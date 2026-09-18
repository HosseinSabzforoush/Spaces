#include "ApiHandlers.h"

#include <algorithm>
#include <cwctype>
#include <optional>
#include <string>
#include <vector>

#include <nlohmann/json.hpp>

#include "../core/AppDiscoveryService.h"
#include "../core/AppInfo.h"
#include "../core/Workspace.h"
#include "../core/WorkspaceManager.h"
#include "../storage/AppCacheRepository.h"
#include "../bridge/Serialization.h"
#include "../storage/WorkspaceRepository.h"
#include "../win32/GuidGenerator.h"
#include "../win32/StringConvert.h"

namespace {

std::string ok(const nlohmann::json& data) {
    nlohmann::json response;
    response["ok"]   = true;
    response["data"] = data;
    return response.dump();
}

std::string fail(const char* code) {
    nlohmann::json response;
    response["ok"]    = false;
    response["error"] = code;
    return response.dump();
}


nlohmann::json parseArgs(const std::string& request) {
    nlohmann::json args = nlohmann::json::parse(request, nullptr, false);
    if (args.is_discarded() || !args.is_array()) {
        return nlohmann::json::array();
    }
    return args;
}

std::optional<std::string> stringArg(const nlohmann::json& args, size_t index) {
    if (args.size() <= index || !args.at(index).is_string()) {
        return std::nullopt;
    }
    return args.at(index).get<std::string>();
}

const char* statusToString(LaunchStatus status) {
    switch (status) {
        case LaunchStatus::Launched:       return "launched";
        case LaunchStatus::AlreadyRunning: return "alreadyRunning";
        case LaunchStatus::AppNotFound:    return "appNotFound";
        case LaunchStatus::NoExePath:      return "noExePath";
        case LaunchStatus::LaunchFailed:   return "launchFailed";
    }
    return "launchFailed";
}

} 

ApiHandlers::ApiHandlers(WorkspaceRepository& workspaces,
                         AppCacheRepository&  appCache,
                         WorkspaceManager&    manager)
    : workspaces_(workspaces),
      appCache_(appCache),
      manager_(manager) {}

void ApiHandlers::registerAll(webview::webview& view) {
    view.bind("getWorkspaces", [this](std::string request) {
        return getWorkspaces(request);
    });
    view.bind("saveWorkspace", [this](std::string request) {
        return saveWorkspace(request);
    });
    view.bind("deleteWorkspace", [this](std::string request) {
        return deleteWorkspace(request);
    });
    view.bind("launchWorkspace", [this](std::string request) {
        return launchWorkspace(request);
    });
    view.bind("getDiscoveredApps", [this](std::string request) {
        return getDiscoveredApps(request);
    });
    view.bind("rescanApps", [this](std::string request) {
        return rescanApps(request);
    });
    view.bind("addManualApp", [this](std::string request) {
        return addManualApp(request);
    });
}

std::string ApiHandlers::getWorkspaces(const std::string&) {
    return ok(Serialization::toJsonArray(workspaces_.all()));
}


std::string ApiHandlers::saveWorkspace(const std::string& request) {
    const nlohmann::json args = parseArgs(request);
    if (args.empty() || !args.at(0).is_object()) {
        return fail("badRequest");
    }

    nlohmann::json node = args.at(0);

    const bool needsId = !node.contains("id")
                      || !node.at("id").is_string()
                      || node.at("id").get<std::string>().empty();

    if (needsId) {
        const std::wstring generated = GuidGenerator::generate();
        if (generated.empty()) {
            return fail("idGenerationFailed");
        }
        node["id"] = StringConvert::toUtf8(generated);
    }

    Workspace workspace{};
    if (!Serialization::fromJson(node, workspace)) {
        return fail("badRequest");
    }

    workspaces_.upsert(workspace);
    if (!workspaces_.save()) {
        return fail("saveFailed");
    }

    return ok(Serialization::toJson(workspace));
}


std::string ApiHandlers::deleteWorkspace(const std::string& request) {
    const std::optional<std::string> id = stringArg(parseArgs(request), 0);
    if (!id.has_value() || id->empty()) {
        return fail("badRequest");
    }

    if (!workspaces_.remove(StringConvert::fromUtf8(*id))) {
        return fail("notFound");
    }
    if (!workspaces_.save()) {
        return fail("saveFailed");
    }

    return ok(nlohmann::json::object());
}


std::string ApiHandlers::launchWorkspace(const std::string& request) {
    const std::optional<std::string> id = stringArg(parseArgs(request), 0);
    if (!id.has_value() || id->empty()) {
        return fail("badRequest");
    }

    const LaunchReport report =
        manager_.launchWorkspace(StringConvert::fromUtf8(*id));

    if (!report.workspaceFound) {
        return fail("notFound");
    }

    nlohmann::json outcomes = nlohmann::json::array();
    for (const AppLaunchOutcome& outcome : report.outcomes) {
        nlohmann::json node;
        node["appId"]  = StringConvert::toUtf8(outcome.appId);
        node["status"] = statusToString(outcome.status);
        if (outcome.status == LaunchStatus::Launched) {
            node["pid"] = outcome.pid;
        }
        outcomes.push_back(std::move(node));
    }

    nlohmann::json data;
    data["outcomes"] = std::move(outcomes);
    return ok(data);
}

std::string ApiHandlers::getDiscoveredApps(const std::string&) {
    return ok(Serialization::toJsonArray(appCache_.all()));
}

std::string ApiHandlers::rescanApps(const std::string&) {
    std::vector<AppInfo> merged = AppDiscoveryService::discoverAllApps();

    for (const AppInfo& existing : appCache_.all()) {
        if (existing.source != AppSource::Manual) {
            continue;
        }
        const bool alreadyPresent =
            std::any_of(merged.begin(), merged.end(),
                        [&existing](const AppInfo& app) {
                            return app.id == existing.id;
                        });
        if (!alreadyPresent) {
            merged.push_back(existing);
        }
    }

    appCache_.replaceAll(std::move(merged));
    if (!appCache_.save()) {
        return fail("saveFailed");
    }

    return ok(Serialization::toJsonArray(appCache_.all()));
}


std::string ApiHandlers::addManualApp(const std::string& request) {
    const nlohmann::json args = parseArgs(request);
    if (args.empty() || !args.at(0).is_object()) {
        return fail("badRequest");
    }

    nlohmann::json node = args.at(0);

    if (!node.contains("exePath") || !node.at("exePath").is_string()) {
        return fail("badRequest");
    }
    const std::string exePath = node.at("exePath").get<std::string>();
    if (exePath.empty()) {
        return fail("badRequest");
    }

 
    std::wstring wideId = StringConvert::fromUtf8(exePath);
    std::transform(wideId.begin(), wideId.end(), wideId.begin(),
                   [](wchar_t c) { return static_cast<wchar_t>(std::towlower(c)); });

    node["id"]     = StringConvert::toUtf8(wideId);
    node["source"] = "manual";
    if (!node.contains("displayName") || !node.at("displayName").is_string()) {
        node["displayName"] = exePath;
    }

    AppInfo app{};
    if (!Serialization::fromJson(node, app)) {
        return fail("badRequest");
    }

    appCache_.add(app);
    if (!appCache_.save()) {
        return fail("saveFailed");
    }

    return ok(Serialization::toJson(app));
}
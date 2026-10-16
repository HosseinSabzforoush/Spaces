#include "ApiHandlers.h"

#include <algorithm>
#include <cstdint>
#include <cwctype>
#include <filesystem>
#include <system_error>
#include <optional>
#include <string>
#include <vector>

#include <nlohmann/json.hpp>

#include "Serialization.h"
#include "../core/AppDiscoveryService.h"
#include "../core/AppInfo.h"
#include "../core/AppSettings.h"
#include "../core/ExecutableScanner.h"
#include "../core/Workspace.h"
#include "../core/WorkspaceManager.h"
#include "../storage/AppCacheRepository.h"
#include "../storage/IconCache.h"
#include "../storage/SettingsRepository.h"
#include "../storage/WorkspaceRepository.h"
#include "../win32/FileDialog.h"
#include "../win32/GuidGenerator.h"
#include "../win32/StartupRegistration.h"
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

std::string base64Encode(const std::vector<unsigned char>& data) {
    static const char table[] =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    std::string out;
    out.reserve(((data.size() + 2) / 3) * 4);

    size_t i = 0;
    while (i + 2 < data.size()) {
        const std::uint32_t n = (static_cast<std::uint32_t>(data[i]) << 16) |
                                (static_cast<std::uint32_t>(data[i + 1]) << 8) |
                                 static_cast<std::uint32_t>(data[i + 2]);
        out += table[(n >> 18) & 0x3F];
        out += table[(n >> 12) & 0x3F];
        out += table[(n >> 6) & 0x3F];
        out += table[n & 0x3F];
        i += 3;
    }

    const size_t remaining = data.size() - i;
    if (remaining == 1) {
        const std::uint32_t n = static_cast<std::uint32_t>(data[i]) << 16;
        out += table[(n >> 18) & 0x3F];
        out += table[(n >> 12) & 0x3F];
        out += "==";
    } else if (remaining == 2) {
        const std::uint32_t n = (static_cast<std::uint32_t>(data[i]) << 16) |
                                (static_cast<std::uint32_t>(data[i + 1]) << 8);
        out += table[(n >> 18) & 0x3F];
        out += table[(n >> 12) & 0x3F];
        out += table[(n >> 6) & 0x3F];
        out += '=';
    }

    return out;
}

} 

ApiHandlers::ApiHandlers(WorkspaceRepository& workspaces,
                         AppCacheRepository&  appCache,
                         IconCache&           icons,
                         SettingsRepository&  settings,
                         WorkspaceManager&    manager)
    : workspaces_(workspaces),
      appCache_(appCache),
      icons_(icons),
      settings_(settings),
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
    view.bind("getAppIcon", [this](std::string request) {
        return getAppIcon(request);
    });
    view.bind("selectExecutables", [this](std::string request) {
        return selectExecutables(request);
    });
    view.bind("selectDirectory", [this](std::string request) {
        return selectDirectory(request);
    });
    view.bind("scanExecutables", [this](std::string request) {
        return scanExecutables(request);
    });
    view.bind("getSettings", [this](std::string request) {
        return getSettings(request);
    });
    view.bind("saveSettings", [this](std::string request) {
        return saveSettings(request);
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
        std::error_code ec;
        if (!std::filesystem::exists(existing.exePath, ec)) {
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

    icons_.ensureAll(merged);

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

    icons_.ensureIcon(app); 

    appCache_.add(app);
    if (!appCache_.save()) {
        return fail("saveFailed");
    }

    return ok(Serialization::toJson(app));
}


std::string ApiHandlers::getAppIcon(const std::string& request) {
    const std::optional<std::string> id = stringArg(parseArgs(request), 0);
    if (!id.has_value() || id->empty()) {
        return fail("badRequest");
    }

    const AppInfo* app = appCache_.findById(StringConvert::fromUtf8(*id));
    if (app == nullptr) {
        return fail("notFound");
    }

    const std::optional<std::vector<unsigned char>> png = icons_.read(*app);
    if (!png.has_value()) {
        return fail("noIcon");
    }

    nlohmann::json data;
    data["dataUrl"] = "data:image/png;base64," + base64Encode(*png);
    return ok(data);
}

std::string ApiHandlers::selectExecutables(const std::string&) {
    nlohmann::json paths = nlohmann::json::array();
    for (const std::wstring& path : FileDialog::pickExecutables()) {
        paths.push_back(StringConvert::toUtf8(path));
    }
    return ok(paths);
}

std::string ApiHandlers::selectDirectory(const std::string&) {
    const std::wstring directory = FileDialog::pickDirectory();
    if (directory.empty()) {
        return ok(nullptr);  
    }
    return ok(StringConvert::toUtf8(directory));
}

std::string ApiHandlers::scanExecutables(const std::string& request) {
    const nlohmann::json args = parseArgs(request);
    if (args.empty() || !args.at(0).is_object()) {
        return fail("badRequest");
    }

    const nlohmann::json& options = args.at(0);
    if (!options.contains("directory") || !options.at("directory").is_string()) {
        return fail("badRequest");
    }
    const std::string directory = options.at("directory").get<std::string>();
    if (directory.empty()) {
        return fail("badRequest");
    }

    bool recursive = true;
    if (options.contains("recursive") && options.at("recursive").is_boolean()) {
        recursive = options.at("recursive").get<bool>();
    }

    nlohmann::json paths = nlohmann::json::array();
    for (const std::wstring& path : ExecutableScanner::scan(StringConvert::fromUtf8(directory), recursive)) {
        paths.push_back(StringConvert::toUtf8(path));
    }
    return ok(paths);
}

std::string ApiHandlers::getSettings(const std::string&) {
    AppSettings settings = settings_.get();


    settings.runAtStartup = StartupRegistration::isEnabled();

    return ok(Serialization::toJson(settings));
}


std::string ApiHandlers::saveSettings(const std::string& request) {
    const nlohmann::json args = parseArgs(request);
    if (args.empty() || !args.at(0).is_object()) {
        return fail("badRequest");
    }

    const bool startupNow = StartupRegistration::isEnabled();

    AppSettings next = settings_.get();
    next.runAtStartup = startupNow;  

    if (!Serialization::fromJson(args.at(0), next)) {
        return fail("badRequest");
    }


    if (next.runAtStartup != startupNow &&
        !StartupRegistration::setEnabled(next.runAtStartup)) {
        return fail("startupFailed");
    }

    settings_.set(next);
    if (!settings_.save()) {
        return fail("saveFailed");
    }

    return ok(Serialization::toJson(next));
}
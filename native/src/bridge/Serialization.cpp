#include "Serialization.h"

#include "../win32/StringConvert.h"

namespace {

bool readWide(const nlohmann::json& node, const char* key, std::wstring& out) {
    if (!node.contains(key) || !node.at(key).is_string()) {
        return false;
    }
    out = StringConvert::fromUtf8(node.at(key).get<std::string>());
    return true;
}


void readOptionalWide(const nlohmann::json& node,
                      const char* key,
                      std::optional<std::wstring>& out) {
    out.reset();
    if (!node.contains(key)) {
        return;
    }
    const nlohmann::json& value = node.at(key);
    if (!value.is_string()) {
        return;
    }
    out = StringConvert::fromUtf8(value.get<std::string>());
}

void writeOptionalWide(nlohmann::json& node,
                       const char* key,
                       const std::optional<std::wstring>& value) {
    if (value.has_value()) {
        node[key] = StringConvert::toUtf8(*value);
    }
}

void readBool(const nlohmann::json& node, const char* key, bool& out) {
    if (node.contains(key) && node.at(key).is_boolean()) {
        out = node.at(key).get<bool>();
    }
}

}

namespace Serialization {

std::string toString(AppSource source) {
    switch (source) {
        case AppSource::Registry: return "registry";
        case AppSource::Shortcut: return "shortcut";
        case AppSource::Manual:   return "manual";
    }
    return "manual";
}

AppSource appSourceFromString(const std::string& text) {
    if (text == "registry") return AppSource::Registry;
    if (text == "shortcut") return AppSource::Shortcut;
    return AppSource::Manual;
}

std::string toString(Theme theme) {
    switch (theme) {
        case Theme::Dark:   return "dark";
        case Theme::Light:  return "light";
        case Theme::System: return "system";
    }
    return "dark";
}

Theme themeFromString(const std::string& text) {
    if (text == "light")  return Theme::Light;
    if (text == "system") return Theme::System;
    return Theme::Dark;
}


nlohmann::json toJson(const AppInfo& app) {
    nlohmann::json node;
    node["id"]          = StringConvert::toUtf8(app.id);
    node["displayName"] = StringConvert::toUtf8(app.displayName);
    node["exePath"]     = StringConvert::toUtf8(app.exePath);
    node["source"]      = toString(app.source);

    writeOptionalWide(node, "args",       app.args);
    writeOptionalWide(node, "workingDir", app.workingDir);
    writeOptionalWide(node, "iconRef",    app.iconRef);

    return node;
}

bool fromJson(const nlohmann::json& node, AppInfo& out) {
    if (!node.is_object()) {
        return false;
    }

    AppInfo app{};

    if (!readWide(node, "id", app.id) || app.id.empty()) {
        return false;
    }
    if (!readWide(node, "displayName", app.displayName)) {
        return false;
    }

    readWide(node, "exePath", app.exePath);

    app.source = AppSource::Manual;
    if (node.contains("source") && node.at("source").is_string()) {
        app.source = appSourceFromString(node.at("source").get<std::string>());
    }

    readOptionalWide(node, "args",       app.args);
    readOptionalWide(node, "workingDir", app.workingDir);
    readOptionalWide(node, "iconRef",    app.iconRef);

    out = std::move(app);
    return true;
}


nlohmann::json toJson(const WorkspaceApp& entry) {

    nlohmann::json node;
    node["appId"] = StringConvert::toUtf8(entry.appId);
    return node;
}

bool fromJson(const nlohmann::json& node, WorkspaceApp& out) {
    if (!node.is_object()) {
        return false;
    }

    WorkspaceApp entry{};
    if (!readWide(node, "appId", entry.appId) || entry.appId.empty()) {
        return false;
    }

    out = std::move(entry);
    return true;
}


nlohmann::json toJson(const Workspace& workspace) {
    nlohmann::json apps = nlohmann::json::array();
    for (const WorkspaceApp& entry : workspace.apps) {
        apps.push_back(toJson(entry));
    }

    nlohmann::json node;
    node["id"]          = StringConvert::toUtf8(workspace.id);
    node["displayName"] = StringConvert::toUtf8(workspace.displayName);
    node["apps"]        = std::move(apps);

    return node;
}

bool fromJson(const nlohmann::json& node, Workspace& out) {
    if (!node.is_object()) {
        return false;
    }

    Workspace workspace{};

    if (!readWide(node, "id", workspace.id) || workspace.id.empty()) {
        return false;
    }
    if (!readWide(node, "displayName", workspace.displayName)) {
        return false;
    }

    if (node.contains("apps") && node.at("apps").is_array()) {
        for (const nlohmann::json& child : node.at("apps")) {
            WorkspaceApp entry{};
            if (fromJson(child, entry)) {
                workspace.apps.push_back(std::move(entry));
            }
        }
    }

    out = std::move(workspace);
    return true;
}


nlohmann::json toJson(const AppSettings& settings) {
    nlohmann::json node;
    node["theme"]               = toString(settings.theme);
    node["runAtStartup"]        = settings.runAtStartup;
    node["rescanOnStartup"]     = settings.rescanOnStartup;
    node["confirmBeforeDelete"] = settings.confirmBeforeDelete;
    return node;
}

bool fromJson(const nlohmann::json& node, AppSettings& out) {
    if (!node.is_object()) {
        return false;
    }

    AppSettings settings = out;

    if (node.contains("theme") && node.at("theme").is_string()) {
        settings.theme = themeFromString(node.at("theme").get<std::string>());
    }
    readBool(node, "runAtStartup",        settings.runAtStartup);
    readBool(node, "rescanOnStartup",     settings.rescanOnStartup);
    readBool(node, "confirmBeforeDelete", settings.confirmBeforeDelete);

    out = settings;
    return true;
}


nlohmann::json toJsonArray(const std::vector<AppInfo>& apps) {
    nlohmann::json array = nlohmann::json::array();
    for (const AppInfo& app : apps) {
        array.push_back(toJson(app));
    }
    return array;
}

nlohmann::json toJsonArray(const std::vector<Workspace>& workspaces) {
    nlohmann::json array = nlohmann::json::array();
    for (const Workspace& workspace : workspaces) {
        array.push_back(toJson(workspace));
    }
    return array;
}

} 
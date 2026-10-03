#pragma once

#include <string>
#include <vector>

#include <nlohmann/json.hpp>

#include "../core/AppInfo.h"
#include "../core/AppSettings.h"
#include "../core/Workspace.h"
#include "../core/WorkspaceApp.h"


namespace Serialization {

std::string toString(AppSource source);
AppSource   appSourceFromString(const std::string& text);   

std::string toString(Theme theme);
Theme       themeFromString(const std::string& text);       

nlohmann::json toJson(const AppInfo& app);
bool fromJson(const nlohmann::json& node, AppInfo& out);

nlohmann::json toJson(const WorkspaceApp& entry);
bool fromJson(const nlohmann::json& node, WorkspaceApp& out);

nlohmann::json toJson(const Workspace& workspace);
bool fromJson(const nlohmann::json& node, Workspace& out);

nlohmann::json toJson(const AppSettings& settings);

bool fromJson(const nlohmann::json& node, AppSettings& out);

nlohmann::json toJsonArray(const std::vector<AppInfo>& apps);
nlohmann::json toJsonArray(const std::vector<Workspace>& workspaces);

} 
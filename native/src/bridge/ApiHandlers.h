#pragma once

#include <string>

#include <webview/webview.h>

class WorkspaceRepository;
class AppCacheRepository;
class IconCache;
class SettingsRepository;
class WorkspaceManager;


class ApiHandlers {
public:
    ApiHandlers(WorkspaceRepository& workspaces,
                AppCacheRepository&  appCache,
                IconCache&           icons,
                SettingsRepository&  settings,
                WorkspaceManager&    manager);

    void registerAll(webview::webview& view);

private:
    std::string getWorkspaces(const std::string& request);
    std::string saveWorkspace(const std::string& request);
    std::string deleteWorkspace(const std::string& request);
    std::string launchWorkspace(const std::string& request);
    std::string getDiscoveredApps(const std::string& request);
    std::string rescanApps(const std::string& request);
    std::string addManualApp(const std::string& request);
    std::string getAppIcon(const std::string& request);
    std::string selectExecutables(const std::string& request);
    std::string getSettings(const std::string& request);
    std::string saveSettings(const std::string& request);

    WorkspaceRepository& workspaces_;
    AppCacheRepository&  appCache_;
    IconCache&           icons_;
    SettingsRepository&  settings_;
    WorkspaceManager&    manager_;
};
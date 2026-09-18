#pragma once

#include <string>

#include <webview/webview.h>

class WorkspaceRepository;
class AppCacheRepository;
class WorkspaceManager;


class ApiHandlers {
public:
    ApiHandlers(WorkspaceRepository& workspaces,
                AppCacheRepository&  appCache,
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

    WorkspaceRepository& workspaces_;
    AppCacheRepository&  appCache_;
    WorkspaceManager&    manager_;
};
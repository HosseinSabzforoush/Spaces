#pragma once

#include <string>

#include <webview/webview.h>

class WorkspaceRepository;
class AppCacheRepository;
class IconCache;
class WorkspaceManager;

// The ONLY layer that touches webview::bind(). Every function below takes
// the raw JSON argument array webview hands over (e.g. `["someId"]`) and
// returns a JSON string.
//
// Every handler returns an object of the shape:
//   { "ok": true,  "data": <payload> }
//   { "ok": false, "error": "<machine-readable code>" }
// so the frontend has one branch to write, not one per endpoint.
class ApiHandlers {
public:
    ApiHandlers(WorkspaceRepository& workspaces,
                AppCacheRepository&  appCache,
                IconCache&           icons,
                WorkspaceManager&    manager);

    // Binds every endpoint onto `window` in the webview.
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

    WorkspaceRepository& workspaces_;
    AppCacheRepository&  appCache_;
    IconCache&           icons_;
    WorkspaceManager&    manager_;
};
#pragma once

#include <string>
#include <unordered_map>
#include <vector>

#include <windows.h>

#include "Workspace.h"

class WorkspaceRepository;
class AppCacheRepository;


enum class LaunchStatus {
    Launched,        
    AlreadyRunning,  
    AppNotFound,    
    NoExePath,      
    LaunchFailed     
};

struct AppLaunchOutcome {
    std::wstring appId;
    LaunchStatus status = LaunchStatus::LaunchFailed;
    DWORD        pid    = 0;  
};

struct LaunchReport {
    bool workspaceFound = false;
    std::vector<AppLaunchOutcome> outcomes;
};


class WorkspaceManager {
public:
    WorkspaceManager(const WorkspaceRepository& workspaces,
                     const AppCacheRepository& appCache);

    LaunchReport launchWorkspace(const std::wstring& workspaceId);

    std::vector<DWORD> runningPids(const std::wstring& workspaceId);

private:
    const WorkspaceRepository& workspaces_;
    const AppCacheRepository&  appCache_;


    std::unordered_map<std::wstring, std::vector<DWORD>> launchedPids_;
};
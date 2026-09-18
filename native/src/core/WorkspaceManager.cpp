#include "WorkspaceManager.h"

#include <algorithm>
#include <filesystem>

#include "AppInfo.h"
#include "WorkspaceApp.h"
#include "../storage/AppCacheRepository.h"
#include "../storage/WorkspaceRepository.h"
#include "../win32/ProcessLauncher.h"
#include "../win32/ProcessSnapshot.h"

namespace {

std::wstring exeFilenameOf(const std::wstring& exePath) {
    return std::filesystem::path(exePath).filename().wstring();
}

bool isPidAlive(DWORD pid) {
    if (pid == 0) {
        return false;
    }

    const HANDLE process = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, FALSE, pid);
    if (process == nullptr) {
        return false;
    }

    DWORD exitCode = 0;
    const bool queried = GetExitCodeProcess(process, &exitCode) != FALSE;
    CloseHandle(process);

    return queried && exitCode == STILL_ACTIVE;
}

} 

WorkspaceManager::WorkspaceManager(const WorkspaceRepository& workspaces,
                                   const AppCacheRepository& appCache)
    : workspaces_(workspaces),
      appCache_(appCache) {}

LaunchReport WorkspaceManager::launchWorkspace(const std::wstring& workspaceId) {
    LaunchReport report;

    const Workspace* workspace = workspaces_.findById(workspaceId);
    if (workspace == nullptr) {
        return report;  
    }
    report.workspaceFound = true;

  
    ProcessSnapshot snapshot;
    const bool snapshotUsable = static_cast<bool>(snapshot);

    std::vector<DWORD>& pids = launchedPids_[workspaceId];
    pids.erase(std::remove_if(pids.begin(), pids.end(),
                              [](DWORD pid) { return !isPidAlive(pid); }),
               pids.end());

    for (const WorkspaceApp& entry : workspace->apps) {
        AppLaunchOutcome outcome;
        outcome.appId = entry.appId;

        const AppInfo* app = appCache_.findById(entry.appId);
        if (app == nullptr) {
            outcome.status = LaunchStatus::AppNotFound;
            report.outcomes.push_back(std::move(outcome));
            continue;
        }

        if (app->exePath.empty()) {
            outcome.status = LaunchStatus::NoExePath;
            report.outcomes.push_back(std::move(outcome));
            continue;
        }


        if (snapshotUsable && snapshot.isRunning(exeFilenameOf(app->exePath))) {
            outcome.status = LaunchStatus::AlreadyRunning;
            report.outcomes.push_back(std::move(outcome));
            continue;
        }

        std::optional<ProcessLauncher::Result> result =
            ProcessLauncher::launchApp(app->exePath);

        if (!result.has_value()) {
            outcome.status = LaunchStatus::LaunchFailed;
            report.outcomes.push_back(std::move(outcome));
            continue;
        }

        outcome.status = LaunchStatus::Launched;
        outcome.pid    = result->pid;
        pids.push_back(result->pid);


        report.outcomes.push_back(std::move(outcome));
    }

    return report;
}

std::vector<DWORD> WorkspaceManager::runningPids(const std::wstring& workspaceId) {
    const auto it = launchedPids_.find(workspaceId);
    if (it == launchedPids_.end()) {
        return {};
    }

    std::vector<DWORD>& pids = it->second;
    pids.erase(std::remove_if(pids.begin(), pids.end(),
                              [](DWORD pid) { return !isPidAlive(pid); }),
               pids.end());

    return pids;
}
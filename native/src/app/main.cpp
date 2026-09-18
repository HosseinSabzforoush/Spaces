#include <windows.h>

#include <webview/webview.h>

#include "AppConfig.h"
#include "../bridge/ApiHandlers.h"
#include "../core/WorkspaceManager.h"
#include "../storage/AppCacheRepository.h"
#include "../storage/WorkspaceRepository.h"
#include "../win32/ComInitializer.h"

int WINAPI wWinMain(HINSTANCE, HINSTANCE, PWSTR, int) {

    ComInitializer com;
    if (!com) {
        MessageBoxW(nullptr, L"COM initialisation failed.", L"Spaces", MB_ICONERROR);
        return 1;
    }

    if (!AppConfig::ensureDataDir()) {
        MessageBoxW(nullptr, L"Could not create the Spaces data folder.",
                    L"Spaces", MB_ICONERROR);
        return 1;
    }

    WorkspaceRepository workspaces(AppConfig::workspacesPath());
    AppCacheRepository  appCache(AppConfig::appCachePath());


    workspaces.load();
    appCache.load();

    WorkspaceManager manager(workspaces, appCache);
    ApiHandlers      api(workspaces, appCache, manager);

    webview::webview view(true, nullptr);
    view.set_title(AppConfig::kWindowTitle);
    view.set_size(AppConfig::kWindowWidth, AppConfig::kWindowHeight, WEBVIEW_HINT_NONE);

    api.registerAll(view);

    view.navigate(AppConfig::kFrontendUrl);
    view.run();

    return 0;
}
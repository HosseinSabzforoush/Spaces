#include <windows.h>

#include <webview/webview.h>

#include "AppConfig.h"
#include "../bridge/ApiHandlers.h"
#include "../core/WorkspaceManager.h"
#include "../storage/AppCacheRepository.h"
#include "../storage/IconCache.h"
#include "../storage/WorkspaceRepository.h"
#include "../win32/ComInitializer.h"

int WINAPI wWinMain(HINSTANCE, HINSTANCE, PWSTR, int) {
    // COM is initialised for the whole UI thread here rather than inside
    // AppDiscoveryService, because rescanApps() runs on this thread and
    // ShortcutResolver (and now IconExtractor's WIC calls) require it.
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
    IconCache           icons(AppConfig::iconsDir());

    // A false return means the file exists but is unparseable. It is left
    // on disk untouched; the app starts empty rather than overwriting it.
    workspaces.load();
    appCache.load();

    WorkspaceManager manager(workspaces, appCache);
    ApiHandlers      api(workspaces, appCache, icons, manager);

    webview::webview view(true, nullptr);
    view.set_title(AppConfig::kWindowTitle);
    view.set_size(AppConfig::kWindowWidth, AppConfig::kWindowHeight, WEBVIEW_HINT_NONE);

    api.registerAll(view);

    view.navigate(AppConfig::kFrontendUrl);
    view.run();

    return 0;
}
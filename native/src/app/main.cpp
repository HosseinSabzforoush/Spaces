#include <windows.h>

#include <cctype>
#include <cstdio>
#include <cstring>
#include <filesystem>
#include <string>

#include <webview/webview.h>

#include "AppConfig.h"
#include "../bridge/ApiHandlers.h"
#include "../core/WorkspaceManager.h"
#include "../storage/AppCacheRepository.h"
#include "../storage/IconCache.h"
#include "../storage/SettingsRepository.h"
#include "../storage/WorkspaceRepository.h"
#include "../win32/ComInitializer.h"
#include "../win32/StartupRegistration.h"
#include "../win32/StringConvert.h"

namespace {

std::filesystem::path exeDirectory() {
    wchar_t buffer[MAX_PATH];
    const DWORD length = GetModuleFileNameW(nullptr, buffer, MAX_PATH);
    if (length == 0 || length >= MAX_PATH) {
        return {};
    }
    return std::filesystem::path(buffer).parent_path();
}

std::string toFileUrl(const std::filesystem::path& path) {
    const std::string utf8 = StringConvert::toUtf8(path.generic_wstring());

    std::string url = "file:///";
    for (const char raw : utf8) {
        const unsigned char c = static_cast<unsigned char>(raw);
        if (std::isalnum(c) || std::strchr("-_.~/:", c) != nullptr) {
            url += raw;
        } else {
            char escaped[4];
            std::snprintf(escaped, sizeof(escaped), "%%%02X", c);
            url += escaped;
        }
    }
    return url;
}

constexpr int kIconResourceId = 1;

void applyWindowIcon(void* nativeWindow) {
    if (nativeWindow == nullptr) {
        return;
    }
    const HWND hwnd = static_cast<HWND>(nativeWindow);
    const HINSTANCE instance = GetModuleHandleW(nullptr);

    const auto load = [&](int width, int height) {
        return static_cast<HICON>(LoadImageW(instance, MAKEINTRESOURCEW(kIconResourceId),
                                             IMAGE_ICON, width, height, LR_DEFAULTCOLOR));
    };

    const HICON big = load(GetSystemMetrics(SM_CXICON), GetSystemMetrics(SM_CYICON));
    const HICON small = load(GetSystemMetrics(SM_CXSMICON), GetSystemMetrics(SM_CYSMICON));
    if (big != nullptr) {
        SendMessageW(hwnd, WM_SETICON, ICON_BIG, reinterpret_cast<LPARAM>(big));
    }
    if (small != nullptr) {
        SendMessageW(hwnd, WM_SETICON, ICON_SMALL, reinterpret_cast<LPARAM>(small));
    }
}

#ifdef NDEBUG
constexpr const char* kLockDownScript = R"JS(
(function () {
  window.addEventListener('contextmenu', function (e) { e.preventDefault(); }, true);
  window.addEventListener('wheel', function (e) { if (e.ctrlKey) e.preventDefault(); },
                          { passive: false, capture: true });
  window.addEventListener('keydown', function (e) {
    var key = e.key.toLowerCase();
    var ctrl = e.ctrlKey || e.metaKey;
    var blocked =
      e.key === 'F5' || e.key === 'F7' || e.key === 'F12' ||
      (ctrl && ['p', 's', 'u', 'f', 'g', 'j', 'r', '+', '-', '=', '0'].indexOf(key) !== -1) ||
      (ctrl && e.shiftKey && ['i', 'c', 'j', 'p'].indexOf(key) !== -1) ||
      (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'));
    if (blocked) e.preventDefault();
  }, true);
})();
)JS";
#endif

}

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

    std::string frontendUrl;
#ifdef SPACES_DEV_SERVER
    frontendUrl = AppConfig::kFrontendUrl;
#else
    const std::filesystem::path indexHtml = exeDirectory() / L"dist" / L"index.html";
    std::error_code ec;
    if (!std::filesystem::exists(indexHtml, ec)) {
        MessageBoxW(nullptr,
                    L"The frontend files were not found.\n\n"
                    L"Run 'npm run build' in the frontend folder, then rebuild the app.",
                    L"Spaces", MB_ICONERROR);
        return 1;
    }
    frontendUrl = toFileUrl(indexHtml);
#endif

    WorkspaceRepository workspaces(AppConfig::workspacesPath());
    AppCacheRepository  appCache(AppConfig::appCachePath());
    IconCache           icons(AppConfig::iconsDir());
    SettingsRepository  settings(AppConfig::settingsPath());


    workspaces.load();
    appCache.load();
    settings.load();

    if (StartupRegistration::isEnabled()) {
        StartupRegistration::setEnabled(true);
    }

    WorkspaceManager manager(workspaces, appCache);

    const AppSettings& startup = settings.get();
    if (startup.startupWorkspaceEnabled && !startup.startupWorkspaceId.empty()) {
        manager.launchWorkspace(startup.startupWorkspaceId);
    }

    ApiHandlers      api(workspaces, appCache, icons, settings, manager);

#ifdef NDEBUG
    const bool enableDevTools = false;
#else
    const bool enableDevTools = true;
#endif

    webview::webview view(enableDevTools, nullptr);
    view.set_title(AppConfig::kWindowTitle);
    view.set_size(AppConfig::kWindowWidth, AppConfig::kWindowHeight, WEBVIEW_HINT_NONE);

    const auto window = view.window();
    if (window.has_value()) {
        applyWindowIcon(window.value());
    }

    api.registerAll(view);

#ifdef NDEBUG
    view.init(kLockDownScript);
#endif

    view.navigate(frontendUrl);
    view.run();

    return 0;
}
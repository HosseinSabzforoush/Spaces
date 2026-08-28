// src/app/main.cpp (TEMPORARY smoke test — replace with real webview main.cpp)
#include <iostream>
#include "../core/AppDiscoveryService.h"

int main() {
    std::vector<AppInfo> appPathsApps = AppDiscoveryService::discoverFromAppPaths();
    std::wcout << L"=== App Paths: " << appPathsApps.size() << L" apps ===\n";
    for (const auto& app : appPathsApps) {
        std::wcout << L"  " << app.displayName << L"  ->  " << app.exePath << L"\n";
    }

    std::vector<AppInfo> uninstallApps = AppDiscoveryService::discoverFromUninstallKeys();
    std::wcout << L"\n=== Uninstall Keys: " << uninstallApps.size() << L" apps ===\n";
    for (const auto& app : uninstallApps) {
        std::wcout << L"  " << app.displayName << L"\n";
    }

    std::vector<AppInfo> shortcutApps = AppDiscoveryService::discoverFromShortcuts();
    std::wcout << L"\n=== Shortcuts: " << shortcutApps.size() << L" apps ===\n";
    for (const auto& app : shortcutApps) {
        std::wcout << L"  " << app.displayName << L"  ->  " << app.exePath << L"\n";
    }

    return 0;
}
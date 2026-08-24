// src/app/main.cpp (TEMPORARY smoke test — replace with real webview main.cpp)
#include <iostream>
#include "../core/AppDiscoveryService.h"

int main() {
    std::vector<AppInfo> apps = AppDiscoveryService::discoverFromAppPaths();

    std::wcout << L"Found " << apps.size() << L" apps via App Paths:\n\n";
    for (const auto& app : apps) {
        std::wcout << L"  " << app.displayName << L"  ->  " << app.exePath << L"\n";
    }

    return 0;
}
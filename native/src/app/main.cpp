// src/app/main.cpp (TEMPORARY smoke test — replace with real webview main.cpp)
#include <iostream>
#include "../core/AppDiscoveryService.h"

int main() {
    std::vector<AppInfo> allApps = AppDiscoveryService::discoverAllApps();
    std::wcout << L"=== All Apps (merged + filtered): " << allApps.size() << L" apps ===\n";
    for (const auto& app : allApps) {
        std::wcout << L"  " << app.displayName << L"  ->  " << app.exePath << L"\n";
    }

    return 0;
}
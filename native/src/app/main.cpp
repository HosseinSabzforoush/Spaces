// src/app/main.cpp (TEMPORARY smoke test — replace with real webview main.cpp)
#include <iostream>
#include "../win32/ProcessLauncher.h"

int main() {
    std::wstring exePath = L"C:\\WINDOWS\\system32\\notepad.exe";

    std::optional<ProcessLauncher::Result> result = ProcessLauncher::launchApp(exePath);
    if (result.has_value()) {
        std::wcout << L"Launched successfully. PID: " << result.value().pid << L"\n";
    } else {
        std::wcout << L"Failed to launch.\n";
    }

    return 0;
}
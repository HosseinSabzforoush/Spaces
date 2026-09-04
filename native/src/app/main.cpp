// src/app/main.cpp (TEMPORARY smoke test — replace with real webview main.cpp)
#include <iostream>
#include "../win32/ProcessSnapshot.h"

int main() {
    ProcessSnapshot snapshot;
    if (!snapshot) {
        std::wcout << L"Snapshot failed to initialize.\n";
        return 1;
    }

    std::wcout << std::boolalpha;
    std::wcout << L"explorer.exe running: " << snapshot.isRunning(L"explorer.exe") << L"\n";
    std::wcout << L"notepad.exe running: " << snapshot.isRunning(L"notepad.exe") << L"\n";
    std::wcout << L"definitely_not_a_real_process.exe running: " << snapshot.isRunning(L"definitely_not_a_real_process.exe") << L"\n";

    return 0;
}
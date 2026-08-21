// src/app/main.cpp (TEMPORARY smoke test — replace with real webview main.cpp)
#include <iostream>
#include "../win32/RegistryKey.h"

int main() {
    RegistryKey key(HKEY_LOCAL_MACHINE,
        L"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths");

    if (!key) {
        std::wcout << L"Failed to open key.\n";
        return 1;
    }

    std::wcout << L"Key opened successfully.\n\n";

    auto subkeys = key.enum_subkeys();
    std::wcout << L"Found " << subkeys.size() << L" subkeys:\n";
    for (const auto& name : subkeys) {
        std::wcout << L"  " << name << L"\n";
    }

    return 0;
}
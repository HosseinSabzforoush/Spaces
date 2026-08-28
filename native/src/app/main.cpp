// src/app/main.cpp (TEMPORARY smoke test — replace with real webview main.cpp)
#include <iostream>
#include "../win32/ComInitializer.h"
#include "../win32/ShortcutResolver.h"

int main() {
    ComInitializer com;
    if (!com) {
        std::wcout << L"ComInitializer failed to initialize.\n";
        return 1;
    }

    ShortcutResolver resolver;
    if (!resolver) {
        std::wcout << L"ShortcutResolver failed to initialize.\n";
        return 1;
    }

    std::wstring lnkPath = L"C://Users//PardisPazar//AppData//Roaming//Microsoft//Windows//Start Menu//Programs//Opera Browser.lnk"; // replace with a real .lnk on your machine

    std::optional<std::wstring> target = resolver.resolve(lnkPath);
    if (target.has_value()) {
        std::wcout << L"Resolved target: " << target.value() << L"\n";
    } else {
        std::wcout << L"Failed to resolve shortcut.\n";
    }

    return 0;
}
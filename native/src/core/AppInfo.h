#pragma once
#include <string>
#include <optional>

enum class AppSource {Registry, Shortcut, Manual};

struct AppInfo{
    

    std::wstring id;
    std::wstring displayName;
    std::wstring exePath;

    AppSource source; 
       
    std::optional<std::wstring> args;
    std::optional<std::wstring> workingDir;
    std::optional<std::wstring> iconRef;

};
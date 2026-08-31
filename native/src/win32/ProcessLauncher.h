#pragma once
#include <optional>
#include <windows.h>
#include <string>

#include "Win32Handle.h"



namespace ProcessLauncher{
    struct Result{
        Win32Handle handle;
        DWORD pid;
    };
    std::optional<Result> launchApp(const std::wstring &exePath);
}

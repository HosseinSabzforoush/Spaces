#pragma once
#include <windows.h>
#include <string>
#include <tlhelp32.h>

#include "Win32Handle.h"

class ProcessSnapshot{

private:
    Win32Handle handle_;

public:
    ProcessSnapshot();
    bool isRunning(const std::wstring& filename) const;
    explicit operator bool() const;
};
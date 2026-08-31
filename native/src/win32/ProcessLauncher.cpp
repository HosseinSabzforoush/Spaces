#include "ProcessLauncher.h"

std::optional<ProcessLauncher::Result> ProcessLauncher::launchApp(const std::wstring &exePath){

    std::wstring cmdLine = exePath;
    
    STARTUPINFOW startupInfo = {};
    startupInfo.cb = sizeof(STARTUPINFOW);
    PROCESS_INFORMATION processInfo;

    WINBOOL createdProcess = CreateProcessW(exePath.c_str(), cmdLine.data(), nullptr, nullptr, FALSE, 0, nullptr, nullptr, &startupInfo, &processInfo);

    if(!createdProcess){
        return std::nullopt;
    }
    Result result{Win32Handle(processInfo.hProcess), processInfo.dwProcessId};
    CloseHandle(processInfo.hThread);

    return result;
}
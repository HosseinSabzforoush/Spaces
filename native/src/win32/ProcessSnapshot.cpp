#include "ProcessSnapshot.h"

#include <algorithm>
#include <cwctype>

ProcessSnapshot::ProcessSnapshot()
    : handle_(CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0))
{

}

ProcessSnapshot::operator bool() const{
    return static_cast<bool>(handle_);
}

bool ProcessSnapshot::isRunning(const std::wstring& filename) const {
    if (!static_cast<bool>(handle_)) {
        return false;
    }
                std::wstring inputFile = filename;

    std::transform(inputFile.begin(), inputFile.end(), inputFile.begin(),[](wchar_t c) { return std::towlower(c); });

    PROCESSENTRY32W entry;
    entry.dwSize = sizeof(PROCESSENTRY32W);

    if (Process32FirstW(handle_.get(), &entry)) {
        do {
            std::wstring entryFile = std::wstring(entry.szExeFile);
            std::transform(entryFile.begin(), entryFile.end(), entryFile.begin(),[](wchar_t c) { return std::towlower(c); });           
            if(entryFile == inputFile){
                return true;
            }
        } while (Process32NextW(handle_.get(), &entry));
    }

    return false;
}

#include "EnvExpander.h"
#include <windows.h>

std::wstring expandEnvironmentString(const std::wstring& input){

    DWORD size = ExpandEnvironmentStringsW(input.c_str(), nullptr, 0);
    if(size == 0){
        return input;
    }
    std::wstring buffer(size, L' ');


    DWORD result = ExpandEnvironmentStringsW(input.c_str(), &buffer[0], size);

    if(result != 0){
        if (!buffer.empty() && buffer.back() == L'\0') {
            buffer.pop_back();
        }
        return buffer;
    }
    return input;
}
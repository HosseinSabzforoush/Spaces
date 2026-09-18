#pragma once
#include <string>


namespace StringConvert {
    std::string  toUtf8(const std::wstring& wide);
    std::wstring fromUtf8(const std::string& utf8);
}
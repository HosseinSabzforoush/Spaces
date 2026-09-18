#include "GuidGenerator.h"

#include <windows.h>
#include <objbase.h>

#include <algorithm>
#include <cwctype>

namespace GuidGenerator {

std::wstring generate() {
    GUID guid{};
    if (FAILED(CoCreateGuid(&guid))) {
        return {};
    }

    wchar_t buffer[64] = {};
    const int written = StringFromGUID2(guid, buffer, 64);
    if (written <= 0) {
        return {};
    }


    std::wstring result(buffer, static_cast<size_t>(written - 1));
    if (result.size() >= 2 && result.front() == L'{' && result.back() == L'}') {
        result = result.substr(1, result.size() - 2);
    }

    std::transform(result.begin(), result.end(), result.begin(),
                   [](wchar_t c) { return static_cast<wchar_t>(std::towlower(c)); });

    return result;
}

} 
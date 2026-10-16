#pragma once

#include <string>
#include <vector>

namespace ExecutableScanner {


std::vector<std::wstring> scan(const std::wstring& directory, bool recursive);

}

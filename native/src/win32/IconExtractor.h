#pragma once

#include <optional>
#include <string>
#include <vector>

// Shell icon -> PNG bytes. The calling thread must have COM initialised
// (ComInitializer), because both SHGetFileInfo and WIC need it.
namespace IconExtractor {

// PNG file contents of the 32x32 shell icon for `filePath`, or std::nullopt
// on any failure (missing file, no icon, WIC unavailable).
std::optional<std::vector<unsigned char>> extractPng(const std::wstring& filePath);

} // namespace IconExtractor
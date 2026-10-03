#pragma once

#include <optional>
#include <string>
#include <vector>


namespace IconExtractor {


std::optional<std::vector<unsigned char>> extractPng(const std::wstring& filePath);

}
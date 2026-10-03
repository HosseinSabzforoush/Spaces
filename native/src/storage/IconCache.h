#pragma once

#include <filesystem>
#include <optional>
#include <vector>

#include "../core/AppInfo.h"


class IconCache {
public:
    explicit IconCache(std::filesystem::path directory);


    bool ensureIcon(AppInfo& app) const;

    void ensureAll(std::vector<AppInfo>& apps) const;

    std::optional<std::vector<unsigned char>> read(const AppInfo& app) const;

private:
    std::filesystem::path pathFor(const std::wstring& fileName) const;

    std::filesystem::path directory_;
};
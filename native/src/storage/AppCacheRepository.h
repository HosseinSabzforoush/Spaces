#pragma once

#include <filesystem>
#include <string>
#include <unordered_map>
#include <vector>

#include "../core/AppInfo.h"

class AppCacheRepository {
public:
    explicit AppCacheRepository(std::filesystem::path file);

    bool load();
    bool save() const;

    const std::vector<AppInfo>& all() const;

    const AppInfo* findById(const std::wstring& id) const;

    void replaceAll(std::vector<AppInfo> apps);

    void add(const AppInfo& app);

private:
    void rebuildIndex();

    std::filesystem::path file_;
    std::vector<AppInfo>  apps_;
    std::unordered_map<std::wstring, size_t> indexById_;
};
#pragma once

#include <filesystem>

#include "../core/AppSettings.h"


class SettingsRepository {
public:
    explicit SettingsRepository(std::filesystem::path file);


    bool load();
    bool save() const;

    const AppSettings& get() const;
    void set(const AppSettings& settings);

private:
    std::filesystem::path file_;
    AppSettings           settings_;
};
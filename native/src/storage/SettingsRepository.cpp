#include "SettingsRepository.h"

#include <optional>
#include <utility>

#include <nlohmann/json.hpp>

#include "JsonStore.h"
#include "../app/AppConfig.h"
#include "../bridge/Serialization.h"

SettingsRepository::SettingsRepository(std::filesystem::path file)
    : file_(std::move(file)) {}

bool SettingsRepository::load() {
    settings_ = AppSettings{};

    const std::optional<nlohmann::json> document = JsonStore::read(file_);
    if (!document.has_value()) {
        return true;   
    }


    return Serialization::fromJson(*document, settings_);
}

bool SettingsRepository::save() const {
    nlohmann::json document = Serialization::toJson(settings_);
    document["version"] = AppConfig::kSchemaVersion;
    return JsonStore::write(file_, document);
}

const AppSettings& SettingsRepository::get() const {
    return settings_;
}

void SettingsRepository::set(const AppSettings& settings) {
    settings_ = settings;
}
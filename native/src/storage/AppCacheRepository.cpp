#include "AppCacheRepository.h"

#include <utility>

#include "JsonStore.h"
#include "../bridge/Serialization.h"
#include "../app/AppConfig.h"

AppCacheRepository::AppCacheRepository(std::filesystem::path file)
    : file_(std::move(file)) {}

void AppCacheRepository::rebuildIndex() {
    indexById_.clear();
    indexById_.reserve(apps_.size());
    for (size_t i = 0; i < apps_.size(); ++i) {
        indexById_[apps_[i].id] = i;
    }
}

bool AppCacheRepository::load() {
    apps_.clear();
    indexById_.clear();

    const std::optional<nlohmann::json> document = JsonStore::read(file_);
    if (!document.has_value()) {
        return true;
    }

    if (!document->is_object() || !document->contains("apps")) {
        return false;
    }

    const nlohmann::json& array = document->at("apps");
    if (!array.is_array()) {
        return false;
    }

    for (const nlohmann::json& node : array) {
        AppInfo app{};
        if (Serialization::fromJson(node, app)) {
            apps_.push_back(std::move(app));
        }
    }

    rebuildIndex();
    return true;
}

bool AppCacheRepository::save() const {
    nlohmann::json document;
    document["version"] = AppConfig::kSchemaVersion;
    document["apps"]    = Serialization::toJsonArray(apps_);

    return JsonStore::write(file_, document);
}

const std::vector<AppInfo>& AppCacheRepository::all() const {
    return apps_;
}

const AppInfo* AppCacheRepository::findById(const std::wstring& id) const {
    const auto it = indexById_.find(id);
    if (it == indexById_.end()) {
        return nullptr;
    }
    return &apps_[it->second];
}

void AppCacheRepository::replaceAll(std::vector<AppInfo> apps) {
    apps_ = std::move(apps);
    rebuildIndex();
}

void AppCacheRepository::add(const AppInfo& app) {
    const auto it = indexById_.find(app.id);
    if (it != indexById_.end()) {
        apps_[it->second] = app;
        return;
    }

    apps_.push_back(app);
    indexById_[app.id] = apps_.size() - 1;
}
#include "WorkspaceRepository.h"

#include <utility>

#include "JsonStore.h"
#include "../bridge/Serialization.h"
#include "../app/AppConfig.h"

WorkspaceRepository::WorkspaceRepository(std::filesystem::path file)
    : file_(std::move(file)) {}

bool WorkspaceRepository::load() {
    workspaces_.clear();

    const std::optional<nlohmann::json> document = JsonStore::read(file_);
    if (!document.has_value()) {

        return true;
    }

    if (!document->is_object() || !document->contains("workspaces")) {
        return false;
    }

    const nlohmann::json& array = document->at("workspaces");
    if (!array.is_array()) {
        return false;
    }

    for (const nlohmann::json& node : array) {
        Workspace workspace{};
        if (Serialization::fromJson(node, workspace)) {
            workspaces_.push_back(std::move(workspace));
        }
    }

    return true;
}

bool WorkspaceRepository::save() const {
    nlohmann::json document;
    document["version"]    = AppConfig::kSchemaVersion;
    document["workspaces"] = Serialization::toJsonArray(workspaces_);

    return JsonStore::write(file_, document);
}

const std::vector<Workspace>& WorkspaceRepository::all() const {
    return workspaces_;
}

const Workspace* WorkspaceRepository::findById(const std::wstring& id) const {
    for (const Workspace& workspace : workspaces_) {
        if (workspace.id == id) {
            return &workspace;
        }
    }
    return nullptr;
}

void WorkspaceRepository::upsert(const Workspace& workspace) {
    for (Workspace& existing : workspaces_) {
        if (existing.id == workspace.id) {
            existing = workspace;
            return;
        }
    }
    workspaces_.push_back(workspace);
}

bool WorkspaceRepository::remove(const std::wstring& id) {
    for (auto it = workspaces_.begin(); it != workspaces_.end(); ++it) {
        if (it->id == id) {
            workspaces_.erase(it);
            return true;
        }
    }
    return false;
}
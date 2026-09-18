#pragma once 


#include <filesystem>
#include <string>
#include <vector>

#include "../core/Workspace.h"


class WorkspaceRepository {
public:
    explicit WorkspaceRepository(std::filesystem::path file);


    bool load();
    bool save() const;

    const std::vector<Workspace>& all() const;

    const Workspace* findById(const std::wstring& id) const;


    void upsert(const Workspace& workspace);


    bool remove(const std::wstring& id);

private:
    std::filesystem::path  file_;
    std::vector<Workspace> workspaces_;
};
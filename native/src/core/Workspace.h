#pragma once

#include <vector>
#include <string>

#include "WorkspaceApp.h"

struct Workspace
{
    std::wstring id;
    std::wstring displayName;
    std::vector<WorkspaceApp> apps;
};

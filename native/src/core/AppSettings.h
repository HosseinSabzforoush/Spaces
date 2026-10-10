#pragma once

#include <string>

enum class Theme { Dark, Light, System };


struct AppSettings {
    Theme theme = Theme::Dark;
    bool  runAtStartup = false;
    bool  rescanOnStartup = true;
    bool  confirmBeforeDelete = true;

    bool         startupWorkspaceEnabled = false;
    std::wstring startupWorkspaceId;
};
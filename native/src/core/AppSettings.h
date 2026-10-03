#pragma once

enum class Theme { Dark, Light, System };


struct AppSettings {
    Theme theme = Theme::Dark;
    bool  runAtStartup = false;
    bool  rescanOnStartup = false;
    bool  confirmBeforeDelete = true;
};
#pragma once

#include <filesystem>

namespace AppConfig {

inline constexpr int kSchemaVersion = 1;

inline constexpr const wchar_t* kDataFolderName  = L"Spaces";
inline constexpr const wchar_t* kWorkspacesFile  = L"workspaces.json";
inline constexpr const wchar_t* kAppCacheFile    = L"apps_cache.json";
inline constexpr const wchar_t* kSettingsFile    = L"settings.json";
inline constexpr const wchar_t* kIconsFolder     = L"icons";

inline constexpr const char* kWindowTitle = "Spaces";
inline constexpr int kWindowWidth  = 1100;
inline constexpr int kWindowHeight = 720;

inline constexpr const char* kFrontendUrl = "http://localhost:5173";


std::filesystem::path dataDir();
std::filesystem::path workspacesPath();
std::filesystem::path appCachePath();
std::filesystem::path settingsPath();
std::filesystem::path iconsDir();   


bool ensureDataDir();

} 
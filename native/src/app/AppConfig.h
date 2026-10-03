#pragma once

#include <filesystem>

namespace AppConfig {

inline constexpr int kSchemaVersion = 1;

inline constexpr const wchar_t* kDataFolderName  = L"Spaces";
inline constexpr const wchar_t* kWorkspacesFile  = L"workspaces.json";
inline constexpr const wchar_t* kAppCacheFile    = L"apps_cache.json";
inline constexpr const wchar_t* kIconsFolder     = L"icons";

inline constexpr const char* kWindowTitle = "Spaces";
inline constexpr int kWindowWidth  = 1100;
inline constexpr int kWindowHeight = 720;

// Dev: the Vite dev server. Swap for a file:// URL to the built frontend
// once you package. Kept as one constant so there is exactly one place
// to change.
inline constexpr const char* kFrontendUrl = "http://localhost:5173";

// %APPDATA%\Spaces\  — created on demand by ensureDataDir().
std::filesystem::path dataDir();
std::filesystem::path workspacesPath();
std::filesystem::path appCachePath();
std::filesystem::path iconsDir();   // created lazily by IconCache on first write

// Returns false if the directory could not be created.
bool ensureDataDir();

} // namespace AppConfig
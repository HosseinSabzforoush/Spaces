#include "AppConfig.h"

#include <system_error>

#include "../win32/EnvExpander.h"

namespace AppConfig {

std::filesystem::path dataDir() {
    const std::wstring appData = expandEnvironmentString(L"%APPDATA%");
    return std::filesystem::path(appData) / kDataFolderName;
}

std::filesystem::path workspacesPath() {
    return dataDir() / kWorkspacesFile;
}

std::filesystem::path appCachePath() {
    return dataDir() / kAppCacheFile;
}

std::filesystem::path iconsDir() {
    return dataDir() / kIconsFolder;
}

bool ensureDataDir() {
    std::error_code ec;
    const std::filesystem::path dir = dataDir();

    if (std::filesystem::exists(dir, ec)) {
        return std::filesystem::is_directory(dir, ec);
    }

    std::filesystem::create_directories(dir, ec);
    return !ec;
}

} // namespace AppConfig
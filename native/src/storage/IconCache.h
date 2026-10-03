#pragma once

#include <filesystem>
#include <optional>
#include <vector>

#include "../core/AppInfo.h"

// Owns %APPDATA%\Spaces\icons\. One PNG per app, named by a stable hash of
// the app id and referenced from AppInfo::iconRef. Pure cache: anything in
// here can be deleted and will be regenerated on the next rescan.
class IconCache {
public:
    explicit IconCache(std::filesystem::path directory);

    // Makes sure `app` has an icon on disk and sets app.iconRef to its
    // filename. Returns false (and clears iconRef) if the app has no exe
    // path or the icon could not be extracted. An icon already on disk is
    // reused, not re-extracted.
    bool ensureIcon(AppInfo& app) const;

    // ensureIcon() for every app, then deletes icon files no app refers to.
    void ensureAll(std::vector<AppInfo>& apps) const;

    // PNG bytes for the app's icon; std::nullopt if it has none.
    std::optional<std::vector<unsigned char>> read(const AppInfo& app) const;

private:
    std::filesystem::path pathFor(const std::wstring& fileName) const;

    std::filesystem::path directory_;
};
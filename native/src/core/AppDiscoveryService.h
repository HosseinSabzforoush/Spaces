#pragma once
#include "AppInfo.h"
#include <string>

#include <vector>

class AppDiscoveryService{

public:
    static std::vector<AppInfo> discoverFromAppPaths();
    static std::vector<AppInfo> discoverFromUninstallKeys();
    static std::vector<AppInfo> discoverFromShortcuts();
    static std::vector<AppInfo> discoverAllApps();

private:
    static std::wstring buildSubkeyPath(const std::wstring &rootPath, const std::wstring &subkeyPath);    
    static std::vector<std::wstring> scanFolderForShortcuts(const std::wstring &rootPath);
};
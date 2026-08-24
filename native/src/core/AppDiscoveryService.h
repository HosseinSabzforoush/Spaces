#pragma once
#include "AppInfo.h"

#include <vector>

class AppDiscoveryService{

public:
    static std::vector<AppInfo> discoverFromAppPaths();
    static std::vector<AppInfo> discoverFromUninstallKeys(); //not designed , can change
    static std::vector<AppInfo> discoverFromShortcuts(); //not designed , can change

private:
    static std::wstring buildSubkeyPath(const std::wstring &rootPath, const std::wstring &subkeyPath);    
};
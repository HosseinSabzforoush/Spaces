#include "AppDiscoveryService.h"
#include "../win32/RegistryKey.h"
#include "../win32/EnvExpander.h"

std::wstring AppDiscoveryService::buildSubkeyPath(const std::wstring &rootPath, const std::wstring &subkeyPath){
    std::wstring fullPath = rootPath + L"\\" + subkeyPath;
    return fullPath;
}

std::vector<AppInfo> AppDiscoveryService::discoverFromAppPaths(){
    const std::wstring rootPath = L"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths";
    std::vector<AppInfo> appsList = {};
    RegistryKey rootKey(HKEY_LOCAL_MACHINE, rootPath);
    if(!rootKey){
        return appsList;
    }
    
    std::vector<std::wstring> subkeys = rootKey.enum_subkeys();
    for(const auto& name : subkeys){
        std::wstring subPath = buildSubkeyPath(rootPath, name);
        RegistryKey subKey(HKEY_LOCAL_MACHINE, subPath);
        if(subKey){
            std::optional<std::wstring> value = subKey.string_read(L"");
            if(value.has_value()){
                std::wstring expanded_value = expandEnvironmentString(value.value());
                AppInfo app{L"0", name, expanded_value, AppSource::Registry};
                appsList.push_back(app);
            }
        }
    }
    return appsList;
}
#include "AppDiscoveryService.h"
#include "../win32/RegistryKey.h"
#include "../win32/EnvExpander.h"
#include "../win32/ComInitializer.h"
#include "../win32/ShortcutResolver.h"

#include <filesystem>
#include <cwctype>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>

namespace fs = std::filesystem;

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
    
    std::vector<std::wstring> subKeys = rootKey.enum_subkeys();
    for(const auto& name : subKeys){
        std::wstring subPath = buildSubkeyPath(rootPath, name);
        RegistryKey subKey(HKEY_LOCAL_MACHINE, subPath);
        if(subKey){
            std::optional<std::wstring> value = subKey.string_read(L"");
            if(value.has_value() && !value.value().empty()){
                std::wstring expanded_value = expandEnvironmentString(value.value());
                if(!(expanded_value.length() < 2) && expanded_value.front() == L'"' && expanded_value.back() == L'"'){
                    std::wstring exePath = expanded_value.substr(1, expanded_value.size() - 2);
                    AppInfo app{L"0", name, exePath, AppSource::Registry};
                    appsList.push_back(app);
                }
                else if((expanded_value.front() == L'"') ^ (expanded_value.back() == L'"')){
                }
                else{
                    AppInfo app{L"0", name, expanded_value, AppSource::Registry};
                    appsList.push_back(app);  
                }
                
            }
        }
    }
    return appsList;
}

std::vector<AppInfo> AppDiscoveryService::discoverFromUninstallKeys(){
    const std::wstring rootPath = L"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall";
    std::vector<AppInfo> appsList = {};
    RegistryKey rootKey(HKEY_LOCAL_MACHINE, rootPath);
    if(!rootKey){
        return appsList;
    }
    std::vector<std::wstring> subKeys = rootKey.enum_subkeys();
    for(const auto& name :subKeys){
        std::wstring subPath = buildSubkeyPath(rootPath, name);
        RegistryKey subKey(HKEY_LOCAL_MACHINE, subPath);
        if(subKey){
            
            std::optional<std::wstring> displayName = subKey.string_read(L"DisplayName");
            if(displayName.has_value()){
                AppInfo app{L"0", displayName.value(), L"", AppSource::Registry};
                appsList.push_back(app);
            }
        }
    }
    return appsList;
}

std::vector<AppInfo> AppDiscoveryService::discoverFromShortcuts(){

    std::vector<AppInfo> appsList = {};

    const std::wstring appDataRoot = L"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs";
    const std::wstring programDataRoot = L"%ProgramData%\\Microsoft\\Windows\\Start Menu\\Programs";
    std::vector<std::wstring> shortcuts = {};

    ComInitializer com;
    if(!com){
        return {};
    }
    ShortcutResolver resolver;
    if(!resolver){
        return {};
    }
    for(const auto& shortcut : scanFolderForShortcuts(expandEnvironmentString(appDataRoot))){
        shortcuts.push_back(shortcut);
    }
    for(const auto& shortcut : scanFolderForShortcuts(expandEnvironmentString(programDataRoot))){
        shortcuts.push_back(shortcut);
    }

    for(const auto& shortcut : shortcuts){

        fs::path shortcutPath(shortcut);
        std::wstring displayName = shortcutPath.stem().wstring();
        std::optional<std::wstring> exePath = resolver.resolve(shortcut);
        fs::path entry(exePath.value());
        std::wstring ext = entry.extension().wstring();
        std::transform(ext.begin(), ext.end(), ext.begin(),[](wchar_t c) { return std::towlower(c); });

        if(exePath.has_value() && !exePath.value().empty() && ext == L".exe"){
            AppInfo app{L"0", displayName, exePath.value(), AppSource::Shortcut};
            appsList.push_back(app);
        }
    }
    return appsList;
}

std::vector<std::wstring> AppDiscoveryService::scanFolderForShortcuts(const std::wstring &rootPath){
    std::vector<std::wstring> filesList = {};
    try
    {
        for(const auto& entry : fs::recursive_directory_iterator(rootPath)){
            if(entry.is_regular_file()){
                std::wstring ext = entry.path().extension().wstring();
                std::transform(ext.begin(), ext.end(), ext.begin(),[](wchar_t c) { return std::towlower(c); });
                if(ext == L".lnk"){
                    filesList.push_back(entry.path().wstring());
                }
            }
        }
        return filesList;
    }
    catch(const std::filesystem::filesystem_error&)
    {
       return {};
    }
    
}

std::vector<AppInfo> AppDiscoveryService::discoverAllApps(){

    std::vector<AppInfo> registryApps = discoverFromAppPaths();
    std::vector<AppInfo> shortcutApps = discoverFromShortcuts();

    std::unordered_map<std::wstring, AppInfo> shortcutsByPath;

    for(const auto& app : shortcutApps){
        std::wstring lowerPath = app.exePath;
        std::transform(lowerPath.begin(), lowerPath.end(), lowerPath.begin(),[](wchar_t c) { return std::towlower(c); });
        shortcutsByPath[lowerPath] = app;
    }

    for(const auto& app : registryApps){
        std::wstring lowerPath = app.exePath;
        std::transform(lowerPath.begin(), lowerPath.end(), lowerPath.begin(),[](wchar_t c) { return std::towlower(c); });
        auto it = shortcutsByPath.find(lowerPath);
        if(it == shortcutsByPath.end()){
            shortcutsByPath[lowerPath] = app;        
        }
    }

    std::wstring windowsPrefix = L"c:\\windows\\";
    std::unordered_set<std::wstring> allowList = {L"powershell.exe", L"cmd.exe", L"taskmgr.exe", L"regedit.exe", L"control.exe", L"charmap.exe", L"mstsc.exe"};
    std::vector<AppInfo> result = {};

    for(const auto& pair : shortcutsByPath){

        std::wstring appPath = pair.second.exePath;
        std::wstring fileName = fs::path(pair.second.exePath).filename().wstring();

        std::transform(appPath.begin(), appPath.end(), appPath.begin(),[](wchar_t c) { return std::towlower(c); });
        std::transform(fileName.begin(), fileName.end(), fileName.begin(),[](wchar_t c) { return std::towlower(c); });

        bool isUnderWindows = (appPath.compare(0, windowsPrefix.size(), windowsPrefix) == 0);
        if(!isUnderWindows){
            result.push_back(pair.second);
        }
        else{
            if(allowList.count(fileName)){
                result.push_back(pair.second);
            }
        }

    }
    return result;
    
}
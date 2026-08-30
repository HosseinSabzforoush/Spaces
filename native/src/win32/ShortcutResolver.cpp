#include "ShortcutResolver.h"

ShortcutResolver::ShortcutResolver(){
    HRESULT instance_result = CoCreateInstance(CLSID_ShellLink, nullptr, CLSCTX_INPROC_SERVER, IID_IShellLinkW, reinterpret_cast<void**>(&m_shellLink));
    if(FAILED(instance_result)){
        valid = false;
        m_shellLink = nullptr;
        m_persistFile = nullptr;
    }
    else{
        HRESULT query_result = m_shellLink->QueryInterface(IID_IPersistFile, reinterpret_cast<void**>(&m_persistFile));
        if(FAILED(query_result)){
            valid = false;
            m_shellLink->Release();
            m_shellLink = nullptr;
            m_persistFile = nullptr;
        }
        else{
            valid = true;
        }
    }
}
ShortcutResolver::~ShortcutResolver(){
    if(m_persistFile != nullptr){
        m_persistFile->Release();
    }
    if(m_shellLink != nullptr){
        m_shellLink->Release();
    }
}

std::optional<std::wstring> ShortcutResolver::resolve(const std::wstring& lnk_path){
    if(!valid){
        return std::nullopt;
    }
    HRESULT load_result = m_persistFile->Load(lnk_path.c_str(), STGM_READ);
    
    if(FAILED(load_result)){
        return std::nullopt;
    }
    wchar_t buffer[MAX_PATH];
    HRESULT getPath_result = m_shellLink->GetPath(buffer, MAX_PATH, nullptr, 0);
    if (FAILED(getPath_result)){
        return std::nullopt;
    }
    return buffer;
}

ShortcutResolver::operator bool() const{
    return valid;
}
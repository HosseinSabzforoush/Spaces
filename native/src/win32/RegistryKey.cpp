#include "RegistryKey.h"

RegistryKey::RegistryKey(HKEY hkey,const std::wstring& lpsubkey){
    LONG result = RegOpenKeyExW(hkey, lpsubkey.c_str(), 0, KEY_READ, &open_hkey);
    if (result != ERROR_SUCCESS){
        open_hkey = nullptr;
    }
}

RegistryKey::~RegistryKey(){
    close();
}

RegistryKey::RegistryKey(RegistryKey&& other) noexcept{
    open_hkey = other.open_hkey;
    other.open_hkey = nullptr;
}

RegistryKey& RegistryKey::operator=(RegistryKey&& other) noexcept{
    if(&other == this){
        return *this;
    }
    close();
    open_hkey = other.open_hkey;
    other.open_hkey = nullptr;
    return *this;
}

void RegistryKey::close(){
    if(open_hkey != nullptr){
        RegCloseKey(open_hkey);
        open_hkey = nullptr;
    }
}

bool RegistryKey::valid() const{
    return open_hkey != nullptr;
}

RegistryKey::operator bool() const{
    return valid();
}

std::optional<std::wstring> RegistryKey::string_read(const std::wstring& value_name) const{
    DWORD data_size;
    LONG result = RegQueryValueExW(open_hkey, value_name.c_str(), nullptr, nullptr, nullptr, &data_size);
    if(result != ERROR_SUCCESS){
        return std::nullopt;
    }
    std::wstring buffer(data_size / sizeof(wchar_t), L' ');
    LONG result2 = RegQueryValueExW(open_hkey, value_name.c_str(), nullptr, nullptr, reinterpret_cast<LPBYTE>(&buffer[0]), &data_size);
    if(result2 != ERROR_SUCCESS){
        return std::nullopt;
    }
    if (!buffer.empty() && buffer.back() == L'\0') {
        buffer.pop_back();
    }
    return buffer;
}

std::vector<std::wstring> RegistryKey::enum_subkeys() const{
    std::vector<std::wstring> result_data;
    DWORD dwindex = 0;
    wchar_t buffer[256];
    DWORD data_size = 256;
    LONG result;
    for(;;){
        data_size = 256;
        result = RegEnumKeyExW(open_hkey, dwindex, buffer, &data_size, nullptr, nullptr, nullptr, nullptr);
        dwindex++;
        if(result == ERROR_SUCCESS){
            result_data.push_back(std::wstring(buffer, data_size));
        }
        else{
            break;
        }
    }
    return result_data;

}
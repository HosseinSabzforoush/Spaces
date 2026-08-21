#pragma once
#include "windows.h"
#include <vector>
#include <optional>
#include <string>

class RegistryKey{
private:
    HKEY open_hkey;
    void close();
    bool valid() const;
public:
    explicit RegistryKey(HKEY hKey,const std::wstring& lpsubkey);
    ~RegistryKey();

    RegistryKey(const RegistryKey&) = delete;
    RegistryKey& operator=(const RegistryKey&) = delete;

    RegistryKey(RegistryKey&& other) noexcept;
    RegistryKey& operator=(RegistryKey&& other) noexcept;

    explicit operator bool() const;

    std::optional<std::wstring> string_read(const std::wstring& value_name) const;
    std::vector<std::wstring> enum_subkeys() const;
};
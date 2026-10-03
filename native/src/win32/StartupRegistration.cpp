#include "StartupRegistration.h"

#include <windows.h>

#include <string>

namespace {

constexpr const wchar_t* kRunKeyPath =
    L"Software\\Microsoft\\Windows\\CurrentVersion\\Run";
constexpr const wchar_t* kValueName = L"Spaces";

class KeyGuard {
public:
    explicit KeyGuard(HKEY key) : key_(key) {}
    ~KeyGuard() {
        if (key_ != nullptr) {
            RegCloseKey(key_);
        }
    }
    KeyGuard(const KeyGuard&) = delete;
    KeyGuard& operator=(const KeyGuard&) = delete;

    HKEY get() const { return key_; }

private:
    HKEY key_;
};

std::wstring currentExePath() {
    std::wstring buffer(MAX_PATH, L'\0');
    for (;;) {
        const DWORD length = GetModuleFileNameW(
            nullptr, buffer.data(), static_cast<DWORD>(buffer.size()));
        if (length == 0) {
            return {};
        }
        if (length < buffer.size()) {
            buffer.resize(length);
            return buffer;
        }
        buffer.resize(buffer.size() * 2);
    }
}

} 

namespace StartupRegistration {

bool isEnabled() {
    HKEY raw = nullptr;
    if (RegOpenKeyExW(HKEY_CURRENT_USER, kRunKeyPath, 0, KEY_QUERY_VALUE, &raw) != ERROR_SUCCESS) {
        return false;
    }
    KeyGuard key(raw);

    DWORD type = 0;
    DWORD size = 0;
    const LONG result = RegQueryValueExW(key.get(), kValueName, nullptr, &type, nullptr, &size);
    return result == ERROR_SUCCESS && type == REG_SZ;
}

bool setEnabled(bool enabled) {
    HKEY raw = nullptr;
    if (RegCreateKeyExW(HKEY_CURRENT_USER, kRunKeyPath, 0, nullptr,
                        REG_OPTION_NON_VOLATILE, KEY_SET_VALUE, nullptr,
                        &raw, nullptr) != ERROR_SUCCESS) {
        return false;
    }
    KeyGuard key(raw);

    if (!enabled) {
        const LONG result = RegDeleteValueW(key.get(), kValueName);
        return result == ERROR_SUCCESS || result == ERROR_FILE_NOT_FOUND;
    }

    const std::wstring exe = currentExePath();
    if (exe.empty()) {
        return false;
    }

   
    const std::wstring command = L"\"" + exe + L"\"";

    const LONG result = RegSetValueExW(
        key.get(), kValueName, 0, REG_SZ,
        reinterpret_cast<const BYTE*>(command.c_str()),
        static_cast<DWORD>((command.size() + 1) * sizeof(wchar_t)));

    return result == ERROR_SUCCESS;
}

} 
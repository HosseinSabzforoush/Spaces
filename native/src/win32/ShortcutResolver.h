#pragma once
#include <optional>
#include <string>
#include <windows.h>
#include <shobjidl.h>

class ShortcutResolver{

private:

    IShellLinkW* m_shellLink;
    IPersistFile* m_persistFile;
    bool valid;

public:

    ShortcutResolver();
    ~ShortcutResolver();

    ShortcutResolver(const ShortcutResolver&) = delete;
    ShortcutResolver& operator=(const ShortcutResolver&) = delete;

    std::optional<std::wstring> resolve(const std::wstring& lnk_path);

    explicit operator bool() const;

};
#pragma once
#include <windows.h>

class Win32Handle {
private:
    HANDLE handle_;
    void close();
    bool valid() const;

public:
    explicit Win32Handle(HANDLE handle);
    ~Win32Handle();

    Win32Handle(const Win32Handle&) = delete;
    Win32Handle& operator=(const Win32Handle&) = delete;

    Win32Handle(Win32Handle&& other) noexcept;
    Win32Handle& operator=(Win32Handle&& other) noexcept;

    HANDLE get() const;
    HANDLE release();
    explicit operator bool() const;
};
#include "Win32Handle.h"

Win32Handle::Win32Handle(HANDLE handle) : handle_(handle) {
}

Win32Handle::~Win32Handle() {
    close();
}

Win32Handle::Win32Handle(Win32Handle&& other) noexcept {
    handle_ = other.handle_;
    other.handle_ = nullptr;
}

Win32Handle& Win32Handle::operator=(Win32Handle&& other) noexcept {
    if (&other == this) {
        return *this;
    }
    close();
    handle_ = other.handle_;
    other.handle_ = nullptr;
    return *this;
}

void Win32Handle::close() {
    if (handle_ != nullptr && handle_ != INVALID_HANDLE_VALUE) {
        CloseHandle(handle_);
        handle_ = nullptr;
    }
}

bool Win32Handle::valid() const {
    return handle_ != nullptr && handle_ != INVALID_HANDLE_VALUE;
}

HANDLE Win32Handle::get() const {
    return handle_;
}

HANDLE Win32Handle::release() {
    HANDLE temp = handle_;
    handle_ = nullptr;
    return temp;
}

Win32Handle::operator bool() const {
    return valid();
}
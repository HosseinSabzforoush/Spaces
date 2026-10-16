#include "FileDialog.h"

#include <windows.h>
#include <commdlg.h>
#include <shobjidl.h>

namespace {

template <typename T>
struct ComRelease {
    T* ptr = nullptr;
    ~ComRelease() {
        if (ptr != nullptr) {
            ptr->Release();
        }
    }
};

}

namespace FileDialog {

std::vector<std::wstring> pickExecutables() {
    std::vector<wchar_t> buffer(32768, L'\0');

    OPENFILENAMEW ofn{};
    ofn.lStructSize = sizeof(ofn);
    ofn.hwndOwner   = GetActiveWindow();
    ofn.lpstrFilter = L"Programs (*.exe)\0*.exe\0";
    ofn.nFilterIndex = 1;
    ofn.lpstrFile   = buffer.data();
    ofn.nMaxFile    = static_cast<DWORD>(buffer.size());
    ofn.lpstrTitle  = L"Choose applications";
    ofn.Flags = OFN_EXPLORER | OFN_ALLOWMULTISELECT | OFN_FILEMUSTEXIST |
                OFN_PATHMUSTEXIST | OFN_NOCHANGEDIR;

    if (!GetOpenFileNameW(&ofn)) {
        return {};
    }

    std::vector<std::wstring> paths;
    const std::wstring first(buffer.data());
    const wchar_t* next = buffer.data() + first.size() + 1;

    if (*next == L'\0') {
        paths.push_back(first);
        return paths;
    }

    const std::wstring folder = (!first.empty() && first.back() == L'\\') ? first : first + L"\\";
    while (*next != L'\0') {
        const std::wstring name(next);
        paths.push_back(folder + name);
        next += name.size() + 1;
    }
    return paths;
}


std::wstring pickDirectory() {
    ComRelease<IFileOpenDialog> dialog;
    if (FAILED(CoCreateInstance(CLSID_FileOpenDialog, nullptr, CLSCTX_INPROC_SERVER,
                                IID_IFileOpenDialog,
                                reinterpret_cast<void**>(&dialog.ptr)))) {
        return {};
    }

    DWORD options = 0;
    if (FAILED(dialog.ptr->GetOptions(&options))) {
        return {};
    }
    dialog.ptr->SetOptions(options | FOS_PICKFOLDERS | FOS_FORCEFILESYSTEM |
                           FOS_PATHMUSTEXIST | FOS_NOCHANGEDIR);
    dialog.ptr->SetTitle(L"Choose a folder");

    if (FAILED(dialog.ptr->Show(GetActiveWindow()))) {
        return {};  
    }

    ComRelease<IShellItem> item;
    if (FAILED(dialog.ptr->GetResult(&item.ptr))) {
        return {};
    }

    PWSTR rawPath = nullptr;
    if (FAILED(item.ptr->GetDisplayName(SIGDN_FILESYSPATH, &rawPath)) || rawPath == nullptr) {
        return {};
    }

    std::wstring path(rawPath);
    CoTaskMemFree(rawPath);
    return path;
}

}

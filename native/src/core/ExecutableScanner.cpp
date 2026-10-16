#include "ExecutableScanner.h"

#include <cwctype>
#include <filesystem>
#include <system_error>

namespace {

constexpr int    kMaxDepth   = 8;
constexpr size_t kMaxResults = 2000;

bool hasExeExtension(const std::filesystem::path& path) {
    std::wstring ext = path.extension().wstring();
    if (ext.size() != 4) {
        return false;
    }
    for (wchar_t& c : ext) {
        c = static_cast<wchar_t>(std::towlower(c));
    }
    return ext == L".exe";
}

}

namespace ExecutableScanner {

std::vector<std::wstring> scan(const std::wstring& directory, bool recursive) {
    namespace fs = std::filesystem;

    std::vector<std::wstring> found;

    std::error_code ec;
    const fs::path root(directory);
    if (!fs::is_directory(root, ec) || ec) {
        return found;
    }

    fs::recursive_directory_iterator it(root, fs::directory_options::skip_permission_denied, ec);
    const fs::recursive_directory_iterator end;
    if (ec) {
        return found;
    }

    while (it != end && found.size() < kMaxResults) {
        if (!recursive || it.depth() >= kMaxDepth) {
            it.disable_recursion_pending();
        }

        std::error_code entryEc;
        if (it->is_regular_file(entryEc) && !entryEc && hasExeExtension(it->path())) {
            found.push_back(it->path().wstring());
        }

        it.increment(ec);
        if (ec) {
            break;
        }
    }

    return found;
}

}

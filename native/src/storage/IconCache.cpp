#include "IconCache.h"

#include <cstdint>
#include <fstream>
#include <iterator>
#include <string>
#include <system_error>
#include <unordered_set>
#include <utility>

#include "../win32/IconExtractor.h"

namespace {


std::wstring fileNameFor(const std::wstring& appId) {
    std::uint64_t hash = 14695981039346656037ULL;
    for (const wchar_t c : appId) {
        hash ^= static_cast<std::uint64_t>(c);
        hash *= 1099511628211ULL;
    }

    static const wchar_t digits[] = L"0123456789abcdef";
    std::wstring name(16, L'0');
    for (int i = 15; i >= 0; --i) {
        name[static_cast<size_t>(i)] = digits[hash & 0xF];
        hash >>= 4;
    }

    name += L".png";
    return name;
}


bool writeAtomically(const std::filesystem::path& target,
                     const std::vector<unsigned char>& bytes) {
    std::error_code ec;
    std::filesystem::create_directories(target.parent_path(), ec);
    if (ec) {
        return false;
    }

    std::filesystem::path temp = target;
    temp += L".tmp";

    {
        std::ofstream out(temp, std::ios::binary | std::ios::trunc);
        if (!out) {
            return false;
        }
        out.write(reinterpret_cast<const char*>(bytes.data()),
                  static_cast<std::streamsize>(bytes.size()));
        if (!out) {
            return false;
        }
    }

    std::filesystem::rename(temp, target, ec);
    if (ec) {
        std::error_code ignored;
        std::filesystem::remove(temp, ignored);
        return false;
    }

    return true;
}

} 

IconCache::IconCache(std::filesystem::path directory)
    : directory_(std::move(directory)) {}

std::filesystem::path IconCache::pathFor(const std::wstring& fileName) const {

    return directory_ / std::filesystem::path(fileName).filename();
}

bool IconCache::ensureIcon(AppInfo& app) const {
    if (app.exePath.empty() || app.id.empty()) {
        app.iconRef.reset();
        return false;
    }

    const std::wstring fileName = fileNameFor(app.id);
    const std::filesystem::path target = pathFor(fileName);

    std::error_code ec;
    if (std::filesystem::exists(target, ec) && !ec) {
        app.iconRef = fileName;
        return true;
    }

    const std::optional<std::vector<unsigned char>> png =
        IconExtractor::extractPng(app.exePath);
    if (!png.has_value() || !writeAtomically(target, *png)) {
        app.iconRef.reset();
        return false;
    }

    app.iconRef = fileName;
    return true;
}

void IconCache::ensureAll(std::vector<AppInfo>& apps) const {
    std::unordered_set<std::wstring> keep;
    for (AppInfo& app : apps) {
        if (ensureIcon(app) && app.iconRef.has_value()) {
            keep.insert(*app.iconRef);
        }
    }

    std::error_code ec;
    if (!std::filesystem::is_directory(directory_, ec)) {
        return;
    }

    for (std::filesystem::directory_iterator it(directory_, ec), end;
         !ec && it != end;
         it.increment(ec)) {
        const std::filesystem::path& file = it->path();
        if (file.extension() != L".png") {
            continue;
        }
        if (keep.count(file.filename().wstring()) == 0) {
            std::error_code ignored;
            std::filesystem::remove(file, ignored);
        }
    }
}

std::optional<std::vector<unsigned char>> IconCache::read(const AppInfo& app) const {
    if (!app.iconRef.has_value()) {
        return std::nullopt;
    }

    std::ifstream in(pathFor(*app.iconRef), std::ios::binary);
    if (!in) {
        return std::nullopt;
    }

    std::vector<unsigned char> bytes((std::istreambuf_iterator<char>(in)),
                                     std::istreambuf_iterator<char>());
    if (bytes.empty()) {
        return std::nullopt;
    }

    return bytes;
}
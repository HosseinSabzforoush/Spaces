#include "JsonStore.h"

#include <fstream>
#include <system_error>

namespace JsonStore {

std::optional<nlohmann::json> read(const std::filesystem::path& file) {
    std::error_code ec;
    if (!std::filesystem::exists(file, ec) || ec) {
        return std::nullopt;
    }

    std::ifstream in(file, std::ios::binary);
    if (!in) {
        return std::nullopt;
    }


    nlohmann::json parsed = nlohmann::json::parse(in, nullptr, false);
    if (parsed.is_discarded()) {
        return std::nullopt;
    }

    return parsed;
}

bool write(const std::filesystem::path& file, const nlohmann::json& data) {
    std::error_code ec;

    const std::filesystem::path parent = file.parent_path();
    if (!parent.empty() && !std::filesystem::exists(parent, ec)) {
        std::filesystem::create_directories(parent, ec);
        if (ec) {
            return false;
        }
    }

    std::filesystem::path temp = file;
    temp += L".tmp";

    {
        std::ofstream out(temp, std::ios::binary | std::ios::trunc);
        if (!out) {
            return false;
        }
        out << data.dump(2);
        if (!out) {
            return false;
        }
    }
    std::filesystem::rename(temp, file, ec);
    if (ec) {
        std::error_code ignored;
        std::filesystem::remove(temp, ignored);
        return false;
    }

    return true;
}

} 
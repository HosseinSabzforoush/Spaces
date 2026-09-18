#pragma once

#include <filesystem>
#include <optional>

#include <nlohmann/json.hpp>


namespace JsonStore {


std::optional<nlohmann::json> read(const std::filesystem::path& file);

bool write(const std::filesystem::path& file, const nlohmann::json& data);

} 
cmake_minimum_required(VERSION 3.16)
project(Spaces LANGUAGES CXX)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin")
set(CMAKE_CXX_STANDARD 17)

include(FetchContent)

FetchContent_Declare(
    webview
    GIT_REPOSITORY https://github.com/webview/webview
    GIT_TAG 0.12.0)
FetchContent_MakeAvailable(webview)

add_executable(Spaces WIN32
    src/app/main.cpp
    # ... rest of your source files as you add them
)
target_link_libraries(Spaces PRIVATE webview::core)
target_include_directories(Spaces PRIVATE third_party/nlohmann)
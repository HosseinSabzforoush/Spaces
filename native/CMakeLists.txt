cmake_minimum_required(VERSION 3.16)
project(Spaces LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin")

include(FetchContent)

set(WEBVIEW_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(WEBVIEW_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)

FetchContent_Declare(
    webview
    GIT_REPOSITORY https://github.com/webview/webview
    GIT_TAG 0.12.0)
FetchContent_MakeAvailable(webview)

add_executable(Spaces
    src/app/main.cpp
    src/win32/Win32Handle.cpp
    src/win32/RegistryKey.cpp
    src/core/AppDiscoveryService.cpp
    src/win32/EnvExpander.cpp
    src/win32/ComInitializer.cpp
    src/win32/ShortcutResolver.cpp
    src/win32/ProcessLauncher.cpp
)

target_include_directories(Spaces PRIVATE third_party/nlohmann)
target_link_libraries(Spaces PRIVATE webview::core advapi32)
target_link_options(Spaces PRIVATE -static-libgcc -static-libstdc++ -static -lpthread)
cmake_minimum_required(VERSION 3.16)
project(Spaces LANGUAGES CXX RC)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin")

# OFF (default): the app loads the built frontend from the "dist" folder next to the exe.
# ON: the app loads http://localhost:5173 (run `npm run dev` yourself) for hot reload.
option(SPACES_DEV_SERVER "Load the frontend from the Vite dev server instead of dist" OFF)

include(FetchContent)

set(WEBVIEW_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(WEBVIEW_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)

FetchContent_Declare(
    webview
    GIT_REPOSITORY https://github.com/webview/webview
    GIT_TAG 0.12.0)
FetchContent_MakeAvailable(webview)

add_executable(Spaces WIN32
    src/app/main.cpp
    src/app/AppConfig.cpp
    resources/spaces.rc

    src/win32/Win32Handle.cpp
    src/win32/RegistryKey.cpp
    src/win32/EnvExpander.cpp
    src/win32/ComInitializer.cpp
    src/win32/ShortcutResolver.cpp
    src/win32/ProcessLauncher.cpp
    src/win32/ProcessSnapshot.cpp
    src/win32/StringConvert.cpp
    src/win32/GuidGenerator.cpp
    src/win32/IconExtractor.cpp
    src/win32/StartupRegistration.cpp

    src/core/AppDiscoveryService.cpp
    src/core/WorkspaceManager.cpp

    src/storage/JsonStore.cpp
    src/storage/WorkspaceRepository.cpp
    src/storage/AppCacheRepository.cpp
    src/storage/IconCache.cpp
    src/storage/SettingsRepository.cpp

    src/bridge/Serialization.cpp
    src/bridge/ApiHandlers.cpp
)

target_include_directories(Spaces PRIVATE third_party resources)

# Rebuild the resource file when the icon changes.
set_source_files_properties(resources/spaces.rc PROPERTIES OBJECT_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/resources/spaces.ico")

if(SPACES_DEV_SERVER)
    target_compile_definitions(Spaces PRIVATE SPACES_DEV_SERVER)
endif()

target_link_libraries(Spaces PRIVATE webview::core advapi32 ole32 shell32 windowscodecs uuid)

target_link_options(Spaces PRIVATE -municode -static-libgcc -static-libstdc++ -static -lpthread)

# After each build, copy frontend/dist next to the exe (build/bin/dist).
add_custom_command(TARGET Spaces POST_BUILD
    COMMAND ${CMAKE_COMMAND}
            -DSRC=${CMAKE_CURRENT_SOURCE_DIR}/../frontend/dist
            -DDST=$<TARGET_FILE_DIR:Spaces>/dist
            -P ${CMAKE_CURRENT_SOURCE_DIR}/cmake/CopyDist.cmake
    VERBATIM)
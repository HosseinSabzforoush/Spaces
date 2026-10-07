# Run by CMake after every build: copies frontend/dist next to Spaces.exe.
# Usage: cmake -DSRC=<frontend/dist> -DDST=<exe folder>/dist -P CopyDist.cmake

if(NOT EXISTS "${SRC}/index.html")
    message(WARNING "frontend/dist/index.html not found. Run 'npm run build' in the frontend folder, then build again.")
    return()
endif()

file(REMOVE_RECURSE "${DST}")
file(COPY "${SRC}/" DESTINATION "${DST}")
message(STATUS "Copied frontend build to ${DST}")
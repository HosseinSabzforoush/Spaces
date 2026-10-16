# Spaces

<p align="center">
  <img src="frontend/public/favicon.svg" width="96" alt="Spaces icon">
</p>

A Windows desktop app for launching groups of applications together. Create a **workspace** (for example "Coding" or "Study"), add the apps you use for it, and start them all with one click.

## Download

Get the latest version from the [Releases page](https://github.com/HosseinSabzforoush/Spaces/releases/latest):

- **`Spaces-Setup-x.y.z.exe`**: the installer (recommended). No administrator rights needed.
- **`Spaces-x.y.z-portable.zip`**: unzip anywhere and run `Spaces.exe`. Keep the `dist` folder next to it.

**Windows warning:** the app is not code-signed yet, so Windows SmartScreen may say "Windows protected your PC". Click **More info**, then **Run anyway**. If Microsoft Defender flags the file, it is a false positive, and the full source code is in this repository.

Requires Windows 10 or 11 with the Microsoft Edge WebView2 runtime (already installed on most systems; the installer tells you if it is missing).

## Features

- Create, edit, duplicate and delete workspaces
- Finds installed apps automatically (registry App Paths and Start Menu shortcuts), skipping uninstalled apps, installers and updaters, and you can add any `.exe` manually with a normal Windows file dialog
- One-click launch of every app in a workspace; apps that are already running are skipped
- App icons pulled from the executables
- Startup options (Settings page):
  - start Spaces with Windows
  - launch a chosen workspace every time Spaces starts
  - scan for apps on startup (can be turned off for a faster start)
- Behaves like a desktop app: no browser right-click menu or browser shortcuts in release builds
- Data is stored locally as JSON in `%APPDATA%\Spaces`

## How it works

The window is a [webview](https://github.com/webview/webview) (Microsoft WebView2) that shows a React interface. The C++ side does the real work and exposes a few functions to the page.

```
React UI  →  frontend/src/native  →  webview bindings  →  C++  →  Windows API
```

```
Spaces/
├── frontend/    React + Vite + TypeScript + Tailwind
├── native/      C++17 backend
│   └── src/
│       ├── win32/     RAII wrappers around Win32 (handles, registry, COM, processes)
│       ├── core/      app discovery and workspace logic
│       ├── storage/   JSON persistence
│       ├── bridge/    the functions the UI calls (webview::bind)
│       └── app/       entry point and config
├── installer/   Inno Setup script
└── scripts/     packaging script
```

## Building from source

### Requirements

- Windows 10 or 11
- [MSYS2](https://www.msys2.org/) UCRT64 toolchain: `g++`, `cmake`, `ninja`
- [Node.js](https://nodejs.org/) 20 or newer
- Git (CMake downloads the webview library on first configure)
- [Inno Setup 6.3+](https://jrsoftware.org/isdl.php) (only if you want to build the installer)

### Build and run

**1. Build the frontend**

```
cd frontend
npm install
npm run build
```

This creates `frontend/dist/index.html`, a single self-contained file.

**2. Build the app**

```
cd native
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

**3. Run**

```
native\build\bin\Spaces.exe
```

The build copies `frontend/dist` to `native/build/bin/dist`. Keep that folder next to `Spaces.exe` when you move the app.

### Development with hot reload

Run the Vite dev server and build the app so it loads from it:

```
cd frontend
npm run dev
```

```
cd native
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Debug -DSPACES_DEV_SERVER=ON
cmake --build build
```

The app then loads `http://localhost:5173`. Debug builds also enable the webview inspector (right-click, Inspect).

Opening the frontend in a normal browser also works: the native calls are replaced by mocks that store data in `localStorage`.

### Packaging a release

From the repository root:

```
powershell -ExecutionPolicy Bypass -File scripts\package.ps1 -Version 1.0.0
```

This builds everything and writes `Spaces-Setup-1.0.0.exe` and `Spaces-1.0.0-portable.zip` to the `release` folder. Upload both to a new GitHub release.

## Known limitations

- Workspaces store only a name and a list of apps. Descriptions, icons, colors and per-app launch options shown in the UI are not saved yet.
- "Scan a folder" does not work in the desktop app yet. Dropping a file onto the drop zone opens the file dialog instead.
- Removing an app from the library is not saved.
- Windows only.


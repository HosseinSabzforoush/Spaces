# Spaces — frontend

React UI for Spaces, a Windows desktop app. A *workspace* is a set of applications that launch together; each app can be enabled/disabled without being removed.

The UI runs inside the native C++ host. It has no backend of its own.

```
React  →  src/native (nativeBridge)  →  C++  →  Windows API
```

## Scripts

```
npm run dev      # Vite dev server (native layer is mocked)
npm run build    # type-check + production build
npm run lint
```

## Structure

```
src/
  app/            router, providers (MotionConfig, Toaster, initial data load)
  layouts/        MainLayout → collapsible Sidebar + <Outlet/> (PageTransition)
  pages/          thin route components
  features/
    workspaces/   cards, editor (draft → save), icon set + picker, launch button, stores
    applications/ app rows, settings dialog, icon, panel (the apps inside one workspace)
    library/      the global app library: drop zone, folder scanner, Add apps popup, store
    settings/     settings store + section/row components
    activity/     activity store
  components/ui/  Button, Modal, ConfirmDialog, ToggleSwitch, EmptyState, Skeleton, Toaster …
  native/         the only place that talks to the host (see below)
  stores/         toastStore, uiStore (sidebar state)
```

State is split into small Zustand stores: `workspaceStore`, `launchStore` (runtime only), `settingsStore`, `activityStore`, `toastStore`. Applications live inside their workspace.

## Native integration points

UI components never call the host directly. They use the abstractions in `src/native`:

| API | Methods | Host command(s) |
| --- | --- | --- |
| `processApi` | `launchWorkspace(workspace)` | `process.launchWorkspace` |
| `fileSystemApi` | `selectExecutables()`, `resolveDroppedFiles(files)`, `selectDirectory()`, `scanForExecutables(dir, { recursive })`, `revealInFolder(path)` | `fileSystem.selectExecutables`, `fileSystem.resolveDroppedFiles`, `fileSystem.selectDirectory`, `fileSystem.scanForExecutables`, `fileSystem.revealInFolder` |
| `appLibraryApi` | `list()`, `saveAll(apps)` | `library.list`, `library.saveAll` |
| `startupApi` | `isEnabled()`, `setEnabled(bool)` | `startup.isEnabled`, `startup.setEnabled` |
| `windowApi` | `setTitle`, `minimize`, `toggleMaximize`, `close` | `window.*` |
| `workspaceApi` | `list()`, `saveAll(workspaces)` | `workspace.list`, `workspace.saveAll` |

`selectExecutables`, `resolveDroppedFiles` and `scanForExecutables` return `{ name, executablePath }[]`. The host should fill `name` from the file's product name where it can. A WebView cannot read the real path of a dropped or picked file, so the host resolves it: `resolveDroppedFiles` receives the dropped file names and must map them to the paths of the files the user actually dropped.

The host must expose `window.nativeBridge.invoke(command, payload): Promise<unknown>`. When it is absent, each call falls back to a mock (bottom of each file), so `npm run dev` works in a plain browser. Mock data and sample Windows paths live only in `src/native`. In mock mode, picked or dropped files are given placeholder paths under `C:\Users\User\Downloads`, and folder scans return a fixed sample list.

## Application model

```ts
interface Application {
  id; name; executablePath; icon?; description; enabled;
  arguments: string[]; workingDirectory: string | null;
  launchConfig?: { environment?: Record<string,string>; [key: string]: unknown };
}
```

`launchConfig` is intentionally open-ended: Chrome profiles, start URLs or other per-app behaviour can be added there (and edited in `AppSettingsDialog`) without changing the model.

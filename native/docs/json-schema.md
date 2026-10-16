# Spaces — JSON contract (v1)

Replaces the earlier draft handed over as a text file. Two differences from
that draft: `launchOrder` / `launchDelayMs` are gone (vector position is the
launch order), and every bridge call returns a uniform envelope.

All strings are UTF-8. All keys are camelCase. Absent optional fields are
omitted, never written as `null`.

## `%APPDATA%\Spaces\workspaces.json`

```json
{
  "version": 1,
  "workspaces": [
    {
      "id": "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
      "displayName": "Work",
      "icon": "code",
      "accentColor": "#3b82f6",
      "apps": [
        { "appId": "c:\\program files\\microsoft vs code\\code.exe" }
      ]
    }
  ]
}
```

`icon` (an icon id from the UI's picker) and `accentColor` (a CSS hex colour)
are optional. Files written before they existed simply lack them, and the
frontend falls back to its defaults.

`apps` entries are objects, not bare strings, so per-app fields can be added
later without migrating existing files.

## `%APPDATA%\Spaces\apps_cache.json`

Disposable. Regenerated on every rescan. `id` is the lowercased `exePath`;
`exePath` keeps its original casing because that is what gets launched.

```json
{
  "version": 1,
  "apps": [
    {
      "id": "c:\\program files\\microsoft vs code\\code.exe",
      "displayName": "Visual Studio Code",
      "exePath": "C:\\Program Files\\Microsoft VS Code\\Code.exe",
      "source": "shortcut",
      "args": "--new-window",
      "workingDir": "C:\\dev",
      "iconRef": "..."
    }
  ]
}
```

`source` is one of `registry` | `shortcut` | `manual`. Unknown values read
back as `manual`.

## Bridge API

Every function is on `window`, returns a Promise resolving to a JSON string.

```
{ "ok": true,  "data": <payload> }
{ "ok": false, "error": "badRequest" | "notFound" | "saveFailed" | "idGenerationFailed" }
```

| Function | Args | `data` |
|---|---|---|
| `getWorkspaces()` | — | array of Workspace |
| `saveWorkspace(ws)` | Workspace (omit `id` to create) | the saved Workspace, with its assigned `id` |
| `deleteWorkspace(id)` | string | `{}` |
| `launchWorkspace(id)` | string | `{ "outcomes": [...] }` |
| `getDiscoveredApps()` | — | array of AppInfo |
| `rescanApps()` | — | array of AppInfo (the new cache) |
| `addManualApp(app)` | `{ displayName?, exePath, args?, workingDir? }` | the saved AppInfo |
| `selectDirectory()` | — | the chosen folder path, or `null` if cancelled |
| `scanExecutables(opts)` | `{ directory, recursive? }` | array of `.exe` paths (capped, depth-limited) |

### Launch outcomes

A workspace launch is not all-or-nothing — one outcome per app:

```json
{ "appId": "...", "status": "launched", "pid": 12345 }
```

`status` is one of:

- `launched` — started; `pid` present
- `alreadyRunning` — a process with the same exe filename was already up
- `appNotFound` — the workspace references an appId no longer in the cache
- `noExePath` — the cached app has an empty exePath
- `launchFailed` — CreateProcess failed

`pid` appears only on `launched`.
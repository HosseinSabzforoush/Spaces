import { appNameFromPath } from '@/utils/paths';
import type { Workspace } from '@/features/workspaces/types';
import type { Application } from '@/features/applications/types';
import type { LibraryApp } from '@/features/library/types';
import type { LaunchResult } from './processApi';
import type { SelectedExecutable } from './fileSystemApi';


interface BackendApp {
  id: string;
  displayName: string;
  exePath: string;
}

interface BackendWorkspace {
  id: string;
  displayName: string;
  apps: { appId: string }[];
}

interface BackendOutcome {
  appId: string;
  status: 'launched' | 'alreadyRunning' | 'appNotFound' | 'noExePath' | 'launchFailed';
}


export function hasBackend(): boolean {
  return typeof (window as unknown as Record<string, unknown>).getWorkspaces === 'function';
}

async function rpc<T>(name: string, ...args: unknown[]): Promise<T> {
  const fn = (window as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>)[name];
  const res = (await fn(...args)) as { ok: boolean; data?: T; error?: string };
  if (!res.ok) throw new Error(res.error ?? `${name} failed`);
  return res.data as T;
}

const appIdOf = (path: string) => path.trim().toLowerCase();


let queue: Promise<unknown> = Promise.resolve();
const enqueue = <T>(job: () => Promise<T>): Promise<T> => {
  const next = queue.then(job, job);
  queue = next.catch(() => undefined);
  return next;
};

const iconCache = new Map<string, Promise<string | undefined>>();
const iconFor = (id: string) => {
  let hit = iconCache.get(id);
  if (!hit) {
    hit = rpc<{ dataUrl: string }>('getAppIcon', id).then(
      (d) => d.dataUrl,
      () => {
        iconCache.delete(id);
        return undefined;
      },
    );
    iconCache.set(id, hit);
  }
  return hit;
};

let scan: Promise<BackendApp[]> | null = null;
function discoveredApps(): Promise<BackendApp[]> {
  scan ??= (async () => {
    const [settings, cached] = await Promise.all([
      rpc<{ rescanOnStartup: boolean }>('getSettings'),
      rpc<BackendApp[]>('getDiscoveredApps'),
    ]);
    return settings.rescanOnStartup || cached.length === 0 ? rpc<BackendApp[]>('rescanApps') : cached;
  })().catch(() => rpc<BackendApp[]>('getDiscoveredApps'));
  return scan;
}

async function registerApps(items: { name: string; executablePath: string }[]) {
  const known = new Set((await rpc<BackendApp[]>('getDiscoveredApps')).map((a) => a.id));
  for (const { name, executablePath } of items) {
    const id = appIdOf(executablePath);
    if (!id || known.has(id)) continue;
    known.add(id);
    await rpc('addManualApp', { displayName: name, exePath: executablePath.trim() });
  }
}


async function workspaceList(): Promise<Workspace[]> {
  const [saved, apps] = await Promise.all([rpc<BackendWorkspace[]>('getWorkspaces'), discoveredApps()]);
  const byId = new Map(apps.map((a) => [a.id, a]));
  const now = Date.now();

  return Promise.all(
    saved.map(async (w): Promise<Workspace> => {
      const entries = await Promise.all(
        w.apps.map(async ({ appId }): Promise<Application | null> => {
          const app = byId.get(appId);
          if (!app) return null;
          return {
            id: app.id,
            name: app.displayName,
            executablePath: app.exePath,
            icon: await iconFor(app.id),
            description: '',
            enabled: true,
            arguments: [],
            workingDirectory: null,
          };
        }),
      );
      return {
        id: w.id,
        title: w.displayName,
        description: '',
        icon: '',
        accentColor: '#3b82f6',
        behavior: { launchOnStartup: false, minimizeOthers: false, closeOnExit: false },
        workingDirectory: '',
        envVars: [],
        apps: entries.filter((e): e is Application => e !== null),
        createdAt: now,
        updatedAt: now,
      };
    }),
  );
}

function workspaceSaveAll(workspaces: Workspace[]): Promise<void> {
  return enqueue(async () => {
    await registerApps(workspaces.flatMap((w) => w.apps));

    const existing = await rpc<BackendWorkspace[]>('getWorkspaces');
    const keep = new Set(workspaces.map((w) => w.id));
    for (const w of existing) {
      if (!keep.has(w.id)) await rpc('deleteWorkspace', w.id);
    }
    for (const w of workspaces) {
      await rpc('saveWorkspace', {
        id: w.id,
        displayName: w.title,
        apps: w.apps.filter((a) => a.executablePath.trim()).map((a) => ({ appId: appIdOf(a.executablePath) })),
      });
    }
  });
}

async function libraryList(): Promise<LibraryApp[]> {
  const apps = await discoveredApps();
  return Promise.all(
    apps.map(async (a) => ({
      id: a.id,
      name: a.displayName,
      executablePath: a.exePath,
      icon: await iconFor(a.id),
      addedAt: 0,
    })),
  );
}

function librarySaveAll(apps: LibraryApp[]): Promise<void> {
  return enqueue(() => registerApps(apps));
}

async function launchWorkspace(workspace: Workspace): Promise<LaunchResult> {
  await queue;
  const { outcomes } = await rpc<{ outcomes: BackendOutcome[] }>('launchWorkspace', workspace.id);

  const result: LaunchResult = { workspaceId: workspace.id, launched: [], skipped: [], failed: [] };
  for (const outcome of outcomes) {
    const matches = workspace.apps.filter((a) => appIdOf(a.executablePath) === outcome.appId);
    for (const app of matches) {
      if (outcome.status === 'launched') result.launched.push(app.id);
      else if (outcome.status === 'alreadyRunning') result.skipped.push(app.id);
      else result.failed.push({ appId: app.id, message: failureMessage(outcome.status) });
    }
  }
  return result;
}

function failureMessage(status: BackendOutcome['status']): string {
  if (status === 'noExePath') return 'Executable path is missing.';
  if (status === 'appNotFound') return 'App not found.';
  return 'Could not start the app.';
}

async function selectExecutables(): Promise<SelectedExecutable[]> {
  const paths = await rpc<string[]>('selectExecutables');
  if (paths.length === 0) return [];

  const known = new Map((await rpc<BackendApp[]>('getDiscoveredApps')).map((a) => [a.id, a]));
  const result: SelectedExecutable[] = [];
  for (const path of paths) {
    const app =
      known.get(appIdOf(path)) ??
      (await rpc<BackendApp>('addManualApp', { displayName: appNameFromPath(path), exePath: path }));
    result.push({ name: app.displayName, executablePath: app.exePath, icon: await iconFor(app.id) });
  }
  return result;
}


type Handler = (payload: never) => Promise<unknown>;

export const handlers: Record<string, Handler> = {
  'workspace.list': workspaceList,
  'workspace.saveAll': workspaceSaveAll,
  'library.list': libraryList,
  'library.saveAll': librarySaveAll,
  'process.launchWorkspace': launchWorkspace,
  'startup.getSettings': async () => {
    const s = await rpc<{ rescanOnStartup: boolean; startupWorkspaceEnabled: boolean; startupWorkspaceId: string }>('getSettings');
    return {
      rescanOnStartup: s.rescanOnStartup,
      startupWorkspaceEnabled: s.startupWorkspaceEnabled,
      startupWorkspaceId: s.startupWorkspaceId || null,
    };
  },
  'startup.saveSettings': async (patch: { startupWorkspaceId?: string | null }) => {
    const { startupWorkspaceId, ...rest } = patch;
    await rpc('saveSettings', {
      ...rest,
      ...(startupWorkspaceId !== undefined && { startupWorkspaceId: startupWorkspaceId ?? '' }),
    });
  },
  'fileSystem.selectExecutables': selectExecutables,
  'fileSystem.resolveDroppedFiles': selectExecutables,
  'fileSystem.selectDirectory': async () => null,
  'fileSystem.scanForExecutables': async () => [],
  'startup.isEnabled': async () => (await rpc<{ runAtStartup: boolean }>('getSettings')).runAtStartup,
  'startup.setEnabled': async ({ enabled }: { enabled: boolean }) => {
    await rpc('saveSettings', { runAtStartup: enabled });
  },
};
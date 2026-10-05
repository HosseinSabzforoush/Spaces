import { create } from 'zustand';
import { workspaceApi } from '@/native';
import { uid } from '@/utils/id';
import { toast } from '@/stores/toastStore';
import { useActivityStore } from '@/features/activity/store/activityStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { DEFAULT_ICON_ID } from '../constants/workspaceIcons';
import { createApplication } from '@/features/applications/utils/createApplication';
import type { Application, NewApplication } from '@/features/applications/types';
import { pathKey } from '@/utils/paths';
import type { Workspace, WorkspaceForm } from '../types';

type Status = 'idle' | 'loading' | 'ready' | 'error';

interface WorkspaceState {
  workspaces: Workspace[];
  status: Status;
  error: string | null;

  query: string;
  load: () => Promise<void>;
  setQuery: (query: string) => void;
  create: (input: { title: string; description?: string }) => Workspace;
  update: (id: string, form: WorkspaceForm) => void;
  addApps: (id: string, apps: NewApplication[]) => number;
  duplicate: (id: string) => Workspace | undefined;
  remove: (id: string) => void;
}

const activity = () => useActivityStore.getState();

const withDefaults = (w: Workspace): Workspace => ({ ...w, icon: w.icon || DEFAULT_ICON_ID });

export const useWorkspaceStore = create<WorkspaceState>((set, get) => {
  const commit = (workspaces: Workspace[]) => {
    set({ workspaces });
    workspaceApi.saveAll(workspaces).catch(() => {
      toast.error("Couldn't save workspaces. Recent changes may be lost when the app closes.");
    });
  };

  return {
    workspaces: [],
    status: 'idle',
    error: null,
    query: '',

    load: async () => {
      if (get().status === 'loading') return;
      set({ status: 'loading', error: null });
      try {
        set({ workspaces: (await workspaceApi.list()).map(withDefaults), status: 'ready' });
      } catch (e) {
        set({ status: 'error', error: e instanceof Error ? e.message : 'Unable to load your workspaces.' });
      }
    },

    setQuery: (query) => set({ query }),

    create: ({ title, description = '' }) => {
      const now = Date.now();
      const workspace: Workspace = {
        id: uid(),
        title: title.trim(),
        description: description.trim(),
        icon: DEFAULT_ICON_ID,
        accentColor: '#3b82f6',
        behavior: { launchOnStartup: false, minimizeOthers: false, closeOnExit: false },
        workingDirectory: '',
        envVars: [],
        apps: [],
        createdAt: now,
        updatedAt: now,
      };
      commit([...get().workspaces, workspace]);
      activity().add('workspace.created', `${workspace.title} created`, workspace.id);
      return workspace;
    },

    update: (id, form) => {
      const previous = get().workspaces.find((w) => w.id === id);
      if (!previous) return;
      const title = form.title.trim();

      commit(get().workspaces.map((w) => (w.id === id ? { ...w, ...form, title, updatedAt: Date.now() } : w)));

      const before = new Set(previous.apps.map((a) => a.id));
      const after = new Set(form.apps.map((a) => a.id));
      form.apps.filter((a) => !before.has(a.id)).forEach((a) => activity().add('app.added', `${a.name} added to ${title}`, id));
      previous.apps.filter((a) => !after.has(a.id)).forEach((a) => activity().add('app.removed', `${a.name} removed from ${title}`, id));
      activity().add('workspace.edited', `${title} edited`, id);
    },

    addApps: (id, list) => {
      const target = get().workspaces.find((w) => w.id === id);
      if (!target) return 0;
      const known = new Set(target.apps.map((a) => pathKey(a.executablePath)));
      const fresh: Application[] = [];
      for (const item of list) {
        const key = pathKey(item.executablePath);
        if (known.has(key)) continue;
        known.add(key);
        fresh.push(createApplication(item));
      }
      if (fresh.length === 0) return 0;
      commit(get().workspaces.map((w) => (w.id === id ? { ...w, apps: [...w.apps, ...fresh], updatedAt: Date.now() } : w)));
      fresh.forEach((a) => activity().add('app.added', `${a.name} added to ${target.title}`, id));
      return fresh.length;
    },

    duplicate: (id) => {
      const source = get().workspaces.find((w) => w.id === id);
      if (!source) return undefined;
      const now = Date.now();
      const copy: Workspace = {
        ...source,
        id: uid(),
        title: `${source.title} (copy)`,
        apps: source.apps.map((a) => ({ ...a, id: uid() })),
        envVars: source.envVars.map((v) => ({ ...v, id: uid() })),
        createdAt: now,
        updatedAt: now,
      };
      commit([...get().workspaces, copy]);
      activity().add('workspace.created', `${copy.title} created`, copy.id);
      return copy;
    },

    remove: (id) => {
      const target = get().workspaces.find((w) => w.id === id);
      if (!target) return;
      commit(get().workspaces.filter((w) => w.id !== id));
      activity().add('workspace.deleted', `${target.title} deleted`);
      const settings = useSettingsStore.getState();
      if (settings.startupWorkspaceId === id) settings.update('startupWorkspaceId', null);
    },
  };
});

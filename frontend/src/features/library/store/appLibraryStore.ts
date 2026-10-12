import { create } from 'zustand';
import { appLibraryApi, type SelectedExecutable } from '@/native';
import { useActivityStore } from '@/features/activity/store/activityStore';
import { toast } from '@/stores/toastStore';
import { pluralize } from '@/utils/format';
import { uid } from '@/utils/id';
import { appNameFromPath, pathKey } from '@/utils/paths';
import type { LibraryApp } from '../types';

type Status = 'idle' | 'loading' | 'ready' | 'error';

interface AddResult {
  added: LibraryApp[];
  existing: LibraryApp[];
}

interface AppLibraryState {
  apps: LibraryApp[];
  status: Status;
  error: string | null;
  load: () => Promise<void>;
  rescan: () => Promise<void>;
  addMany: (entries: SelectedExecutable[]) => AddResult;
  remove: (id: string) => void;
}

export const useAppLibraryStore = create<AppLibraryState>((set, get) => {
  const commit = (apps: LibraryApp[]) => {
    set({ apps });
    appLibraryApi.saveAll(apps).catch(() => {
      toast.error("Couldn't save your app library. Recent changes may be lost when the app closes.");
    });
  };

  return {
    apps: [],
    status: 'idle',
    error: null,

    load: async () => {
      if (get().status === 'loading') return;
      set({ status: 'loading', error: null });
      try {
        set({ apps: await appLibraryApi.list(), status: 'ready' });
      } catch (e) {
        set({ status: 'error', error: e instanceof Error ? e.message : 'Unable to load your apps.' });
      }
    },

    rescan: async () => {
      const apps = await appLibraryApi.list();
      set({ apps });
    },

    addMany: (entries) => {
      const known = new Map(get().apps.map((a) => [pathKey(a.executablePath), a]));
      const added: LibraryApp[] = [];
      const existing: LibraryApp[] = [];
      const now = Date.now();

      for (const entry of entries) {
        const key = pathKey(entry.executablePath);
        const match = known.get(key);
        if (match) {
          if (!existing.includes(match) && !added.includes(match)) existing.push(match);
          continue;
        }
        const app: LibraryApp = {
          id: uid(),
          name: entry.name.trim() || appNameFromPath(entry.executablePath),
          executablePath: entry.executablePath.trim(),
          icon: entry.icon,
          addedAt: now,
        };
        known.set(key, app);
        added.push(app);
      }

      if (added.length > 0) {
        commit([...get().apps, ...added]);
        useActivityStore
          .getState()
          .add('library.added', added.length === 1 ? `${added[0].name} added to library` : `${pluralize(added.length, 'app')} added to library`);
      }
      return { added, existing };
    },

    remove: (id) => {
      const target = get().apps.find((a) => a.id === id);
      if (!target) return;
      commit(get().apps.filter((a) => a.id !== id));
      useActivityStore.getState().add('library.removed', `${target.name} removed from library`);
    },
  };
});
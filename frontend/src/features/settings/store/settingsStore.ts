import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startupApi } from '@/native';
import { toast } from '@/stores/toastStore';

interface SettingsValues {
  startupWorkspaceEnabled: boolean;
  startupWorkspaceId: string | null;
  confirmBeforeRemove: boolean;
  notifyOnLaunch: boolean;
}

interface SettingsState extends SettingsValues {
  startWithWindows: boolean;
  hydrate: () => Promise<void>;
  setStartWithWindows: (enabled: boolean) => Promise<void>;
  update: <K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      startWithWindows: false,
      startupWorkspaceEnabled: false,
      startupWorkspaceId: null,
      confirmBeforeRemove: true,
      notifyOnLaunch: true,

      hydrate: async () => {
        const enabled = await startupApi.isEnabled().catch(() => false);
        set({ startWithWindows: enabled });
      },

      setStartWithWindows: async (enabled) => {
        const previous = get().startWithWindows;
        set({ startWithWindows: enabled });
        try {
          await startupApi.setEnabled(enabled);
        } catch {
          set({ startWithWindows: previous });
          toast.error('Could not update the Windows startup setting.');
        }
      },

      update: (key, value) => set({ [key]: value } as Pick<SettingsValues, typeof key>),
    }),
    {
      name: 'wm.settings',
      partialize: (s) => ({
        startupWorkspaceEnabled: s.startupWorkspaceEnabled,
        startupWorkspaceId: s.startupWorkspaceId,
        confirmBeforeRemove: s.confirmBeforeRemove,
        notifyOnLaunch: s.notifyOnLaunch,
      }),
    },
  ),
);

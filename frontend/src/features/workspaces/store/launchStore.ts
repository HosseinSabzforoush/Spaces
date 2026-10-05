import { create } from 'zustand';
import { processApi } from '@/native';
import { toast } from '@/stores/toastStore';
import { useActivityStore } from '@/features/activity/store/activityStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import type { LaunchState, Workspace } from '../types';

interface LaunchStoreState {
  states: Record<string, LaunchState>;
  launch: (workspace: Workspace) => Promise<void>;
}

export const useLaunchStore = create<LaunchStoreState>((set, get) => ({
  states: {},

  launch: async (workspace) => {
    const { id, title } = workspace;
    if (get().states[id] === 'launching') return;

    const setState = (state: LaunchState) => set((s) => ({ states: { ...s.states, [id]: state } }));
    const activity = useActivityStore.getState();
    setState('launching');

    try {
      const result = await processApi.launchWorkspace(workspace);
      const names = new Map(workspace.apps.map((a) => [a.id, a.name]));
      const nameOf = (appId: string) => names.get(appId) ?? 'Application';

      if (result.launched.length === 0) {
        setState('error');
        activity.add('launch.failed', `${title} could not be launched`, id);
        toast.error(result.failed[0]?.message ?? 'No enabled applications to launch.');
        return;
      }

      setState('running');
      activity.add('workspace.launched', `${title} launched`, id);
      result.launched.forEach((appId) => activity.add('app.opened', `${nameOf(appId)} opened`, id));
      result.failed.forEach((f) => activity.add('launch.failed', `${nameOf(f.appId)} failed to open`, id));

      if (result.failed.length > 0) {
        toast.warning(`${title} launched, but ${result.failed.length} app(s) failed to open.`);
      } else if (useSettingsStore.getState().notifyOnLaunch) {
        const n = result.launched.length;
        toast.success(`${title} launched · ${n} ${n === 1 ? 'app' : 'apps'} opened`);
      }
    } catch (e) {
      setState('error');
      activity.add('launch.failed', `${title} could not be launched`, id);
      toast.error(e instanceof Error ? e.message : 'Failed to launch the workspace.');
    }
  },
}));

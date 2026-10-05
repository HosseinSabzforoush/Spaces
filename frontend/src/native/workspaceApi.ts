import type { Workspace } from '@/features/workspaces/types';
import { callNative } from './nativeBridge';
import { delay } from './mocks/delay';
import { seedWorkspaces } from './mocks/seedWorkspaces';

const KEY = 'wm.workspaces';

export const workspaceApi = {
  list(): Promise<Workspace[]> {
    return callNative('workspace.list', undefined, mockList);
  },
  saveAll(workspaces: Workspace[]): Promise<void> {
    return callNative('workspace.saveAll', workspaces, () => localStorage.setItem(KEY, JSON.stringify(workspaces)));
  },
};

async function mockList(): Promise<Workspace[]> {
  await delay(350);
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Workspace[];
    } catch {
      console.warn('Stored workspaces are corrupted; falling back to defaults.');
    }
  }
  return seedWorkspaces();
}

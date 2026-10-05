import type { Workspace } from '@/features/workspaces/types';
import { callNative } from './nativeBridge';
import { delay } from './mocks/delay';

export interface LaunchResult {
  workspaceId: string;

  launched: string[];

  skipped: string[];
  failed: { appId: string; message: string }[];
}

export const processApi = {
  launchWorkspace(workspace: Workspace): Promise<LaunchResult> {
    return callNative('process.launchWorkspace', workspace, () => mockLaunchWorkspace(workspace));
  },
};

async function mockLaunchWorkspace(workspace: Workspace): Promise<LaunchResult> {
  await delay(1400);
  const result: LaunchResult = { workspaceId: workspace.id, launched: [], skipped: [], failed: [] };
  for (const app of workspace.apps) {
    if (!app.enabled) result.skipped.push(app.id);
    else if (!app.executablePath.trim()) result.failed.push({ appId: app.id, message: 'Executable path is missing.' });
    else result.launched.push(app.id);
  }
  return result;
}

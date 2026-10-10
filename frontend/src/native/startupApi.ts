import { callNative } from './nativeBridge';

const KEY = 'wm.startWithWindows';

export interface StartupSettings {
  rescanOnStartup: boolean;
  startupWorkspaceEnabled: boolean;
  startupWorkspaceId: string | null;
}

export const startupApi = {
  isEnabled(): Promise<boolean> {
    return callNative('startup.isEnabled', undefined, () => localStorage.getItem(KEY) === 'true');
  },
  setEnabled(enabled: boolean): Promise<void> {
    return callNative('startup.setEnabled', { enabled }, () => localStorage.setItem(KEY, String(enabled)));
  },
  getSettings(): Promise<StartupSettings | null> {
    return callNative('startup.getSettings', undefined, () => null);
  },
  saveSettings(patch: Partial<StartupSettings>): Promise<void> {
    return callNative('startup.saveSettings', patch, () => undefined);
  },
};
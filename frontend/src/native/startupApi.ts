import { callNative } from './nativeBridge';

const KEY = 'wm.startWithWindows';

export const startupApi = {
  isEnabled(): Promise<boolean> {
    return callNative('startup.isEnabled', undefined, () => localStorage.getItem(KEY) === 'true');
  },
  setEnabled(enabled: boolean): Promise<void> {
    return callNative('startup.setEnabled', { enabled }, () => localStorage.setItem(KEY, String(enabled)));
  },
};

import { callNative } from './nativeBridge';

export const windowApi = {
  setTitle(title: string): Promise<void> {
    return callNative('window.setTitle', { title }, () => {
      document.title = title;
    });
  },
  minimize(): Promise<void> {
    return callNative('window.minimize', undefined, () => undefined);
  },
  toggleMaximize(): Promise<void> {
    return callNative('window.toggleMaximize', undefined, () => undefined);
  },
  close(): Promise<void> {
    return callNative('window.close', undefined, () => undefined);
  },
};

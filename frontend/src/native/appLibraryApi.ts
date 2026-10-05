import type { LibraryApp } from '@/features/library/types';
import { callNative } from './nativeBridge';
import { delay } from './mocks/delay';
import { seedLibrary } from './mocks/seedLibrary';

const KEY = 'wm.library';

export const appLibraryApi = {
  list(): Promise<LibraryApp[]> {
    return callNative('library.list', undefined, mockList);
  },
  saveAll(apps: LibraryApp[]): Promise<void> {
    return callNative('library.saveAll', apps, () => localStorage.setItem(KEY, JSON.stringify(apps)));
  },
};

async function mockList(): Promise<LibraryApp[]> {
  await delay(300);
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as LibraryApp[];
    } catch {
      console.warn('Stored app library is corrupted; falling back to defaults.');
    }
  }
  return seedLibrary();
}

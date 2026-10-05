import { appNameFromPath, isExecutableName } from '@/utils/paths';
import { callNative } from './nativeBridge';
import { delay } from './mocks/delay';
import { SCAN_CATALOG } from './mocks/scanCatalog';

export interface SelectedExecutable {
  executablePath: string;
  name: string;
}

export interface ScanOptions {
  recursive: boolean;
}

export const fileSystemApi = {
  selectExecutables(): Promise<SelectedExecutable[]> {
    return callNative('fileSystem.selectExecutables', undefined, mockSelectExecutables);
  },
  resolveDroppedFiles(files: File[]): Promise<SelectedExecutable[]> {
    return callNative('fileSystem.resolveDroppedFiles', files.map((f) => f.name), () => toEntries(files));
  },
  selectDirectory(): Promise<string | null> {
    return callNative('fileSystem.selectDirectory', undefined, async () => {
      await delay(200);
      return 'C:\\Program Files';
    });
  },
  scanForExecutables(directory: string, options: ScanOptions): Promise<SelectedExecutable[]> {
    return callNative('fileSystem.scanForExecutables', { directory, ...options }, () => mockScan(directory, options));
  },
  revealInFolder(path: string): Promise<void> {
    return callNative('fileSystem.revealInFolder', { path }, () => {
      throw new Error('Showing a file in its folder is available in the desktop app.');
    });
  },
};

const MOCK_DOWNLOADS = 'C:\\Users\\User\\Downloads';

function toEntries(files: File[]): SelectedExecutable[] {
  return files
    .filter((f) => isExecutableName(f.name))
    .map((f) => ({ name: appNameFromPath(f.name), executablePath: `${MOCK_DOWNLOADS}\\${f.name}` }));
}

function mockSelectExecutables(): Promise<SelectedExecutable[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.exe';
    input.multiple = true;
    input.addEventListener('change', () => resolve(toEntries(Array.from(input.files ?? []))));
    input.addEventListener('cancel', () => resolve([]));
    input.click();
  });
}

async function mockScan(directory: string, { recursive }: ScanOptions): Promise<SelectedExecutable[]> {
  await delay(900);
  const base = directory.replace(/[\\/]+$/, '');
  return SCAN_CATALOG.filter((_, index) => recursive || index % 3 === 0).map(({ name, folder, file }) => ({
    name,
    executablePath: recursive ? `${base}\\${folder}\\${file}` : `${base}\\${file}`,
  }));
}

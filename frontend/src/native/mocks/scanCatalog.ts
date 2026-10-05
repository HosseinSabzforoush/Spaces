export interface ScanCatalogEntry {
  name: string;
  folder: string;
  file: string;
}

export const SCAN_CATALOG: ScanCatalogEntry[] = [
  { name: 'Git Bash', folder: 'Git', file: 'git-bash.exe' },
  { name: 'Unins000', folder: 'Git', file: 'unins000.exe' },
  { name: 'Notepad++', folder: 'Notepad++', file: 'notepad++.exe' },
  { name: '7-Zip File Manager', folder: '7-Zip', file: '7zFM.exe' },
  { name: 'Uninstall', folder: '7-Zip', file: 'Uninstall.exe' },
  { name: 'VLC media player', folder: 'VLC', file: 'vlc.exe' },
  { name: 'OBS Studio', folder: 'OBS Studio', file: 'obs64.exe' },
  { name: 'Blender', folder: 'Blender', file: 'blender.exe' },
  { name: 'Update', folder: 'Discord', file: 'Update.exe' },
  { name: 'Docker Desktop', folder: 'Docker', file: 'Docker Desktop.exe' },
  { name: 'Crashpad_handler', folder: 'Docker', file: 'crashpad_handler.exe' },
  { name: 'Postman', folder: 'Postman', file: 'Postman.exe' },
  { name: 'Steam', folder: 'Steam', file: 'steam.exe' },
  { name: 'Vc_redist.x64', folder: 'Steam', file: 'vc_redist.x64.exe' },
];

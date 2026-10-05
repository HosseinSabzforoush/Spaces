import vscodeIcon from '@/assets/images/vscode-icon.png';
import type { LibraryApp } from '@/features/library/types';

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 0, 1);

const entries: Array<[string, string, string?]> = [
  ['Visual Studio Code', 'C:\\Program Files\\Microsoft VS Code\\Code.exe', vscodeIcon],
  ['Windows Terminal', 'C:\\Program Files\\WindowsApps\\wt.exe'],
  ['Google Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'],
  ['Slack', 'C:\\Program Files\\Slack\\Slack.exe'],
  ['Notion', 'C:\\Program Files\\Notion\\Notion.exe'],
  ['Figma', 'C:\\Program Files\\Figma\\Figma.exe'],
  ['Adobe Photoshop', 'C:\\Program Files\\Adobe\\Adobe Photoshop\\Photoshop.exe'],
  ['Obsidian', 'C:\\Program Files\\Obsidian\\Obsidian.exe'],
  ['Zoom', 'C:\\Program Files\\Zoom\\bin\\Zoom.exe'],
  ['Discord', 'C:\\Users\\User\\AppData\\Local\\Discord\\Discord.exe'],
  ['Spotify', 'C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe'],
  ['Postman', 'C:\\Users\\User\\AppData\\Local\\Postman\\Postman.exe'],
  ['Notepad++', 'C:\\Program Files\\Notepad++\\notepad++.exe'],
  ['VLC media player', 'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe'],
];

export function seedLibrary(): LibraryApp[] {
  return entries.map(([name, executablePath, icon], index) => ({
    id: `library-${index}`,
    name,
    executablePath,
    icon,
    addedAt: NOW - (entries.length - index) * DAY,
  }));
}

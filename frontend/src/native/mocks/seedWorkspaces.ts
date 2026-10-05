import vscodeIcon from '@/assets/images/vscode-icon.png';
import type { Application } from '@/features/applications/types';
import type { Workspace, WorkspaceBehavior } from '@/features/workspaces/types';

const NOW = Date.UTC(2026, 0, 1);
const behavior: WorkspaceBehavior = { launchOnStartup: false, minimizeOthers: false, closeOnExit: false };

const app = (id: string, name: string, executablePath: string, description: string, extra: Partial<Application> = {}): Application => ({
  id,
  name,
  executablePath,
  description,
  enabled: true,
  arguments: [],
  workingDirectory: null,
  ...extra,
});

export function seedWorkspaces(): Workspace[] {
  return [
    {
      id: 'coding',
      title: 'Coding',
      description: 'Main development environment',
      icon: 'code',
      accentColor: '#3b82f6',
      behavior: { ...behavior, launchOnStartup: true, closeOnExit: true },
      workingDirectory: 'C:\\Users\\User\\Workspace\\Coding',
      envVars: [],
      createdAt: NOW,
      updatedAt: NOW,
      apps: [
        app('coding-vscode', 'Visual Studio Code', 'C:\\Program Files\\Microsoft VS Code\\Code.exe', 'Code editor', { icon: vscodeIcon, arguments: ['--new-window'] }),
        app('coding-terminal', 'Windows Terminal', 'C:\\Program Files\\WindowsApps\\wt.exe', 'Terminal'),
        app('coding-chrome', 'Google Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'Google Chrome', { arguments: ['--profile-directory=Default'] }),
        app('coding-slack', 'Slack', 'C:\\Program Files\\Slack\\Slack.exe', 'Team chat', { enabled: false, arguments: ['--start-minimized'] }),
        app('coding-notion', 'Notion', 'C:\\Program Files\\Notion\\Notion.exe', 'Notes and docs'),
      ],
    },
    {
      id: 'design',
      title: 'Design',
      description: 'Interface and visual design',
      icon: 'palette',
      accentColor: '#ec4899',
      behavior,
      workingDirectory: '',
      envVars: [],
      createdAt: NOW,
      updatedAt: NOW,
      apps: [
        app('design-figma', 'Figma', 'C:\\Program Files\\Figma\\Figma.exe', 'Interface design'),
        app('design-photoshop', 'Adobe Photoshop', 'C:\\Program Files\\Adobe\\Adobe Photoshop\\Photoshop.exe', 'Image editing'),
        app('design-slack', 'Slack', 'C:\\Program Files\\Slack\\Slack.exe', 'Team chat'),
        app('design-chrome', 'Google Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'Behance inspiration', { arguments: ['https://www.behance.net'] }),
      ],
    },
    {
      id: 'study',
      title: 'Study',
      description: 'Notes, lectures and research',
      icon: 'graduation-cap',
      accentColor: '#14b8a6',
      behavior,
      workingDirectory: '',
      envVars: [],
      createdAt: NOW,
      updatedAt: NOW,
      apps: [
        app('study-notion', 'Notion', 'C:\\Program Files\\Notion\\Notion.exe', 'Notes and docs'),
        app('study-obsidian', 'Obsidian', 'C:\\Program Files\\Obsidian\\Obsidian.exe', 'Knowledge base'),
        app('study-zoom', 'Zoom', 'C:\\Program Files\\Zoom\\bin\\Zoom.exe', 'Video calls'),
        app('study-chrome', 'Google Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'Google Chrome'),
      ],
    },
  ];
}

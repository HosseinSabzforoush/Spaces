import type { Application } from '@/features/applications/types';

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
}

export interface WorkspaceBehavior {
  launchOnStartup: boolean;
  minimizeOthers: boolean;
  closeOnExit: boolean;
}

export interface WorkspaceForm {
  title: string;
  description: string;
  icon: string;
  accentColor: string;
  behavior: WorkspaceBehavior;
  workingDirectory: string;
  envVars: EnvVariable[];
  apps: Application[];
}

export interface Workspace extends WorkspaceForm {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export type LaunchState = 'idle' | 'launching' | 'running' | 'error';

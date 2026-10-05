
export interface LaunchConfig {
  environment?: Record<string, string>;
  [key: string]: unknown;
}

export interface Application {
  id: string;
  name: string;
  executablePath: string;
  icon?: string;
  description: string;
  enabled: boolean;
  arguments: string[];
  workingDirectory: string | null;
  launchConfig?: LaunchConfig;
}

export type NewApplication = Pick<Application, 'name' | 'executablePath'> &
  Partial<Pick<Application, 'icon' | 'description'>>;

export type ApplicationSettings = Pick<Application, 'name' | 'description' | 'arguments' | 'workingDirectory'>;

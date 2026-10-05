import { uid } from '@/utils/id';
import type { Application, NewApplication } from '../types';

export const createApplication = (app: NewApplication): Application => ({
  id: uid(),
  name: app.name,
  executablePath: app.executablePath,
  icon: app.icon,
  description: app.description ?? '',
  enabled: true,
  arguments: [],
  workingDirectory: null,
});

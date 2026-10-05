import type { NewApplication } from '@/features/applications/types';
import type { LibraryApp } from '../types';

export const toNewApplication = ({ name, executablePath, icon }: LibraryApp): NewApplication => ({
  name,
  executablePath,
  icon,
});

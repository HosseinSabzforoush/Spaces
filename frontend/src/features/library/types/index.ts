export interface LibraryApp {
  id: string;
  name: string;
  executablePath: string;
  icon?: string;
  addedAt: number;
}

export type LibrarySort = 'name-asc' | 'name-desc' | 'recent' | 'most-used';

export type LibraryFilter = 'all' | 'used' | 'unused';

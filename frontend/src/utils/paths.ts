export const pathKey = (path: string) => path.trim().replace(/\//g, '\\').replace(/\\+$/, '').toLowerCase();

export const fileNameFromPath = (path: string) => path.split(/[\\/]/).filter(Boolean).pop() ?? path;

export const folderFromPath = (path: string) => path.split(/[\\/]/).slice(0, -1).join('\\');

export const isExecutableName = (name: string) => /\.exe$/i.test(name.trim());

export function appNameFromPath(path: string) {
  const base = fileNameFromPath(path).replace(/\.exe$/i, '');
  return base.charAt(0).toUpperCase() + base.slice(1);
}

const HELPER_PATTERN = /(^|[\s._-])(unins\w*|uninstall\w*|setup\w*|install\w*|update\w*|updater|crash\w*|helper\w*|vc_?redist\w*)([\s._-]|$)/i;

export const isHelperExecutable = (path: string) =>
  HELPER_PATTERN.test(fileNameFromPath(path).replace(/\.exe$/i, ''));

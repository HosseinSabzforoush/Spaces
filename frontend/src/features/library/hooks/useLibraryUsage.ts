import { useMemo } from 'react';
import { useWorkspaceStore } from '@/features/workspaces/store/workspaceStore';
import { pathKey } from '@/utils/paths';

export function useLibraryUsage(): Map<string, string[]> {
  const workspaces = useWorkspaceStore((s) => s.workspaces);

  return useMemo(() => {
    const usage = new Map<string, string[]>();
    for (const workspace of workspaces) {
      for (const app of workspace.apps) {
        const key = pathKey(app.executablePath);
        const titles = usage.get(key) ?? [];
        if (!titles.includes(workspace.title)) titles.push(workspace.title);
        usage.set(key, titles);
      }
    }
    return usage;
  }, [workspaces]);
}

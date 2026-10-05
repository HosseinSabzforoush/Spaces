import { Copy, FolderOpen, Plus, Trash2 } from 'lucide-react';
import DropdownMenu from '@/components/ui/DropdownMenu';
import AppIcon from '@/features/applications/components/AppIcon';
import { fileSystemApi } from '@/native';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { pluralize } from '@/utils/format';
import type { LibraryApp } from '../types';

interface LibraryAppCardProps {
  app: LibraryApp;
  usedIn: string[];
  onAddToWorkspace: () => void;
  onRemove: () => void;
}

const actionClass = 'rounded-md p-1.5 transition-colors';

export default function LibraryAppCard({ app, usedIn, onAddToWorkspace, onRemove }: LibraryAppCardProps) {
  const reveal = async () => {
    try {
      await fileSystemApi.revealInFolder(app.executablePath);
    } catch (e) {
      toast.warning(e instanceof Error ? e.message : "Couldn't open the folder.");
    }
  };

  const copyPath = async () => {
    try {
      await navigator.clipboard.writeText(app.executablePath);
      toast.success('Path copied');
    } catch {
      toast.error("Couldn't copy the path.");
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors hover:border-border-hover">
      <AppIcon app={app} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{app.name}</p>
        <p className="truncate font-mono text-xs text-text-muted" title={app.executablePath}>{app.executablePath}</p>
        <p className={cn('truncate text-xs', usedIn.length > 0 ? 'text-success' : 'text-text-disabled')} title={usedIn.join(', ')}>
          {usedIn.length > 0 ? `In ${pluralize(usedIn.length, 'workspace')}` : 'Not in any workspace'}
        </p>
      </div>
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          aria-label={`Add ${app.name} to a workspace`}
          title="Add to workspace"
          onClick={onAddToWorkspace}
          className={cn(actionClass, 'text-text-muted hover:bg-card-active hover:text-text-primary')}
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          aria-label={`Remove ${app.name} from library`}
          title="Remove from library"
          onClick={onRemove}
          className={cn(actionClass, 'text-danger/70 hover:bg-danger/10 hover:text-danger')}
        >
          <Trash2 size={16} />
        </button>
        <DropdownMenu
          label={`${app.name} options`}
          items={[
            { label: 'Show in folder', icon: <FolderOpen size={14} />, onSelect: () => void reveal() },
            { label: 'Copy path', icon: <Copy size={14} />, onSelect: () => void copyPath() },
          ]}
        />
      </div>
    </div>
  );
}

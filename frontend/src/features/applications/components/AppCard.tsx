import { Settings2, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { formatArguments } from '@/utils/arguments';
import AppIcon from './AppIcon';
import type { Application } from '../types';

interface AppCardProps {
  app: Application;
  layout: 'list' | 'grid';
  onToggle: (enabled: boolean) => void;
  onRemove: () => void;
  onConfigure: () => void;
}

const actionClass = 'cursor-pointer rounded-md p-1.5 transition-colors';

export default function AppCard({ app, layout, onToggle, onRemove, onConfigure }: AppCardProps) {
  const details = [app.executablePath, formatArguments(app.arguments)].filter(Boolean).join(' ');

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors hover:border-border-hover">

      <div className={cn('flex min-w-0 flex-1 items-center gap-3 transition-opacity', !app.enabled && 'opacity-55')} title={details}>
        <AppIcon app={app} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{app.name}</p>
          <p className="truncate text-xs text-text-muted">{app.description || app.executablePath}</p>
        </div>
      </div>

      <div className={cn('flex shrink-0 items-center', layout === 'grid' ? 'gap-1' : 'gap-2')}>
        <button
          type="button"
          aria-label={`Configure ${app.name}`}
          title="Configure"
          onClick={onConfigure}
          className={cn(actionClass, 'text-text-muted hover:bg-card-active hover:text-text-primary')}
        >
          <Settings2 size={16} />
        </button>
        <ToggleSwitch checked={app.enabled} onChange={onToggle} label={`${app.enabled ? 'Disable' : 'Enable'} ${app.name}`} />
        <button
          type="button"
          aria-label={`Remove ${app.name}`}
          title="Remove"
          onClick={onRemove}
          className={cn(actionClass, 'text-danger/70 hover:bg-danger/10 hover:text-danger')}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

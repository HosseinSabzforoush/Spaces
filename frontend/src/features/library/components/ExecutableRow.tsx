import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import AppIcon from '@/features/applications/components/AppIcon';

interface ExecutableRowProps {
  name: string;
  detail: string;
  icon?: string;
  checked: boolean;
  disabled?: boolean;
  badge?: string;
  onToggle: () => void;
}

export default function ExecutableRow({ name, detail, icon, checked, disabled, badge, onToggle }: ExecutableRowProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={name}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
        disabled ? 'cursor-default opacity-60' : 'hover:bg-card-hover',
        checked && 'bg-card-active',
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
          checked ? 'border-accent bg-accent text-white' : 'border-border-hover',
        )}
      >
        {checked && <Check size={13} strokeWidth={3} />}
      </span>
      <AppIcon app={{ name, icon }} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{name}</span>
        <span className="block truncate text-xs text-text-muted" title={detail}>{detail}</span>
      </span>
      {badge && <span className="shrink-0 rounded-md bg-card-active px-2 py-0.5 text-xs text-text-muted">{badge}</span>}
    </button>
  );
}

import { useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { cn } from '@/utils/cn';
import { WORKSPACE_ICONS } from '../constants/workspaceIcons';
import WorkspaceIcon from './WorkspaceIcon';

interface WorkspaceIconPickerProps {
  icon: string;
  accentColor: string;
  onChange: (icon: string) => void;
}

export default function WorkspaceIconPicker({ icon, accentColor, onChange }: WorkspaceIconPickerProps) {
  const [open, setOpen] = useState(false);

  const select = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-text-muted">Icon</span>
      <button
        type="button"
        aria-label="Change icon"
        onClick={() => setOpen(true)}
        className="group relative h-16 w-16 rounded-xl bg-border p-1 transition-colors hover:bg-border-hover"
        style={{ boxShadow: `0 0 0 1px ${accentColor}55` }}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-card">
          <WorkspaceIcon icon={icon} color={accentColor} size="lg" className="bg-transparent!" />
        </span>
        <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-lg border border-border bg-card-active group-hover:border-border-hover">
          <Pencil size={13} />
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Choose an icon" className="max-w-lg">
        <div role="radiogroup" aria-label="Workspace icon" className="grid grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))] gap-2">
          {WORKSPACE_ICONS.map(({ id, label, Icon }) => {
            const selected = id === icon;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={label}
                title={label}
                onClick={() => select(id)}
                className={cn(
                  'relative flex flex-col items-center gap-1.5 rounded-lg border px-1 py-2.5 text-[11px] transition-colors',
                  selected ? 'border-border-active bg-card-active text-text-primary' : 'border-border bg-card text-text-secondary hover:border-border-hover hover:bg-card-hover',
                )}
              >
                <Icon size={20} style={selected ? { color: accentColor } : undefined} />
                <span className="w-full truncate text-center">{label}</span>
                {selected && <Check size={12} className="absolute top-1 right-1 text-accent" />}
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

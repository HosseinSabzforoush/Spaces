import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}

export default function Tabs<T extends string>({ tabs, value, onChange, label }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg border border-border bg-card p-1">
      {tabs.map(({ id, label: text, icon: Icon }) => {
        const selected = id === value;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(id)}
            className={cn(
              'flex min-w-0 items-center justify-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
              selected ? 'bg-card-active font-medium text-text-primary' : 'text-text-muted hover:text-text-primary',
            )}
          >
            {Icon && <Icon size={15} className="shrink-0 max-[30rem]:hidden" />}
            <span className="truncate">{text}</span>
          </button>
        );
      })}
    </div>
  );
}

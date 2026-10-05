import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: 'default' | 'danger';
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, tone = 'default', className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-12 text-center', className)}>
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl border',
          tone === 'danger' ? 'border-danger/30 bg-danger/10 text-danger' : 'border-border bg-card text-text-muted',
        )}
      >
        <Icon size={22} />
      </div>
      <div>
        <p className="text-base font-semibold">{title}</p>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

import type { ReactNode } from 'react';

export default function SettingsRow({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm">{title}</p>
        {description && <p className="text-xs text-text-muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}

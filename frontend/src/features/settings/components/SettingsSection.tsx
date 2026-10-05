import type { ReactNode } from 'react';

export default function SettingsSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-xs text-text-muted">{description}</p>}
      </div>
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card px-5">{children}</div>
    </section>
  );
}

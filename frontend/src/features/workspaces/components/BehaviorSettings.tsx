import ToggleSwitch from '@/components/ui/ToggleSwitch';
import type { WorkspaceBehavior } from '../types';

const OPTIONS: { key: keyof WorkspaceBehavior; title: string; description: string }[] = [
  { key: 'launchOnStartup', title: 'Launch on startup', description: 'Open this workspace automatically when the app starts' },
  { key: 'minimizeOthers', title: 'Minimize other apps', description: 'Minimize running apps before launching' },
  { key: 'closeOnExit', title: 'Close apps on exit', description: 'Close all apps when the workspace session ends' },
];

interface BehaviorSettingsProps {
  value: WorkspaceBehavior;
  onChange: (key: keyof WorkspaceBehavior, checked: boolean) => void;
}

export default function BehaviorSettings({ value, onChange }: BehaviorSettingsProps) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">Behavior</h3>
      <div className="flex flex-col divide-y divide-border">
        {OPTIONS.map((o) => (
          <div key={o.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm">{o.title}</p>
              <p className="text-xs text-text-muted">{o.description}</p>
            </div>
            <ToggleSwitch checked={value[o.key]} onChange={(c) => onChange(o.key, c)} label={o.title} />
          </div>
        ))}
      </div>
    </section>
  );
}

import { Rocket } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useLaunchStore } from '../store/launchStore';
import type { Workspace } from '../types';

interface LaunchButtonProps {
  workspace: Workspace;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function LaunchButton({ workspace, label = 'Launch', size = 'md', className }: LaunchButtonProps) {
  const launching = useLaunchStore((s) => s.states[workspace.id] === 'launching');
  const launch = useLaunchStore((s) => s.launch);
  const hasEnabledApps = workspace.apps.some((a) => a.enabled);

  return (
    <Button
      variant="success"
      size={size}
      loading={launching}
      disabled={!hasEnabledApps}
      title={hasEnabledApps ? undefined : 'Enable at least one app to launch this workspace'}
      icon={<Rocket size={16} />}
      iconAfter
      className={cn(className)}
      onClick={() => void launch(workspace)}
    >
      {launching ? 'Launching…' : label}
    </Button>
  );
}

import { cn } from '@/utils/cn';
import { Layers } from 'lucide-react';
import { WORKSPACE_ICON_COMPONENTS } from '../constants/workspaceIcons';

type Size = 'md' | 'lg';

const sizes: Record<Size, { box: string; icon: number }> = {
  md: { box: 'h-10 w-10 rounded-lg', icon: 20 },
  lg: { box: 'h-12 w-12 rounded-xl', icon: 24 },
};

interface WorkspaceIconProps {
  icon: string;
  color: string;
  size?: Size;
  className?: string;
}

export default function WorkspaceIcon({ icon, color, size = 'md', className }: WorkspaceIconProps) {
  const Icon = WORKSPACE_ICON_COMPONENTS[icon] ?? Layers;
  const { box, icon: iconSize } = sizes[size];
  return (
    <span
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center', box, className)}
      style={{ backgroundColor: `${color}26`, color }}
    >
      <Icon size={iconSize} />
    </span>
  );
}

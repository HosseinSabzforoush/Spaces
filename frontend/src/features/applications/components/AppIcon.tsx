import { cn } from '@/utils/cn';
import type { Application } from '../types';

interface AppIconProps {
  app: Pick<Application, 'name' | 'icon'>;
  size?: 'sm' | 'md';
  muted?: boolean;
  className?: string;
}

export default function AppIcon({ app, size = 'md', muted = false, className }: AppIconProps) {
  return (
    <div
      title={app.name}
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card-active font-semibold text-text-secondary',
        size === 'md' ? 'h-10 w-10 text-base' : 'h-8 w-8 text-sm',
        muted && 'opacity-50',
        className,
      )}
    >
      {app.icon ? (
        <img src={app.icon} alt="" className={size === 'md' ? 'h-7 w-7 object-contain' : 'h-5 w-5 object-contain'} />
      ) : (
        app.name.trim().charAt(0).toUpperCase()
      )}
    </div>
  );
}

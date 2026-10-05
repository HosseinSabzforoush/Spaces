import { cn } from '@/utils/cn';

export default function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-card-active', className)} />;
}

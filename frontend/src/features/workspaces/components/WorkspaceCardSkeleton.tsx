import Skeleton from '@/components/ui/Skeleton';

export default function WorkspaceCardSkeleton() {
  return (
    <div className="flex min-h-54 flex-col justify-between rounded-2xl border-2 border-border bg-card px-6 py-4" aria-hidden>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-1 w-8" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-10 w-10 rounded-lg" />)}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

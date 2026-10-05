import Skeleton from '@/components/ui/Skeleton';

export default function WorkspaceEditorSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4" aria-hidden>
      <Skeleton className="h-4 w-40" />
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-1 w-10" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>
      <div className="flex min-h-0 grow gap-3">
        <Skeleton className="hidden w-2/5 rounded-md lg:block" />
        <div className="flex w-full flex-col gap-2 lg:w-3/5">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

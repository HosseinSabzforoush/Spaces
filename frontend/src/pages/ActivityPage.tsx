import { AppWindow, Pencil, Plus, Rocket, Trash2, TriangleAlert, Activity as ActivityIcon, type LucideIcon } from 'lucide-react'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import { useActivityStore, type ActivityType } from '@/features/activity/store/activityStore'
import { useWindowTitle } from '@/hooks/useWindowTitle'
import { cn } from '@/utils/cn'
import { formatRelativeTime } from '@/utils/format'

const TYPES: Record<ActivityType, { icon: LucideIcon; className: string }> = {
  'workspace.created': { icon: Plus, className: 'bg-accent/15 text-accent' },
  'workspace.edited': { icon: Pencil, className: 'bg-card-active text-text-secondary' },
  'workspace.deleted': { icon: Trash2, className: 'bg-danger/15 text-danger' },
  'workspace.launched': { icon: Rocket, className: 'bg-success/15 text-success' },
  'app.opened': { icon: AppWindow, className: 'bg-success/15 text-success' },
  'app.added': { icon: Plus, className: 'bg-accent/15 text-accent' },
  'app.removed': { icon: Trash2, className: 'bg-danger/15 text-danger' },
  'library.added': { icon: Plus, className: 'bg-accent/15 text-accent' },
  'library.removed': { icon: Trash2, className: 'bg-danger/15 text-danger' },
  'launch.failed': { icon: TriangleAlert, className: 'bg-warning/15 text-warning' },
}

function ActivityPage() {
  useWindowTitle('Activity')
  const events = useActivityStore((s) => s.events)
  const clear = useActivityStore((s) => s.clear)

  return (
    <div className='flex flex-col h-full gap-6'>
      <PageHeader
        title='Activity'
        actions={events.length > 0 && <Button size='sm' icon={<Trash2 size={14} />} onClick={clear}>Clear</Button>}
      />

      {events.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title='No activity yet'
          description='Launch or edit a workspace and it will show up here.'
        />
      ) : (
        <ul className='flex flex-col flex-1 min-h-0 max-w-3xl overflow-y-auto divide-y rounded-xl custom-scrollbar divide-border border border-border bg-card self-start w-full'>
          {events.map((event) => {
            const { icon: Icon, className } = TYPES[event.type]
            return (
              <li key={event.id} className='flex items-center gap-3 px-4 py-3'>
                <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', className)}>
                  <Icon size={16} />
                </span>
                <span className='flex-1 min-w-0 text-sm truncate'>{event.message}</span>
                <time dateTime={new Date(event.timestamp).toISOString()} className='text-xs shrink-0 text-text-muted'>
                  {formatRelativeTime(event.timestamp)}
                </time>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default ActivityPage

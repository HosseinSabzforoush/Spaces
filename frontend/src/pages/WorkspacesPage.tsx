import { useState } from 'react'
import { motion } from 'motion/react'
import { LayoutGrid, Plus, SearchX } from 'lucide-react'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import PageHeader from '@/components/ui/PageHeader'
import CreateWorkspaceDialog from '@/features/workspaces/components/CreateWorkspaceDialog'
import NewWorkspaceCard from '@/features/workspaces/components/NewWorkspaceCard'
import { WorkspaceCard } from '@/features/workspaces/components/WorkspaceCard'
import WorkspaceCardSkeleton from '@/features/workspaces/components/WorkspaceCardSkeleton'
import WorkspaceSearch from '@/features/workspaces/components/WorkspaceSearch'
import { useWorkspaceStore } from '@/features/workspaces/store/workspaceStore'
import type { Workspace } from '@/features/workspaces/types'
import { useRetained } from '@/hooks/useRetained'
import { useWindowTitle } from '@/hooks/useWindowTitle'
import { toast } from '@/stores/toastStore'

const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(min(18rem,100%),1fr))] gap-6'

function WorkspacesPage() {
  useWindowTitle()
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const status = useWorkspaceStore((s) => s.status)
  const error = useWorkspaceStore((s) => s.error)
  const query = useWorkspaceStore((s) => s.query)
  const setQuery = useWorkspaceStore((s) => s.setQuery)
  const load = useWorkspaceStore((s) => s.load)
  const remove = useWorkspaceStore((s) => s.remove)

  const [creating, setCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Workspace | null>(null)
  const deleting = useRetained(pendingDelete)

  const needle = query.trim().toLowerCase()
  const visible = needle
    ? workspaces.filter((w) => `${w.title} ${w.description}`.toLowerCase().includes(needle))
    : workspaces

  const confirmDelete = () => {
    if (pendingDelete) {
      remove(pendingDelete.id)
      toast.success(`Deleted “${pendingDelete.title}”`)
    }
    setPendingDelete(null)
  }

  const renderBody = () => {
    if (status === 'idle' || status === 'loading') {
      return <div className={GRID}>{Array.from({ length: 4 }, (_, i) => <WorkspaceCardSkeleton key={i} />)}</div>
    }
    if (status === 'error') {
      return <ErrorState title="Couldn't load your workspaces" message={error} onRetry={() => void load()} />
    }
    if (workspaces.length === 0) {
      return (
        <EmptyState
          icon={LayoutGrid}
          title="No workspaces yet"
          description="Create your first workspace to get started."
          action={<Button variant="primary" icon={<Plus size={16} />} onClick={() => setCreating(true)}>New Workspace</Button>}
        />
      )
    }
    if (visible.length === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title="No matching workspaces"
          description={`Nothing matches “${query.trim()}”.`}
          action={<Button onClick={() => setQuery('')}>Clear search</Button>}
        />
      )
    }
    return (
      <div className={GRID}>
        {visible.map((workspace, index) => (
          <motion.div
            key={workspace.id}
            layout
            className='relative hover:z-10 focus-within:z-10'
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.03 }}
          >
            <WorkspaceCard workspace={workspace} onDelete={setPendingDelete} />
          </motion.div>
        ))}
        {!needle && <NewWorkspaceCard onClick={() => setCreating(true)} />}
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full gap-6'>
      <PageHeader
        title='All Workspaces'
        subtitle={status === 'ready' && workspaces.length > 0 ? `${workspaces.length} ${workspaces.length === 1 ? 'workspace' : 'workspaces'}` : undefined}
        actions={status === 'ready' && workspaces.length > 0 ? <WorkspaceSearch /> : undefined}
      />
      <div className='custom-scrollbar -mx-1 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-1 py-2'>{renderBody()}</div>

      <CreateWorkspaceDialog open={creating} onClose={() => setCreating(false)} />
      <ConfirmDialog
        open={pendingDelete !== null}
        title='Delete workspace?'
        message={<>“{deleting?.title}” and its application list will be permanently removed. Your installed apps are not affected.</>}
        confirmLabel='Delete'
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export default WorkspacesPage

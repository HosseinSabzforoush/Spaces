import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AppWindow, FolderSearch, LayoutGrid, List, SearchX } from 'lucide-react'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import PageHeader from '@/components/ui/PageHeader'
import SearchField from '@/components/ui/SearchField'
import Skeleton from '@/components/ui/Skeleton'
import AddToWorkspaceDialog from '@/features/library/components/AddToWorkspaceDialog'
import AppDropZone from '@/features/library/components/AppDropZone'
import LibraryAppCard from '@/features/library/components/LibraryAppCard'
import ScanFolderPanel from '@/features/library/components/ScanFolderPanel'
import { useLibraryUsage } from '@/features/library/hooks/useLibraryUsage'
import { useAppLibraryStore } from '@/features/library/store/appLibraryStore'
import type { LibraryApp, LibraryFilter, LibrarySort } from '@/features/library/types'
import { useRetained } from '@/hooks/useRetained'
import { useWindowTitle } from '@/hooks/useWindowTitle'
import type { SelectedExecutable } from '@/native'
import { toast } from '@/stores/toastStore'
import { cn } from '@/utils/cn'
import { pluralize } from '@/utils/format'
import { pathKey } from '@/utils/paths'

const SORTS: { id: LibrarySort; label: string }[] = [
  { id: 'name-asc', label: 'Name (A–Z)' },
  { id: 'name-desc', label: 'Name (Z–A)' },
  { id: 'recent', label: 'Recently added' },
  { id: 'most-used', label: 'Most used' },
]

const FILTERS: { id: LibraryFilter; label: string }[] = [
  { id: 'all', label: 'All apps' },
  { id: 'used', label: 'In a workspace' },
  { id: 'unused', label: 'Not in a workspace' },
]

const selectClass = 'rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus-visible:border-border-active'

function AppsPage() {
  useWindowTitle('Apps')
  const apps = useAppLibraryStore((s) => s.apps)
  const status = useAppLibraryStore((s) => s.status)
  const error = useAppLibraryStore((s) => s.error)
  const load = useAppLibraryStore((s) => s.load)
  const addMany = useAppLibraryStore((s) => s.addMany)
  const remove = useAppLibraryStore((s) => s.remove)
  const usage = useLibraryUsage()

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<LibrarySort>('name-asc')
  const [filter, setFilter] = useState<LibraryFilter>('all')
  const [layout, setLayout] = useState<'list' | 'grid'>('list')
  const [pendingRemove, setPendingRemove] = useState<LibraryApp | null>(null)
  const [addingTo, setAddingTo] = useState<LibraryApp | null>(null)
  const removing = useRetained(pendingRemove)

  const existingPaths = useMemo(() => new Set(apps.map((a) => pathKey(a.executablePath))), [apps])
  const usedCount = apps.filter((a) => usage.has(pathKey(a.executablePath))).length
  const ready = status === 'ready'

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const countOf = (a: LibraryApp) => usage.get(pathKey(a.executablePath))?.length ?? 0
    const list = apps.filter((a) => {
      if (needle && !a.name.toLowerCase().includes(needle) && !a.executablePath.toLowerCase().includes(needle)) return false
      if (filter === 'used') return countOf(a) > 0
      if (filter === 'unused') return countOf(a) === 0
      return true
    })
    switch (sort) {
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return list.sort((a, b) => b.name.localeCompare(a.name))
      case 'recent':
        return list.reverse().sort((a, b) => b.addedAt - a.addedAt)
      case 'most-used':
        return list.sort((a, b) => countOf(b) - countOf(a) || a.name.localeCompare(b.name))
    }
  }, [apps, query, filter, sort, usage])

  const handleAdd = (entries: SelectedExecutable[]) => {
    const { added, existing } = addMany(entries)
    if (added.length === 0) {
      toast.warning(existing.length === 1 ? 'That app is already in your library.' : 'Those apps are already in your library.')
    } else if (existing.length > 0) {
      toast.success(`Added ${pluralize(added.length, 'app')} · ${existing.length} already in your library`)
    } else {
      toast.success(`Added ${pluralize(added.length, 'app')} to your library`)
    }
  }

  const confirmRemove = () => {
    if (pendingRemove) {
      remove(pendingRemove.id)
      toast.success(`Removed “${pendingRemove.name}” from your library`)
    }
    setPendingRemove(null)
  }

  const renderLibrary = () => {
    if (status === 'idle' || status === 'loading') {
      return <div className='flex flex-col gap-2'>{[0, 1, 2, 3].map((i) => <Skeleton key={i} className='h-[4.5rem] rounded-xl' />)}</div>
    }
    if (status === 'error') {
      return <ErrorState title="Couldn't load your apps" message={error} onRetry={() => void load()} />
    }
    if (apps.length === 0) {
      return (
        <EmptyState
          icon={AppWindow}
          title='No apps in your library yet'
          description='Drop an .exe above, browse for one, or scan a folder.'
        />
      )
    }
    if (visible.length === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title='No matching apps'
          description='Try a different search or filter.'
          action={<Button onClick={() => { setQuery(''); setFilter('all') }}>Reset filters</Button>}
        />
      )
    }
    return (
      <div className={layout === 'grid' ? 'grid grid-cols-1 gap-2 @3xl:grid-cols-2' : 'flex flex-col gap-2'}>
        <AnimatePresence initial={false} mode='popLayout'>
          {visible.map((app) => (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
            >
              <LibraryAppCard
                app={app}
                usedIn={usage.get(pathKey(app.executablePath)) ?? []}
                onAddToWorkspace={() => setAddingTo(app)}
                onRemove={() => setPendingRemove(app)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col gap-6'>
      <PageHeader
        title='Apps'
        subtitle={ready && apps.length > 0 ? `${pluralize(apps.length, 'app')} · ${usedCount} in a workspace` : undefined}
        actions={ready && apps.length > 0 ? <SearchField value={query} onChange={setQuery} placeholder='Search apps' className='sm:w-72' /> : undefined}
      />

      <div className='@container custom-scrollbar -mx-1 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-1'>
        <div className='flex flex-col gap-8 pb-4'>
          <section aria-labelledby='add-apps' className='flex flex-col gap-3'>
            <div>
              <h2 id='add-apps' className='text-base font-semibold'>Add apps</h2>
              <p className='text-xs text-text-muted'>Saved locations are remembered, so you can reuse them in any workspace.</p>
            </div>
            <div className='grid grid-cols-1 gap-4 @3xl:grid-cols-2'>
              <AppDropZone onFiles={handleAdd} />
              <div className='flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-card p-5'>
                <div className='flex items-center gap-3'>
                  <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card-active text-text-secondary'>
                    <FolderSearch size={18} />
                  </span>
                  <div className='min-w-0'>
                    <h3 className='text-sm font-semibold'>Scan a folder</h3>
                    <p className='text-xs text-text-muted'>Find every .exe inside a folder at once.</p>
                  </div>
                </div>
                <ScanFolderPanel actionLabel='Add to library' existingPaths={existingPaths} onAdd={handleAdd} />
              </div>
            </div>
          </section>

          <section aria-labelledby='library' className='flex flex-col gap-3'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <h2 id='library' className='text-base font-semibold'>Your library</h2>
              {ready && apps.length > 0 && (
                <div className='flex flex-wrap items-center gap-2'>
                  <select value={filter} onChange={(e) => setFilter(e.target.value as LibraryFilter)} aria-label='Filter apps' className={selectClass}>
                    {FILTERS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                  <select value={sort} onChange={(e) => setSort(e.target.value as LibrarySort)} aria-label='Sort apps' className={selectClass}>
                    {SORTS.map((s) => <option key={s.id} value={s.id}>Sort: {s.label}</option>)}
                  </select>
                  <div className='flex overflow-hidden rounded-lg border border-border'>
                    {([['list', List], ['grid', LayoutGrid]] as const).map(([key, Icon]) => (
                      <button
                        key={key}
                        type='button'
                        aria-label={`${key} view`}
                        aria-pressed={layout === key}
                        onClick={() => setLayout(key)}
                        className={cn('p-2 transition-colors', layout === key ? 'bg-card-active text-accent' : 'bg-card text-text-muted')}
                      >
                        <Icon size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {renderLibrary()}
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={pendingRemove !== null}
        title='Remove from library?'
        message={<>“{removing?.name}” will be removed from your library. Workspaces that already use it keep it.</>}
        confirmLabel='Remove'
        onCancel={() => setPendingRemove(null)}
        onConfirm={confirmRemove}
      />
      <AddToWorkspaceDialog app={addingTo} onClose={() => setAddingTo(null)} />
    </div>
  )
}

export default AppsPage

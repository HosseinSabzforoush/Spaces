import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppWindow, LayoutGrid, List, Plus, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatAppCount } from '@/utils/format';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { useRetained } from '@/hooks/useRetained';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import AddAppDialog from '@/features/library/components/AddAppDialog';
import { pathKey } from '@/utils/paths';
import AppCard from './AppCard';
import AppSettingsDialog from './AppSettingsDialog';
import type { Application, ApplicationSettings, NewApplication } from '../types';

type SortKey = 'manual' | 'name' | 'status';
type Layout = 'list' | 'grid';

interface ApplicationsPanelProps {
  apps: Application[];
  onAdd: (apps: NewApplication[]) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, settings: ApplicationSettings) => void;
}

export default function ApplicationsPanel({ apps, onAdd, onToggle, onRemove, onUpdate }: ApplicationsPanelProps) {
  const confirmBeforeRemove = useSettingsStore((s) => s.confirmBeforeRemove);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('manual');
  const [layout, setLayout] = useState<Layout>('list');
  const [addOpen, setAddOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<Application | null>(null);
  const [configuring, setConfiguring] = useState<Application | null>(null);
  const removing = useRetained(pendingRemove);

  const enabledCount = apps.filter((a) => a.enabled).length;

  const visible = useMemo(() => {
    const filtered = apps.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));
    if (sort === 'name') return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'status') return [...filtered].sort((a, b) => Number(b.enabled) - Number(a.enabled));
    return filtered;
  }, [apps, query, sort]);

  const existingPaths = useMemo(() => new Set(apps.map((x) => pathKey(x.executablePath))), [apps]);

  const requestRemove = (app: Application) => {
    if (confirmBeforeRemove) setPendingRemove(app);
    else onRemove(app.id);
  };

  const addButton = (
    <Button variant="primary" icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
      Add App
    </Button>
  );

  return (
    <div className="order-first flex min-h-80 w-full flex-col gap-4 p-5 text-text-primary @4xl:order-none @4xl:min-h-0 @4xl:w-3/5 @4xl:overflow-hidden">

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Applications</h2>
          <p className="text-xs text-text-muted">
            {formatAppCount(apps.length)} · <span className="text-success">{enabledCount} enabled</span>
          </p>
        </div>
        {apps.length > 0 && addButton}
      </div>

      {apps.length === 0 ? (
        <EmptyState
          className="grow"
          icon={AppWindow}
          title="This workspace has no applications yet."
          description="Add the apps you want to open together."
          action={addButton}
        />
      ) : (
        <>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-40 grow">
              <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search applications"
                aria-label="Search applications"
                className="w-full rounded-lg border border-border bg-card py-1.5 pr-3 pl-9 text-sm placeholder:text-text-disabled hover:border-border-hover focus:border-border-active focus:outline-none"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort applications"
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none"
            >
              <option value="manual">Sort: Manual</option>
              <option value="name">Sort: Name</option>
              <option value="status">Sort: Enabled first</option>
            </select>
            <div className="flex overflow-hidden rounded-lg border border-border">
              {([['list', List], ['grid', LayoutGrid]] as const).map(([key, Icon]) => (
                <button
                  key={key}
                  type="button"
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

          <div className="custom-scrollbar flex min-h-0 grow flex-col gap-3 overflow-x-hidden overflow-y-auto pr-1">
            <div className={layout === 'grid' ? 'grid grid-cols-1 gap-2 xl:grid-cols-2' : 'flex flex-col gap-2'}>
              <AnimatePresence initial={false} mode="popLayout">
                {visible.map((app) => (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                  >
                    <AppCard
                      app={app}
                      layout={layout}
                      onToggle={(c) => onToggle(app.id, c)}
                      onRemove={() => requestRemove(app)}
                      onConfigure={() => setConfiguring(app)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {visible.length === 0 && (
              <p className="py-6 text-center text-sm text-text-muted">No applications match your search.</p>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={pendingRemove !== null}
        title="Remove Application?"
        message={<>Are you sure you want to remove “{removing?.name}” from this workspace?</>}
        confirmLabel="Remove"
        onCancel={() => setPendingRemove(null)}
        onConfirm={() => {
          if (pendingRemove) onRemove(pendingRemove.id);
          setPendingRemove(null);
        }}
      />
      <AddAppDialog open={addOpen} onClose={() => setAddOpen(false)} existingPaths={existingPaths} onAdd={onAdd} />
      <AppSettingsDialog app={configuring} onSave={onUpdate} onClose={() => setConfiguring(null)} />
    </div>
  );
}

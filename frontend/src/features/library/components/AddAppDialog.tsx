import { useMemo, useState } from 'react';
import { Library, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/ui/ErrorState';
import Modal from '@/components/ui/Modal';
import SearchField from '@/components/ui/SearchField';
import Skeleton from '@/components/ui/Skeleton';
import Tabs, { type TabItem } from '@/components/ui/Tabs';
import type { NewApplication } from '@/features/applications/types';
import type { SelectedExecutable } from '@/native';
import { toast } from '@/stores/toastStore';
import { pluralize } from '@/utils/format';
import { pathKey } from '@/utils/paths';
import { useAppLibraryStore } from '../store/appLibraryStore';
import type { LibraryApp } from '../types';
import { toNewApplication } from '../utils/toNewApplication';
import AppDropZone from './AppDropZone';
import ExecutableRow from './ExecutableRow';

type TabId = 'library' | 'browse';

const TABS: TabItem<TabId>[] = [
  { id: 'library', label: 'My apps', icon: Library },
  { id: 'browse', label: 'Browse or drop', icon: Upload },
];

interface AddAppDialogProps {
  open: boolean;
  onClose: () => void;
  existingPaths: Set<string>;
  onAdd: (apps: NewApplication[]) => void;
}

export default function AddAppDialog({ open, onClose, existingPaths, onAdd }: AddAppDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add apps"
      description="Pick from your library, or add new apps to it."
      className="max-w-2xl">
      <AddAppContent
        existingPaths={existingPaths}
        onAdd={onAdd}
        onClose={onClose}
      />
    </Modal>
  );
}

function AddAppContent({ existingPaths, onAdd, onClose }: Omit<AddAppDialogProps, 'open'>) {
  const library = useAppLibraryStore((s) => s.apps);
  const status = useAppLibraryStore((s) => s.status);
  const error = useAppLibraryStore((s) => s.error);
  const load = useAppLibraryStore((s) => s.load);
  const addMany = useAppLibraryStore((s) => s.addMany);

  const [tab, setTab] = useState<TabId>(library.length > 0 || status !== 'ready' ? 'library' : 'browse');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return library.filter((a) => !needle || a.name.toLowerCase().includes(needle) || a.executablePath.toLowerCase().includes(needle)).sort((a, b) => a.name.localeCompare(b.name));
  }, [library, query]);

  const finish = (apps: LibraryApp[]) => {
    const fresh = apps.filter((a) => !existingPaths.has(pathKey(a.executablePath)));
    if (fresh.length === 0) {
      toast.warning(apps.length === 1 ? 'That app is already in this workspace.' : 'Those apps are already in this workspace.');
      return;
    }
    onAdd(fresh.map(toNewApplication));
    onClose();
  };

  const addEntries = (entries: SelectedExecutable[]) => {
    const { added, existing } = addMany(entries);
    finish([...existing, ...added]);
  };

  const togglePicked = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const pickedApps = library.filter((a) => picked.has(a.id));

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Tabs
        tabs={TABS}
        value={tab}
        onChange={setTab}
        label="Add apps from"
      />

      <div
        role="tabpanel"
        className="flex min-w-0 flex-col gap-3">
        {tab === 'library' && (
          <>
            {(status === 'idle' || status === 'loading') && (
              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-12 rounded-lg"
                  />
                ))}
              </div>
            )}
            {status === 'error' && (
              <ErrorState
                title="Couldn't load your apps"
                message={error}
                onRetry={() => void load()}
              />
            )}
            {status === 'ready' && library.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-sm text-text-muted">Your library is empty. Add your first apps to get started.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    size="sm"
                    icon={<Upload size={14} />}
                    onClick={() => setTab('browse')}>
                    Browse or drop
                  </Button>
                </div>
              </div>
            )}
            {status === 'ready' && library.length > 0 && (
              <>
                <SearchField
                  value={query}
                  onChange={setQuery}
                  placeholder="Search your apps"
                />
                <div
                  role="group"
                  aria-label="Your apps"
                  className="custom-scrollbar max-h-80 overflow-x-hidden overflow-y-auto rounded-xl border border-border bg-app/40 p-1">
                  {visible.map((app) => {
                    const inWorkspace = existingPaths.has(pathKey(app.executablePath));
                    return (
                      <ExecutableRow
                        key={app.id}
                        name={app.name}
                        detail={app.executablePath}
                        icon={app.icon}
                        checked={picked.has(app.id)}
                        disabled={inWorkspace}
                        badge={inWorkspace ? 'In workspace' : undefined}
                        onToggle={() => togglePicked(app.id)}
                      />
                    );
                  })}
                  {visible.length === 0 && <p className="px-3 py-6 text-center text-sm text-text-muted">No apps match your search.</p>}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'browse' && (
          <AppDropZone
            onFiles={addEntries}
            className="min-h-56"
          />
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        {tab === 'library' && (
          <Button
            variant="primary"
            disabled={pickedApps.length === 0}
            onClick={() => finish(pickedApps)}>
            {pickedApps.length > 0 ? `Add ${pluralize(pickedApps.length, 'app')}` : 'Add apps'}
          </Button>
        )}
      </div>
    </div>
  );
}

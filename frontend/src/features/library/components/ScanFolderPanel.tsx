import { useMemo, useRef, useState } from 'react';
import { FolderSearch, LoaderCircle, RotateCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { fileSystemApi, type SelectedExecutable } from '@/native';
import { cn } from '@/utils/cn';
import { pluralize } from '@/utils/format';
import { isHelperExecutable, pathKey } from '@/utils/paths';
import ExecutableRow from './ExecutableRow';

type Status = 'idle' | 'scanning' | 'done' | 'error';

interface ScanFolderPanelProps {
  actionLabel: string;
  existingPaths: Set<string>;
  existingLabel?: string;
  onAdd: (entries: SelectedExecutable[]) => void;
  className?: string;
}

export default function ScanFolderPanel({ actionLabel, existingPaths, existingLabel = 'In library', onAdd, className }: ScanFolderPanelProps) {
  const [directory, setDirectory] = useState<string | null>(null);
  const [recursive, setRecursive] = useState(true);
  const [hideHelpers, setHideHelpers] = useState(true);
  const [status, setStatus] = useState<Status>('idle');
  const [results, setResults] = useState<SelectedExecutable[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const scanId = useRef(0);

  const visible = useMemo(
    () => (hideHelpers ? results.filter((r) => !isHelperExecutable(r.executablePath)) : results),
    [results, hideHelpers],
  );
  const hiddenCount = results.length - visible.length;
  const selectable = useMemo(
    () => visible.filter((r) => !existingPaths.has(pathKey(r.executablePath))),
    [visible, existingPaths],
  );
  const chosen = selectable.filter((r) => selected.has(pathKey(r.executablePath)));
  const allChosen = selectable.length > 0 && chosen.length === selectable.length;

  const runScan = async (target: string, deep: boolean) => {
    const current = ++scanId.current;
    setDirectory(target);
    setStatus('scanning');
    setResults([]);
    setSelected(new Set());
    try {
      const found = await fileSystemApi.scanForExecutables(target, { recursive: deep });
      if (current !== scanId.current) return;
      setResults(found);
      setStatus('done');
    } catch {
      if (current !== scanId.current) return;
      setStatus('error');
    }
  };

  const chooseFolder = async () => {
    try {
      const picked = await fileSystemApi.selectDirectory();
      if (picked) void runScan(picked, recursive);
    } catch {
      setStatus('error');
    }
  };

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleAll = () => setSelected(allChosen ? new Set() : new Set(selectable.map((r) => pathKey(r.executablePath))));

  const add = () => {
    onAdd(chosen);
    setSelected(new Set());
  };

  const relativePath = (path: string) => {
    if (!directory) return path;
    const base = directory.replace(/[\\/]+$/, '');
    return pathKey(path).startsWith(`${pathKey(base)}\\`) ? path.slice(base.length + 1) : path;
  };

  const scanning = status === 'scanning';

  return (
    <div className={cn('flex min-w-0 flex-col gap-4', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button icon={<FolderSearch size={16} />} loading={scanning} onClick={() => void chooseFolder()}>
          {directory ? 'Change folder' : 'Choose folder'}
        </Button>
        {directory && (
          <Button
            variant="ghost"
            aria-label="Scan again"
            title="Scan again"
            disabled={scanning}
            icon={<RotateCw size={16} />}
            onClick={() => void runScan(directory, recursive)}
          />
        )}
      </div>

      {directory && <p className="truncate font-mono text-xs text-text-muted" title={directory}>{directory}</p>}

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span>Include subfolders</span>
          <ToggleSwitch
            label="Include subfolders"
            checked={recursive}
            disabled={scanning}
            onChange={(checked) => {
              setRecursive(checked);
              if (directory) void runScan(directory, checked);
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Hide installers &amp; helpers</span>
          <ToggleSwitch label="Hide installers and helpers" checked={hideHelpers} onChange={setHideHelpers} />
        </div>
      </div>

      {status === 'idle' && <p className="text-sm text-text-muted">Pick a folder and Spaces will look for .exe files inside it.</p>}

      {scanning && (
        <div className="flex flex-col gap-2" aria-live="polite">
          <p className="flex items-center gap-2 text-sm text-text-muted">
            <LoaderCircle size={14} className="animate-spin" /> Scanning…
          </p>
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-11 rounded-lg" />)}
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-start gap-2 text-sm">
          <p className="text-danger">The scan failed. Check that the folder is accessible and try again.</p>
          {directory && <Button size="sm" icon={<RotateCw size={14} />} onClick={() => void runScan(directory, recursive)}>Try again</Button>}
        </div>
      )}

      {status === 'done' && visible.length === 0 && (
        <p className="text-sm text-text-muted">
          No executables found{hiddenCount > 0 ? ` (${pluralize(hiddenCount, 'helper')} hidden)` : ''}.
        </p>
      )}

      {status === 'done' && visible.length > 0 && (
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-text-secondary">
              {pluralize(visible.length, 'app')} found
              {hiddenCount > 0 && <span className="text-text-muted"> · {hiddenCount} hidden</span>}
            </span>
            {selectable.length > 0 && (
              <button type="button" onClick={toggleAll} className="text-accent hover:text-accent-hover">
                {allChosen ? 'Clear selection' : 'Select all'}
              </button>
            )}
          </div>
          <div role="group" aria-label="Scan results" className="custom-scrollbar max-h-72 overflow-x-hidden overflow-y-auto rounded-xl border border-border bg-app/40 p-1">
            {visible.map((r) => {
              const key = pathKey(r.executablePath);
              const known = existingPaths.has(key);
              return (
                <ExecutableRow
                  key={key}
                  name={r.name}
                  detail={relativePath(r.executablePath)}
                  checked={selected.has(key)}
                  disabled={known}
                  badge={known ? existingLabel : undefined}
                  onToggle={() => toggle(key)}
                />
              );
            })}
          </div>
          <Button variant="primary" disabled={chosen.length === 0} onClick={add}>
            {actionLabel}
            {chosen.length > 0 ? ` (${chosen.length})` : ''}
          </Button>
        </div>
      )}
    </div>
  );
}

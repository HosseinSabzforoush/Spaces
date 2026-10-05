import { useEffect, useRef, useState, type DragEvent } from 'react';
import { FolderOpen, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import { fileSystemApi, type SelectedExecutable } from '@/native';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { pluralize } from '@/utils/format';
import { isExecutableName } from '@/utils/paths';

interface AppDropZoneProps {
  onFiles: (entries: SelectedExecutable[]) => void;
  className?: string;
}

const hasFiles = (e: DragEvent | globalThis.DragEvent) => Boolean(e.dataTransfer?.types.includes('Files'));

export default function AppDropZone({ onFiles, className }: AppDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const depth = useRef(0);

  useEffect(() => {
    const block = (e: globalThis.DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    return () => {
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    };
  }, []);

  const deliver = async (resolve: () => Promise<SelectedExecutable[]>) => {
    setBusy(true);
    try {
      const entries = await resolve();
      if (entries.length > 0) onFiles(entries);
    } catch {
      toast.error("Couldn't read the selected files. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    depth.current = 0;
    setDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    const executables = files.filter((f) => isExecutableName(f.name));
    const skipped = files.length - executables.length;

    if (executables.length === 0) {
      toast.warning('Only .exe files can be added.');
      return;
    }
    if (skipped > 0) toast.warning(`Skipped ${pluralize(skipped, 'file')} that ${skipped === 1 ? "isn't" : "aren't"} an .exe.`);
    void deliver(() => fileSystemApi.resolveDroppedFiles(executables));
  };

  return (
    <div
      onDragEnter={(e) => {
        if (!hasFiles(e)) return;
        depth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragging(false);
      }}
      onDrop={handleDrop}
      data-dragging={dragging}
      className={cn(
        'flex min-h-52 min-w-0 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors',
        dragging ? 'border-border-active bg-accent/5' : 'border-border bg-card hover:border-border-hover',
        className,
      )}
    >
      <span className={cn('flex h-12 w-12 items-center justify-center rounded-xl', dragging ? 'bg-accent/15 text-accent' : 'bg-card-active text-text-secondary')}>
        <Upload size={22} />
      </span>
      <div className="min-w-0">
        <p className="text-base font-semibold">{dragging ? 'Drop to add' : 'Drag & drop .exe files here'}</p>
        <p className="mt-1 text-sm text-text-muted">Their locations are saved to your library for next time.</p>
      </div>
      <Button icon={<FolderOpen size={16} />} loading={busy} onClick={() => void deliver(() => fileSystemApi.selectExecutables())}>
        Browse files
      </Button>
    </div>
  );
}

import { useState } from 'react';
import { FolderOpen, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import { fileSystemApi, type SelectedExecutable } from '@/native';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

interface AppBrowsePanelProps {
  onFiles: (entries: SelectedExecutable[]) => void;
  className?: string;
}

export default function AppBrowsePanel({ onFiles, className }: AppBrowsePanelProps) {
  const [busy, setBusy] = useState(false);

  const browse = async () => {
    setBusy(true);
    try {
      const entries = await fileSystemApi.selectExecutables();
      if (entries.length > 0) onFiles(entries);
    } catch {
      toast.error("Couldn't read the selected files. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={cn(
        'flex min-h-52 min-w-0 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-8 text-center',
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-card-active text-text-secondary">
        <Upload size={22} />
      </span>
      <div className="min-w-0">
        <p className="text-base font-semibold">Add .exe files</p>
        <p className="mt-1 text-sm text-text-muted">Their locations are saved to your library for next time.</p>
      </div>
      <Button icon={<FolderOpen size={16} />} loading={busy} onClick={() => void browse()}>
        Browse files
      </Button>
    </div>
  );
}

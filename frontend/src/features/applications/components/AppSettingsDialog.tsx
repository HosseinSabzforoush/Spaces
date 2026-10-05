import { useState, type SubmitEvent } from 'react';
import { FolderOpen } from 'lucide-react';
import Button from '@/components/ui/Button';
import FormField, { inputClass } from '@/components/ui/FormField';
import Modal from '@/components/ui/Modal';
import { useRetained } from '@/hooks/useRetained';
import { fileSystemApi } from '@/native';
import { cn } from '@/utils/cn';
import { formatArguments, parseArguments } from '@/utils/arguments';
import type { Application, ApplicationSettings } from '../types';

interface AppSettingsDialogProps {
  app: Application | null;
  onSave: (id: string, settings: ApplicationSettings) => void;
  onClose: () => void;
}

export default function AppSettingsDialog({ app, onSave, onClose }: AppSettingsDialogProps) {
  const shown = useRetained(app);
  return (
    <Modal open={app !== null} onClose={onClose} title="Application settings" description={shown?.executablePath} className="max-w-lg">

      {shown && <SettingsForm key={shown.id} app={shown} onSave={onSave} onClose={onClose} />}
    </Modal>
  );
}

function SettingsForm({ app, onSave, onClose }: { app: Application; onSave: AppSettingsDialogProps['onSave']; onClose: () => void }) {
  const [name, setName] = useState(app.name);
  const [description, setDescription] = useState(app.description);
  const [args, setArgs] = useState(formatArguments(app.arguments));
  const [workingDirectory, setWorkingDirectory] = useState(app.workingDirectory ?? '');

  const browse = async () => {
    const dir = await fileSystemApi.selectDirectory();
    if (dir) setWorkingDirectory(dir);
  };

  const submit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(app.id, {
      name: name.trim(),
      description: description.trim(),
      arguments: parseArguments(args),
      workingDirectory: workingDirectory.trim() || null,
    });
    onClose();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <FormField label="Name" htmlFor="app-name" required>
        <input id="app-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </FormField>
      <FormField label="Description" htmlFor="app-desc" optional>
        <input id="app-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is it used for?" className={inputClass} />
      </FormField>
      <FormField label="Arguments" htmlFor="app-args" optional>
        <input id="app-args" value={args} onChange={(e) => setArgs(e.target.value)} placeholder='--new-window "C:\My Folder"' className={cn(inputClass, 'font-mono text-xs')} />
      </FormField>
      <FormField label="Working directory" htmlFor="app-cwd" optional>
        <div className="flex">
          <input id="app-cwd" value={workingDirectory} onChange={(e) => setWorkingDirectory(e.target.value)} className={cn(inputClass, 'rounded-r-none font-mono text-xs')} />
          <button
            type="button"
            aria-label="Browse folders"
            onClick={browse}
            className="flex w-11 shrink-0 cursor-pointer items-center justify-center rounded-r-md border-2 border-l-0 border-border bg-card hover:bg-card-active"
          >
            <FolderOpen size={16} />
          </button>
        </div>
      </FormField>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={!name.trim()}>Save</Button>
      </div>
    </form>
  );
}

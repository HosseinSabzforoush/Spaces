import { FolderOpen, Plus, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import FormField, { inputClass } from '@/components/ui/FormField';
import type { EnvVariable } from '../types';

interface AdvancedSettingsProps {
  workingDirectory: string;
  envVars: EnvVariable[];
  onDirectoryChange: (dir: string) => void;
  onBrowse?: () => void;
  onAddVar: () => void;
  onUpdateVar: (id: string, patch: Partial<EnvVariable>) => void;
  onRemoveVar: (id: string) => void;
}

export default function AdvancedSettings({
  workingDirectory,
  envVars,
  onDirectoryChange,
  onBrowse,
  onAddVar,
  onUpdateVar,
  onRemoveVar,
}: AdvancedSettingsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Advanced</h3>

      <FormField label="Working directory" htmlFor="workdir" optional>
        <div className="flex">
          <input
            id="workdir"
            value={workingDirectory}
            onChange={(e) => onDirectoryChange(e.target.value)}
            placeholder="C:\Users\you\Projects"
            className={cn(inputClass, 'rounded-r-none font-mono text-xs')}
          />
          <button
            type="button"
            aria-label="Browse folders"
            onClick={onBrowse}
            className="flex w-11 shrink-0 cursor-pointer items-center justify-center rounded-r-md border-2 border-l-0 border-border bg-card hover:bg-card-active"
          >
            <FolderOpen size={16} />
          </button>
        </div>
      </FormField>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">
            Environment variables <span className="text-text-disabled">(optional)</span>
          </span>
          <button
            type="button"
            onClick={onAddVar}
            className="flex cursor-pointer items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs hover:bg-card-active"
          >
            <Plus size={14} /> Add variable
          </button>
        </div>

        {envVars.map((v) => (
          <div key={v.id} className="flex items-center gap-2">
            <input
              value={v.key}
              onChange={(e) => onUpdateVar(v.id, { key: e.target.value })}
              placeholder="KEY"
              aria-label="Variable name"
              className={cn(inputClass, 'w-2/5 font-mono text-xs')}
            />
            <input
              value={v.value}
              onChange={(e) => onUpdateVar(v.id, { value: e.target.value })}
              placeholder="value"
              aria-label="Variable value"
              className={cn(inputClass, 'font-mono text-xs')}
            />
            <button
              type="button"
              aria-label="Remove variable"
              onClick={() => onRemoveVar(v.id)}
              className="cursor-pointer rounded-md p-1.5 text-text-muted hover:bg-card-active hover:text-danger"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

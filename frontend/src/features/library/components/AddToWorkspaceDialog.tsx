import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import WorkspaceIcon from '@/features/workspaces/components/WorkspaceIcon';
import { useWorkspaceStore } from '@/features/workspaces/store/workspaceStore';
import { useRetained } from '@/hooks/useRetained';
import { toast } from '@/stores/toastStore';
import { formatAppCount } from '@/utils/format';
import { pathKey } from '@/utils/paths';
import type { LibraryApp } from '../types';
import { toNewApplication } from '../utils/toNewApplication';

interface AddToWorkspaceDialogProps {
  app: LibraryApp | null;
  onClose: () => void;
}

export default function AddToWorkspaceDialog({ app, onClose }: AddToWorkspaceDialogProps) {
  const shown = useRetained(app);

  return (
    <Modal
      open={app !== null}
      onClose={onClose}
      title="Add to workspace"
      description={shown ? `Choose where to add “${shown.name}”.` : undefined}
      footer={<Button onClick={onClose}>Close</Button>}
    >
      {shown && <WorkspaceChoices app={shown} onDone={onClose} />}
    </Modal>
  );
}

function WorkspaceChoices({ app, onDone }: { app: LibraryApp; onDone: () => void }) {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const addApps = useWorkspaceStore((s) => s.addApps);
  const key = pathKey(app.executablePath);

  if (workspaces.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        You don’t have any workspaces yet. <Link to="/workspaces" className="text-accent hover:text-accent-hover" onClick={onDone}>Create one first</Link>.
      </p>
    );
  }

  return (
    <ul className="custom-scrollbar flex max-h-72 flex-col gap-1 overflow-x-hidden overflow-y-auto">
      {workspaces.map((workspace) => {
        const already = workspace.apps.some((a) => pathKey(a.executablePath) === key);
        return (
          <li key={workspace.id}>
            <button
              type="button"
              disabled={already}
              onClick={() => {
                addApps(workspace.id, [toNewApplication(app)]);
                toast.success(`Added “${app.name}” to ${workspace.title}`);
                onDone();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-card-hover disabled:cursor-default disabled:opacity-60 disabled:hover:bg-transparent"
            >
              <WorkspaceIcon icon={workspace.icon} color={workspace.accentColor} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{workspace.title}</span>
                <span className="block text-xs text-text-muted">{formatAppCount(workspace.apps.length)}</span>
              </span>
              <span className="shrink-0 text-xs text-text-muted">{already ? 'Already added' : 'Add'}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

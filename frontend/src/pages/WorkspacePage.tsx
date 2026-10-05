import { SearchX } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import WorkspaceEditor from '@/features/workspaces/components/WorkspaceEditor';
import WorkspaceEditorSkeleton from '@/features/workspaces/components/WorkspaceEditorSkeleton';
import { useWorkspaceStore } from '@/features/workspaces/store/workspaceStore';
import { useWindowTitle } from '@/hooks/useWindowTitle';

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const workspace = useWorkspaceStore((s) => s.workspaces.find((w) => w.id === workspaceId));
  const status = useWorkspaceStore((s) => s.status);
  const error = useWorkspaceStore((s) => s.error);
  const load = useWorkspaceStore((s) => s.load);

  useWindowTitle(workspace?.title);

  if (status === 'idle' || status === 'loading') return <WorkspaceEditorSkeleton />;
  if (status === 'error') return <ErrorState title="Couldn't load this workspace" message={error} onRetry={() => void load()} />;

  if (!workspace) {
    return (
      <EmptyState
        className="h-full"
        icon={SearchX}
        title="Workspace not found"
        description="It may have been deleted."
        action={<Link to="/workspaces"><Button variant="primary">Back to workspaces</Button></Link>}
      />
    );
  }

  return <WorkspaceEditor key={workspace.id} workspace={workspace} />;
}

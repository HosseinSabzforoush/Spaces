import { useRef, useState } from 'react';
import { Link, useBlocker, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import WorkspaceIcon from './WorkspaceIcon';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ApplicationsPanel from '@/features/applications/components/ApplicationsPanel';
import { toast } from '@/stores/toastStore';
import { toWorkspaceForm, useWorkspaceForm } from '../hooks/useWorkspaceForm';
import { useLaunchStore } from '../store/launchStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { Workspace } from '../types';
import LaunchButton from './LaunchButton';
import WorkspaceDetails from './WorkspaceDetails';
import WorkspaceFooter from './WorkspaceFooter';

export default function WorkspaceEditor({ workspace }: { workspace: Workspace }) {
  const navigate = useNavigate();
  const form = useWorkspaceForm(toWorkspaceForm(workspace));
  const { values, isDirty, isValid, addApps, updateApp, toggleApp, removeApp } = form;

  const update = useWorkspaceStore((s) => s.update);
  const remove = useWorkspaceStore((s) => s.remove);
  const launchState = useLaunchStore((s) => s.states[workspace.id] ?? 'idle');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const skipGuard = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !skipGuard.current && isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  const handleSave = () => {
    update(workspace.id, values);
    form.commit();
    toast.success('Changes saved');
  };

  const handleDelete = () => {
    skipGuard.current = true;
    remove(workspace.id);
    navigate('/workspaces', { replace: true });
    toast.success(`Deleted “${values.title || 'workspace'}”`);
  };

  const draft: Workspace = { ...workspace, ...values };
  const title = values.title.trim() || 'Untitled';

  return (
    <div className="flex h-full flex-col gap-3">
      <nav className="flex gap-1 text-sm font-semibold" aria-label="Breadcrumb">
        <Link to="/workspaces" className="text-text-muted transition-colors hover:text-accent-hover">Workspaces</Link>
        <span className="text-text-disabled">/</span>
        <span className="truncate">{title}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-56 flex-1 items-center gap-3">
          <WorkspaceIcon icon={values.icon} color={values.accentColor} size="lg" />
          <div className="min-w-0">
            <div className="flex items-baseline gap-3">
              <h1 className="truncate text-3xl font-bold uppercase">{title}</h1>
              {launchState === 'running' && (
                <span className="shrink-0 text-sm" style={{ color: values.accentColor }}>Active</span>
              )}
              {launchState === 'error' && <span className="shrink-0 text-sm text-danger">Launch failed</span>}
            </div>
            <p className={cn('mt-0.5 truncate text-sm', values.description ? 'text-text-secondary' : 'text-text-disabled')}>
              {values.description || 'No description'}
            </p>
          </div>
        </div>
        <LaunchButton workspace={draft} label="Launch Workspace" />
      </div>

      <div className="@container flex min-h-0 grow flex-col">
        <div className="custom-scrollbar flex min-h-0 grow flex-col gap-3 overflow-x-hidden overflow-y-auto *:min-w-0 *:shrink-0 *:rounded-md *:border *:border-border *:bg-sidebar @4xl:flex-row @4xl:overflow-hidden @4xl:*:shrink">
          <WorkspaceDetails form={form} />
          <ApplicationsPanel apps={values.apps} onAdd={addApps} onToggle={toggleApp} onRemove={removeApp} onUpdate={updateApp} />
        </div>
      </div>

      <WorkspaceFooter
        canSave={isValid}
        dirty={isDirty}
        onDelete={() => setConfirmDelete(true)}
        onCancel={() => navigate('/workspaces')}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete workspace?"
        message={<>“{title}” and its application list will be permanently removed. Your installed apps are not affected.</>}
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Discard unsaved changes?"
        message="You have changes that haven't been saved. If you leave now, they will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onCancel={() => blocker.reset?.()}
        onConfirm={() => blocker.proceed?.()}
      />
    </div>
  );
}

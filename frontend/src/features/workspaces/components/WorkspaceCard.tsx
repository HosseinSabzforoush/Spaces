import { Copy, Pencil, Trash2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import DropdownMenu from "@/components/ui/DropdownMenu"
import AppIcon from "@/features/applications/components/AppIcon"
import { cn } from "@/utils/cn"
import { formatAppCount } from "@/utils/format"
import { toast } from "@/stores/toastStore"
import { useLaunchStore } from "../store/launchStore"
import { useWorkspaceStore } from "../store/workspaceStore"
import type { Workspace } from "../types"
import LaunchButton from "./LaunchButton"
import WorkspaceIcon from "./WorkspaceIcon"

const MAX_ICONS = 4

interface WorkspaceCardProps {
  workspace: Workspace
  onDelete: (workspace: Workspace) => void
}

export const WorkspaceCard = ({ workspace, onDelete }: WorkspaceCardProps) => {
  const navigate = useNavigate()
  const duplicate = useWorkspaceStore((s) => s.duplicate)
  const state = useLaunchStore((s) => s.states[workspace.id] ?? 'idle')

  const shownApps = workspace.apps.slice(0, MAX_ICONS)
  const extra = workspace.apps.length - shownApps.length
  const active = state === 'running'

  const handleDuplicate = () => {
    const copy = duplicate(workspace.id)
    if (copy) toast.success(`Created “${copy.title}”`)
  }

  return (
    <div
      style={active ? { borderColor: workspace.accentColor } : undefined}
      className={cn(
        'relative flex min-h-54 flex-col justify-between gap-4 rounded-2xl border-2 bg-card px-5 py-4 shadow-3d-dark transition-colors',
        !active && 'border-border hover:border-border-hover',
      )}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='flex min-w-0 items-center gap-3'>
          <WorkspaceIcon icon={workspace.icon} color={workspace.accentColor} />
          <div className='flex min-w-0 flex-col'>

            <Link to={`/workspaces/${workspace.id}`} className='truncate text-xl font-bold uppercase after:absolute after:inset-0 after:rounded-2xl'>
              {workspace.title}
            </Link>
            <span
              className={cn('min-h-5 truncate text-sm', !active && state !== 'error' && 'text-text-muted', state === 'error' && 'text-danger')}
              style={active ? { color: workspace.accentColor } : undefined}
            >
              {active ? 'Active' : state === 'error' ? 'Launch failed' : workspace.description}
            </span>
          </div>
        </div>
        <div className='relative z-10 -mr-2 shrink-0'>
          <DropdownMenu
            label={`${workspace.title} actions`}
            items={[
              { label: 'Edit', icon: <Pencil size={14} />, onSelect: () => navigate(`/workspaces/${workspace.id}`) },
              { label: 'Duplicate', icon: <Copy size={14} />, onSelect: handleDuplicate },
              { label: 'Delete', icon: <Trash2 size={14} />, tone: 'danger', onSelect: () => onDelete(workspace) },
            ]}
          />
        </div>
      </div>

      <div className='flex min-h-10 flex-wrap gap-2'>
        {shownApps.map((app) => (
          <AppIcon key={app.id} app={app} muted={!app.enabled} />
        ))}
        {extra > 0 && (
          <div className='flex h-10 w-10 items-center justify-center rounded-lg text-sm text-text-muted'>+{extra}</div>
        )}
        {workspace.apps.length === 0 && <span className='self-center text-sm text-text-disabled'>No apps yet</span>}
      </div>

      <div className='flex h-10 w-full items-center justify-between gap-2'>
        <span className='truncate text-text-muted'>{formatAppCount(workspace.apps.length)}</span>
        <div className='relative z-10 shrink-0'>
          <LaunchButton workspace={workspace} />
        </div>
      </div>
    </div>
  )
}

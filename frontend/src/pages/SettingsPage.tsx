import PageHeader from '@/components/ui/PageHeader'
import { inputClass } from '@/components/ui/FormField'
import ToggleSwitch from '@/components/ui/ToggleSwitch'
import SettingsRow from '@/features/settings/components/SettingsRow'
import SettingsSection from '@/features/settings/components/SettingsSection'
import { useSettingsStore } from '@/features/settings/store/settingsStore'
import { useWorkspaceStore } from '@/features/workspaces/store/workspaceStore'
import { useWindowTitle } from '@/hooks/useWindowTitle'
import { cn } from '@/utils/cn'

function SettingsPage() {
  useWindowTitle('Settings')
  const settings = useSettingsStore()
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const canPickWorkspace = settings.startupWorkspaceEnabled && workspaces.length > 0

  return (
    <div className='flex flex-col h-full gap-6'>
      <PageHeader title='Settings' />

      <div className='flex flex-col flex-1 min-h-0 max-w-3xl gap-8 pb-4 pr-1 overflow-y-auto custom-scrollbar'>
        <SettingsSection title='Startup' description='What happens when Windows starts.'>
          <SettingsRow title='Start with Windows' description='Open Spaces when you sign in.'>
            <ToggleSwitch checked={settings.startWithWindows} onChange={(c) => void settings.setStartWithWindows(c)} label='Start with Windows' />
          </SettingsRow>
          <SettingsRow title='Launch a workspace on startup' description='Automatically open one workspace when the app starts.'>
            <ToggleSwitch checked={settings.startupWorkspaceEnabled} onChange={(c) => settings.update('startupWorkspaceEnabled', c)} label='Launch a workspace on startup' />
          </SettingsRow>
          <SettingsRow title='Startup workspace' description={workspaces.length === 0 ? 'Create a workspace first.' : 'The workspace to open on startup.'}>
            <select
              value={settings.startupWorkspaceId ?? ''}
              disabled={!canPickWorkspace}
              onChange={(e) => settings.update('startupWorkspaceId', e.target.value || null)}
              aria-label='Startup workspace'
              className={cn(inputClass, 'w-40 shrink-0 disabled:cursor-not-allowed disabled:opacity-50 sm:w-56')}
            >
              <option value=''>Select a workspace…</option>
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>{w.title}</option>
              ))}
            </select>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title='Behavior' description='How the app responds to your actions.'>
          <SettingsRow title='Confirm before removing apps' description='Ask first when removing an application from a workspace.'>
            <ToggleSwitch checked={settings.confirmBeforeRemove} onChange={(c) => settings.update('confirmBeforeRemove', c)} label='Confirm before removing apps' />
          </SettingsRow>
          <SettingsRow title='Show launch notifications' description='Display a message when a workspace has finished launching.'>
            <ToggleSwitch checked={settings.notifyOnLaunch} onChange={(c) => settings.update('notifyOnLaunch', c)} label='Show launch notifications' />
          </SettingsRow>
        </SettingsSection>
      </div>
    </div>
  )
}

export default SettingsPage

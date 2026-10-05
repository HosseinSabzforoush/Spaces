import { Activity, AppWindow, LayoutGrid, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react'
import { SidebarItem } from '@/layouts/SidebarItem'
import { useUiStore } from '@/stores/uiStore'
import { cn } from '@/utils/cn'

function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggle = useUiStore((s) => s.toggleSidebar)
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col gap-10 overflow-hidden bg-sidebar px-3 py-6 transition-[width] duration-200 ease-out',
        collapsed ? 'w-[4.5rem]' : 'w-56',
      )}
    >
      <div className={cn('flex h-10 items-center', collapsed ? 'justify-center' : 'justify-between pl-3')}>
        {!collapsed && <h1 className='text-2xl font-extrabold tracking-tight text-text-primary'>Spaces</h1>}
        <button
          type='button'
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-card-hover hover:text-text-primary'
        >
          <ToggleIcon size={18} />
        </button>
      </div>

      <nav aria-label='Main' className='flex w-full flex-col gap-2 font-semibold'>
        <SidebarItem to='/workspaces' icon={LayoutGrid} label='Workspaces' collapsed={collapsed} />
        <SidebarItem to='/apps' icon={AppWindow} label='Apps' collapsed={collapsed} />
        <SidebarItem to='/settings' icon={Settings} label='Settings' collapsed={collapsed} />
        <SidebarItem to='/activity' icon={Activity} label='Activity' collapsed={collapsed} />
      </nav>
    </aside>
  )
}

export default Sidebar

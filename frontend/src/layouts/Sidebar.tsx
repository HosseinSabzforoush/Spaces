import { SidebarItem } from '@/layouts/SidebarItem'
import { Activity, LayoutGrid, Settings } from 'lucide-react'

function Sidebar() {
  return (
    <div className='min-w-52 w-1/5 items-center bg-sidebar px-3 py-8 flex flex-col gap-15'>
      <h1 className='text-text-primary font-extrabold text-3xl'>Spaces</h1>
      <div className='text-text-secondary font-semibold flex flex-col gap-2 w-full items-center'>
        <SidebarItem to='workspaces' icon={LayoutGrid} label='Workspace' />
        <SidebarItem to='settings' icon={Settings} label='Settings' />
        <SidebarItem to='activity' icon={Activity} label='Activity' />
      </div>
    </div>
  )
}

export default Sidebar
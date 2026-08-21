import { SidebarItem } from '@/layouts/SidebarItem'
import { Activity, LayoutGrid, Settings } from 'lucide-react'

function Sidebar() {
  return (
    <div className='flex flex-col items-center w-1/5 px-3 py-8 min-w-52 bg-sidebar gap-15'>
      <h1 className='text-4xl font-extrabold text-text-primary'>Spaces</h1>
      <div className='flex flex-col items-center w-full gap-2 font-semibold text-text-secondary'>
        <SidebarItem to='workspaces' icon={LayoutGrid} label='Workspace' />
        <SidebarItem to='settings' icon={Settings} label='Settings' />
        <SidebarItem to='activity' icon={Activity} label='Activity' />
      </div>
    </div>
  )
}

export default Sidebar
import Sidebar from '@/layouts/Sidebar'
import { Outlet } from 'react-router-dom'
import Topbar from '@/layouts/Topbar'

function MainLayout() {
  return (
    <div className='flex flex-row h-screen overflow-hidden'>
      {/* Sidebar */}
      <Sidebar />

      {/* Right box */}
      <div className='flex flex-col w-full bg-app text-text-primary '>

        <Topbar />

        {/* Main Page*/}
        <main className='flex-1 min-h-0 grow'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
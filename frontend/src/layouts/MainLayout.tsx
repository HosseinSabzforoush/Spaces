import Sidebar from '@/layouts/Sidebar'
import { Outlet } from 'react-router-dom'
import Topbar from '@/layouts/Topbar'

function MainLayout() {
  return (
    <div className='flex flex-row h-screen overflow-hidden'>
      {/* Sidebar */}
      <Sidebar />

      {/* Right box */}
      <div className='w-full bg-app text-text-primary '>
        {/* TopBar */}
        <Topbar />
        {/* Main Page*/}
        <main>
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
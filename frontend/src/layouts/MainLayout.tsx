import Sidebar from '@/layouts/Sidebar'

function MainLayout() {
  return (
    <div className='flex flex-row h-screen'>
      {/* Sidebar */}
      <Sidebar />

      {/* Right box */}
      <div className='bg-app w-full text-text-primary'>
        {/* TopBar */}
        <div></div>
        {/* Main Page*/}
        <main>
          <div></div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
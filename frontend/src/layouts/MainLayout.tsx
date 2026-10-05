import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/layouts/Sidebar'
import PageTransition from '@/layouts/PageTransition'
import { useUiStore } from '@/stores/uiStore'

const NARROW_WINDOW = '(max-width: 52rem)'

function MainLayout() {
  useEffect(() => {
    const query = window.matchMedia(NARROW_WINDOW)
    const collapseWhenNarrow = () => {
      if (query.matches) useUiStore.getState().setSidebarCollapsed(true)
    }
    collapseWhenNarrow()
    query.addEventListener('change', collapseWhenNarrow)
    return () => query.removeEventListener('change', collapseWhenNarrow)
  }, [])

  return (
    <div className='flex h-screen flex-row overflow-hidden bg-app text-text-primary'>
      <Sidebar />
      <main className='min-h-0 min-w-0 flex-1 overflow-x-hidden px-5 py-6 md:px-8'>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  )
}

export default MainLayout

import { Plus } from 'lucide-react'

function WorkspacesPage() {
  return (
    <div className='flex flex-col h-full gap-8 px-10'>
      <h1 className='text-4xl font-semibold'>All Workspaces</h1>
      {/* cards container */}
      <div className='flex flex-wrap gap-10 py-2 overflow-y-auto flex-w-full'>
        {/* Workspace Card */}
        <div className='flex flex-col py-3 px-6 justify-between w-72 border-[3px] border-accent rounded-2xl h-54 bg-sidebar shadow-3d-dark'>
          {/* top */}
          <div className='flex flex-col'>
            <span className='text-2xl font-bold'>CODING</span>
            <span className='text-accent'>Active</span>
          </div>
          {/* apps */}
          <div className='flex h-10 gap-3'>
            <div className='w-10 h-10 rounded-lg bg-accent'></div>
            <div className='w-10 h-10 rounded-lg bg-accent'></div>
            <div className='w-10 h-10 rounded-lg bg-accent'></div>
            <div className='w-10 h-10 rounded-lg bg-accent'></div>
            <div className='flex items-center justify-center w-10 h-10 rounded-lg'>
              <span className='flex items-center justify-center w-full h-full text-sm text-center'>●●●</span>
            </div>
          </div>
          {/* down */}
          <div className='flex items-center justify-between w-full h-10'>
            <span className='text-text-muted'>5 Apps</span>
            <button className='flex items-center justify-center h-full px-4 rounded-lg cursor-pointer bg-success shadow-3d-dark'>
              <span>Launch 🚀</span>
            </button>
          </div>
        </div>


        <div className='flex w-72 border-[3px] border-accent rounded-2xl h-54 bg-sidebar shadow-3d-dark'></div>
        <div className='flex w-72 border-[3px] border-accent rounded-2xl h-54 bg-sidebar shadow-3d-dark'></div>
        <div className='flex w-72 border-[3px] border-accent rounded-2xl h-54 bg-sidebar shadow-3d-dark'></div>
        <div className='flex w-72 border-[3px] border-accent rounded-2xl h-54 bg-sidebar shadow-3d-dark'></div>

        {/* new workspace card */}
        <div className='flex flex-col gap-2 w-72 border-[3px] border-accent rounded-2xl h-54 items-center justify-center text-accent shadow-3d-dark cursor-pointer'>
          <Plus className='w-12 h-12' />
          <span className='text-xl font-semibold'>New Workspace</span>
        </div>
      </div>
    </div>
  )
}

export default WorkspacesPage
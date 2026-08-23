import { WorkspaceCard } from '@/features/workspaces/components/WorkspaceCard'
import { Plus } from 'lucide-react'

function WorkspacesPage() {
  return (
    <div className='flex flex-col h-full gap-8 px-10'>
      <h1 className='text-4xl font-semibold'>All Workspaces</h1>
      {/* cards container */}
      <div className='flex flex-wrap gap-10 py-2 overflow-y-auto flex-w-full'>
        {/* Workspace Card */}
        <WorkspaceCard title='Coding' state='Active' appsCount={5}/>


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
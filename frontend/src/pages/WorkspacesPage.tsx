import NewWorkspaceCard from '@/features/workspaces/components/NewWorkspaceCard'
import { WorkspaceCard } from '@/features/workspaces/components/WorkspaceCard'

function WorkspacesPage() {
  return (
    <div className='flex flex-col h-full gap-8 px-10'>
      <h1 className='text-4xl font-semibold'>All Workspaces</h1>
      {/* cards container */}
      <div className='flex flex-wrap gap-10 py-2 overflow-y-auto flex-w-full'>

        <WorkspaceCard id='1' title='Coding' state='Active' appCount={5} />


        <div className='flex w-72 border-[3px] border-accent rounded-2xl h-54 bg-sidebar shadow-3d-dark'></div>
        <div className='flex w-72 border-[3px] border-accent rounded-2xl h-54 bg-sidebar shadow-3d-dark'></div>
        <div className='flex w-72 border-[3px] border-accent rounded-2xl h-54 bg-sidebar shadow-3d-dark'></div>
        <div className='flex w-72 border-[3px] border-accent rounded-2xl h-54 bg-sidebar shadow-3d-dark'></div>

        <NewWorkspaceCard />
      </div>
    </div>
  )
}

export default WorkspacesPage
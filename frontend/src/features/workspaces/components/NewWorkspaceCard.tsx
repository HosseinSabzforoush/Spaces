import { Plus } from "lucide-react"

function NewWorkspaceCard() {
  return (
    <div className='flex flex-col gap-2 w-72 border-[3px] border-accent rounded-2xl h-54 items-center justify-center text-accent shadow-3d-dark cursor-pointer'>
      <Plus className='w-12 h-12' />
      <span className='text-xl font-semibold'>New Workspace</span>
    </div>
  )
}

export default NewWorkspaceCard
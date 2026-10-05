import { Plus } from "lucide-react"

function NewWorkspaceCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex flex-col gap-2 min-h-54 border-2 border-accent/70 rounded-2xl items-center justify-center text-accent shadow-3d-dark cursor-pointer transition-colors hover:border-accent hover:bg-accent/5'
    >
      <Plus className='w-12 h-12' />
      <span className='text-xl font-semibold uppercase'>New Workspace</span>
    </button>
  )
}

export default NewWorkspaceCard

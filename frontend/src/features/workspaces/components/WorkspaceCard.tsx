interface WorkspaceCardProps {
  title: string
  state: string
  appsCount: number
}

export const WorkspaceCard = ({ title, state, appsCount }: WorkspaceCardProps) => {
  return (
    <div className='flex flex-col py-3 px-6 justify-between w-72 border-[3px] border-accent rounded-2xl h-54 bg-sidebar shadow-3d-dark'>
      {/* top */}
      <div className='flex flex-col'>
        <span className='text-2xl font-bold'>{title}</span>
        <span className='text-accent'>{state}</span>
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
        <span className='text-text-muted'>{appsCount} Apps</span>
        <button className='flex items-center justify-center h-full px-4 rounded-lg cursor-pointer bg-success shadow-3d-dark'>
          <span>Launch 🚀</span>
        </button>
      </div>
    </div>
  )
}
import { Rocket } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface WorkspaceCardProps {
  id: string
  title: string
  state: string
  appCount: number
}

export const WorkspaceCard = ({ id, title, state, appCount }: WorkspaceCardProps) => {

  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/workspaces/${id}`)
  }

  return (
    <div onClick={handleCardClick} className='flex flex-col py-3 px-6 justify-between w-72 border-[3px] border-border-active rounded-2xl h-54 bg-card shadow-3d-dark'>
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
        <span className='text-text-muted'>{appCount} Apps</span>
        <button className='flex items-center justify-center h-10 px-4 rounded-lg cursor-pointer bg-success shadow-3d-dark'>
          <span className='flex items-center gap-2'>Launch <Rocket width={20} height={20}/></span>
        </button>
      </div>
    </div>
  )
}
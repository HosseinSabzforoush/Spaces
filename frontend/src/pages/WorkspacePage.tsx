import WorkspaceDetails from '@/features/workspaces/components/WorkspaceDetails';
import { Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom"

function WorkspacePage() {

  const navigate = useNavigate();

  return (
    <div className='flex flex-col h-full gap-2 pb-5 px-7'>
      {/* header */}
      <div className='flex justify-between text-sm font-semibold'>
        {/* workspace nav */}
        <div className='flex gap-1'>
          <span className='cursor-pointer hover:text-accent-hover' onClick={() => { navigate('/workspaces') }}>Workspaces</span>
          /
          <span>Coding</span>
        </div>

        {/* buttons */}
        <div className='flex gap-2 *:cursor-pointer'>
          <button className='px-3 py-1 rounded-lg bg-card-active shadow-3d-dark'>Edit</button>
          <button className='flex items-center justify-center h-8 px-3 rounded-lg cursor-pointer bg-success shadow-3d-dark'>
            <span className='flex items-center gap-2'>Launch <Rocket width={16} height={16} /></span>
          </button>
        </div>
      </div>

      {/* body */}
      <div className="flex *:h-full *:overflow-y-hidden gap-3 grow *:bg-surface-elevated *:rounded-md *:border-border *:border">
        {/* left frame */}
        <WorkspaceDetails />

        {/* right frame */}
        <div className='w-3/5'>

        </div>
      </div>
    </div>
  )
}

export default WorkspacePage
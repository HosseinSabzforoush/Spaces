import vscodeIcon from '@/assets/images/vscode-icon.png';
import AccentColorPicker from './AccentColorPicker';
import { Pencil } from 'lucide-react';

export default function WorkspaceDetails() {
  return (
    <div className="w-2/5 flex flex-col gap-5 p-5 text-text-primary">
      <span>Workspace Details</span>
      {/* icon and color */}
      <div className="flex gap-16">
        {/* icon */}
        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-xs">Icon</span>
          <div className="relative p-1 bg-border w-16 h-16 rounded-xl">
            <div className="w-14 h-14 p-1.5 rounded-lg shadow-xs shadow-black bg-card">
              <img src={vscodeIcon} />
            </div>

            <button className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-6 h-6 bg-card-active cursor-pointer border-border p-1 rounded-lg shadow-center-md ">
              <Pencil
                height={16}
                width={16}
              />
            </button>
          </div>
        </div>

        {/* accent color */}
        <AccentColorPicker />
      </div>
    </div>
  );
}

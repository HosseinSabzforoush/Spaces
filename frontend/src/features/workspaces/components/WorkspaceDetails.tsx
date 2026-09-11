import vscodeIcon from '@/assets/images/vscode-icon.png';
import AccentColorPicker from './AccentColorPicker';
import { Pencil } from 'lucide-react';
import '@/styles/App.css';

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

      {/* title */}
      <div className="flex flex-col gap-1">
        <span className="text-text-muted text-xs">
          Title <span className="text-danger">*</span>
        </span>
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Title"
          required
          className="w-full border-2 border-border rounded-md px-3 py-1 bg-card focus:border-border-active focus:outline hover:border-border-hover"
        />
      </div>

      {/* desc */}
      <div className="flex flex-col gap-1">
        <span className="text-text-muted text-xs">
          Description <span className="text-text-disabled">(optional)</span>
        </span>

        <textarea
          name="description"
          placeholder="Description"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          className="w-full h-60.5 max-h-60.5 border-2 border-border rounded-md px-3 py-1 bg-card focus:border-border-active focus:outline hover:border-border-hover custom-scrollbar"
        />
      </div>
    </div>
  );
}

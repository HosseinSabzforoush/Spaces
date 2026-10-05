import { Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface WorkspaceFooterProps {
  canSave: boolean;
  dirty: boolean;
  onDelete: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function WorkspaceFooter({ canSave, dirty, onDelete, onCancel, onSave }: WorkspaceFooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <Button variant="dangerOutline" icon={<Trash2 size={15} />} onClick={onDelete}>
        Delete workspace
      </Button>
      <div className="flex items-center gap-3">
        {dirty && <span className="text-xs text-warning">Unsaved changes</span>}
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="primary" disabled={!canSave || !dirty} onClick={onSave}>
          Save changes
        </Button>
      </div>
    </div>
  );
}

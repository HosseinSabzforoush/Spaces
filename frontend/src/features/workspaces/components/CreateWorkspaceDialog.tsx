import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import FormField, { inputClass } from '@/components/ui/FormField';
import Modal from '@/components/ui/Modal';
import { useWorkspaceStore } from '../store/workspaceStore';

export default function CreateWorkspaceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const create = useWorkspaceStore((s) => s.create);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const close = () => {
    onClose();
    setTitle('');
    setDescription('');
  };

  const submit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;
    const workspace = create({ title, description });
    close();
    navigate(`/workspaces/${workspace.id}`);
  };

  return (
    <Modal open={open} onClose={close} title="New workspace" description="Give it a name — you can add apps next.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <FormField label="Title" htmlFor="new-title" required>
          <input id="new-title" autoFocus maxLength={50} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Coding" className={inputClass} />
        </FormField>
        <FormField label="Description" htmlFor="new-desc" optional>
          <input id="new-desc" maxLength={160} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this workspace for?" className={inputClass} />
        </FormField>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!title.trim()}>Create workspace</Button>
        </div>
      </form>
    </Modal>
  );
}

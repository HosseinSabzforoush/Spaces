import SearchField from '@/components/ui/SearchField';
import { useWorkspaceStore } from '../store/workspaceStore';

export default function WorkspaceSearch() {
  const query = useWorkspaceStore((s) => s.query);
  const setQuery = useWorkspaceStore((s) => s.setQuery);

  return <SearchField value={query} onChange={setQuery} placeholder="Search workspaces" className="sm:w-72" />;
}

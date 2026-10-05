import { RotateCw, TriangleAlert } from 'lucide-react';
import Button from './Button';
import EmptyState from './EmptyState';

interface ErrorStateProps {
  title?: string;
  message?: string | null;
  onRetry?: () => void;
}

export default function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <EmptyState
      tone="danger"
      icon={TriangleAlert}
      title={title}
      description={message ?? undefined}
      action={onRetry && <Button size="sm" icon={<RotateCw size={14} />} onClick={onRetry}>Try again</Button>}
    />
  );
}

import { Button } from './Button';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data found',
  description = 'There are no records to display at this moment.',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] text-[var(--text-muted)] flex items-center justify-center mb-4 border border-[var(--border-subtle)] shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] mb-1">{title}</h4>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

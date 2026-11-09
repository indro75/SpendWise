import React from 'react';
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
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-gray-800 bg-[#111827]/40 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-[#1E2638] text-gray-400 flex items-center justify-center mb-4 border border-gray-700/50">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-gray-200 mb-1">{title}</h4>
      <p className="text-xs text-gray-400 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};


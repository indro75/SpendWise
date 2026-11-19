import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center p-1 sm:p-2">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-6">{message}</p>

        <div className="flex items-center gap-3 w-full justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1 sm:flex-none">
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 sm:flex-none"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container (stays above mobile bottom nav) */}
      <div className="fixed bottom-20 md:bottom-5 right-3 left-3 sm:left-auto sm:right-5 sm:max-w-sm z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          let bg = 'bg-white dark:bg-[#151C2C] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-xl';
          let icon = <Info className="w-5 h-5 text-indigo-500 shrink-0" />;

          if (toast.type === 'success') {
            bg = 'bg-emerald-50 dark:bg-[#0f241a] border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-xl shadow-emerald-500/10';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
          } else if (toast.type === 'error') {
            bg = 'bg-rose-50 dark:bg-[#291315] border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 shadow-xl shadow-rose-500/10';
            icon = <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-50 dark:bg-[#291f0d] border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100 shadow-xl shadow-amber-500/10';
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bg}`}
            >
              {icon}
              <div className="flex-1 text-xs sm:text-sm font-semibold leading-snug">{toast.message}</div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-0.5"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

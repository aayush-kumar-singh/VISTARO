import React from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-vistaro-surface text-vistaro-primary shadow-2xl rounded-2xl overflow-hidden border border-vistaro-border animate-fade-in flex flex-col"
          >
            <div className="flex items-center justify-between p-3.5 gap-3">
              <div className="flex items-center gap-2.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-vistaro-success shrink-0" />}
                {isError && <AlertCircle className="w-5 h-5 text-vistaro-error shrink-0" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-vistaro-accent shrink-0" />}
                <p className="text-body-sm text-vistaro-primary leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-vistaro-muted hover:text-vistaro-primary transition-colors p-1 cursor-pointer"
                aria-label="Close toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Progress bar */}
            <div
              className={`h-1 toast-progress-bar ${isSuccess ? 'bg-vistaro-success' : isError ? 'bg-vistaro-error' : 'bg-vistaro-accent'
                }`}
              style={{ animationDuration: `${toast.duration}ms` }}
            />
          </div>
        );
      })}
    </div>
  );
}

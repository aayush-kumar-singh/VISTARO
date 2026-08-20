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
            className="pointer-events-auto bg-[#18181b] text-white shadow-2xl rounded-2xl overflow-hidden border border-zinc-700/60 animate-fade-in flex flex-col"
          >
            <div className="flex items-center justify-between p-3.5 gap-3">
              <div className="flex items-center gap-2.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                {isError && <AlertCircle className="w-5 h-5 text-[#dc3545] shrink-0" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
                <p className="text-sm font-medium text-zinc-100 leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-400 hover:text-white transition-colors p-1"
                aria-label="Close toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Progress bar */}
            <div
              className={`h-1 toast-progress-bar ${
                isSuccess ? 'bg-emerald-500' : isError ? 'bg-[#dc3545]' : 'bg-blue-500'
              }`}
              style={{ animationDuration: `${toast.duration}ms` }}
            />
          </div>
        );
      })}
    </div>
  );
}

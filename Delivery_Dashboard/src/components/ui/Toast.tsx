import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => showToast({ type: 'success', message, title }),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) => showToast({ type: 'error', message, title }),
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => showToast({ type: 'warning', message, title }),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) => showToast({ type: 'info', message, title }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-9999 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          const icon = isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : isError ? (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-blue-600 shrink-0" />
          );

          const borderBg = isSuccess
            ? 'bg-white border-emerald-500/80 text-emerald-950 shadow-emerald-500/10'
            : isError
            ? 'bg-white border-rose-500/80 text-rose-950 shadow-rose-500/10'
            : isWarning
            ? 'bg-white border-amber-500/80 text-amber-950 shadow-amber-500/10'
            : 'bg-white border-blue-500/80 text-blue-950 shadow-blue-500/10';

          const indicatorBar = isSuccess
            ? 'bg-emerald-500'
            : isError
            ? 'bg-rose-500'
            : isWarning
            ? 'bg-amber-500'
            : 'bg-blue-500';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4 ${borderBg}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0 pr-2">
                {toast.title && (
                  <h4 className="text-xs font-bold leading-tight mb-0.5">{toast.title}</h4>
                )}
                <p className="text-xs text-slate-700 leading-relaxed break-words font-medium">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {/* Bottom indicator bar */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${indicatorBar}`} />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

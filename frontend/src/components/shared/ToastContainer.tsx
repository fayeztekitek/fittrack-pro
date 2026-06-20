import { useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
};

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: { id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string };
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const Icon = icons[toast.type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg animate-in slide-in-from-right ${colors[toast.type]}`}
    >
      <Icon size={18} className="shrink-0" />
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 hover:opacity-70 transition"
      >
        <X size={14} />
      </button>
    </div>
  );
}

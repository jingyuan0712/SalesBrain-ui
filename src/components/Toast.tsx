import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.type === 'success' && <CheckCircle size={16} color="var(--success)" />}
          {toast.type === 'error' && <AlertCircle size={16} color="var(--danger)" />}
          {toast.type === 'info' && <Info size={16} color="var(--primary)" />}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button className="btn btn-ghost btn-icon" onClick={() => removeToast(toast.id)} style={{ padding: '2px' }}>
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle, Info, X, ChevronRight } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast, setCurrentPage } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map(toast => {
        const content = <>
          {toast.type === 'success' && <CheckCircle size={16} color="var(--success)" aria-hidden="true" />}
          {toast.type === 'error' && <AlertCircle size={16} color="var(--danger)" aria-hidden="true" />}
          {toast.type === 'info' && <Info size={16} color="var(--primary)" aria-hidden="true" />}
          <span>{toast.message}</span>
        </>;
        return <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.targetPage ? <a className="toast-content toast-action" href={`#/${toast.targetPage}`} onClick={event => {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault(); setCurrentPage(toast.targetPage!); removeToast(toast.id);
          }}>{content}<ChevronRight size={16} aria-hidden="true" /></a> : <div className="toast-content">{content}</div>}
          <button className="btn btn-ghost btn-icon toast-dismiss" aria-label="關閉通知" onClick={() => removeToast(toast.id)} style={{ padding: '2px' }}>
            <X size={13} />
          </button>
        </div>;
      })}
    </div>
  );
}

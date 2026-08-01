'use client';

import { useAppContext } from '@/context/AppContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useAppContext();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        let Icon = Info;
        let borderClass = 'info';
        
        if (toast.type === 'success') {
          Icon = CheckCircle;
          borderClass = 'success';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'error';
        }

        return (
          <div key={toast.id} className={`toast ${borderClass}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon size={18} />
              <span>{toast.message}</span>
            </div>
            <button 
              onClick={() => removeToast(toast.id)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

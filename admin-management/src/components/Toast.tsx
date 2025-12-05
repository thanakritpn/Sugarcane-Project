
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export { ToastType };

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  message, 
  type, 
  duration = 3000, 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: XCircle,
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: AlertCircle,
          iconColor: 'text-yellow-600'
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: Info,
          iconColor: 'text-blue-600'
        };
    }
  };

  const styles = getToastStyles();
  const IconComponent = styles.icon;

  return (
    <div className={`
      ${styles.container}
      border rounded-lg p-4 shadow-lg min-w-[300px] max-w-md
      animate-in slide-in-from-right-2 fade-in duration-300
      flex items-center gap-3
    `}>
      <IconComponent className={`w-5 h-5 flex-shrink-0 ${styles.iconColor}`} />
      <span className="flex-1 font-medium text-sm">{message}</span>
      <button
        onClick={() => onClose(id)}
        className={`
          ${styles.iconColor} hover:opacity-70 transition-opacity
          flex-shrink-0 p-1 rounded hover:bg-black/5
        `}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
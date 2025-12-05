import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  const icon = {
    success: <FaCheckCircle className="text-lg" />,
    error: <FaExclamationCircle className="text-lg" />,
    info: <FaInfoCircle className="text-lg" />,
  }[type];

  return (
    <div
      className={`
        ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg
        flex items-center gap-3 min-w-max
        animate-in slide-in-from-top-2 duration-300
      `}
    >
      {icon}
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="hover:opacity-70 transition"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Toast;

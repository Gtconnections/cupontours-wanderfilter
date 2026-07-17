// app/(dashboard)/admin/components/Toast.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 4000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  const icons = {
    success: <FiCheckCircle size={20} />,
    error: <FiXCircle size={20} />,
    warning: <FiAlertCircle size={20} />,
    info: <FiInfo size={20} />
  };

  const colors = {
    success: '#16a34a',
    error: '#dc2626',
    warning: '#f59e0b',
    info: '#2563eb'
  };

  const backgrounds = {
    success: '#f0fdf4',
    error: '#fef2f2',
    warning: '#fffbeb',
    info: '#eff6ff'
  };

  return (
    <div 
      className={`wander-toast ${isExiting ? 'exiting' : ''}`}
      style={{
        borderLeftColor: colors[type],
        backgroundColor: backgrounds[type]
      }}
    >
      <div className="wander-toast-content">
        <span style={{ color: colors[type] }} className="wander-toast-icon">
          {icons[type]}
        </span>
        <span className="wander-toast-message">{message}</span>
      </div>
      <button onClick={handleClose} className="wander-toast-close">
        <FiX size={16} />
      </button>
    </div>
  );
};

export default Toast;
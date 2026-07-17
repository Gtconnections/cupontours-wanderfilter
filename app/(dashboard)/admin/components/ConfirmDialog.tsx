// app/(dashboard)/admin/components/ConfirmDialog.tsx

'use client';

import React, { useEffect, useRef } from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isSubmitting?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger',
  isSubmitting = false
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '#dc2626',
          iconBg: '#fef2f2',
          confirmBg: '#dc2626',
          confirmHover: '#b91c1c',
        };
      case 'warning':
        return {
          icon: '#f59e0b',
          iconBg: '#fffbeb',
          confirmBg: '#f59e0b',
          confirmHover: '#d97706',
        };
      default:
        return {
          icon: '#2563eb',
          iconBg: '#eff6ff',
          confirmBg: '#2563eb',
          confirmHover: '#1d4ed8',
        };
    }
  };

  const colors = getColors();

  return (
    <div className="wander-confirm-overlay">
      <div ref={dialogRef} className="wander-confirm-dialog">
        <button onClick={onClose} className="wander-confirm-close">
          <FiX size={20} />
        </button>

        <div className="wander-confirm-icon" style={{ backgroundColor: colors.iconBg }}>
          <FiAlertTriangle size={28} style={{ color: colors.icon }} />
        </div>

        <h3 className="wander-confirm-title">{title}</h3>
        <p className="wander-confirm-message">{message}</p>

        <div className="wander-confirm-actions">
          <button
            onClick={onClose}
            className="wander-confirm-btn cancel"
            disabled={isSubmitting}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="wander-confirm-btn confirm"
            style={{
              backgroundColor: colors.confirmBg,
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="wander-confirm-spinner"></span>
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
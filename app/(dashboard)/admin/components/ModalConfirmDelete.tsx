// app/admin/properties/components/ModalConfirmDelete.tsx

'use client';

import React from 'react';

interface ModalConfirmDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ModalConfirmDelete({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  isLoading = false,
}: ModalConfirmDeleteProps) {
  
  if (!isOpen) return null;

  return (
    <div 
      className="wander-modal-overlay wander-modal-confirm" 
      onClick={onClose}
      style={{ zIndex: 10000 }} // 🔥 Asegurar z-index inline también
    >
      <div className="wander-modal-container wander-modal-confirm" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-modal-header wander-modal-confirm-header">
          <h2>{title}</h2>
          <button className="wander-modal-close" onClick={onClose} disabled={isLoading}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="wander-modal-body wander-modal-confirm-body">
          <div className="wander-confirm-icon">🗑️</div>
          <p className="wander-confirm-message">{message}</p>
          <p className="wander-confirm-warning">Esta acción no se puede deshacer.</p>
        </div>

        {/* Footer */}
        <div className="wander-modal-footer wander-modal-confirm-footer">
          <button 
            className="wander-modal-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            className="wander-modal-btn-delete" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Eliminando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
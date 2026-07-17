// app/admin/yachts/components/ModalDeleteYacht.tsx

'use client';

import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './ModalDeleteYacht.css';

interface ModalDeleteYachtProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  yachtName: string;
  yachtId: number;
  isLoading?: boolean;
}

export default function ModalDeleteYacht({
  isOpen,
  onClose,
  onConfirm,
  yachtName,
  yachtId,
  isLoading = false,
}: ModalDeleteYachtProps) {
  
  if (!isOpen) return null;

  return (
    <div 
      className="wander-delete-yacht-overlay" 
      onClick={onClose}
    >
      <div className="wander-delete-yacht-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-delete-yacht-header">
          <h2>Delete Yacht</h2>
          <button 
            className="wander-delete-yacht-close" 
            onClick={onClose} 
            disabled={isLoading}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-delete-yacht-body">
          <div className="wander-delete-yacht-icon">
            <FiAlertTriangle size={48} />
          </div>
          <p className="wander-delete-yacht-message">
            Are you sure you want to delete the yacht <strong>&quot;{yachtName}&quot;</strong>?
          </p>
          <p className="wander-delete-yacht-warning">
            This action cannot be undone.
          </p>
          <p className="wander-delete-yacht-id">
            Yacht ID: #{yachtId}
          </p>
        </div>

        {/* Footer */}
        <div className="wander-delete-yacht-footer">
          <button 
            className="wander-delete-yacht-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-delete-yacht-btn-delete" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Yacht'}
          </button>
        </div>
      </div>
    </div>
  );
}
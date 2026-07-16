// app/admin/properties/components/ModalDeleteAgreement.tsx

'use client';

import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface ModalDeleteAgreementProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agreementTitle: string;
  isLoading?: boolean;
}

export default function ModalDeleteAgreement({
  isOpen,
  onClose,
  onConfirm,
  agreementTitle,
  isLoading = false,
}: ModalDeleteAgreementProps) {
  
  if (!isOpen) return null;

  return (
    <div 
      className="wander-delete-agreement-overlay" 
      onClick={onClose}
    >
      <div className="wander-delete-agreement-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-delete-agreement-header">
          <h2>Delete Agreement</h2>
          <button 
            className="wander-delete-agreement-close" 
            onClick={onClose} 
            disabled={isLoading}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-delete-agreement-body">
          <div className="wander-delete-agreement-icon">
            <FiAlertTriangle size={48} />
          </div>
          <p className="wander-delete-agreement-message">
            Are you sure you want to delete the agreement <strong>"{agreementTitle}"</strong>?
          </p>
          <p className="wander-delete-agreement-warning">
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="wander-delete-agreement-footer">
          <button 
            className="wander-delete-agreement-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-delete-agreement-btn-delete" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Agreement'}
          </button>
        </div>
      </div>
    </div>
  );
}
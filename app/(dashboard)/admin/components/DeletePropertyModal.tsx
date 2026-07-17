// app/admin/properties/components/DeletePropertyModal.tsx

'use client';

import React from 'react';

interface DeletePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  listingName: string;
  isLoading?: boolean;
}

export default function DeletePropertyModal({
  isOpen,
  onClose,
  onConfirm,
  listingName,
  isLoading = false,
}: DeletePropertyModalProps) {
  
  if (!isOpen) return null;

  return (
    <div 
      className="wander-delete-modal-overlay" 
      onClick={onClose}
    >
      <div className="wander-delete-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-delete-modal-header">
          <h2>Delete P&L</h2>
          <button className="wander-delete-modal-close" onClick={onClose} disabled={isLoading}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="wander-delete-modal-body">
          <div className="wander-delete-modal-icon">🗑️</div>
          <p className="wander-delete-modal-message">
            Are you sure you want to delete the P&L record for <strong>&quot;{listingName}&quot;</strong>?
          </p>
          <p className="wander-delete-modal-warning">
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="wander-delete-modal-footer">
          <button 
            className="wander-delete-modal-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-delete-modal-btn-delete" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete P&L'}
          </button>
        </div>
      </div>
    </div>
  );
}
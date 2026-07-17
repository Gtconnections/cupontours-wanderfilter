// app/admin/properties/components/ModalDeleteAccessLink.tsx

'use client';

import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './ModalDeleteAccessLink.css';

interface ModalDeleteAccessLinkProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  accessLinkId: number;
  accessLinkName: string;
  isLoading?: boolean;
}

export default function ModalDeleteAccessLink({
  isOpen,
  onClose,
  onConfirm,
  accessLinkId,
  accessLinkName,
  isLoading = false,
}: ModalDeleteAccessLinkProps) {
  
  if (!isOpen) return null;

  return (
    <div 
      className="wander-delete-al-overlay" 
      onClick={onClose}
    >
      <div className="wander-delete-al-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-delete-al-header">
          <h2>Delete Access Link</h2>
          <button 
            className="wander-delete-al-close" 
            onClick={onClose} 
            disabled={isLoading}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-delete-al-body">
          <div className="wander-delete-al-icon">
            <FiAlertTriangle size={48} />
          </div>
          <p className="wander-delete-al-message">
            Are you sure you want to delete the access link <strong>&quot;{accessLinkName}&quot;</strong>?
          </p>
          <p className="wander-delete-al-warning">
            This action cannot be undone.
          </p>
          <p className="wander-delete-al-id">
            ID: #{accessLinkId}
          </p>
        </div>

        {/* Footer */}
        <div className="wander-delete-al-footer">
          <button 
            className="wander-delete-al-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-delete-al-btn-delete" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Access Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
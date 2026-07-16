// app/admin/properties/components/ModalDeleteFile.tsx

'use client';

import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './ModalDeleteFile.css';

interface ModalDeleteFileProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileId: number;
  isLoading?: boolean;
}

export default function ModalDeleteFile({
  isOpen,
  onClose,
  onConfirm,
  fileId,
  isLoading = false,
}: ModalDeleteFileProps) {
  
  if (!isOpen) return null;

  return (
    <div 
      className="wander-delete-file-overlay" 
      onClick={onClose}
    >
      <div className="wander-delete-file-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-delete-file-header">
          <h2>Delete File</h2>
          <button 
            className="wander-delete-file-close" 
            onClick={onClose} 
            disabled={isLoading}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-delete-file-body">
          <div className="wander-delete-file-icon">
            <FiAlertTriangle size={48} />
          </div>
          <p className="wander-delete-file-message">
            Are you sure you want to delete this file?
          </p>
          <p className="wander-delete-file-warning">
            This action cannot be undone.
          </p>
          <p className="wander-delete-file-id">
            File ID: #{fileId}
          </p>
        </div>

        {/* Footer */}
        <div className="wander-delete-file-footer">
          <button 
            className="wander-delete-file-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-delete-file-btn-delete" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete File'}
          </button>
        </div>
      </div>
    </div>
  );
}
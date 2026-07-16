// app/admin/properties/components/ModalDeleteProperty.tsx

'use client';

import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './ModalDeleteProperty.css';

interface ModalDeletePropertyProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  propertyName: string;
  isLoading?: boolean;
}

export default function ModalDeleteProperty({
  isOpen,
  onClose,
  onConfirm,
  propertyName,
  isLoading = false,
}: ModalDeletePropertyProps) {
  
  if (!isOpen) return null;

  return (
    <div 
      className="wander-delete-property-overlay" 
      onClick={onClose}
    >
      <div className="wander-delete-property-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-delete-property-header">
          <h2>Delete Property</h2>
          <button 
            className="wander-delete-property-close" 
            onClick={onClose} 
            disabled={isLoading}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-delete-property-body">
          <div className="wander-delete-property-icon">
            <FiAlertTriangle size={48} />
          </div>
          <p className="wander-delete-property-message">
            Are you sure you want to delete the property <strong>"{propertyName}"</strong>?
          </p>
          <p className="wander-delete-property-warning">
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="wander-delete-property-footer">
          <button 
            className="wander-delete-property-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-delete-property-btn-delete" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Property'}
          </button>
        </div>
      </div>
    </div>
  );
}
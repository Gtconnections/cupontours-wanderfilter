// app/admin/properties/components/ModalDeleteInvoice.tsx

'use client';

import React, { useState } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './ModalDeleteInvoice.css';

interface ModalDeleteInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  invoiceId: number;
  invoiceTitle: string;
  isLoading?: boolean;
}

export default function ModalDeleteInvoice({
  isOpen,
  onClose,
  onConfirm,
  invoiceId,
  invoiceTitle,
  isLoading = false,
}: ModalDeleteInvoiceProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="wander-delete-invoice-overlay" 
      onClick={onClose}
    >
      <div className="wander-delete-invoice-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-delete-invoice-header">
          <h2>Delete Invoice</h2>
          <button 
            className="wander-delete-invoice-close" 
            onClick={onClose} 
            disabled={isLoading}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-delete-invoice-body">
          <div className="wander-delete-invoice-icon">
            <FiAlertTriangle size={48} />
          </div>
          <p className="wander-delete-invoice-message">
            Are you sure you want to delete the invoice <strong>&quot;{invoiceTitle}&quot;</strong>?
          </p>
          <p className="wander-delete-invoice-warning">
            This action cannot be undone.
          </p>
          <p className="wander-delete-invoice-id">
            Invoice ID: #{invoiceId}
          </p>

          <div className="wander-delete-invoice-reason">
            <label className="wander-delete-invoice-reason-label">
              Reason for deletion
            </label>
            <textarea
              className="wander-delete-invoice-reason-input"
              placeholder="Please provide a reason for deleting this invoice..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="wander-delete-invoice-footer">
          <button 
            className="wander-delete-invoice-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-delete-invoice-btn-delete" 
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? 'Deleting...' : 'Delete Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}
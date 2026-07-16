// app/admin/properties/components/ModalDeleteReservation.tsx

'use client';

import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './ModalDeleteReservation.css';

interface ModalDeleteReservationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reservationId: number;
  guestName: string;
  isLoading?: boolean;
}

export default function ModalDeleteReservation({
  isOpen,
  onClose,
  onConfirm,
  reservationId,
  guestName,
  isLoading = false,
}: ModalDeleteReservationProps) {
  
  if (!isOpen) return null;

  return (
    <div 
      className="wander-delete-reservation-overlay" 
      onClick={onClose}
    >
      <div className="wander-delete-reservation-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-delete-reservation-header">
          <h2>Delete Reservation</h2>
          <button 
            className="wander-delete-reservation-close" 
            onClick={onClose} 
            disabled={isLoading}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-delete-reservation-body">
          <div className="wander-delete-reservation-icon">
            <FiAlertTriangle size={48} />
          </div>
          <p className="wander-delete-reservation-message">
            Are you sure you want to delete the reservation for <strong>"{guestName}"</strong>?
          </p>
          <p className="wander-delete-reservation-warning">
            This action cannot be undone.
          </p>
          <p className="wander-delete-reservation-id">
            Reservation ID: #{reservationId}
          </p>
        </div>

        {/* Footer */}
        <div className="wander-delete-reservation-footer">
          <button 
            className="wander-delete-reservation-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-delete-reservation-btn-delete" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Reservation'}
          </button>
        </div>
      </div>
    </div>
  );
}
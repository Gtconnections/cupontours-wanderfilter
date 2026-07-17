// components/DeleteCarModal.tsx
'use client';

import React from 'react';

interface DeleteCarModalProps {
  isOpen: boolean;
  carId: number;
  carName: string;
  onClose: () => void;
  onDelete: () => Promise<void>;
  isDeleting: boolean;
}

export default function DeleteCarModal({ 
  isOpen, 
  carId, 
  carName, 
  onClose, 
  onDelete,
  isDeleting 
}: DeleteCarModalProps) {
  if (!isOpen) return null;

  console.log('🗑️ DeleteCarModal renderizado:', { isOpen, carId, carName });

  return (
    <div className="wander-modal-overlay" onClick={onClose}>
      <div className="wander-modal wander-modal-delete" onClick={(e) => e.stopPropagation()}>
        <div className="wander-modal-header">
          <h2>Eliminar Auto</h2>
          <button className="wander-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="wander-modal-body">
          <div className="wander-delete-confirm">
            <span className="wander-delete-icon">⚠️</span>
            <p>
              ¿Estás seguro que deseas eliminar el auto <strong>&quot;{carName}&quot;</strong>?
            </p>
            <p className="wander-delete-warning">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <div className="wander-modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="wander-btn-cancel"
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="wander-btn-delete"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="wander-spinner"></span>
                Eliminando...
              </>
            ) : (
              'Eliminar Auto'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
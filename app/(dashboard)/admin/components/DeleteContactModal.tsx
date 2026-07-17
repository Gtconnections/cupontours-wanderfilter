// components/DeleteContactModal.tsx
'use client';

import React, { useState } from 'react';
import { Contact } from '@/app/lib/api/emergencyContacts';

interface DeleteContactModalProps {
  isOpen: boolean;
  contact: Contact | null;
  onClose: () => void;
  onDelete: (contactId: number) => Promise<void>;
}

export default function DeleteContactModal({ 
  isOpen, 
  contact, 
  onClose, 
  onDelete 
}: DeleteContactModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!contact) return;

    setIsLoading(true);
    setError(null);

    try {
      await onDelete(contact.id);
      onClose();
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al eliminar el contacto');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !contact) return null;

  return (
    <div className="wander-modal-overlay" onClick={onClose}>
      <div className="wander-modal wander-modal-delete" onClick={(e) => e.stopPropagation()}>
        <div className="wander-modal-header">
          <h2>Eliminar Contacto</h2>
          <button className="wander-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="wander-modal-body">
          {error && (
            <div className="wander-modal-error">
              ⚠️ {error}
            </div>
          )}
          
          <div className="wander-delete-confirm">
            <span className="wander-delete-icon">⚠️</span>
            <p>
              ¿Estás seguro que deseas eliminar el contacto <strong>&quot;{contact.name}&quot;</strong>?
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
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="wander-btn-delete"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="wander-spinner"></span>
                Eliminando...
              </>
            ) : (
              'Eliminar Contacto'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
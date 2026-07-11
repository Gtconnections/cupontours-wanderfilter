// components/DeleteProcessModal.tsx
'use client';

import React, { useState } from 'react';
import { Process } from '@/app/lib/api/processes';

interface DeleteProcessModalProps {
  isOpen: boolean;
  process: Process | null;
  onClose: () => void;
  onDelete: (processId: number) => Promise<void>;
}

export default function DeleteProcessModal({ 
  isOpen, 
  process, 
  onClose, 
  onDelete 
}: DeleteProcessModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!process) return;

    setIsLoading(true);
    setError(null);

    try {
      await onDelete(process.id);
      onClose();
    } catch (err: any) {
      console.error('Error al eliminar:', err);
      setError(err.message || 'Error al eliminar el proceso');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !process) return null;

  return (
    <div className="wander-modal-overlay" onClick={onClose}>
      <div className="wander-modal wander-modal-delete" onClick={(e) => e.stopPropagation()}>
        <div className="wander-modal-header">
          <h2>Eliminar Proceso</h2>
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
              ¿Estás seguro que deseas eliminar el proceso <strong>"{process.name}"</strong>?
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
              'Eliminar Proceso'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
// components/DeleteUserModal.tsx
'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/app/lib/api/profiles';

interface DeleteUserModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onDelete: (userId: number) => Promise<void>;
}

export default function DeleteUserModal({ isOpen, user, onClose, onDelete }: DeleteUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      await onDelete(user.id);
      onClose();
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al eliminar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="wander-modal-overlay" onClick={onClose}>
      <div className="wander-modal wander-modal-delete" onClick={(e) => e.stopPropagation()}>
        <div className="wander-modal-header">
          <h2>Eliminar Usuario</h2>
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
              ¿Estás seguro que deseas eliminar a <strong>{user.user.first_name} {user.user.last_name}</strong>?
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
              'Eliminar Usuario'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
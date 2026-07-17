// components/CreateContactTypeModal.tsx
'use client';

import React, { useState } from 'react';

interface CreateContactTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { contact_type: string }) => Promise<void>;
}

export default function CreateContactTypeModal({ 
  isOpen, 
  onClose, 
  onCreate 
}: CreateContactTypeModalProps) {
  const [contactType, setContactType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactType.trim()) {
      setError('El nombre del tipo de contacto es requerido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onCreate({ contact_type: contactType });
      setContactType('');
      onClose();
    } catch (err) {
      console.error('Error al crear tipo de contacto:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al crear el tipo de contacto');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-modal-overlay" onClick={onClose}>
      <div className="wander-modal wander-modal-contact-type" onClick={(e) => e.stopPropagation()}>
        <div className="wander-modal-header">
          <h2>Create contact type</h2>
          <button className="wander-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="wander-modal-form">
          {error && (
            <div className="wander-modal-error">
              ⚠️ {error}
            </div>
          )}

          <div className="wander-form-group">
            <label htmlFor="contact_type">Contact type name</label>
            <input
              type="text"
              id="contact_type"
              name="contact_type"
              value={contactType}
              onChange={(e) => setContactType(e.target.value)}
              placeholder="Contact type name"
              required
              disabled={isLoading}
            />
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
              type="submit"
              className="wander-btn-save"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="wander-spinner"></span>
                  Creando...
                </>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
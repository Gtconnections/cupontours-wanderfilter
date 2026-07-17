// components/CreateProcessTypeModal.tsx
'use client';

import React, { useState } from 'react';

interface CreateProcessTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { process_name: string; user_position: string }) => Promise<void>;
}

// Opciones de roles
const ROLE_OPTIONS = [
  { value: 'admin', label: 'ADMIN' },
  { value: 'owner', label: 'OWNER' },
  { value: 'seller', label: 'SELLER' },
  { value: 'housekeeper', label: 'HOUSEKEEPER' },
  { value: 'frontdesk', label: 'FRONTDESK' },
  { value: 'customer', label: 'CUSTOMER' },
];

export default function CreateProcessTypeModal({ 
  isOpen, 
  onClose, 
  onCreate 
}: CreateProcessTypeModalProps) {
  const [formData, setFormData] = useState({
    process_name: '',
    user_position: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.process_name.trim()) {
      setError('El nombre del tipo de proceso es requerido');
      return;
    }

    if (!formData.user_position) {
      setError('Debes seleccionar un rol');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onCreate(formData);
      // Resetear formulario
      setFormData({
        process_name: '',
        user_position: '',
      });
      onClose();
    } catch (err) {
      console.error('Error al crear tipo de proceso:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al crear el tipo de proceso');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-modal-overlay" onClick={onClose}>
      <div className="wander-modal wander-modal-process-type" onClick={(e) => e.stopPropagation()}>
        <div className="wander-modal-header">
          <h2>Create Process Type</h2>
          <button className="wander-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="wander-modal-form">
          <p className="wander-modal-subtitle">
            Put the info about the process type
          </p>

          {error && (
            <div className="wander-modal-error">
              ⚠️ {error}
            </div>
          )}

          <div className="wander-form-group">
            <label htmlFor="process_name">Process type name</label>
            <input
              type="text"
              id="process_name"
              name="process_name"
              value={formData.process_name}
              onChange={handleChange}
              placeholder="The process name is required"
              required
              disabled={isLoading}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="user_position">Role</label>
            <select
              id="user_position"
              name="user_position"
              value={formData.user_position}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="">Select a value</option>
              {ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
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
                'Crear Tipo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
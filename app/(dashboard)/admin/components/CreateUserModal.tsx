// components/CreateUserModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CreateUserData, POSITIONS } from '@/app/lib/api/profiles';
import { FiX, FiAlertTriangle } from 'react-icons/fi';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateUserData) => Promise<void>;
}

const EMPTY_FORM: CreateUserData = {
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  password: '',
  position: 'admin',
  phone: '',
};

export default function CreateUserModal({ isOpen, onClose, onCreate }: CreateUserModalProps) {
  const [formData, setFormData] = useState<CreateUserData>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resetea el formulario cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(EMPTY_FORM);
      setError(null);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.username.trim() ||
        !formData.email.trim() || !formData.phone.trim() || !formData.password.trim()) {
      setError('Todos los campos son requeridos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onCreate(formData);
      onClose();
    } catch (err) {
      console.error('Error al crear usuario:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-modal-overlay" onClick={onClose}>
      <div className="wander-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wander-modal-header">
          <h2>Crear Usuario</h2>
          <button className="wander-modal-close" onClick={onClose} disabled={isLoading}>
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="wander-modal-form">
          {error && (
            <div className="wander-modal-error">
              <FiAlertTriangle size={14} /> {error}
            </div>
          )}

          <div className="wander-form-group">
            <label htmlFor="position">Posición</label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              {POSITIONS.map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>

          <div className="wander-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@ejemplo.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="wander-form-row">
            <div className="wander-form-group">
              <label htmlFor="first_name">Nombre</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Nombre"
                required
                minLength={3}
                disabled={isLoading}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="last_name">Apellido</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Apellido"
                required
                minLength={3}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="wander-form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="nombre.usuario"
              required
              minLength={4}
              disabled={isLoading}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+17866566582"
              required
              disabled={isLoading}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña"
              required
              minLength={3}
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
                'Crear Usuario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

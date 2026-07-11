// components/EditUserModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, UpdateUserData, POSITIONS } from '@/app/lib/api/profiles';

interface EditUserModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onSave: (userId: number, data: UpdateUserData) => Promise<void>;
}

export default function EditUserModal({ isOpen, user, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState<UpdateUserData>({
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipcode: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.user.first_name || '',
        last_name: user.user.last_name || '',
        email: user.user.email || '',
        position: user.position || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        zipcode: user.zipcode || 0,
      });
      setError(null);
    }
  }, [user]);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'zipcode' ? Number(value) : value
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validar campos requeridos
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      setError('Nombre, apellido y email son requeridos');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(user.id, formData);
      onClose();
    } catch (err: any) {
      console.error('Error al guardar:', err);
      setError(err.message || 'Error al actualizar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="wander-modal-overlay" onClick={onClose}>
      <div className="wander-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wander-modal-header">
          <h2>Editar Usuario</h2>
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
                disabled={isLoading}
              />
            </div>
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
              <option value="">Selecciona una posición</option>
              {POSITIONS.map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>

          <div className="wander-form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(123) 456 7890"
              disabled={isLoading}
            />
          </div>

          <div className="wander-form-row">
            <div className="wander-form-group">
              <label htmlFor="city">Ciudad</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ciudad"
                disabled={isLoading}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="state">Estado</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Estado"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="wander-form-row">
            <div className="wander-form-group">
              <label htmlFor="country">País</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="País"
                disabled={isLoading}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="zipcode">Código Postal</label>
              <input
                type="number"
                id="zipcode"
                name="zipcode"
                value={formData.zipcode || ''}
                onChange={handleChange}
                placeholder="Código Postal"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="wander-form-group">
            <label htmlFor="address">Dirección</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Dirección completa"
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
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
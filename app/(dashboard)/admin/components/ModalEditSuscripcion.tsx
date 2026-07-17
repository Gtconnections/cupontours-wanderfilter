// app/(dashboard)/admin/components/ModalEditSuscripcion.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { updateSuscripcion, Suscripcion } from '@/app/lib/api/suscripcionAdmin';
import './ModalEditService.css';

interface ModalEditSuscripcionProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: Suscripcion;
}

export default function ModalEditSuscripcion({ isOpen, onClose, onSuccess, item }: ModalEditSuscripcionProps) {
  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_email: '',
    cliente_telefono: '',
    monto_acordado: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'activa',
    notas: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        cliente_nombre: item.cliente_nombre || '',
        cliente_email: item.cliente_email || '',
        cliente_telefono: item.cliente_telefono || '',
        monto_acordado: item.monto_acordado?.toString() || '',
        fecha_inicio: item.fecha_inicio || '',
        fecha_fin: item.fecha_fin || '',
        estado: item.estado || 'activa',
        notas: item.notas || ''
      });
      setError(null);
    }
  }, [isOpen, item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cliente_nombre.trim()) {
      setError('Please enter the client name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateSuscripcion(item.id, {
        cliente_nombre: formData.cliente_nombre,
        cliente_email: formData.cliente_email,
        cliente_telefono: formData.cliente_telefono,
        monto_acordado: formData.monto_acordado ? parseFloat(formData.monto_acordado) : 0,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin || null,
        estado: formData.estado,
        notas: formData.notas
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Error al actualizar suscripción:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error updating subscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-edit-service-overlay" onClick={onClose}>
      <div className="wander-edit-service-container" onClick={(e) => e.stopPropagation()}>
        <div className="wander-edit-service-header">
          <h2>Edit Subscription</h2>
          <button className="wander-edit-service-close" onClick={onClose} disabled={isLoading}>
            <FiX size={20} />
          </button>
        </div>

        <div className="wander-edit-service-body">
          <form onSubmit={handleSubmit}>
            <div className="wander-edit-service-grid">
              <div className="wander-edit-service-group full-width">
                <label htmlFor="cliente_nombre" className="wander-edit-service-label">
                  Client Name <span className="wander-edit-service-required">*</span>
                </label>
                <input
                  type="text"
                  id="cliente_nombre"
                  name="cliente_nombre"
                  value={formData.cliente_nombre}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="cliente_email" className="wander-edit-service-label">Client Email</label>
                <input
                  type="email"
                  id="cliente_email"
                  name="cliente_email"
                  value={formData.cliente_email}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="cliente_telefono" className="wander-edit-service-label">Client Phone</label>
                <input
                  type="text"
                  id="cliente_telefono"
                  name="cliente_telefono"
                  value={formData.cliente_telefono}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="monto_acordado" className="wander-edit-service-label">Agreed Amount</label>
                <input
                  type="number"
                  id="monto_acordado"
                  name="monto_acordado"
                  value={formData.monto_acordado}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  step="0.01"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="estado" className="wander-edit-service-label">Status</label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="wander-edit-service-select"
                  disabled={isLoading}
                >
                  <option value="activa">Active</option>
                  <option value="vencida">Expired</option>
                  <option value="cancelada">Cancelled</option>
                </select>
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="fecha_inicio" className="wander-edit-service-label">Start Date</label>
                <input
                  type="date"
                  id="fecha_inicio"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="fecha_fin" className="wander-edit-service-label">Valid Until</label>
                <input
                  type="date"
                  id="fecha_fin"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group full-width">
                <label htmlFor="notas" className="wander-edit-service-label">Notes</label>
                <textarea
                  id="notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  className="wander-edit-service-textarea"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="wander-edit-service-error">
                <FiX size={16} />
                {error}
              </div>
            )}

            <div className="wander-edit-service-footer">
              <button type="button" className="wander-edit-service-btn-cancel" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" className="wander-edit-service-btn-submit" disabled={isLoading}>
                <FiSave size={16} />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

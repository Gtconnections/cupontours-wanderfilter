// app/(dashboard)/admin/components/ModalEditEvent.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { updateEvent, Event } from '@/app/lib/api/eventAdmin';
import './ModalEditService.css';

interface ModalEditEventProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: Event;
}

// El backend entrega fecha_hora como string; normalizamos a formato datetime-local (YYYY-MM-DDTHH:mm)
function toDateTimeLocal(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function ModalEditEvent({ isOpen, onClose, onSuccess, item }: ModalEditEventProps) {
  const [formData, setFormData] = useState({
    name: '',
    fecha_hora: '',
    descripcion: '',
    price: '',
    location: '',
    capacity: '',
    category: '',
    status: 'activo'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fills the form from the record being edited when the modal opens.
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: item.name || '',
        fecha_hora: toDateTimeLocal(item.fecha_hora),
        descripcion: item.descripcion || '',
        price: item.price?.toString() || '',
        location: item.location || '',
        capacity: item.capacity?.toString() || '',
        category: item.category || '',
        status: item.status || 'activo'
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

    if (!formData.name.trim()) {
      setError('Please enter a name');
      return;
    }
    if (!formData.fecha_hora) {
      setError('Please select a date and time');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateEvent(item.id, {
        name: formData.name,
        fecha_hora: formData.fecha_hora,
        descripcion: formData.descripcion,
        price: formData.price ? parseFloat(formData.price) : 0,
        location: formData.location,
        capacity: parseInt(formData.capacity) || 0,
        category: formData.category,
        status: formData.status
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Error al actualizar evento:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error updating event');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-edit-service-overlay" onClick={onClose}>
      <div className="wander-edit-service-container" onClick={(e) => e.stopPropagation()}>
        <div className="wander-edit-service-header">
          <h2>Edit Event</h2>
          <button className="wander-edit-service-close" onClick={onClose} disabled={isLoading}>
            <FiX size={20} />
          </button>
        </div>

        <div className="wander-edit-service-body">
          <form onSubmit={handleSubmit}>
            <div className="wander-edit-service-grid">
              <div className="wander-edit-service-group full-width">
                <label htmlFor="name" className="wander-edit-service-label">
                  Event Name <span className="wander-edit-service-required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="e.g., Noche de Jazz en la Playa"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="wander-edit-service-group full-width">
                <label htmlFor="fecha_hora" className="wander-edit-service-label">
                  Date & Time <span className="wander-edit-service-required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="fecha_hora"
                  name="fecha_hora"
                  value={formData.fecha_hora}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="price" className="wander-edit-service-label">Price</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="75.00"
                  step="0.01"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="capacity" className="wander-edit-service-label">Capacity</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="150"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="location" className="wander-edit-service-label">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="e.g., Playa Bávaro"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="category" className="wander-edit-service-label">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="e.g., Música, Deportes, Cultural"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group full-width">
                <label htmlFor="descripcion" className="wander-edit-service-label">Description</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="wander-edit-service-textarea"
                  placeholder="Concierto en vivo frente al mar con cena incluida."
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group full-width">
                <label htmlFor="status" className="wander-edit-service-label">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="wander-edit-service-select"
                  disabled={isLoading}
                >
                  <option value="activo">Active</option>
                  <option value="inactivo">Inactive</option>
                  <option value="finalizado">Finished</option>
                  <option value="cancelado">Cancelled</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="wander-edit-service-error">
                <FiX size={16} />
                {error}
              </div>
            )}

            <div className="wander-edit-service-footer">
              <button
                type="button"
                className="wander-edit-service-btn-cancel"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="wander-edit-service-btn-submit"
                disabled={isLoading}
              >
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

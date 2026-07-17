// app/(dashboard)/admin/components/ModalEditTransport.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { updateTransport, Transport } from '@/app/lib/api/transportAdmin';
import './ModalEditService.css';

interface ModalEditTransportProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: Transport;
}

export default function ModalEditTransport({ isOpen, onClose, onSuccess, item }: ModalEditTransportProps) {
  const [formData, setFormData] = useState({
    name: '',
    price_hour: '',
    capacity: '',
    category: '',
    brand: '',
    model: '',
    color: '',
    kit: '',
    descripcion: '',
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
        price_hour: item.price_hour?.toString() || '',
        capacity: item.capacity?.toString() || '',
        category: item.category || '',
        brand: item.brand || '',
        model: item.model || '',
        color: item.color || '',
        kit: item.kit || '',
        descripcion: item.descripcion || '',
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
    if (!formData.price_hour) {
      setError('Please enter a price per hour');
      return;
    }
    if (!formData.capacity) {
      setError('Please enter a capacity');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateTransport(item.id, {
        name: formData.name,
        price_hour: parseFloat(formData.price_hour) || 0,
        capacity: parseInt(formData.capacity) || 0,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        color: formData.color,
        kit: formData.kit,
        descripcion: formData.descripcion,
        status: formData.status
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Error al actualizar transporte:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error updating transport');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-edit-service-overlay" onClick={onClose}>
      <div className="wander-edit-service-container" onClick={(e) => e.stopPropagation()}>
        <div className="wander-edit-service-header">
          <h2>Edit Transport</h2>
          <button className="wander-edit-service-close" onClick={onClose} disabled={isLoading}>
            <FiX size={20} />
          </button>
        </div>

        <div className="wander-edit-service-body">
          <form onSubmit={handleSubmit}>
            <div className="wander-edit-service-grid">
              <div className="wander-edit-service-group full-width">
                <label htmlFor="name" className="wander-edit-service-label">
                  Name <span className="wander-edit-service-required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="e.g., Suburban Executive"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="price_hour" className="wander-edit-service-label">
                  Price / Hour <span className="wander-edit-service-required">*</span>
                </label>
                <input
                  type="number"
                  id="price_hour"
                  name="price_hour"
                  value={formData.price_hour}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="85.00"
                  step="0.01"
                  min="0"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="capacity" className="wander-edit-service-label">
                  Capacity <span className="wander-edit-service-required">*</span>
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="6"
                  min="1"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="brand" className="wander-edit-service-label">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="Chevrolet"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="model" className="wander-edit-service-label">Model</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="Suburban"
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
                  placeholder="SUV"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="color" className="wander-edit-service-label">Color</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="Negro"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group full-width">
                <label htmlFor="kit" className="wander-edit-service-label">Kit (amenities)</label>
                <input
                  type="text"
                  id="kit"
                  name="kit"
                  value={formData.kit}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="WiFi, agua, snacks"
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
                  placeholder="SUV de lujo con chofer para transporte ejecutivo."
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

// app/(dashboard)/admin/components/ModalEditGeneralService.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { updateGeneralService, GeneralService } from '@/app/lib/api/generalAdmin';
import './ModalEditService.css';

interface ModalEditGeneralServiceProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: GeneralService;
}

export default function ModalEditGeneralService({ isOpen, onClose, onSuccess, item }: ModalEditGeneralServiceProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    price_type: 'cotizacion',
    category: '',
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
        price: item.price?.toString() || '',
        price_type: item.price_type || 'cotizacion',
        category: item.category || '',
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

  const isFixedPrice = formData.price_type === 'fijo';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please enter a name');
      return;
    }
    if (isFixedPrice && !formData.price) {
      setError('Please enter a price for a fixed-price service');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateGeneralService(item.id, {
        name: formData.name,
        price_type: formData.price_type,
        price: formData.price ? parseFloat(formData.price) : null,
        category: formData.category,
        descripcion: formData.descripcion,
        status: formData.status
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Error al actualizar servicio general:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error updating service');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-edit-service-overlay" onClick={onClose}>
      <div className="wander-edit-service-container" onClick={(e) => e.stopPropagation()}>
        <div className="wander-edit-service-header">
          <h2>Edit Service</h2>
          <button className="wander-edit-service-close" onClick={onClose} disabled={isLoading}>
            <FiX size={20} />
          </button>
        </div>

        <div className="wander-edit-service-body">
          <form onSubmit={handleSubmit}>
            <div className="wander-edit-service-grid">
              <div className="wander-edit-service-group full-width">
                <label htmlFor="name" className="wander-edit-service-label">
                  Service Name <span className="wander-edit-service-required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="e.g., Catering para eventos privados"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="price_type" className="wander-edit-service-label">
                  Price Type <span className="wander-edit-service-required">*</span>
                </label>
                <select
                  id="price_type"
                  name="price_type"
                  value={formData.price_type}
                  onChange={handleChange}
                  className="wander-edit-service-select"
                  disabled={isLoading}
                  required
                >
                  <option value="cotizacion">Quote (Request Price)</option>
                  <option value="fijo">Fixed Price</option>
                </select>
              </div>

              {isFixedPrice && (
                <div className="wander-edit-service-group">
                  <label htmlFor="price" className="wander-edit-service-label">
                    Price <span className="wander-edit-service-required">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="wander-edit-service-input"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    disabled={isLoading}
                    required={isFixedPrice}
                  />
                  <span className="wander-edit-service-hint">Required when Price Type is &quot;Fixed Price&quot;</span>
                </div>
              )}

              <div className="wander-edit-service-group">
                <label htmlFor="category" className="wander-edit-service-label">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="e.g., Catering, Photography, Security"
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
                  placeholder="Servicio de catering personalizado para eventos."
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

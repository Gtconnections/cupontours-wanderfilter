// app/(dashboard)/admin/components/ModalEditMembresia.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { updateMembresia, Membresia } from '@/app/lib/api/membresiaAdmin';
import './ModalEditService.css';

interface ModalEditMembresiaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: Membresia;
}

export default function ModalEditMembresia({ isOpen, onClose, onSuccess, item }: ModalEditMembresiaProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    period: '',
    benefitsText: '',
    featured: false,
    icon: '',
    sort_order: '',
    description: '',
    status: 'activo'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: item.name || '',
        price: item.price?.toString() || '',
        period: item.period || '',
        benefitsText: (item.benefits || []).join('\n'),
        featured: Number(item.featured) === 1,
        icon: item.icon || '',
        sort_order: item.sort_order?.toString() || '',
        description: item.description || '',
        status: item.status || 'activo'
      });
      setError(null);
    }
  }, [isOpen, item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please enter a name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateMembresia(item.id, {
        name: formData.name,
        price: formData.price ? parseFloat(formData.price) : 0,
        period: formData.period,
        benefits: formData.benefitsText.split('\n').map(b => b.trim()).filter(Boolean),
        featured: formData.featured,
        icon: formData.icon,
        sort_order: formData.sort_order ? parseInt(formData.sort_order) : 0,
        description: formData.description,
        status: formData.status
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Error al actualizar membresía:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error updating plan');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-edit-service-overlay" onClick={onClose}>
      <div className="wander-edit-service-container" onClick={(e) => e.stopPropagation()}>
        <div className="wander-edit-service-header">
          <h2>Edit Membership Plan</h2>
          <button className="wander-edit-service-close" onClick={onClose} disabled={isLoading}>
            <FiX size={20} />
          </button>
        </div>

        <div className="wander-edit-service-body">
          <form onSubmit={handleSubmit}>
            <div className="wander-edit-service-grid">
              <div className="wander-edit-service-group full-width">
                <label htmlFor="name" className="wander-edit-service-label">
                  Plan Name <span className="wander-edit-service-required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
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
                  step="0.01"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="period" className="wander-edit-service-label">Period</label>
                <input
                  type="text"
                  id="period"
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="icon" className="wander-edit-service-label">Icon</label>
                <input
                  type="text"
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="sort_order" className="wander-edit-service-label">Sort Order</label>
                <input
                  type="number"
                  id="sort_order"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group full-width">
                <label htmlFor="benefitsText" className="wander-edit-service-label">Benefits (one per line)</label>
                <textarea
                  id="benefitsText"
                  name="benefitsText"
                  value={formData.benefitsText}
                  onChange={handleChange}
                  className="wander-edit-service-textarea"
                  rows={6}
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group full-width">
                <label htmlFor="description" className="wander-edit-service-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="wander-edit-service-textarea"
                  rows={2}
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
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

              <div className="wander-edit-service-group">
                <label className="wander-edit-service-checkbox-group">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  Featured
                </label>
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

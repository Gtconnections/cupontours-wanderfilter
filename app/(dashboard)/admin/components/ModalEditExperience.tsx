// app/(dashboard)/admin/components/ModalEditExperience.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { updateExperience, Experience } from '@/app/lib/api/experienceAdmin';
import './ModalEditService.css';

interface ModalEditExperienceProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: Experience;
}

export default function ModalEditExperience({ isOpen, onClose, onSuccess, item }: ModalEditExperienceProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    capacity_min: '',
    capacity_max: '',
    location: '',
    duration_days: '',
    pet_friendly: false,
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
        capacity_min: item.capacity_min?.toString() || '',
        capacity_max: item.capacity_max?.toString() || '',
        location: item.location || '',
        duration_days: item.duration_days?.toString() || '',
        pet_friendly: !!item.pet_friendly,
        category: item.category || '',
        descripcion: item.descripcion || '',
        status: item.status || 'activo'
      });
      setError(null);
    }
  }, [isOpen, item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please enter a name');
      return;
    }
    if (!formData.price) {
      setError('Please enter a price');
      return;
    }
    if (!formData.capacity_max) {
      setError('Please enter a max capacity');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateExperience(item.id, {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        capacity_max: parseInt(formData.capacity_max) || 0,
        category: formData.category,
        capacity_min: parseInt(formData.capacity_min) || 0,
        location: formData.location,
        duration_days: parseInt(formData.duration_days) || 0,
        pet_friendly: formData.pet_friendly,
        descripcion: formData.descripcion,
        status: formData.status
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Error al actualizar experiencia:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error updating experience');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-edit-service-overlay" onClick={onClose}>
      <div className="wander-edit-service-container" onClick={(e) => e.stopPropagation()}>
        <div className="wander-edit-service-header">
          <h2>Edit Experience</h2>
          <button className="wander-edit-service-close" onClick={onClose} disabled={isLoading}>
            <FiX size={20} />
          </button>
        </div>

        <div className="wander-edit-service-body">
          <form onSubmit={handleSubmit}>
            <div className="wander-edit-service-grid">
              <div className="wander-edit-service-group full-width">
                <label htmlFor="name" className="wander-edit-service-label">
                  Experience Name <span className="wander-edit-service-required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="e.g., Excursión en Catamarán Isla Saona"
                  disabled={isLoading}
                  required
                />
              </div>

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
                  placeholder="95.00"
                  step="0.01"
                  min="0"
                  disabled={isLoading}
                  required
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
                  placeholder="e.g., Tour acuático"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="capacity_min" className="wander-edit-service-label">Min Capacity</label>
                <input
                  type="number"
                  id="capacity_min"
                  name="capacity_min"
                  value={formData.capacity_min}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="1"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="capacity_max" className="wander-edit-service-label">
                  Max Capacity <span className="wander-edit-service-required">*</span>
                </label>
                <input
                  type="number"
                  id="capacity_max"
                  name="capacity_max"
                  value={formData.capacity_max}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="40"
                  min="0"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="wander-edit-service-group full-width">
                <label htmlFor="location" className="wander-edit-service-label">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="e.g., Isla Saona"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="duration_days" className="wander-edit-service-label">Duration (days)</label>
                <input
                  type="number"
                  id="duration_days"
                  name="duration_days"
                  value={formData.duration_days}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="1"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label className="wander-edit-service-checkbox-group">
                  <input
                    type="checkbox"
                    name="pet_friendly"
                    checked={formData.pet_friendly}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  Pet Friendly
                </label>
              </div>

              <div className="wander-edit-service-group full-width">
                <label htmlFor="descripcion" className="wander-edit-service-label">Description</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="wander-edit-service-textarea"
                  placeholder="Día completo en catamarán con almuerzo incluido."
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

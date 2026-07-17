// app/(dashboard)/admin/components/CreateExperienceForm.tsx

'use client';

import React, { useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import './CreateExperienceForm.css';

interface CreateExperienceFormProps {
  onSubmit: (data: { name: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CreateExperienceForm: React.FC<CreateExperienceFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      price: parseFloat(formData.price) || 0,
      capacity_min: parseInt(formData.capacity_min) || 0,
      capacity_max: parseInt(formData.capacity_max) || 0,
      location: formData.location,
      duration_days: parseInt(formData.duration_days) || 0,
      pet_friendly: formData.pet_friendly,
      category: formData.category,
      descripcion: formData.descripcion,
      status: formData.status
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="wander-create-form">
      <div className="wander-form-grid">
        {/* Name */}
        <div className="wander-form-group full-width">
          <label htmlFor="name" className="wander-form-label">
            Experience Name <span className="wander-form-required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Excursión en Catamarán Isla Saona"
            required
          />
        </div>

        {/* Price & Category */}
        <div className="wander-form-group">
          <label htmlFor="price" className="wander-form-label">
            Price <span className="wander-form-required">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="95.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="category" className="wander-form-label">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Tour acuático"
          />
        </div>

        {/* Capacity Min & Max */}
        <div className="wander-form-group">
          <label htmlFor="capacity_min" className="wander-form-label">Min Capacity</label>
          <input
            type="number"
            id="capacity_min"
            name="capacity_min"
            value={formData.capacity_min}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="1"
            min="0"
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="capacity_max" className="wander-form-label">
            Max Capacity <span className="wander-form-required">*</span>
          </label>
          <input
            type="number"
            id="capacity_max"
            name="capacity_max"
            value={formData.capacity_max}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="40"
            min="0"
            required
          />
        </div>

        {/* Location & Duration */}
        <div className="wander-form-group full-width">
          <label htmlFor="location" className="wander-form-label">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Isla Saona"
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="duration_days" className="wander-form-label">Duration (days)</label>
          <input
            type="number"
            id="duration_days"
            name="duration_days"
            value={formData.duration_days}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="1"
            min="0"
          />
        </div>

        {/* Pet Friendly */}
        <div className="wander-form-group">
          <label htmlFor="pet_friendly" className="wander-form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              id="pet_friendly"
              name="pet_friendly"
              checked={formData.pet_friendly}
              onChange={handleChange}
              className="wander-form-checkbox"
            />
            Pet Friendly
          </label>
        </div>

        {/* Description */}
        <div className="wander-form-group full-width">
          <label htmlFor="descripcion" className="wander-form-label">Description</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="wander-form-textarea"
            placeholder="Día completo en catamarán con almuerzo incluido."
            rows={3}
          />
        </div>

        {/* Status */}
        <div className="wander-form-group full-width">
          <label htmlFor="status" className="wander-form-label">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="wander-form-select"
          >
            <option value="activo">Active</option>
            <option value="inactivo">Inactive</option>
          </select>
        </div>
      </div>

      <div className="wander-form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="wander-form-btn cancel"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="wander-form-btn submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <FiLoader size={16} className="wander-spinner" />
              Creating...
            </>
          ) : (
            'Create Experience'
          )}
        </button>
      </div>
    </form>
  );
};
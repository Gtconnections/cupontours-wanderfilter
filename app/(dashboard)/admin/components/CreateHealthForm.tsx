// app/(dashboard)/admin/components/CreateHealthForm.tsx

'use client';

import React, { useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import './CreateHealthForm.css';

interface CreateHealthFormProps {
  onSubmit: (data: { name: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CreateHealthForm: React.FC<CreateHealthFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration_minutes: '',
    category: '',
    location: '',
    descripcion: '',
    status: 'activo'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      price: formData.price ? parseFloat(formData.price) : 0,
      duration_minutes: parseInt(formData.duration_minutes) || 0,
      category: formData.category,
      location: formData.location,
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
            Service Name <span className="wander-form-required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Consulta Médica General"
            required
          />
        </div>

        {/* Price & Duration */}
        <div className="wander-form-group">
          <label htmlFor="price" className="wander-form-label">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="40.00"
            step="0.01"
            min="0"
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="duration_minutes" className="wander-form-label">Duration (minutes)</label>
          <input
            type="number"
            id="duration_minutes"
            name="duration_minutes"
            value={formData.duration_minutes}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="30"
            min="0"
          />
        </div>

        {/* Category & Location */}
        <div className="wander-form-group">
          <label htmlFor="category" className="wander-form-label">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Consulta médica, Especialidad, Dental"
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="location" className="wander-form-label">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Cupontours Health Clinic"
          />
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
            placeholder="Consulta con médico general certificado."
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
            'Create Service'
          )}
        </button>
      </div>
    </form>
  );
};
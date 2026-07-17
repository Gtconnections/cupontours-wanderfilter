// app/(dashboard)/admin/components/CreateMembresiaForm.tsx

'use client';

import React, { useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import './CreateWellnessForm.css';

interface CreateMembresiaFormProps {
  onSubmit: (data: {
    name: string;
    price: number;
    period: string;
    benefits: string[];
    featured: boolean;
    icon: string;
    sort_order: number;
    description: string;
    status: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CreateMembresiaForm: React.FC<CreateMembresiaFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    period: 'mensual',
    benefitsText: '',
    featured: false,
    icon: '',
    sort_order: '',
    description: '',
    status: 'activo'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      price: formData.price ? parseFloat(formData.price) : 0,
      period: formData.period,
      benefits: formData.benefitsText
        .split('\n')
        .map(b => b.trim())
        .filter(Boolean),
      featured: formData.featured,
      icon: formData.icon,
      sort_order: formData.sort_order ? parseInt(formData.sort_order) : 0,
      description: formData.description,
      status: formData.status
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="wander-create-form">
      <div className="wander-form-grid">
        <div className="wander-form-group full-width">
          <label htmlFor="name" className="wander-form-label">
            Plan Name <span className="wander-form-required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Elite"
            required
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="price" className="wander-form-label">Price</label>
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
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="period" className="wander-form-label">Period</label>
          <input
            type="text"
            id="period"
            name="period"
            value={formData.period}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="mensual, anual..."
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="icon" className="wander-form-label">Icon</label>
          <input
            type="text"
            id="icon"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="☆, 👑, 💼..."
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="sort_order" className="wander-form-label">Sort Order</label>
          <input
            type="number"
            id="sort_order"
            name="sort_order"
            value={formData.sort_order}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="1"
            min="0"
          />
        </div>

        <div className="wander-form-group full-width">
          <label htmlFor="benefitsText" className="wander-form-label">Benefits (one per line)</label>
          <textarea
            id="benefitsText"
            name="benefitsText"
            value={formData.benefitsText}
            onChange={handleChange}
            className="wander-form-textarea"
            placeholder={"Spa y salón a domicilio\nReservas en restaurantes\n..."}
            rows={6}
          />
        </div>

        <div className="wander-form-group full-width">
          <label htmlFor="description" className="wander-form-label">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="wander-form-textarea"
            placeholder="Short internal description (optional)"
            rows={2}
          />
        </div>

        <div className="wander-form-group">
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

        <div className="wander-form-group">
          <label className="wander-form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              style={{ width: '16px', height: '16px', accentColor: '#000000' }}
            />
            Featured (&quot;Most Complete&quot; badge)
          </label>
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
            'Create Plan'
          )}
        </button>
      </div>
    </form>
  );
};

// app/(dashboard)/admin/components/CreateGeneralServiceForm.tsx

'use client';

import React, { useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import './CreateGeneralServiceForm.css';

interface CreateGeneralServiceFormProps {
  onSubmit: (data: { name: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CreateGeneralServiceForm: React.FC<CreateGeneralServiceFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    price_type: 'cotizacion',
    category: '',
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
      price: formData.price ? parseFloat(formData.price) : null,
      price_type: formData.price_type,
      category: formData.category,
      descripcion: formData.descripcion,
      status: formData.status
    };
    
    onSubmit(payload);
  };

  const isFixedPrice = formData.price_type === 'fijo';

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
            placeholder="e.g., Catering para eventos privados"
            required
          />
        </div>

        {/* Price Type */}
        <div className="wander-form-group">
          <label htmlFor="price_type" className="wander-form-label">
            Price Type <span className="wander-form-required">*</span>
          </label>
          <select
            id="price_type"
            name="price_type"
            value={formData.price_type}
            onChange={handleChange}
            className="wander-form-select"
            required
          >
            <option value="cotizacion">Quote (Request Price)</option>
            <option value="fijo">Fixed Price</option>
          </select>
        </div>

        {/* Price (conditional) */}
        {isFixedPrice && (
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
              placeholder="0.00"
              step="0.01"
              min="0"
              required={isFixedPrice}
            />
            <span className="wander-form-hint">Required when Price Type is &quot;Fixed Price&quot;</span>
          </div>
        )}

        {/* Category */}
        <div className="wander-form-group">
          <label htmlFor="category" className="wander-form-label">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Catering, Photography, Security"
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
            placeholder="Servicio de catering personalizado para eventos."
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
// app/(dashboard)/admin/components/CreateTransportForm.tsx

'use client';

import React, { useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import './CreateTransportForm.css';

interface CreateTransportFormProps {
  onSubmit: (data: { name: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CreateTransportForm: React.FC<CreateTransportFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
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
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="wander-create-form">
      <div className="wander-form-grid">
        {/* Name */}
        <div className="wander-form-group full-width">
          <label htmlFor="name" className="wander-form-label">
            Name <span className="wander-form-required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Suburban Executive"
            required
          />
        </div>

        {/* Price & Capacity */}
        <div className="wander-form-group">
          <label htmlFor="price_hour" className="wander-form-label">
            Price / Hour <span className="wander-form-required">*</span>
          </label>
          <input
            type="number"
            id="price_hour"
            name="price_hour"
            value={formData.price_hour}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="85.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="capacity" className="wander-form-label">
            Capacity <span className="wander-form-required">*</span>
          </label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="6"
            min="1"
            required
          />
        </div>

        {/* Brand & Model */}
        <div className="wander-form-group">
          <label htmlFor="brand" className="wander-form-label">Brand</label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="Chevrolet"
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="model" className="wander-form-label">Model</label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="Suburban"
          />
        </div>

        {/* Category & Color */}
        <div className="wander-form-group">
          <label htmlFor="category" className="wander-form-label">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="SUV"
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="color" className="wander-form-label">Color</label>
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="Negro"
          />
        </div>

        {/* Kit */}
        <div className="wander-form-group full-width">
          <label htmlFor="kit" className="wander-form-label">Kit (amenities)</label>
          <input
            type="text"
            id="kit"
            name="kit"
            value={formData.kit}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="WiFi, agua, snacks"
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
            placeholder="SUV de lujo con chofer para transporte ejecutivo."
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
            'Create Transport'
          )}
        </button>
      </div>
    </form>
  );
};
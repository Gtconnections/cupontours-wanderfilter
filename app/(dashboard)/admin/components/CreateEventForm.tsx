// app/(dashboard)/admin/components/CreateEventForm.tsx

'use client';

import React, { useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import './CreateEventForm.css';

interface CreateEventFormProps {
  onSubmit: (data: { name: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      fecha_hora: formData.fecha_hora,
      descripcion: formData.descripcion,
      price: formData.price ? parseFloat(formData.price) : 0,
      location: formData.location,
      capacity: parseInt(formData.capacity) || 0,
      category: formData.category,
      status: formData.status
    };
    
    onSubmit(payload);
  };

  // Obtener fecha y hora actual para el placeholder
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  return (
    <form onSubmit={handleSubmit} className="wander-create-form">
      <div className="wander-form-grid">
        {/* Name */}
        <div className="wander-form-group full-width">
          <label htmlFor="name" className="wander-form-label">
            Event Name <span className="wander-form-required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Noche de Jazz en la Playa"
            required
          />
        </div>

        {/* Date & Time */}
        <div className="wander-form-group full-width">
          <label htmlFor="fecha_hora" className="wander-form-label">
            Date & Time <span className="wander-form-required">*</span>
          </label>
          <input
            type="datetime-local"
            id="fecha_hora"
            name="fecha_hora"
            value={formData.fecha_hora}
            onChange={handleChange}
            className="wander-form-input"
            required
          />
          <span className="wander-form-hint">Select the date and time for the event</span>
        </div>

        {/* Price & Capacity */}
        <div className="wander-form-group">
          <label htmlFor="price" className="wander-form-label">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="75.00"
            step="0.01"
            min="0"
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="capacity" className="wander-form-label">Capacity</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="150"
            min="0"
          />
        </div>

        {/* Location & Category */}
        <div className="wander-form-group">
          <label htmlFor="location" className="wander-form-label">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Playa Bávaro"
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
            placeholder="e.g., Música, Deportes, Cultural"
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
            placeholder="Concierto en vivo frente al mar con cena incluida."
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
            'Create Event'
          )}
        </button>
      </div>
    </form>
  );
};
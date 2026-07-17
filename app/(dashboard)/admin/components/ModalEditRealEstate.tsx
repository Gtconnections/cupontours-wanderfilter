// app/(dashboard)/admin/components/ModalEditRealEstate.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { updateRealEstate, RealEstate } from '@/app/lib/api/realAdmin';
import './ModalEditService.css';

interface ModalEditRealEstateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: RealEstate;
}

export default function ModalEditRealEstate({ isOpen, onClose, onSuccess, item }: ModalEditRealEstateProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    operation_type: 'venta',
    property_type: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    location: '',
    address: '',
    parking_spaces: '',
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
        operation_type: item.operation_type || 'venta',
        property_type: item.property_type || '',
        bedrooms: item.bedrooms?.toString() || '',
        bathrooms: item.bathrooms?.toString() || '',
        sqft: item.sqft?.toString() || '',
        location: item.location || '',
        address: item.address || '',
        parking_spaces: item.parking_spaces?.toString() || '',
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
    if (!formData.price) {
      setError('Please enter a price');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateRealEstate(item.id, {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        operation_type: formData.operation_type,
        property_type: formData.property_type,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        sqft: parseFloat(formData.sqft) || 0,
        location: formData.location,
        address: formData.address,
        parking_spaces: parseInt(formData.parking_spaces) || 0,
        descripcion: formData.descripcion,
        status: formData.status
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Error al actualizar inmueble:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error updating property');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-edit-service-overlay" onClick={onClose}>
      <div className="wander-edit-service-container" onClick={(e) => e.stopPropagation()}>
        <div className="wander-edit-service-header">
          <h2>Edit Property</h2>
          <button className="wander-edit-service-close" onClick={onClose} disabled={isLoading}>
            <FiX size={20} />
          </button>
        </div>

        <div className="wander-edit-service-body">
          <form onSubmit={handleSubmit}>
            <div className="wander-edit-service-grid">
              <div className="wander-edit-service-group full-width">
                <label htmlFor="name" className="wander-edit-service-label">
                  Property Name <span className="wander-edit-service-required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="e.g., Villa Punta Cana Oceanfront"
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
                  placeholder="850000.00"
                  step="0.01"
                  min="0"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="operation_type" className="wander-edit-service-label">
                  Operation Type <span className="wander-edit-service-required">*</span>
                </label>
                <select
                  id="operation_type"
                  name="operation_type"
                  value={formData.operation_type}
                  onChange={handleChange}
                  className="wander-edit-service-select"
                  disabled={isLoading}
                  required
                >
                  <option value="venta">For Sale</option>
                  <option value="renta">For Rent</option>
                  <option value="alquiler">For Lease</option>
                </select>
              </div>

              <div className="wander-edit-service-group full-width">
                <label htmlFor="property_type" className="wander-edit-service-label">Property Type</label>
                <input
                  type="text"
                  id="property_type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="e.g., Villa, Apartment, House"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="bedrooms" className="wander-edit-service-label">Bedrooms</label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="5"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="bathrooms" className="wander-edit-service-label">Bathrooms</label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="6"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="sqft" className="wander-edit-service-label">Square Feet</label>
                <input
                  type="number"
                  id="sqft"
                  name="sqft"
                  value={formData.sqft}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="4500"
                  step="0.01"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="parking_spaces" className="wander-edit-service-label">Parking Spaces</label>
                <input
                  type="number"
                  id="parking_spaces"
                  name="parking_spaces"
                  value={formData.parking_spaces}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="3"
                  min="0"
                  disabled={isLoading}
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
                  placeholder="e.g., Punta Cana, República Dominicana"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group full-width">
                <label htmlFor="address" className="wander-edit-service-label">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="e.g., Calle Principal #12, Cocotal"
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
                  placeholder="Villa frente al mar con acceso privado a la playa."
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
                  <option value="vendido">Sold</option>
                  <option value="alquilado">Rented</option>
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

// app/(dashboard)/admin/components/CreateRealEstateForm.tsx

'use client';

import React, { useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import './CreateRealEstateForm.css';
import { RealEstateDynamicFields, ExtraField, UnitRow, PaymentRow, NearbyRow } from './RealEstateDynamicFields';

interface CreateRealEstateFormProps {
  onSubmit: (data: { name: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CreateRealEstateForm: React.FC<CreateRealEstateFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    operation_type: 'venta',
    currency: 'USD',
    latitude: '',
    longitude: '',
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

  const [extraInfo, setExtraInfo] = useState<ExtraField[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [paymentPlan, setPaymentPlan] = useState<PaymentRow[]>([]);
  const [nearby, setNearby] = useState<NearbyRow[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
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
      status: formData.status,
      currency: formData.currency,
      extra_info: extraInfo.filter((f) => f.label.trim() || f.value.trim()),
      amenities: amenities,
      units: units.filter((u) => u.tower.trim() || u.unit_code.trim() || String(u.price).trim()),
      payment_plan: paymentPlan.filter((p) => p.stage.trim() || p.value.trim()),
      nearby: nearby.filter((n) => n.place.trim() || n.time.trim()),
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="wander-create-form">
      <div className="wander-form-grid">
        {/* Name */}
        <div className="wander-form-group full-width">
          <label htmlFor="name" className="wander-form-label">
            Property Name <span className="wander-form-required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Villa Punta Cana Oceanfront"
            required
          />
        </div>

        {/* Price & Operation Type */}
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
            placeholder="850000.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="operation_type" className="wander-form-label">
            Operation Type <span className="wander-form-required">*</span>
          </label>
          <select
            id="operation_type"
            name="operation_type"
            value={formData.operation_type}
            onChange={handleChange}
            className="wander-form-select"
            required
          >
            <option value="venta">For Sale</option>
            <option value="renta">For Rent</option>
          </select>
        </div>

        {/* Currency */}
        <div className="wander-form-group">
          <label htmlFor="currency" className="wander-form-label">Currency</label>
          <select id="currency" name="currency" value={formData.currency} onChange={handleChange} className="wander-form-select">
            <option value="USD">USD</option>
            <option value="MXN">MXN</option>
          </select>
        </div>

        {/* Property Type */}
        <div className="wander-form-group full-width">
          <label htmlFor="property_type" className="wander-form-label">Property Type</label>
          <input
            type="text"
            id="property_type"
            name="property_type"
            value={formData.property_type}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Villa, Apartment, House"
          />
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="wander-form-group">
          <label htmlFor="bedrooms" className="wander-form-label">Bedrooms</label>
          <input
            type="number"
            id="bedrooms"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="5"
            min="0"
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="bathrooms" className="wander-form-label">Bathrooms</label>
          <input
            type="number"
            id="bathrooms"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="6"
            min="0"
          />
        </div>

        {/* Sqft & Parking */}
        <div className="wander-form-group">
          <label htmlFor="sqft" className="wander-form-label">Square Feet</label>
          <input
            type="number"
            id="sqft"
            name="sqft"
            value={formData.sqft}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="4500"
            step="0.01"
            min="0"
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="parking_spaces" className="wander-form-label">Parking Spaces</label>
          <input
            type="number"
            id="parking_spaces"
            name="parking_spaces"
            value={formData.parking_spaces}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="3"
            min="0"
          />
        </div>

        {/* Location & Address */}
        <div className="wander-form-group full-width">
          <label htmlFor="location" className="wander-form-label">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Punta Cana, República Dominicana"
          />
        </div>

        <div className="wander-form-group full-width">
          <label htmlFor="address" className="wander-form-label">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Calle Principal #12, Cocotal"
          />
        </div>

        {/* Coordinates (for map) */}
        <div className="wander-form-group">
          <label htmlFor="latitude" className="wander-form-label">Latitude (mapa)</label>
          <input type="number" step="any" id="latitude" name="latitude" value={formData.latitude} onChange={handleChange} className="wander-form-input" placeholder="25.7617" />
        </div>

        <div className="wander-form-group">
          <label htmlFor="longitude" className="wander-form-label">Longitude (mapa)</label>
          <input type="number" step="any" id="longitude" name="longitude" value={formData.longitude} onChange={handleChange} className="wander-form-input" placeholder="-80.1918" />
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
            placeholder="Villa frente al mar con acceso privado a la playa."
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

      <RealEstateDynamicFields extraInfo={extraInfo} setExtraInfo={setExtraInfo} amenities={amenities} setAmenities={setAmenities} paymentPlan={paymentPlan} setPaymentPlan={setPaymentPlan} nearby={nearby} setNearby={setNearby} units={units} setUnits={setUnits} />

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
            'Create Property'
          )}
        </button>
      </div>
    </form>
  );
};
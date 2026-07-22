// app/admin/yachts/components/ModalEditYacht.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiUser, FiAnchor, FiMaximize, FiUsers, FiHome, FiDroplet, FiDollarSign, FiTag, FiFileText } from 'react-icons/fi';
import { updateYacht, UpdateYachtData, getFullYacht, YachtOwner } from '@/app/lib/api/yachtsAdmin';
import './ModalEditYacht.css';

interface ModalEditYachtProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  yachtId: number;
  owners: YachtOwner[]; // 🔥 Recibir owners desde el padre
}

export default function ModalEditYacht({
  isOpen,
  onClose,
  onSuccess,
  yachtId,
  owners,
}: ModalEditYachtProps) {
  const [formData, setFormData] = useState<UpdateYachtData>({
    owner_id: 0,
    name: '',
    external_id: '',
    description: '',
    length: 0,
    capacity: 0,
    staterooms: 0,
    bathrooms: 0,
    price_full_day: 0,
    price_half_day: 0,
    certified_captain: false,
    fuel: false,
    water_toys: false,
    vip_host: false,
    crew: false,
    jet_sky: false,
    jacuzzi: false,
    slide: false,
    seabob: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const loadYachtData = async () => {
    setIsLoadingData(true);
    setError(null);
    
    try {
      // 🔥 Solo cargar el detalle del yate (los owners ya están en el padre)
      const yachtData = await getFullYacht(yachtId);
      
      if (yachtData) {
        const ownerId = Number(yachtData.owner_id) || 0;
        
        // Verificar si el owner existe en la lista
        const ownerExists = owners.some((owner) => owner.id === ownerId);
        
        setFormData({
          owner_id: ownerId,
          name: yachtData.name || '',
          external_id: yachtData.external_id || '',
          description: yachtData.description || '',
          length: yachtData.length || 0,
          capacity: yachtData.capacity || 0,
          staterooms: yachtData.staterooms || 0,
          bathrooms: yachtData.bathrooms || 0,
          price_full_day: yachtData.price_full_day || 0,
          price_half_day: yachtData.price_half_day || 0,
          certified_captain: yachtData.certified_captain || false,
          fuel: yachtData.fuel || false,
          water_toys: yachtData.water_toys || false,
          vip_host: yachtData.vip_host || false,
          crew: yachtData.crew || false,
          jet_sky: yachtData.jet_sky || false,
          jacuzzi: yachtData.jacuzzi || false,
          slide: yachtData.slide || false,
          seabob: yachtData.seabob || false,
        });
      }
      
    } catch (err) {
      console.error('❌ Error al cargar datos:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error loading data');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      // Pre-fills the form from the record being edited when the modal opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadYachtData();
    }
  }, [isOpen]);

  // Manejar cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Manejar envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.owner_id) {
      setError('Please select an owner');
      return;
    }
    if (!formData.name.trim()) {
      setError('Please enter a name');
      return;
    }
    if (!formData.external_id.trim()) {
      setError('Please enter an external ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateYacht(yachtId, formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Error al actualizar yate:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error updating yacht');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Mostrar loading mientras se cargan los datos
  if (isLoadingData) {
    return (
      <div className="wander-edit-yacht-overlay" onClick={onClose}>
        <div className="wander-edit-yacht-container" onClick={(e) => e.stopPropagation()}>
          <div className="wander-edit-yacht-header">
            <h2>Edit Yacht</h2>
            <button className="wander-edit-yacht-close" onClick={onClose} disabled>
              <FiX size={20} />
            </button>
          </div>
          <div className="wander-edit-yacht-loading">
            <div className="wander-loading-spinner"></div>
            <p>Loading yacht data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-edit-yacht-overlay" onClick={onClose}>
      <div className="wander-edit-yacht-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-edit-yacht-header">
          <h2>Edit Yacht</h2>
          <button className="wander-edit-yacht-close" onClick={onClose} disabled={isLoading}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-edit-yacht-body">
          <form onSubmit={handleSubmit}>
            {/* Owner */}
            <div className="wander-edit-yacht-field">
              <label className="wander-edit-yacht-label">
                <FiUser size={16} />
                Owner
              </label>
              <select
                name="owner_id"
                className="wander-edit-yacht-select"
                value={formData.owner_id}
                onChange={handleChange}
                disabled={isLoading}
                required
              >
                <option value={0}>Select an owner</option>
                {owners.map((owner) => {
                  const fullName = `${owner.user?.first_name || ''} ${owner.user?.last_name || ''}`.trim();
                  return (
                    <option key={owner.id} value={owner.id}>
                      {fullName || owner.user?.username || `Owner #${owner.id}`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Name y External ID */}
            <div className="wander-edit-yacht-row">
              <div className="wander-edit-yacht-field">
                <label className="wander-edit-yacht-label">
                  <FiAnchor size={16} />
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="wander-edit-yacht-input"
                  placeholder="Yacht name..."
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="wander-edit-yacht-field">
                <label className="wander-edit-yacht-label">
                  <FiTag size={16} />
                  External ID
                </label>
                <input
                  type="text"
                  name="external_id"
                  className="wander-edit-yacht-input"
                  placeholder="External ID..."
                  value={formData.external_id}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="wander-edit-yacht-field">
              <label className="wander-edit-yacht-label">
                <FiFileText size={16} />
                Description
              </label>
              <textarea
                name="description"
                className="wander-edit-yacht-textarea"
                placeholder="Enter description..."
                value={formData.description}
                onChange={handleChange}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Especificaciones */}
            <div className="wander-edit-yacht-row">
              <div className="wander-edit-yacht-field">
                <label className="wander-edit-yacht-label">
                  <FiMaximize size={16} />
                  Length (ft)
                </label>
                <input
                  type="number"
                  name="length"
                  className="wander-edit-yacht-input"
                  value={formData.length}
                  onChange={handleChange}
                  disabled={isLoading}
                  min="0"
                />
              </div>
              <div className="wander-edit-yacht-field">
                <label className="wander-edit-yacht-label">
                  <FiUsers size={16} />
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  className="wander-edit-yacht-input"
                  value={formData.capacity}
                  onChange={handleChange}
                  disabled={isLoading}
                  min="0"
                />
              </div>
            </div>

            <div className="wander-edit-yacht-row">
              <div className="wander-edit-yacht-field">
                <label className="wander-edit-yacht-label">
                  <FiHome size={16} />
                  Staterooms
                </label>
                <input
                  type="number"
                  name="staterooms"
                  className="wander-edit-yacht-input"
                  value={formData.staterooms}
                  onChange={handleChange}
                  disabled={isLoading}
                  min="0"
                />
              </div>
              <div className="wander-edit-yacht-field">
                <label className="wander-edit-yacht-label">
                  <FiDroplet size={16} />
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  className="wander-edit-yacht-input"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  disabled={isLoading}
                  min="0"
                />
              </div>
            </div>

            {/* Precios */}
            <div className="wander-edit-yacht-row">
              <div className="wander-edit-yacht-field">
                <label className="wander-edit-yacht-label">
                  <FiDollarSign size={16} />
                  Full Day Price
                </label>
                <input
                  type="number"
                  name="price_full_day"
                  className="wander-edit-yacht-input"
                  value={formData.price_full_day}
                  onChange={handleChange}
                  disabled={isLoading}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="wander-edit-yacht-field">
                <label className="wander-edit-yacht-label">
                  <FiDollarSign size={16} />
                  Half Day Price
                </label>
                <input
                  type="number"
                  name="price_half_day"
                  className="wander-edit-yacht-input"
                  value={formData.price_half_day}
                  onChange={handleChange}
                  disabled={isLoading}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Amenities - Grid de checkboxes */}
            <div className="wander-edit-yacht-section">
              <h3>Amenities</h3>
              <div className="wander-edit-yacht-amenities-grid">
                <label className="wander-edit-yacht-checkbox">
                  <input
                    type="checkbox"
                    name="certified_captain"
                    checked={formData.certified_captain}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  Certified Captain
                </label>
                <label className="wander-edit-yacht-checkbox">
                  <input
                    type="checkbox"
                    name="fuel"
                    checked={formData.fuel}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  Fuel Included
                </label>
                <label className="wander-edit-yacht-checkbox">
                  <input
                    type="checkbox"
                    name="water_toys"
                    checked={formData.water_toys}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  Water Toys
                </label>
                <label className="wander-edit-yacht-checkbox">
                  <input
                    type="checkbox"
                    name="vip_host"
                    checked={formData.vip_host}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  VIP Host
                </label>
                <label className="wander-edit-yacht-checkbox">
                  <input
                    type="checkbox"
                    name="crew"
                    checked={formData.crew}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  Crew
                </label>
                <label className="wander-edit-yacht-checkbox">
                  <input
                    type="checkbox"
                    name="jet_sky"
                    checked={formData.jet_sky}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  Jet Ski
                </label>
                <label className="wander-edit-yacht-checkbox">
                  <input
                    type="checkbox"
                    name="jacuzzi"
                    checked={formData.jacuzzi}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  Jacuzzi
                </label>
                <label className="wander-edit-yacht-checkbox">
                  <input
                    type="checkbox"
                    name="slide"
                    checked={formData.slide}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  Slide
                </label>
                <label className="wander-edit-yacht-checkbox">
                  <input
                    type="checkbox"
                    name="seabob"
                    checked={formData.seabob}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  Seabob
                </label>
              </div>
            </div>

            {error && (
              <div className="wander-edit-yacht-error">
                <FiX size={16} />
                {error}
              </div>
            )}

            {/* Footer */}
            <div className="wander-edit-yacht-footer">
              <button 
                type="button"
                className="wander-edit-yacht-btn-cancel" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="wander-edit-yacht-btn-submit" 
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
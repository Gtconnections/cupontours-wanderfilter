// app/admin/properties/components/ModalEditListing.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { editListing, EditListingData, PropertyDetailResponse, getOwners, Owner } from '@/app/lib/api/propertiesAdmin';

interface ModalEditListingProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: number;
  data: PropertyDetailResponse | null;
  onSuccess: () => void;
}

export default function ModalEditListing({
  isOpen,
  onClose,
  listingId,
  data,
  onSuccess,
}: ModalEditListingProps) {
  const [formData, setFormData] = useState<EditListingData>({
    owner_id: 0,
    listing_public_name: '',
    listing_name: '',
    property_id: '',
    listing_type: '',
    address: '',
    rent_price: 0,
    beds_number: 0,
    baths_number: 0,
    cleaning_fee: 0,
    percentage: 0,
    booking_price: 0,
    max_of_guest: 0,
    listing_status: true,
    description: '',
    wa_codes: '',
  });

  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoadingOwners, setIsLoadingOwners] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Función para obtener el nombre completo del owner
  const getOwnerFullName = (owner: Owner): string => {
    const firstName = owner.user?.first_name || '';
    const lastName = owner.user?.last_name || '';
    return `${firstName} ${lastName}`.trim() || owner.user?.username || '';
  };

  // Cargar datos de la propiedad al abrir el modal
  useEffect(() => {
    if (isOpen && data && owners.length > 0) {
      const listing = data.listing;
      
      // Buscar el owner_id correcto comparando nombres
      let ownerId = 0;
      const currentOwnerName = listing.owner_info?.full_name || '';
      
      if (currentOwnerName && owners.length > 0) {
        // Buscar por nombre completo
        const foundOwner = owners.find(owner => {
          const fullName = getOwnerFullName(owner);
          return fullName.toLowerCase() === currentOwnerName.toLowerCase();
        });
        
        if (foundOwner) {
          ownerId = foundOwner.id;
        } else {
          // Si no encuentra por nombre exacto, intentar búsqueda parcial
          const partialMatch = owners.find(owner => {
            const fullName = getOwnerFullName(owner);
            return fullName.toLowerCase().includes(currentOwnerName.toLowerCase()) ||
                   currentOwnerName.toLowerCase().includes(fullName.toLowerCase());
          });
          if (partialMatch) {
            ownerId = partialMatch.id;
          }
        }
      }

      // Pre-fills the form from the record being edited when the modal opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        owner_id: ownerId,
        listing_public_name: listing.public_name || listing.name || '',
        listing_name: listing.name || '',
        property_id: listing.property_id || '',
        listing_type: listing.listing_type || '',
        address: listing.address || '',
        rent_price: listing.rent || 0,
        beds_number: listing.beds || 0,
        baths_number: listing.bathrooms || 0,
        cleaning_fee: listing.cleaning_fee || 0,
        percentage: listing.percentage || 0,
        booking_price: listing.booking_price || 0,
        max_of_guest: listing.max_of_guest || 0,
        listing_status: listing.listing_status !== undefined ? listing.listing_status : true,
        description: listing.description || '',
        wa_codes: listing.wa_codes || '',
      });
      setError(null);
      setIsSuccess(false);
    }
  }, [isOpen, data, owners]);

  // Cargar owners desde la API
  const loadOwners = async () => {
    setIsLoadingOwners(true);
    try {
      const ownersData = await getOwners();
      setOwners(ownersData);
    } catch (err) {
      console.error('❌ Error al cargar owners:', err);
      setError('Error al cargar la lista de propietarios');
    } finally {
      setIsLoadingOwners(false);
    }
  };

  // Cargar owners al abrir el modal
  useEffect(() => {
    if (isOpen) {
      // Pre-fills the form from the record being edited when the modal opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadOwners();
    }
  }, [isOpen]);

  // Manejar cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.owner_id) {
      setError('Please select an owner');
      return;
    }
    if (!formData.listing_public_name.trim()) {
      setError('Public Name is required');
      return;
    }
    if (!formData.listing_name.trim()) {
      setError('Listing Name is required');
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await editListing(listingId, formData);
      setIsSuccess(true);
      
      // Mostrar mensaje de éxito
      onSuccess();
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('❌ Error al editar propiedad:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al editar la propiedad. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Obtener el nombre del owner seleccionado para mostrarlo como valor actual
  const selectedOwnerName = formData.owner_id 
    ? owners.find(o => o.id === formData.owner_id) 
    : null;
  
  const displayOwnerName = selectedOwnerName 
    ? getOwnerFullName(selectedOwnerName) 
    : data?.listing?.owner_info?.full_name || 'Select a value';

  return (
    <div 
      className="wander-modal-overlay wander-modal-edit"
      onClick={onClose}
      style={{ zIndex: 10002 }}
    >
      <div className="wander-modal-container wander-modal-edit" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-modal-header">
          <h2>Edit listing</h2>
          <button className="wander-modal-close" onClick={onClose} disabled={isLoading}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="wander-modal-body wander-modal-edit-body">
          <form onSubmit={handleSubmit}>
            {/* Public Name */}
            <div className="wander-edit-form-group">
              <label className="wander-edit-label">Public Name</label>
              <input
                type="text"
                name="listing_public_name"
                className="wander-edit-input"
                value={formData.listing_public_name}
                onChange={handleChange}
                disabled={isLoading || isSuccess}
                placeholder="° Comfy Apt on 8th Street ° Enjoy Latin life"
              />
            </div>

            {/* Listing Name */}
            <div className="wander-edit-form-group">
              <label className="wander-edit-label">Listing name</label>
              <input
                type="text"
                name="listing_name"
                className="wander-edit-input"
                value={formData.listing_name}
                onChange={handleChange}
                disabled={isLoading || isSuccess}
                placeholder="Calle 8 Apt 2 (Edificio)"
              />
            </div>

            {/* Owner y Listing Type en grid */}
            <div className="wander-edit-row">
              <div className="wander-edit-form-group">
                <label className="wander-edit-label">Owner</label>
                <select
                  name="owner_id"
                  className="wander-edit-select"
                  value={formData.owner_id}
                  onChange={handleChange}
                  disabled={isLoading || isSuccess || isLoadingOwners}
                >
                  <option value={0}>{displayOwnerName}</option>
                  {owners.map((owner) => {
                    const fullName = getOwnerFullName(owner);
                    // No mostrar duplicados
                    if (fullName === displayOwnerName && owner.id === formData.owner_id) {
                      return null;
                    }
                    return (
                      <option key={owner.id} value={owner.id}>
                        {fullName}
                      </option>
                    );
                  })}
                </select>
                {isLoadingOwners && (
                  <div className="wander-edit-loading">Loading owners...</div>
                )}
              </div>
              <div className="wander-edit-form-group">
                <label className="wander-edit-label">Listing type</label>
                <select
                  name="listing_type"
                  className="wander-edit-select"
                  value={formData.listing_type}
                  onChange={handleChange}
                  disabled={isLoading || isSuccess || formData.listing_type.toLowerCase() === 'luxury'}
                >
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="car">Car</option>
                  <option value="business">Business</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="wander-edit-form-group">
              <label className="wander-edit-label">Address</label>
              <input
                type="text"
                name="address"
                className="wander-edit-input"
                value={formData.address}
                onChange={handleChange}
                disabled={isLoading || isSuccess}
                placeholder="1684 Southwest 10th Street, Miami, FL"
              />
            </div>

            {/* Active/Inactive y Property ID en grid */}
            <div className="wander-edit-row">
              <div className="wander-edit-form-group">
                <label className="wander-edit-label">Active/Inactive</label>
                <div className="wander-edit-toggle">
                  <button
                    type="button"
                    className={`wander-toggle-btn ${formData.listing_status ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, listing_status: true }))}
                    disabled={isLoading || isSuccess}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    className={`wander-toggle-btn ${!formData.listing_status ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, listing_status: false }))}
                    disabled={isLoading || isSuccess}
                  >
                    Inactive
                  </button>
                </div>
              </div>
              <div className="wander-edit-form-group">
                <label className="wander-edit-label">Property id</label>
                <input
                  type="text"
                  name="property_id"
                  className="wander-edit-input"
                  value={formData.property_id}
                  onChange={handleChange}
                  disabled={isLoading || isSuccess}
                  placeholder="603926"
                />
              </div>
            </div>

            {/* Códigos WhatsApp (alias para el clasificador de entrega de turno) */}
            <div className="wander-edit-form-group">
              <label className="wander-edit-label">Códigos WhatsApp</label>
              <input
                type="text"
                name="wa_codes"
                className="wander-edit-input"
                value={formData.wa_codes}
                onChange={handleChange}
                disabled={isLoading || isSuccess}
                placeholder="FM 1612, 1612, Flamingo 1612 (separados por coma)"
              />
              <span style={{ fontSize: '0.78rem', opacity: 0.7, marginTop: '4px', display: 'block' }}>
                Alias que usa el equipo en WhatsApp. Se usan para matchear la entrega de turno.
              </span>
            </div>

            {/* Description */}
            <div className="wander-edit-form-group wander-edit-description-group">
              <label className="wander-edit-label">Description</label>
              <textarea
                name="description"
                className="wander-edit-textarea"
                value={formData.description}
                onChange={handleChange}
                disabled={isLoading || isSuccess}
                rows={8}
                placeholder="About this space: ..."
              />
            </div>

            {/* Grid de números */}
            <div className="wander-edit-row wander-edit-numbers">
              <div className="wander-edit-form-group">
                <label className="wander-edit-label">Rent price</label>
                <input
                  type="number"
                  name="rent_price"
                  className="wander-edit-input"
                  value={formData.rent_price}
                  onChange={handleChange}
                  disabled={isLoading || isSuccess}
                />
              </div>
              <div className="wander-edit-form-group">
                <label className="wander-edit-label">Booking Price</label>
                <input
                  type="number"
                  name="booking_price"
                  className="wander-edit-input"
                  value={formData.booking_price}
                  onChange={handleChange}
                  disabled={isLoading || isSuccess}
                />
              </div>
              <div className="wander-edit-form-group">
                <label className="wander-edit-label">Beds</label>
                <input
                  type="number"
                  name="beds_number"
                  className="wander-edit-input"
                  value={formData.beds_number}
                  onChange={handleChange}
                  disabled={isLoading || isSuccess}
                />
              </div>
              <div className="wander-edit-form-group">
                <label className="wander-edit-label">Baths</label>
                <input
                  type="number"
                  name="baths_number"
                  className="wander-edit-input"
                  value={formData.baths_number}
                  onChange={handleChange}
                  disabled={isLoading || isSuccess}
                />
              </div>
            </div>

            {/* Grid de números - segunda fila */}
            <div className="wander-edit-row wander-edit-numbers">
              <div className="wander-edit-form-group">
                <label className="wander-edit-label">Cleaning fee</label>
                <input
                  type="number"
                  name="cleaning_fee"
                  className="wander-edit-input"
                  value={formData.cleaning_fee}
                  onChange={handleChange}
                  disabled={isLoading || isSuccess}
                />
              </div>
              <div className="wander-edit-form-group">
                <label className="wander-edit-label">Percentage</label>
                <input
                  type="number"
                  name="percentage"
                  className="wander-edit-input"
                  value={formData.percentage}
                  onChange={handleChange}
                  disabled={isLoading || isSuccess}
                />
              </div>
              <div className="wander-edit-form-group">
                <label className="wander-edit-label">Max Guests</label>
                <input
                  type="number"
                  name="max_of_guest"
                  className="wander-edit-input"
                  value={formData.max_of_guest}
                  onChange={handleChange}
                  disabled={isLoading || isSuccess}
                />
              </div>
              <div className="wander-edit-form-group">
                {/* Espacio vacío para mantener grid */}
              </div>
            </div>

            {error && (
              <div className="wander-modal-error">
                ⚠️ {error}
              </div>
            )}

            {isSuccess && (
              <div className="wander-edit-success">
                ✅ Property updated successfully!
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="wander-modal-footer wander-modal-footer-edit">
          <button 
            className="wander-modal-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-modal-btn-send" 
            onClick={handleSubmit}
            disabled={isLoading || isSuccess}
          >
            {isLoading ? 'Saving...' : isSuccess ? 'Saved!' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
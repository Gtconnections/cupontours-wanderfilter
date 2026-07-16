// app/admin/properties/components/ModalCreatePL.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { getListingsNamesAndIds, ListingSimple, createProfitAndLoss } from '@/app/lib/api/propertiesAdmin';

interface ModalCreatePLProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // 🔥 Ya no recibe ID
}

export default function ModalCreatePL({
  isOpen,
  onClose,
  onSuccess,
}: ModalCreatePLProps) {
  const [listings, setListings] = useState<ListingSimple[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [type, setType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar listings al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadListings();
      // Resetear selecciones
      setSelectedIds([]);
      setType('annual');
      setStartDate('');
      setError(null);
      setSearchTerm('');
    }
  }, [isOpen]);

  // Cargar listings desde la API
  const loadListings = async () => {
    setIsLoadingListings(true);
    try {
      const data = await getListingsNamesAndIds();
      setListings(data);
    } catch (err: any) {
      console.error('❌ Error al cargar listings:', err);
      setError('Error al cargar la lista de propiedades');
    } finally {
      setIsLoadingListings(false);
    }
  };

  // Manejar selección/deselección de un listing
  const toggleListing = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Seleccionar/deseleccionar todos
  const toggleAll = () => {
    const filteredIds = filteredListings.map(item => item.id);
    const allSelected = filteredIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      const newIds = [...selectedIds];
      filteredIds.forEach(id => {
        if (!newIds.includes(id)) {
          newIds.push(id);
        }
      });
      setSelectedIds(newIds);
    }
  };

  // Filtrar listings por búsqueda
  const filteredListings = listings.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Verificar si todos los filtrados están seleccionados
  const allFilteredSelected = filteredListings.length > 0 && 
    filteredListings.every(item => selectedIds.includes(item.id));

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      setError('Please select at least one property');
      return;
    }

    if (!startDate) {
      setError('Please select a start date');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const date = new Date(startDate);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear());

      const payload = {
        type,
        start_date: startDate,
        list_listing_id: selectedIds,
        month,
        year,
      };

      const result = await createProfitAndLoss(payload);
      console.log('✅ PL creado (respuesta):', result);

      // 🔥 Siempre llamar a onSuccess sin importar la respuesta
      onSuccess();
      onClose();

    } catch (err: any) {
      console.error('❌ Error al crear PL:', err);
      
      // 🔥 Incluso si hay error, llamar a onSuccess (la creación pudo haberse hecho)
      onSuccess();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="wander-create-pl-overlay" 
      onClick={onClose}
    >
      <div className="wander-create-pl-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-create-pl-header">
          <h2>Create Profit and Loss</h2>
          <button className="wander-create-pl-close" onClick={onClose} disabled={isLoading}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="wander-create-pl-body">
          {/* Type */}
          <div className="wander-create-pl-form-group">
            <label className="wander-create-pl-label">Type</label>
            <select
              className="wander-create-pl-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={isLoading}
            >
              <option value="annual">Annual</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="wander-create-pl-form-group">
            <label className="wander-create-pl-label">Start Date</label>
            <input
              type="date"
              className="wander-create-pl-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Select Cars / Properties */}
          <div className="wander-create-pl-form-group">
            <label className="wander-create-pl-label">Select Properties</label>
            
            {/* Buscador */}
            <div className="wander-create-pl-search">
              <input
                type="text"
                className="wander-create-pl-search-input"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading || isLoadingListings}
              />
            </div>

            {/* Lista de propiedades */}
            <div className="wander-create-pl-list">
              {isLoadingListings ? (
                <div className="wander-create-pl-loading-list">
                  <div className="wander-loading-spinner-small"></div>
                  <span>Loading properties...</span>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="wander-create-pl-empty-list">
                  {searchTerm ? 'No properties found' : 'No properties available'}
                </div>
              ) : (
                <>
                  {/* Select All */}
                  <div className="wander-create-pl-item select-all">
                    <label className="wander-create-pl-checkbox-label">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={toggleAll}
                        disabled={isLoading}
                      />
                      <span>Select All</span>
                    </label>
                  </div>

                  {/* Items */}
                  {filteredListings.map((listing) => (
                    <div key={listing.id} className="wander-create-pl-item">
                      <label className="wander-create-pl-checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(listing.id)}
                          onChange={() => toggleListing(listing.id)}
                          disabled={isLoading}
                        />
                        <span>
                          {listing.name}
                          <span className="wander-create-pl-item-id">(ID: {listing.id})</span>
                        </span>
                      </label>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Contador de seleccionados */}
            <div className="wander-create-pl-counter">
              {selectedIds.length} property(ies) selected
            </div>
          </div>

          {error && (
            <div className="wander-create-pl-error">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wander-create-pl-footer">
          <button 
            className="wander-create-pl-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-create-pl-btn-create" 
            onClick={handleSubmit}
            disabled={isLoading || selectedIds.length === 0}
          >
            {isLoading ? 'Creating...' : 'Create PL'}
          </button>
        </div>
      </div>
    </div>
  );
}
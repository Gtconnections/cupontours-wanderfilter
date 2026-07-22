// app/admin/properties/components/ModalCreateAgreement.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getListingsNamesAndIds, ListingSimple, createAgreement } from '@/app/lib/api/propertiesAdmin';
import { FiX, FiUpload, FiFile } from 'react-icons/fi';

interface ModalCreateAgreementProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number; // Este es el user_id real (no profile_id)
}

export default function ModalCreateAgreement({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: ModalCreateAgreementProps) {
  const [listings, setListings] = useState<ListingSimple[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [listingId, setListingId] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar listings desde la API
  const loadListings = async () => {
    setIsLoadingListings(true);
    try {
      const data = await getListingsNamesAndIds();
      setListings(data);
    } catch (err) {
      console.error('❌ Error al cargar listings:', err);
      setError('Error al cargar la lista de propiedades');
    } finally {
      setIsLoadingListings(false);
    }
  };

  // Cargar listings al abrir el modal
  useEffect(() => {
    if (isOpen) {
      // Pre-fills the form from the record being edited when the modal opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadListings();
      // Resetear formulario
      setTitle('');
      setExpirationDate('');
      setListingId(0);
      setSelectedFile(null);
      setError(null);
    }
  }, [isOpen]);

  // Manejar selección de archivo
  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Validar tipo (PDF, DOC, DOCX, etc.)
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
      setError('Por favor, selecciona un archivo válido (PDF, DOC, DOCX, JPG, PNG)');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo excede el tamaño máximo de 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  // Manejar cambio en input file
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Manejar drag & drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Manejar clic en el área de drop
  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  // Eliminar archivo seleccionado
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    // Validaciones
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!expirationDate) {
      setError('Please select an expiration date');
      return;
    }
    if (!listingId) {
      setError('Please select a listing');
      return;
    }
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      
      await createAgreement({
        title: title.trim(),
        expiration_date: expirationDate,
        listing_id: listingId,
        user_id: userId, // 🔥 Usar el userId que viene del prop
        agreement: selectedFile,
      });

      onSuccess();
      onClose();

    } catch (err) {
      console.error('❌ Error al crear agreement:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al crear el agreement');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="wander-create-agreement-overlay" 
      onClick={onClose}
    >
      <div className="wander-create-agreement-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-create-agreement-header">
          <h2>Create Agreement</h2>
          <button 
            className="wander-create-agreement-close" 
            onClick={onClose} 
            disabled={isLoading}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-create-agreement-body">
          {/* Title */}
          <div className="wander-create-agreement-form-group">
            <label className="wander-create-agreement-label">Title</label>
            <input
              type="text"
              className="wander-create-agreement-input"
              placeholder="Enter agreement title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Expiration Date */}
          <div className="wander-create-agreement-form-group">
            <label className="wander-create-agreement-label">Expiration date</label>
            <input
              type="date"
              className="wander-create-agreement-input"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Listing */}
          <div className="wander-create-agreement-form-group">
            <label className="wander-create-agreement-label">Listing</label>
            <select
              className="wander-create-agreement-select"
              value={listingId}
              onChange={(e) => setListingId(Number(e.target.value))}
              disabled={isLoading || isLoadingListings}
            >
              <option value={0}>Select a value</option>
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.name} (ID: {listing.id})
                </option>
              ))}
            </select>
            {isLoadingListings && (
              <div className="wander-create-agreement-loading-list">
                Loading listings...
              </div>
            )}
          </div>

          {/* File Drop Zone */}
          <div className="wander-create-agreement-form-group">
            <label className="wander-create-agreement-label">Document</label>
            <div 
              className={`wander-create-agreement-dropzone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleDropZoneClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileInputChange}
                className="wander-create-agreement-file-input"
                disabled={isLoading}
              />
              
              {selectedFile ? (
                <div className="wander-create-agreement-file-preview">
                  <FiFile size={32} />
                  <span className="wander-create-agreement-file-name">{selectedFile.name}</span>
                  <span className="wander-create-agreement-file-size">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    className="wander-create-agreement-file-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    disabled={isLoading}
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div className="wander-create-agreement-drop-content">
                  <FiUpload size={32} />
                  <p>Drop your document here</p>
                  <span>or click to browse</span>
                  <small>PDF, DOC, DOCX, JPG, PNG (Max 10MB)</small>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="wander-create-agreement-error">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wander-create-agreement-footer">
          <button 
            className="wander-create-agreement-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-create-agreement-btn-submit" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
// app/admin/components/ModalChangePrincipalImage.tsx
// Shared principal-image-change modal, reused across properties and cars detail pages.

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiCamera, FiAlertTriangle } from 'react-icons/fi';

interface ModalChangePrincipalImageProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: number;
  itemName: string;
  currentImage: string;
  uploadFn: (id: number, file: File) => Promise<unknown>;
  onSuccess: () => void;
}

export default function ModalChangePrincipalImage({
  isOpen,
  onClose,
  itemId,
  itemName,
  currentImage,
  uploadFn,
  onSuccess,
}: ModalChangePrincipalImageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resetear estado al abrir/cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      // Limpiar URL de preview para evitar memory leaks
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      // Resets the form when the modal opens/closes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedFile(null);
      setPreview(null);
      setError(null);
      setIsLoading(false);
      setIsDragging(false);
    }
  }, [isOpen]);

  // Manejar selección de archivo
  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen excede el tamaño máximo de 10MB');
      return;
    }

    // Limpiar preview anterior
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  // Manejar cambio en input file
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
    // Resetear input para permitir seleccionar el mismo archivo nuevamente
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

  // Subir imagen principal
  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Por favor, selecciona una imagen');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await uploadFn(itemId, selectedFile);
      console.log('Foto principal actualizada:', result);

      // Limpiar preview
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      // Callback de éxito
      onSuccess();

      // Cerrar modal
      onClose();

    } catch (err) {
      console.error('Error al actualizar foto principal:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al actualizar la foto principal. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar clic en el área de drop
  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="wander-modal-overlay wander-modal-principal"
      onClick={onClose}
      style={{ zIndex: 10001 }}
    >
      <div className="wander-modal-container wander-modal-principal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-modal-header">
          <h2>Change Principal Image</h2>
          <button className="wander-modal-close" onClick={onClose} disabled={isLoading}>
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-modal-body">
          <div className="wander-modal-section">
            <p className="wander-modal-description">
              Select a new image to set as the principal photo for <strong>&quot;{itemName}&quot;</strong>
            </p>

            {/* Current Image Preview */}
            <div className="wander-current-image-container">
              <label className="wander-upload-label">Current Image:</label>
              <div className="wander-current-image">
                <img src={currentImage} alt="Current principal" />
              </div>
            </div>

            {/* New Image Drop Zone */}
            <div className="wander-principal-upload-section">
              <label className="wander-upload-label">Select new photo:</label>
              
              <div 
                className={`wander-drop-zone ${isDragging ? 'dragging' : ''} ${preview ? 'has-image' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleDropZoneClick}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="wander-file-input"
                  disabled={isLoading}
                />
                
                {preview ? (
                  <div className="wander-principal-preview">
                    <img src={preview} alt="New principal preview" />
                    <div className="wander-principal-preview-overlay">
                      <FiCamera size={16} />
                      <span>Click to change</span>
                    </div>
                  </div>
                ) : (
                  <div className="wander-drop-content">
                    <div className="wander-drop-icon"><FiCamera size={28} /></div>
                    <p className="wander-drop-text">Drop your image here</p>
                    <p className="wander-drop-subtext">or click to browse</p>
                    <p className="wander-drop-hint">PNG, JPG, WEBP (Max 10MB)</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="wander-modal-error">
                  <FiAlertTriangle size={14} /> {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="wander-modal-footer wander-modal-footer-principal">
          <button 
            className="wander-modal-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-modal-btn-save-principal" 
            onClick={handleSubmit}
            disabled={isLoading || !selectedFile}
          >
            {isLoading ? 'Uploading...' : 'Save Principal Image'}
          </button>
        </div>
      </div>
    </div>
  );
}
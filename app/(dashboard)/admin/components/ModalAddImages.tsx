// app/admin/properties/components/ModalAddImages.tsx

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { uploadListingImages } from '@/app/lib/api/propertiesAdmin';

interface ModalAddImagesProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: number;
  listingName: string;
  listingIdDisplay: number;
  onSuccess: () => void;
}

export default function ModalAddImages({ 
  isOpen, 
  onClose, 
  listingId, 
  listingName,
  listingIdDisplay,
  onSuccess 
}: ModalAddImagesProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Resetear estado al abrir/cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      // Limpiar URLs de preview para evitar memory leaks
      previews.forEach(url => URL.revokeObjectURL(url));
      setFiles([]);
      setPreviews([]);
      setError(null);
      setIsLoading(false);
      setIsDragging(false);
    }
  }, [isOpen]);

  // Manejar selección de archivos
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    Array.from(selectedFiles).forEach(file => {
      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" no es una imagen válida`);
        return;
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" excede el tamaño máximo de 10MB`);
        return;
      }

      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...validPreviews]);
      setError(null);
    }
  };

  // Manejar cambio en input file
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Resetear input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Eliminar imagen individual
  const removeImage = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
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
    handleFileSelect(e.dataTransfer.files);
  };

  // Subir imágenes
  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Por favor, selecciona al menos una imagen');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await uploadListingImages(listingId, files);
      console.log('✅ Imágenes subidas:', result);

      // Limpiar URLs de preview
      previews.forEach(url => URL.revokeObjectURL(url));
      
      // Callback de éxito
      onSuccess();
      
      // Cerrar modal
      onClose();

    } catch (err: any) {
      console.error('❌ Error al subir imágenes:', err);
      setError(err.message || 'Error al subir las imágenes. Por favor, intenta de nuevo.');
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
    <div className="wander-modal-overlay" onClick={onClose}>
      <div className="wander-modal-container wander-modal-images" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-modal-header">
          <h2>Create new process</h2>
          <button className="wander-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="wander-modal-body">
          <div className="wander-modal-section">
            <p className="wander-modal-description">
              Put the info about the process
            </p>

            <div className="wander-modal-listing-info">
              The last listing uploaded was <strong>"{listingName}"</strong> with id: <strong>{listingIdDisplay}</strong>.
            </div>

            <div className="wander-upload-section">
              <label className="wander-upload-label">Select the photo:</label>
              
              {/* Drop Zone */}
              <div 
                ref={dropZoneRef}
                className={`wander-drop-zone ${isDragging ? 'dragging' : ''} ${previews.length > 0 ? 'has-images' : ''}`}
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
                  multiple
                  onChange={handleFileInputChange}
                  className="wander-file-input"
                  disabled={isLoading}
                />
                
                {previews.length === 0 ? (
                  <div className="wander-drop-content">
                    <div className="wander-drop-icon">📁</div>
                    <p className="wander-drop-text">Drop it!</p>
                    <p className="wander-drop-subtext">or click to browse</p>
                  </div>
                ) : (
                  <div className="wander-image-grid">
                    {previews.map((preview, index) => (
                      <div key={index} className="wander-image-preview">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        <button 
                          className="wander-image-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          disabled={isLoading}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="wander-modal-error">
                  ⚠️ {error}
                </div>
              )}

              <p className="wander-upload-help">
                If you don't want to upload photos press the <strong>CANCEL</strong> button below.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="wander-modal-footer wander-modal-footer-images">
          <button 
            className="wander-modal-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-modal-btn-save wander-modal-btn-save-without"
            onClick={handleSubmit}
            disabled={isLoading || files.length === 0}
          >
            {isLoading ? 'Uploading...' : 'Save Without Image'}
          </button>
          <button 
            className="wander-modal-btn-save wander-modal-btn-save-with"
            onClick={handleSubmit}
            disabled={isLoading || files.length === 0}
          >
            {isLoading ? 'Uploading...' : 'Save With Image'}
          </button>
        </div>
      </div>
    </div>
  );
}
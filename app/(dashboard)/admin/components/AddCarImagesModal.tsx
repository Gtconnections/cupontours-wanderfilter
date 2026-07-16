// components/AddCarImagesModal.tsx
'use client';

import React, { useState, useRef } from 'react';

interface AddCarImagesModalProps {
  isOpen: boolean;
  carId: number;
  onClose: () => void;
  onUpload: (carId: number, files: File[]) => Promise<void>;
}

export default function AddCarImagesModal({ isOpen, carId, onClose, onUpload }: AddCarImagesModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setError('Selecciona al menos una imagen');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onUpload(carId, selectedFiles);
      // Limpiar después de subir
      previews.forEach(url => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviews([]);
      onClose();
    } catch (err: any) {
      console.error('Error al subir imágenes:', err);
      setError(err.message || 'Error al subir las imágenes');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-modal-overlay" onClick={onClose}>
      <div className="wander-modal wander-modal-images" onClick={(e) => e.stopPropagation()}>
        <div className="wander-modal-header">
          <h2>Add images</h2>
          <button className="wander-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="wander-modal-body">
          {error && (
            <div className="wander-modal-error">
              ⚠️ {error}
            </div>
          )}

          <div 
            className={`wander-drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="wander-drop-icon">🖼️</span>
            <p>Arrastra tus imágenes aquí</p>
            <span className="wander-drop-hint">o haz clic para seleccionar</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="wander-drop-input"
            />
          </div>

          {previews.length > 0 && (
            <div className="wander-image-previews">
              {previews.map((preview, index) => (
                <div key={index} className="wander-image-preview-item">
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="wander-preview-remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="wander-images-note">
            {selectedFiles.length} {selectedFiles.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
          </p>
        </div>

        <div className="wander-modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="wander-btn-cancel"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="wander-btn-save"
            disabled={isLoading || selectedFiles.length === 0}
          >
            {isLoading ? (
              <>
                <span className="wander-spinner"></span>
                Subiendo...
              </>
            ) : (
              `Subir ${selectedFiles.length} imagen${selectedFiles.length !== 1 ? 'es' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
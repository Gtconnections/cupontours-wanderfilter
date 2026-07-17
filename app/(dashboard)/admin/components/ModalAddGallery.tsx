// app/(dashboard)/admin/components/ModalAddGallery.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';
import './ModalAddGallery.css';

interface ModalAddGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemId: number;
  itemName: string;
  uploadFn: (id: number, files: File[]) => Promise<unknown>;
}

export default function ModalAddGallery({
  isOpen,
  onClose,
  onSuccess,
  itemId,
  itemName,
  uploadFn,
}: ModalAddGalleryProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

  // Resetear estado al cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      previews.forEach(url => URL.revokeObjectURL(url));
      // Resets the form when the modal opens/closes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFiles([]);
      setPreviews([]);
      setError(null);
      setIsLoading(false);
      setIsDragging(false);
    }
  }, [isOpen]);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    Array.from(selectedFiles).forEach(file => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`"${file.name}" must be PNG, JPG or WEBP`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the maximum size of 10MB`);
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

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

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await uploadFn(itemId, files);

      previews.forEach(url => URL.revokeObjectURL(url));

      onSuccess();
      onClose();

    } catch (err) {
      console.error('❌ Error al subir imágenes de galería:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error uploading images');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-add-gallery-overlay" onClick={onClose}>
      <div className="wander-add-gallery-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-add-gallery-header">
          <h2>Add Gallery</h2>
          <button className="wander-add-gallery-close" onClick={onClose} disabled={isLoading}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-add-gallery-body">
          <p className="wander-add-gallery-subtitle">
            Adding gallery images for <strong>&quot;{itemName}&quot;</strong>
          </p>

          <div
            className={`wander-add-gallery-dropzone ${isDragging ? 'dragging' : ''} ${previews.length > 0 ? 'has-images' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleDropZoneClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handleFileInputChange}
              className="wander-add-gallery-file-input"
              disabled={isLoading}
            />

            {previews.length === 0 ? (
              <div className="wander-add-gallery-drop-content">
                <FiUpload size={48} />
                <p>Drop your images here</p>
                <span>or click to browse</span>
                <small>PNG, JPG, WEBP (Max 10MB each)</small>
              </div>
            ) : (
              <div className="wander-add-gallery-preview-grid">
                {previews.map((preview, index) => (
                  <div key={index} className="wander-add-gallery-preview-item">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      className="wander-add-gallery-preview-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      disabled={isLoading}
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="wander-add-gallery-error">
              <FiX size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wander-add-gallery-footer">
          <button
            className="wander-add-gallery-btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="wander-add-gallery-btn-upload"
            onClick={handleSubmit}
            disabled={isLoading || files.length === 0}
          >
            {isLoading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>
      </div>
    </div>
  );
}

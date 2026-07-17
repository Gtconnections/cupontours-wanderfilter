// app/(dashboard)/admin/components/ModalChangeImage.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';
import './ModalChangeImage.css';

interface ModalChangeImageProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemId: number;
  itemName: string;
  currentImage: string;
  uploadFn: (id: number, file: File) => Promise<unknown>;
}

export default function ModalChangeImage({
  isOpen,
  onClose,
  onSuccess,
  itemId,
  itemName,
  currentImage,
  uploadFn,
}: ModalChangeImageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

  // Resetear estado al abrir/cerrar el modal
  useEffect(() => {
    if (!isOpen) {
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

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please select a PNG, JPG or WEBP image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('The image exceeds the maximum size of 10MB');
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await uploadFn(itemId, selectedFile);

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      onSuccess();
      onClose();

    } catch (err) {
      console.error('❌ Error al actualizar imagen principal:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error updating the principal image');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-change-image-overlay" onClick={onClose}>
      <div className="wander-change-image-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-change-image-header">
          <h2>Change Principal Image</h2>
          <button className="wander-change-image-close" onClick={onClose} disabled={isLoading}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-change-image-body">
          <p className="wander-change-image-subtitle">
            Select a new image to set as the principal photo for <strong>&quot;{itemName}&quot;</strong>
          </p>

          {currentImage && (
            <div className="wander-change-image-current">
              <label className="wander-change-image-label">Current image</label>
              <div className="wander-change-image-current-frame">
                <img src={currentImage} alt="Current principal" />
              </div>
            </div>
          )}

          <label className="wander-change-image-label">Select new photo</label>
          <div
            className={`wander-change-image-dropzone ${isDragging ? 'dragging' : ''} ${preview ? 'has-image' : ''}`}
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
              onChange={handleFileInputChange}
              className="wander-change-image-file-input"
              disabled={isLoading}
            />

            {preview ? (
              <div className="wander-change-image-preview">
                <img src={preview} alt="New principal preview" />
              </div>
            ) : (
              <div className="wander-change-image-drop-content">
                <FiUpload size={40} />
                <p>Drop your image here</p>
                <span>or click to browse</span>
                <small>PNG, JPG, WEBP (Max 10MB)</small>
              </div>
            )}
          </div>

          {error && (
            <div className="wander-change-image-error">
              <FiX size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wander-change-image-footer">
          <button
            className="wander-change-image-btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="wander-change-image-btn-save"
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

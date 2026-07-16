// app/admin/yachts/components/ModalAddYachtImages.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { uploadYachtImages } from '@/app/lib/api/yachtsAdmin';
import { FiX, FiUpload } from 'react-icons/fi';
import './ModalAddYachtImages.css';

interface ModalAddYachtImagesProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  yachtId: number;
  yachtName: string;
}

export default function ModalAddYachtImages({
  isOpen,
  onClose,
  onSuccess,
  yachtId,
  yachtName,
}: ModalAddYachtImagesProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resetear estado al cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      previews.forEach(url => URL.revokeObjectURL(url));
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
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" is not a valid image`);
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
      await uploadYachtImages(yachtId, files);
      
      // Limpiar previews
      previews.forEach(url => URL.revokeObjectURL(url));
      
      onSuccess();
      onClose();

    } catch (err: any) {
      console.error('❌ Error al subir imágenes:', err);
      setError(err.message || 'Error uploading images');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-add-yacht-images-overlay" onClick={onClose}>
      <div className="wander-add-yacht-images-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-add-yacht-images-header">
          <h2>Add Images</h2>
          <button className="wander-add-yacht-images-close" onClick={onClose} disabled={isLoading}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-add-yacht-images-body">
          <p className="wander-add-yacht-images-subtitle">
            Adding images for <strong>"{yachtName}"</strong>
          </p>

          <div 
            className={`wander-add-yacht-images-dropzone ${isDragging ? 'dragging' : ''} ${previews.length > 0 ? 'has-images' : ''}`}
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
              className="wander-add-yacht-images-file-input"
              disabled={isLoading}
            />
            
            {previews.length === 0 ? (
              <div className="wander-add-yacht-images-drop-content">
                <FiUpload size={48} />
                <p>Drop your images here</p>
                <span>or click to browse</span>
                <small>PNG, JPG, WEBP (Max 10MB each)</small>
              </div>
            ) : (
              <div className="wander-add-yacht-images-preview-grid">
                {previews.map((preview, index) => (
                  <div key={index} className="wander-add-yacht-images-preview-item">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      className="wander-add-yacht-images-preview-remove"
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
            <div className="wander-add-yacht-images-error">
              <FiX size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wander-add-yacht-images-footer">
          <button 
            className="wander-add-yacht-images-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-add-yacht-images-btn-upload" 
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
// app/admin/properties/components/ModalAddFiles.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { uploadInvoiceImages } from '@/app/lib/api/propertiesAdmin';
import { FiX, FiUpload, FiFile } from 'react-icons/fi';
import './ModalAddFiles.css';

interface ModalAddFilesProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoiceId: number;
}

export default function ModalAddFiles({
  isOpen,
  onClose,
  onSuccess,
  invoiceId,
}: ModalAddFilesProps) {
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
      setError('Please select at least one file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await uploadInvoiceImages(invoiceId, files);
      
      // Limpiar previews
      previews.forEach(url => URL.revokeObjectURL(url));
      
      onSuccess();
      onClose();

    } catch (err: any) {
      console.error('❌ Error al subir archivos:', err);
      setError(err.message || 'Error uploading files');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-add-files-overlay" onClick={onClose}>
      <div className="wander-add-files-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-add-files-header">
          <h2>Add Files</h2>
          <button className="wander-add-files-close" onClick={onClose} disabled={isLoading}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-add-files-body">
          <div 
            className={`wander-add-files-dropzone ${isDragging ? 'dragging' : ''} ${previews.length > 0 ? 'has-files' : ''}`}
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
              className="wander-add-files-file-input"
              disabled={isLoading}
            />
            
            {previews.length === 0 ? (
              <div className="wander-add-files-drop-content">
                <FiUpload size={48} />
                <p>Drop your files here</p>
                <span>or click to browse</span>
                <small>PNG, JPG, WEBP (Max 10MB each)</small>
              </div>
            ) : (
              <div className="wander-add-files-preview-grid">
                {previews.map((preview, index) => (
                  <div key={index} className="wander-add-files-preview-item">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      className="wander-add-files-preview-remove"
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
            <div className="wander-add-files-error">
              <FiX size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wander-add-files-footer">
          <button 
            className="wander-add-files-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-add-files-btn-upload" 
            onClick={handleSubmit}
            disabled={isLoading || files.length === 0}
          >
            {isLoading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>
    </div>
  );
}
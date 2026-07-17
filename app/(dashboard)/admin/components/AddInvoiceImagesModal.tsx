// components/AddInvoiceImagesModal.tsx
'use client';

import React, { useState, useRef } from 'react';

interface AddInvoiceImagesModalProps {
  isOpen: boolean;
  invoiceId: number;
  onClose: () => void;
  onUpload: (invoiceId: number, files: File[]) => Promise<void>;
}

export default function AddInvoiceImagesModal({ 
  isOpen, 
  invoiceId, 
  onClose, 
  onUpload 
}: AddInvoiceImagesModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resetear estado al cerrar
  const resetState = () => {
    setSelectedFiles([]);
    setPreviews(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return [];
    });
    setError(null);
  };

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
      await onUpload(invoiceId, selectedFiles);
      resetState();
      onClose();
    } catch (err) {
      console.error('Error al subir imágenes:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al subir las imágenes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="wander-modal-overlay" onClick={handleClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
    }}>
      <div className="wander-modal wander-modal-images" onClick={(e) => e.stopPropagation()} style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        animation: 'slideUp 0.3s ease',
      }}>
        <div className="wander-modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 28px 16px',
          borderBottom: '1px solid #ebebeb',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#000000',
            margin: 0,
          }}>
            Add Images
            <span style={{ fontSize: '14px', fontWeight: 400, color: '#717171', marginLeft: '8px' }}>
              Factura #{invoiceId}
            </span>
          </h2>
          <button className="wander-modal-close" onClick={handleClose} style={{
            width: '36px',
            height: '36px',
            border: 'none',
            background: 'transparent',
            fontSize: '22px',
            cursor: 'pointer',
            color: '#717171',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            ✕
          </button>
        </div>

        <div className="wander-modal-body" style={{ padding: '24px 28px' }}>
          {error && (
            <div className="wander-modal-error" style={{
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '8px',
              color: '#991b1b',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              ⚠️ {error}
            </div>
          )}

          <div 
            className={`wander-drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#000000' : '#d0d0d0'}`,
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              background: dragOver ? '#f0f0f0' : '#fafafa',
              cursor: 'pointer',
              position: 'relative',
              minHeight: '150px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="wander-drop-icon" style={{ fontSize: '48px', marginBottom: '8px' }}>🖼️</span>
            <p style={{ fontSize: '14px', color: '#333333', margin: '4px 0' }}>
              Arrastra tus imágenes aquí
            </p>
            <span className="wander-drop-hint" style={{ fontSize: '12px', color: '#999999' }}>
              o haz clic para seleccionar
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="wander-drop-input"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0,
                cursor: 'pointer',
              }}
            />
          </div>

          {previews.length > 0 && (
            <div className="wander-image-previews" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginTop: '16px',
            }}>
              {previews.map((preview, index) => (
                <div key={index} className="wander-image-preview-item" style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #ebebeb',
                  background: '#f5f5f5',
                }}>
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="wander-preview-remove"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'rgba(220, 38, 38, 0.9)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#dc2626';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(220, 38, 38, 0.9)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="wander-images-note" style={{
            fontSize: '13px',
            color: '#717171',
            textAlign: 'center',
            marginTop: '12px',
          }}>
            {selectedFiles.length} {selectedFiles.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
          </p>
        </div>

        <div className="wander-modal-actions" style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          padding: '16px 28px 24px',
          borderTop: '1px solid #ebebeb',
        }}>
          <button
            type="button"
            onClick={handleClose}
            className="wander-btn-cancel"
            disabled={isLoading}
            style={{
              padding: '10px 24px',
              background: 'transparent',
              border: '1px solid #d0d0d0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#717171',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="wander-btn-save"
            disabled={isLoading || selectedFiles.length === 0}
            style={{
              padding: '10px 28px',
              background: '#000000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              cursor: (isLoading || selectedFiles.length === 0) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: (isLoading || selectedFiles.length === 0) ? 0.6 : 1,
            }}
          >
            {isLoading ? (
              <>
                <span className="wander-spinner" style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}></span>
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
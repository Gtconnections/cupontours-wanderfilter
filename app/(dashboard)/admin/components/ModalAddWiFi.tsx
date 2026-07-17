// app/admin/properties/components/ModalAddWiFi.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { createWiFi, WiFiCreateData } from '@/app/lib/api/propertiesAdmin';

interface ModalAddWiFiProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: number;
  listingName: string;
  onSuccess: (networkData: { network: string; password: string }) => void;
}

export default function ModalAddWiFi({ 
  isOpen, 
  onClose, 
  listingId, 
  listingName,
  onSuccess 
}: ModalAddWiFiProps) {
  const [network, setNetwork] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resetear estado al abrir/cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      // Pre-fills the form from the record being edited when the modal opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNetwork('');
      setPassword('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Actualizar en tiempo real en el preview
  const handleNetworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNetwork(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!network.trim()) {
      setError('Please enter a network name');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data: WiFiCreateData = {
        network: network.trim(),
        password: password.trim(),
        listing: listingId
      };

      const result = await createWiFi(data);
      console.log('✅ WiFi creado:', result);

      // Llamar al callback con los datos del WiFi
      onSuccess({
        network: result.network,
        password: result.password
      });

      // Cerrar modal
      onClose();

    } catch (err) {
      console.error('❌ Error al crear WiFi:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al crear el WiFi. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-modal-overlay" onClick={onClose}>
      <div className="wander-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-modal-header">
          <h2>Add WiFi</h2>
          <button className="wander-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="wander-modal-body">
          <div className="wander-modal-section">
            <h3>Enter WiFi Information</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="wander-form-group">
                <label className="wander-form-label">Network</label>
                <input
                  type="text"
                  className="wander-form-input"
                  placeholder="Nueva red"
                  value={network}
                  onChange={handleNetworkChange}
                  disabled={isLoading}
                />
              </div>

              <div className="wander-form-group">
                <label className="wander-form-label">Password</label>
                <input
                  type="text"
                  className="wander-form-input"
                  placeholder="Pass2544*"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="wander-modal-error">
                  {error}
                </div>
              )}

              {/* Listing information preview */}
              <div className="wander-modal-listing-preview">
                <h4>Listing information</h4>
                <div className="wander-preview-grid">
                  <div className="wander-preview-item">
                    <span className="wander-preview-label">Name:</span>
                    <span className="wander-preview-value">{listingName}</span>
                  </div>
                  <div className="wander-preview-item">
                    <span className="wander-preview-label">Wifi info:</span>
                    <span className="wander-preview-value">
                      Network: {network || 'Nueva red'} | Password: {password || 'Pass2544*'}
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="wander-modal-footer">
          <button 
            className="wander-modal-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-modal-btn-save" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save WiFi'}
          </button>
        </div>
      </div>
    </div>
  );
}
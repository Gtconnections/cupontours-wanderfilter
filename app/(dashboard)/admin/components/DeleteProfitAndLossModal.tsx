// components/DeleteProfitAndLossModal.tsx
'use client';

import React from 'react';

interface DeleteProfitAndLossModalProps {
  isOpen: boolean;
  plId: number;
  plInfo: string;
  onClose: () => void;
  onConfirm: (plId: number) => Promise<void>;
  isLoading: boolean;
}

export default function DeleteProfitAndLossModal({ 
  isOpen, 
  plId,
  plInfo,
  onClose, 
  onConfirm,
  isLoading 
}: DeleteProfitAndLossModalProps) {
  if (!isOpen) return null;

  return (
    <div className="wander-modal-overlay" onClick={onClose} style={{
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
      <div className="wander-modal wander-modal-delete" onClick={(e) => e.stopPropagation()} style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '440px',
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
            Eliminar Profit and Loss
            <span style={{ fontSize: '14px', fontWeight: 400, color: '#717171', marginLeft: '8px' }}>
              #{plId}
            </span>
          </h2>
          <button className="wander-modal-close" onClick={onClose} style={{
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
          <div className="wander-delete-confirm" style={{ textAlign: 'center', padding: '8px 0' }}>
            <span className="wander-delete-icon" style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>⚠️</span>
            <p style={{ fontSize: '15px', color: '#333333', margin: '8px 0' }}>
              ¿Estás seguro que deseas eliminar este Profit and Loss?
            </p>
            {plInfo && (
              <p style={{ fontSize: '13px', color: '#717171', margin: '4px 0' }}>
                <strong>{plInfo}</strong>
              </p>
            )}
            <p className="wander-delete-warning" style={{ fontSize: '13px', color: '#717171', marginTop: '4px' }}>
              Esta acción no se puede deshacer.
            </p>
          </div>
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
            onClick={onClose}
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
            onClick={() => onConfirm(plId)}
            className="wander-btn-delete"
            disabled={isLoading}
            style={{
              padding: '10px 24px',
              background: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isLoading ? 0.6 : 1,
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
                Eliminando...
              </>
            ) : (
              'Eliminar PL'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
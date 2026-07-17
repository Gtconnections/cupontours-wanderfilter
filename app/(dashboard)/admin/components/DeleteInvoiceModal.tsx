// components/DeleteInvoiceModal.tsx
'use client';

import React, { useState } from 'react';

interface DeleteInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => Promise<void>;
  isLoading: boolean;
  invoiceTitle?: string;
  invoiceId?: number;
}

export default function DeleteInvoiceModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading,
  invoiceTitle,
  invoiceId
}: DeleteInvoiceModalProps) {
  const [comment, setComment] = useState('');

  const handleConfirm = async () => {
    if (!comment.trim()) {
      alert('Por favor, ingresa un motivo para eliminar la factura');
      return;
    }
    await onConfirm(comment);
  };

  const handleClose = () => {
    setComment('');
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
      <div className="wander-modal wander-modal-delete" onClick={(e) => e.stopPropagation()} style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '480px',
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
            Eliminar Factura
            {invoiceId && <span style={{ fontSize: '14px', fontWeight: 400, color: '#717171', marginLeft: '8px' }}>#{invoiceId}</span>}
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
          <div className="wander-delete-confirm" style={{ textAlign: 'center', padding: '8px 0' }}>
            <span className="wander-delete-icon" style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>⚠️</span>
            <p style={{ fontSize: '15px', color: '#333333', margin: '8px 0' }}>
              ¿Estás seguro que deseas eliminar esta factura?
              {invoiceTitle && (
                <>
                  <br />
                  <strong style={{ color: '#000000' }}>&quot;{invoiceTitle}&quot;</strong>
                </>
              )}
            </p>
            <p className="wander-delete-warning" style={{ fontSize: '13px', color: '#717171', marginTop: '4px' }}>
              Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="wander-form-group" style={{ marginTop: '16px' }}>
            <label htmlFor="delete_comment" style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#333333',
              marginBottom: '6px',
            }}>
              Motivo de eliminación <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              id="delete_comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe el motivo por el cual eliminas esta factura..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#000000',
                background: '#fafafa',
                transition: 'all 0.2s ease',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                resize: 'vertical',
                minHeight: '80px',
                lineHeight: '1.6',
              }}
              disabled={isLoading}
            />
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
            onClick={handleConfirm}
            className="wander-btn-delete"
            disabled={isLoading || !comment.trim()}
            style={{
              padding: '10px 24px',
              background: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              cursor: (isLoading || !comment.trim()) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: (isLoading || !comment.trim()) ? 0.6 : 1,
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
              'Eliminar Factura'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
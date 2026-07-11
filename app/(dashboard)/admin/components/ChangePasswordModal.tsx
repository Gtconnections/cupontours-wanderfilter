// components/ChangePasswordModal.tsx
'use client';

import React, { useState } from 'react';
import { ChangePasswordData } from '@/app/lib/api/profile';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: (data: ChangePasswordData) => Promise<void>;
}

export default function ChangePasswordModal({ 
  isOpen, 
  onClose, 
  onChangePassword 
}: ChangePasswordModalProps) {
  const [formData, setFormData] = useState<ChangePasswordData>({
    old_password: '',
    new_password: '',
    repeat_new_password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.old_password.trim()) {
      setError('La contraseña actual es requerida');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (formData.new_password !== formData.repeat_new_password) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await onChangePassword(formData);
      setSuccess(true);
      setFormData({
        old_password: '',
        new_password: '',
        repeat_new_password: '',
      });
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error('Error al cambiar contraseña:', err);
      // 🔥 Mostrar el mensaje de error específico que viene del servicio
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="wander-modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div 
        className="wander-modal wander-modal-password" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '460px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          animation: 'slideUp 0.3s ease',
        }}
      >
        <div 
          className="wander-modal-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 28px 16px',
            borderBottom: '1px solid #ebebeb',
          }}
        >
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#000000',
            margin: 0,
            letterSpacing: '-0.3px',
          }}>
            CHANGE PASSWORD
          </h2>
          <button 
            className="wander-modal-close" 
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              border: 'none',
              background: 'transparent',
              fontSize: '22px',
              cursor: 'pointer',
              color: '#717171',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
              e.currentTarget.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#717171';
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="wander-modal-form" style={{
          padding: '24px 28px 28px',
        }}>
          {error && (
            <div style={{
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

          {success && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#dcfce7',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              color: '#166534',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              ✅ Contraseña cambiada exitosamente
            </div>
          )}

          <div className="wander-form-group" style={{ marginBottom: '18px' }}>
            <label htmlFor="old_password" style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#333333',
              marginBottom: '6px',
            }}>
              Current Password
            </label>
            <input
              type="password"
              id="old_password"
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              placeholder="Current Password"
              required
              disabled={isLoading}
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
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#000000';
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.background = '#fafafa';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div className="wander-form-group" style={{ marginBottom: '18px' }}>
            <label htmlFor="new_password" style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#333333',
              marginBottom: '6px',
            }}>
              New Password
            </label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              placeholder="New Password"
              required
              disabled={isLoading}
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
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#000000';
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.background = '#fafafa';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div className="wander-form-group" style={{ marginBottom: '18px' }}>
            <label htmlFor="repeat_new_password" style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#333333',
              marginBottom: '6px',
            }}>
              Repeat New Password
            </label>
            <input
              type="password"
              id="repeat_new_password"
              name="repeat_new_password"
              value={formData.repeat_new_password}
              onChange={handleChange}
              placeholder="Repeat New Password"
              required
              disabled={isLoading}
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
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#000000';
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.background = '#fafafa';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            paddingTop: '20px',
            borderTop: '1px solid #ebebeb',
            marginTop: '4px',
          }}>
            <button
              type="button"
              onClick={onClose}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f5f5';
                e.currentTarget.style.borderColor = '#b0b0b0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#d0d0d0';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '10px 28px',
                background: '#000000',
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
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#333333';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isLoading ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}></span>
                  Cambiando...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(30px) scale(0.96);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
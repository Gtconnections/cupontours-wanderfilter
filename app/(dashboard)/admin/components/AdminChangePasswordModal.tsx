// components/AdminChangePasswordModal.tsx
// Modal para que un admin/staff resetee la contraseña de OTRO usuario.
// No pide la contraseña actual (a diferencia de ChangePasswordModal).
'use client';

import React, { useState } from 'react';
import type { UserProfile } from '@/app/lib/api/profiles';

interface AdminChangePasswordModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onSubmit: (newPassword: string) => Promise<void>;
}

const inputStyle: React.CSSProperties = {
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
};

export default function AdminChangePasswordModal({
  isOpen,
  user,
  onClose,
  onSubmit,
}: AdminChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setNewPassword('');
    setRepeatPassword('');
    setError(null);
    setSuccess(false);
    setIsLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== repeatPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await onSubmit(newPassword);
      setSuccess(true);
      setNewPassword('');
      setRepeatPassword('');
      setTimeout(() => {
        handleClose();
      }, 1600);
    } catch (err) {
      setError((err instanceof Error ? err.message : undefined) || 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const fullName = user
    ? `${user.user.first_name || ''} ${user.user.last_name || ''}`.trim() || user.user.username || user.user.email
    : '';

  return (
    <div
      className="wander-modal-overlay"
      onClick={handleClose}
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
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '24px 28px 16px',
            borderBottom: '1px solid #ebebeb',
          }}
        >
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#000', margin: 0, letterSpacing: '-0.3px' }}>
              Cambiar contraseña
            </h2>
            {fullName && (
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#717171' }}>
                Usuario: <b style={{ color: '#333' }}>{fullName}</b>
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            aria-label="Cerrar"
            style={{
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
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px' }}>
          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#991b1b', fontSize: '13px', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '12px 16px', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', fontSize: '13px', marginBottom: '16px' }}>
              ✅ Contraseña actualizada
            </div>
          )}

          <div style={{ marginBottom: '18px' }}>
            <label htmlFor="admin_new_password" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
              Nueva contraseña
            </label>
            <input
              type="password"
              id="admin_new_password"
              name="admin_new_password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
              disabled={isLoading || success}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label htmlFor="admin_repeat_password" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
              Repetir contraseña
            </label>
            <input
              type="password"
              id="admin_repeat_password"
              name="admin_repeat_password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              placeholder="Repite la nueva contraseña"
              autoComplete="new-password"
              required
              disabled={isLoading || success}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                background: '#fff',
                color: '#333',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || success}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#000',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isLoading || success ? 'not-allowed' : 'pointer',
                opacity: isLoading || success ? 0.7 : 1,
              }}
            >
              {isLoading ? 'Guardando...' : success ? 'Guardado' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

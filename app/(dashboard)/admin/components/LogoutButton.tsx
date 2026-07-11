// components/LogoutButton.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/lib/utils/useAuth';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'text';
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({ 
  variant = 'primary', 
  className = '',
  children 
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 5000); // Auto-ocultar después de 5s
      return;
    }

    setIsLoggingOut(true);
    try {
      await logout();
      // El logout ya redirige, pero por si acaso
      router.push('/login?logout=success');
    } catch (error) {
      console.error('Error en logout:', error);
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
      setShowConfirm(false);
    }
  };

  // Estilos según variante
  const getStyles = () => {
    const baseStyles = {
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 500,
      transition: 'all 0.2s ease',
      border: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    };

    const variants = {
      primary: {
        ...baseStyles,
        backgroundColor: '#dc2626',
        color: '#ffffff',
        ':hover': { backgroundColor: '#b91c1c' }
      },
      secondary: {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: '#dc2626',
        border: '1px solid #dc2626'
      },
      text: {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: '#6b7280',
        padding: '4px 8px'
      }
    };

    return variants[variant];
  };

  const styles = getStyles();

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        style={{
          ...styles,
          opacity: isLoggingOut ? 0.6 : 1,
          cursor: isLoggingOut ? 'not-allowed' : 'pointer',
          backgroundColor: showConfirm ? '#dc2626' : styles.backgroundColor
        }}
        className={className}
        onMouseEnter={(e) => {
          if (variant === 'primary' && !showConfirm) {
            e.currentTarget.style.backgroundColor = '#b91c1c';
          }
        }}
        onMouseLeave={(e) => {
          if (variant === 'primary' && !showConfirm) {
            e.currentTarget.style.backgroundColor = '#dc2626';
          }
        }}
      >
        {isLoggingOut ? (
          <>
            <span className="spinner" style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }}></span>
            Cerrando sesión...
          </>
        ) : showConfirm ? (
          '¿Seguro?'
        ) : (
          children || 'Cerrar sesión'
        )}
      </button>

      {showConfirm && !isLoggingOut && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1f2937',
          color: '#f3f4f6',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 50
        }}>
          Haz clic de nuevo para confirmar
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
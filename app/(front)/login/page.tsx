"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser, AuthResponse } from '../../lib/api/login';
import './login.css';

const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

export default function LoginPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const saveUserData = (userData: AuthResponse) => {
    try {
      // Guardar en localStorage
      localStorage.setItem('accessToken', userData.token);
      localStorage.setItem('isUserLoggedIn', 'true');
      
      const userInfo = {
        id: userData.id,
        user_id: userData.id,
        username: userData.username,
        email: userData.email,
        position: userData.position,
        fullName: userData.fullName,
        profile_id: userData.profile_id,
      };
      localStorage.setItem('userData', JSON.stringify(userInfo));
      localStorage.setItem('user_id', userData.id.toString());
      localStorage.setItem('username', userData.username);
      localStorage.setItem('profile_id', userData.profile_id.toString());
      
      const positionMap: Record<string, string> = {
        'admin': '1', 'administrator': '1', 'superadmin': '1',
        'owner': '2', 'proprietor': '2',
        'customer': '3', 'client': '3', 'user': '3'
      };
      localStorage.setItem('position', positionMap[userData.position.toLowerCase()] || '3');
      
      if (userData.email) localStorage.setItem('userEmail', userData.email);
      if (userData.fullName) localStorage.setItem('fullName', userData.fullName);

      // Guardar en cookies
      setCookie('accessToken', userData.token, 7);
      setCookie('isUserLoggedIn', 'true', 7);
      setCookie('user_id', userData.id.toString(), 7);
      setCookie('username', userData.username, 7);
      setCookie('profile_id', userData.profile_id.toString(), 7);
      setCookie('position', positionMap[userData.position.toLowerCase()] || '3', 7);
      if (userData.email) setCookie('userEmail', userData.email, 7);

      console.log('✅ DATOS GUARDADOS:');
      console.log('  - User ID:', userData.id);
      console.log('  - Profile ID:', userData.profile_id);
      console.log('  - Username:', userData.username);
      
      return true;
    } catch (error) {
      console.error('❌ Error guardando datos:', error);
      throw new Error('No se pudieron guardar los datos de sesión');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor, ingresa tu usuario y contraseña');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await loginUser({ username, password });
      
      console.log('✅ LOGIN EXITOSO - Datos recibidos:', result);
      
      if (!result.token) {
        throw new Error('El servidor no retornó un token válido.');
      }

      saveUserData(result);
      
      console.log('🎯 Redirigiendo al dashboard...');
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      window.location.href = '/admin/dashboard';
      
    } catch (error: any) {
      console.error('❌ Error en el login:', error);
      let errorMsg = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
      if (error.message) {
        errorMsg = error.message;
      }
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-split-page">
      <section className="login-form-side">
        <div className="login-box-container">
          <div className="login-header-text">
            <span className="pre-title">Dashboard Access</span>
            <h1 className="login-main-title">Welcome back to our platform!</h1>
            <p className="login-subtitle">
              Please enter your credentials to access your data and continue with your activities. 
              If you don't have an account yet, sign up now and start enjoying the benefits of our platform. 
              Thank you for choosing us!
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="wander-login-form">
            {errorMessage && (
              <div className="error-message" style={{
                padding: '12px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                borderRadius: '12px',
                color: '#991b1b',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>⚠️</span>
                {errorMessage}
              </div>
            )}

            <div className="form-group-clean">
              <label htmlFor="username">Username or Email</label>
              <div className="input-with-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input 
                  type="text" 
                  id="username" 
                  placeholder="Enter your username" 
                  required 
                  disabled={isLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group-clean">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <Link href="/recover-account" className="forgot-link">
                  Forgot password?
                </Link>
              </div>
              <div className="input-with-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="••••••••" 
                  required 
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-login-submit"
              disabled={isLoading}
              style={{ 
                opacity: isLoading ? 0.7 : 1, 
                cursor: isLoading ? 'not-allowed' : 'pointer' 
              }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="spinner" style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></span>
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </section>

      <section className="login-image-side">
        <div className="login-image-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80" 
          alt="Luxury hospitality architectural viewpoint" 
          className="login-bg-img"
        />
        <div className="image-side-caption">
          <p className="caption-tagline">“Find your happy place.”</p>
          <span className="caption-location">Miami Beach, Florida</span>
        </div>
      </section>

    </main>
  );
}
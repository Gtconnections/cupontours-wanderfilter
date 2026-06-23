"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Hook oficial para navegación fluida
import { loginUser } from '../lib/api'; 
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  
  // Estados para controlar los valores del formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados para el flujo de la petición
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await loginUser({ username, password });
      console.log("Login successful!", result);
      
      // NOTA: Si guardas el token en localStorage o Cookies, hazlo aquí antes de redirigir.
      // e.preventDefault() o localStorage.setItem('token', result.token);

      // Redirección exacta al dashboard del subdominio de la app
      window.location.href = "https://app.cupontours.com/dashboard";
      
    } catch (error: any) {
      setErrorMessage(error.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-split-page">
      
      {/* COLUMNA IZQUIERDA: FORMULARIO MINIMALISTA */}
      <section className="login-form-side">
        <div className="login-box-container">
          <div className="login-header-text">
            <span className="pre-title">Dashboard Access</span>
            <h1 className="login-main-title">Welcome back to our platform!</h1>
            <p className="login-subtitle">Please enter your credentials to access your data and continue with your activities. If you don't have an account yet, sign up now and start enjoying the benefits of our platform. Thank you for choosing us!</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="wander-login-form">
            
            {/* Mostrar mensaje de error si la petición falla */}
            {errorMessage && (
              <div style={{
                padding: '12px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                borderRadius: '12px',
                color: '#991b1b',
                fontSize: '13px',
                fontWeight: 500
              }}>
                {errorMessage}
              </div>
            )}

            <div className="form-group-clean">
              <label htmlFor="username">Username or Email</label>
              <div className="input-with-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <input 
                  type="text" 
                  id="username" 
                  placeholder="Enter your username" 
                  required 
                  disabled={isLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group-clean">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <Link href="/recover-account" className="forgot-link">Forgot password?</Link>
              </div>
              <div className="input-with-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="••••••••" 
                  required 
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-login-submit"
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

        </div>
      </section>

      {/* COLUMNA DERECHA: IMAGEN CINEMÁTICA INMERSIVA */}
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
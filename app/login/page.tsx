import React from 'react';
import Link from 'next/link';
import './login.css';

export default function LoginPage() {
  return (
    <main className="login-split-page">
      
      {/* COLUMNA IZQUIERDA: FORMULARIO MINIMALISTA */}
      <section className="login-form-side">
        <div className="login-box-container">
          <div className="login-header-text">
            <span className="pre-title">Portal Access</span>
            <h1 className="login-main-title">Welcome back</h1>
            <p className="login-subtitle">Please enter your credentials to access your secure owner dashboard or guest reservations.</p>
          </div>

          <form className="wander-login-form">
            <div className="form-group-clean">
              <label htmlFor="username">Username or Email</label>
              <div className="input-with-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <input type="text" id="username" placeholder="Enter your username" required />
              </div>
            </div>

            <div className="form-group-clean">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>
              <div className="input-with-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input type="password" id="password" placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" className="btn-login-submit">Sign In</button>
          </form>

          <div className="login-footer-redirect">
            <p>Don't have an account yet? <Link href="/work-with-us">Sign up here</Link></p>
          </div>
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
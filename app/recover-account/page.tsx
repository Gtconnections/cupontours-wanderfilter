"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import './recover.css';

export default function RecoverAccountPage() {
  const [email, setEmail] = useState('');

  const handleRecoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Processing account recovery for email:", email);
  };

  return (
    <main className="recover-split-page recover-page">
      
      {/* COLUMNA IZQUIERDA: FORMULARIO MINIMALISTA WANDER */}
      <section className="recover-form-side">
        <div className="recover-box-container">
          <div className="recover-header-text">
            <span className="pre-title">Security Access</span>
            <h1 className="recover-main-title">Forgot your password?</h1>
            <p className="recover-subtitle">
              We understand, these things happen. Please enter your registered email address below, and we will immediately send you a secure validation link to reset your password and regain access to your dashboard.
            </p>
          </div>

          <form onSubmit={handleRecoverSubmit} className="wander-recover-form">
            <div className="form-group-clean">
              <label htmlFor="recover-email">Email Address</label>
              <div className="input-with-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input 
                  type="email" 
                  id="recover-email" 
                  placeholder="john@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-recover-submit">Recover Account</button>
          </form>

          <div className="recover-footer-redirect">
            <p>Remembered your password? <Link href="/login">Sign In here</Link></p>
          </div>
        </div>
      </section>

      {/* COLUMNA DERECHA: IMAGEN CINEMÁTICA INMERSIVA */}
      <section className="recover-image-side">
        <div className="recover-image-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80" 
          alt="Luxury architectural layout window view" 
          className="recover-bg-img"
        />
        <div className="image-side-caption">
          <p className="caption-tagline">“Security meets sanctuary.”</p>
          <span className="caption-location">Palm Beach, Florida</span>
        </div>
      </section>

    </main>
  );
}
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import './recover.css';
import { getRecover, type Locale } from '@/app/i18n/dictionaries';
import { withLocale } from '@/app/i18n/locale';

// Mismo backend que usa el login (Django). El endpoint restore-password genera
// una clave provisional de 10 caracteres, la guarda y la envía por correo.
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api'
).replace(/\/$/, '');

export default function RecoverContent({ locale = 'en' }: { locale?: Locale }) {
  const t = getRecover(locale);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}/authenticate/restore-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (response.ok) {
        setFeedback({ type: 'success', text: t.successMsg });
        setEmail('');
      } else {
        let message = t.genericErr;
        try {
          const data = await response.json();
          message = data.error || data.message || message;
        } catch {
          /* respuesta sin cuerpo JSON */
        }
        setFeedback({ type: 'error', text: message });
      }
    } catch {
      setFeedback({ type: 'error', text: t.networkErr });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="recover-split-page recover-page">

      {/* COLUMNA IZQUIERDA: FORMULARIO MINIMALISTA WANDER */}
      <section className="recover-form-side">
        <div className="recover-box-container">
          <div className="recover-header-text">
            <span className="pre-title">{t.pre}</span>
            <h1 className="recover-main-title">{t.h1}</h1>
            <p className="recover-subtitle">{t.subtitle}</p>
          </div>

          <form onSubmit={handleRecoverSubmit} className="wander-recover-form">
            <div className="form-group-clean">
              <label htmlFor="recover-email">{t.lblEmail}</label>
              <div className="input-with-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  type="email"
                  id="recover-email"
                  placeholder={t.phEmail}
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {feedback && (
              <div
                role="status"
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  lineHeight: 1.5,
                  backgroundColor: feedback.type === 'success' ? '#dcfce7' : '#fef2f2',
                  color: feedback.type === 'success' ? '#166534' : '#991b1b',
                  border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fee2e2'}`,
                }}
              >
                {feedback.text}
              </div>
            )}

            <button
              type="submit"
              className="btn-recover-submit"
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? t.btnSending : t.btnRecover}
            </button>
          </form>

          <div className="recover-footer-redirect">
            <p>{t.footerText} <Link href={withLocale('/login', locale)}>{t.footerLink}</Link></p>
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
          <p className="caption-tagline">{t.caption}</p>
          <span className="caption-location">{t.captionLoc}</span>
        </div>
      </section>

    </main>
  );
}

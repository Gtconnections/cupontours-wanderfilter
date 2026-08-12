"use client";
import React, { useState } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import { sendContactRequest } from '../../lib/api';
import './contact.css';
import { getContact, type Locale } from '@/app/i18n/dictionaries';

const contactPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Cupontours",
  "description": "Get in touch with the Cupontours team."
};

export default function ContactContent({ locale = 'en' }: { locale?: Locale }) {
  const t = getContact(locale);
  // Estados para controlar los campos nativos del formulario de contacto
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  // Estados de flujo de la petición
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const contactMethods = [
    { icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M2 4l10 8 10-8"></path></svg>), title: t.m1T, desc: t.m1D, action: `${process.env.NEXT_PUBLIC_COMPANY_EMAIL || ''}`, isLink: false },
    { icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>), title: t.m2T, desc: t.m2D, action: `${process.env.NEXT_PUBLIC_COMPANY_PHONE || ''}`, isLink: false },
    { icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>), title: t.m3T, desc: t.m1D, action: t.m3Action, isLink: false }
  ];
  
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    const payload = { firstName, lastName, email, phoneNumber, message };

    try {
      const response = await sendContactRequest(payload);
      setStatusMessage({
        type: 'success',
        text: response.message || t.successMsg
      });
      // Limpiar el formulario tras un envío exitoso
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setMessage('');
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: (error instanceof Error ? error.message : undefined) || t.errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="contact-page">
      
      {/* 1. HERO & FORM SPLIT */}
      {/* 1. HERO & FORM SPLIT */}
      <section className="contact-split-section">
        <div className="split-container">
          
          <div className="split-text-side">
            <span className="pre-title">{t.heroPre}</span>
            <h1 className="massive-heading">{t.heroTitleA}<br />{t.heroTitleB}</h1>
            <p className="contact-subtitle">{t.heroSub}</p>
          </div>
          
          <div className="split-form-side">
            <div className="contact-form-card">
              <form onSubmit={handleContactSubmit} className="clean-form custom-wander-layout">
                
                {/* Capa de Estado Dinámica (Éxito o Error) */}
                {statusMessage && (
                  <div style={{
                    padding: '14px 16px',
                    backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fee2e2'}`,
                    borderRadius: '12px',
                    color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
                    fontSize: '13px',
                    fontWeight: 500,
                    lineHeight: 1.5
                  }}>
                    {statusMessage.text}
                  </div>
                )}

                {/* FILA 1: Nombre y Apellido (RE-ESTABLECIDA LA CLASE ORIGINAL .flex-row-layout) */}
                <div className="form-row flex-row-layout">
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      {t.lblFirst}
                    </label>
                    <input 
                      type="text" 
                      className="wander-input" 
                      placeholder={t.phFirst} 
                      required 
                      disabled={isLoading}
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                    />
                  </div>
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      {t.lblLast}
                    </label>
                    <input 
                      type="text" 
                      className="wander-input" 
                      placeholder={t.phLast} 
                      required 
                      disabled={isLoading}
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                    />
                  </div>
                </div>

                {/* FILA 2: Email y Teléfono (RE-ESTABLECIDA LA CLASE ORIGINAL .flex-row-layout) */}
                <div className="form-row flex-row-layout">
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      {t.lblEmail}
                    </label>
                    <input 
                      type="email" 
                      className="wander-input" 
                      placeholder="john.doe@example.com" 
                      required 
                      disabled={isLoading}
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </div>
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      {t.lblPhone}
                    </label>
                    <input 
                      type="tel" 
                      className="wander-input" 
                      placeholder="+1 (555) 123-4567" 
                      disabled={isLoading}
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)} 
                    />
                  </div>
                </div>

                {/* FILA 3: Mensaje */}
                <div className="wander-input-group">
                  <label className="wander-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    {t.lblMsg}
                  </label>
                  <textarea 
                    className="wander-textarea" 
                    rows={5} 
                    placeholder={t.phMsg} 
                    required 
                    disabled={isLoading}
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>
                
                {/* Caja de Información de Privacidad */}
                <div className="wander-info-box">
                  <div className="info-box-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    {t.privTitle}
                  </div>
                  <ul className="info-box-list">
                    <li>• {t.priv1}</li>
                    <li>• {t.priv2}</li>
                    <li>• {t.priv3}</li>
                  </ul>
                </div>
                
                <button 
                  type="submit" 
                  className="btn-booking-primary override-btn-submit"
                  disabled={isLoading}
                  style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                  {isLoading ? t.btnSending : t.btnSend}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CONTACT METHODS GRID */}
      <section className="contact-methods-section">
        <div className="methods-grid">
          {contactMethods.map((method, i) => (
            <div key={i} className="method-card">
              <div className="method-icon">{method.icon}</div>
              <h3>{method.title}</h3>
              <p>{method.desc}</p>
              {method.isLink ? (
                <a href="#" className="method-action-link">{method.action}</a>
              ) : (
                <span className="method-action-text">{method.action}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <StructuredData type="Organization" data={contactPageStructuredData} />
    </main>
  );
}
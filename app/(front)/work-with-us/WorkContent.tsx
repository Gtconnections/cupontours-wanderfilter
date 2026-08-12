"use client";
import React, { useState } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import { sendAllianceRequest } from '../../lib/api';
import './work.css';
import { getWork, type Locale } from '@/app/i18n/dictionaries';

const workWithUsPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Work With Us",
  "description": "Partner with Cupontours as a luxury service provider."
};

export default function WorkContent({ locale = 'en' }: { locale?: Locale }) {
  const t = getWork(locale);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const revenueEstimates = [
    { beds: t.r1beds, price: '$3,000*', desc: t.r1desc },
    { beds: t.r2beds, price: '$4,500*', desc: t.r2desc, highlight: true },
    { beds: t.r3beds, price: '$6,000*', desc: t.r3desc },
  ];

  const whyUsFeatures = [
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-award w-8 h-8 text-primary" aria-hidden="true"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path><circle cx="12" cy="8" r="6"></circle></svg>,
      title: t.f1T,
      desc: t.f1D
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign w-8 h-8 text-primary" aria-hidden="true"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
      title: t.f2T,
      desc: t.f2D
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      title: t.f3T,
      desc: t.f3D
    }
  ];

  const handleAllySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    const payload = { firstName, lastName, email, phoneNumber, message };

    try {
      const response = await sendAllianceRequest(payload);
      setStatusMessage({ type: 'success', text: response.message || t.successMsg });
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
    <main className="work-page">

      {/* 1. HERO MASIVO */}
      <section className="work-hero-cinematic">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">{t.heroBadge}</span>
          <h1 className="hero-massive-title">{t.heroTitleA}<br />{t.heroTitleB}<br /><span className="text-light-dim">{t.heroTitleAccent}</span></h1>
          <p className="hero-subtitle">{t.heroSub}</p>
          <button className="btn-white-pill mt-4" type="button" onClick={() => document.getElementById('alliance-form-block')?.scrollIntoView({ behavior: 'smooth' })}>{t.heroBtn}</button>
        </div>
      </section>

      {/* 2. ABOUT US & FORM SPLIT */}
      <section className="work-split-section" id="alliance-form-block">
        <div className="split-container">
          <div className="split-text">
            <span className="pre-title">{t.aboutPre}</span>
            <h2 className="section-title">{t.aboutH2a}<br />{t.aboutH2b}</h2>
            <div className="text-content">
              <p>{t.aboutP1}</p>
              <p>{t.aboutP2}</p>
            </div>
          </div>

          <div className="split-form">
            <div className="form-card">
              <h3>{t.formH3}</h3>
              <p>{t.formP}</p>

              <form onSubmit={handleAllySubmit} className="ally-form custom-wander-layout">

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

                {/* FILA 1: Nombre y Apellido */}
                <div className="form-row flex-row-layout">
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      {t.lblFirst}
                    </label>
                    <input type="text" className="wander-input" placeholder={t.phFirst} required disabled={isLoading} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      {t.lblLast}
                    </label>
                    <input type="text" className="wander-input" placeholder={t.phLast} required disabled={isLoading} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>

                {/* FILA 2: Email y Teléfono */}
                <div className="form-row flex-row-layout">
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      {t.lblEmail}
                    </label>
                    <input type="email" className="wander-input" placeholder={t.phEmail} required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 .81 2.7"></path></svg>
                      {t.lblPhone}
                    </label>
                    <input type="tel" className="wander-input" placeholder={t.phPhone} disabled={isLoading} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  </div>
                </div>

                {/* FILA 3: Mensaje */}
                <div className="wander-input-group">
                  <label className="wander-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    {t.lblMsg}
                  </label>
                  <textarea className="wander-textarea" rows={4} placeholder={t.phMsg} required disabled={isLoading} value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
                </div>

                {/* NOTA DE PRIVACIDAD */}
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

      {/* 3. MAXIMIZE PROFITS SPLIT (REVERSE) */}
      <section className="work-split-section bg-gray-light horizontal-centered-split">
        <div className="split-container reverse">
          <div className="split-text">
            <span className="pre-title">{t.solPre}</span>
            <h2 className="section-title">{t.solH2a}<br />{t.solH2b}</h2>
            <div className="text-content">
              <p>{t.solP1}</p>
              <p>{t.solP2}</p>
              <p>{t.solP3}</p>
            </div>

            <a
              href="#alliance-form-block"
              className="btn-black-pill mt-4 text-center-anchor"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('alliance-form-block')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t.solBtn}
            </a>
          </div>
          <div className="split-image">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80" alt="Giving keys to new home" />
          </div>
        </div>
      </section>

      {/* 4. REVENUE ESTIMATES */}
      <section className="revenue-section">
        <div className="section-header center">
          <span className="pre-title">{t.revPre}</span>
          <h2 className="section-title">{t.revH2}</h2>
          <p className="subtitle-text">{t.revSub}</p>
        </div>

        <div className="revenue-grid">
          {revenueEstimates.map((item, index) => (
            <div key={index} className={`revenue-card ${item.highlight ? 'highlight' : ''}`}>
              <h4>{item.beds}</h4>
              <div className="price">{item.price}</div>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHY WORK WITH US */}
      <section className="why-us-section bg-gray-light">
        <div className="section-header center">
          <span className="pre-title">{t.whyPre}</span>
          <h2 className="section-title">{t.whyH2}</h2>
        </div>

        <div className="features-grid-3">
          {whyUsFeatures.map((feat, i) => (
            <div key={i} className="feature-block">
              <div className="icon-circle">{feat.icon}</div>
              <h4>{feat.title}</h4>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. DARK BANNER */}
      <section className="dark-banner">
        <div className="banner-content">
          <div className="logo-placeholder light">
            <img className="img-logo" alt="Cupon Tours" src="https://res.cloudinary.com/gt-connections/image/upload/v1705168752/cupon-tours/footer-icons/logo-cupontours-footer_maerif.png" />
          </div>
          <h2>{t.darkH2}</h2>
        </div>
      </section>

      <StructuredData type="Organization" data={workWithUsPageStructuredData} />
    </main>
  );
}

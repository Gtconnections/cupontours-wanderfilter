"use client";
import React, { useState } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import './about.css';
import Link from 'next/link';
import { sendAboutContactRequest } from '../../lib/api';
import { TRUST_STATS } from '../../lib/trust';
import { getAbout, type Locale } from '@/app/i18n/dictionaries';

const aboutPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Cupontours",
  "description": "Learn about Cupontours, a luxury travel and concierge company."
};

export default function AboutContent({ locale = 'en' }: { locale?: Locale }) {
  const t = getAbout(locale);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const stats = [
    { value: TRUST_STATS.propertiesManaged, label: t.s1 },
    { value: TRUST_STATS.nightsBooked, label: t.s2 },
    { value: TRUST_STATS.guestSatisfaction, label: t.s3 },
    { value: '24/7', label: t.s4 }
  ];

  const benefits = [
    { title: t.b1T, desc: t.b1D },
    { title: t.b2T, desc: t.b2D },
    { title: t.b3T, desc: t.b3D }
  ];

  const pillars = [
    { title: t.p1T, desc: t.p1D },
    { title: t.p2T, desc: t.p2D },
    { title: t.p3T, desc: t.p3D }
  ];

  const coreValues = [
    { title: t.cv1T, desc: t.cv1D },
    { title: t.cv2T, desc: t.cv2D },
    { title: t.cv3T, desc: t.cv3D }
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    const payload = { firstName, lastName, email, phoneNumber, message };

    try {
      const response = await sendAboutContactRequest(payload);
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
    <main className="about-page">

      {/* 1. SECCIÓN HERO */}
      <section className="about-hero-section">
        <div className="about-hero-container">
          <div className="about-hero-text-side">
            <h1 className="about-main-heading">{t.h1}</h1>
            <p className="about-hero-description">{t.heroDesc1}</p>
            <p className="about-hero-description">{t.heroDesc2}</p>

            {/* Badges de Contacto del Hero */}
            <div className="about-hero-badges-row">
              <div className="about-hero-badge-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
                <span>{t.badge1}</span>
              </div>
              <div className="about-hero-badge-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path><circle cx="12" cy="8" r="6"></circle></svg>
                <span>{t.badge2}</span>
              </div>
              <div className="about-hero-badge-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"></path></svg>
                <span>{t.badge3}</span>
              </div>
            </div>
          </div>

          <div className="about-hero-image-side">
            <div className="about-hero-image-box">
              <img src="https://res.cloudinary.com/gt-connections/image/upload/v1679366278/cupon-tours/invest-with-us-cupon-tours-summer-house_nba8ww.jpg" alt="Luxury Property View" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENEFITS OF STAYING WITH CUPON TOURS */}
      <section className="about-benefits-section bg-gray-light">
        <div className="about-benefits-container">
          <div className="about-benefits-image-block">
            <img src="https://res.cloudinary.com/gt-connections/image/upload/v1760238624/cupon-tours/cupon-tours-ultimate/cupon-tours-about-us-our-team_cee3cs.png" alt="Happy Partners" />
          </div>

          <div className="about-benefits-text-block">
            <h2>{t.benefitsH2}</h2>
            <p className="benefits-intro-desc">{t.benefitsIntro}</p>

            <div className="benefits-cards-vertical-stack">
              {benefits.map((item, i) => (
                <div key={i} className="benefit-minimal-card">
                  <div className="benefit-icon-bullet">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div className="benefit-card-content">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. THINGS WE BELIEVE SECTION */}
      <section className="about-pillars-section">
        <div className="about-pillars-container">
          <div className="about-pillars-text-side">
            <h2>{t.pillarsH2}</h2>

            <div className="pillars-text-stack">
              {pillars.map((item, i) => (
                <div key={i} className="pillar-text-node">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="about-pillars-image-side">
            <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80" alt="Meticulous Care Operations" />
          </div>
        </div>
      </section>

      {/* 4. LUXURY TRAVEL MADE AFFORDABLE (DARK BANNER) */}
      <section className="about-dark-banner">
        <div className="dark-banner-viewport">
          <h2>{t.bannerH2}</h2>
          <p>{t.bannerP}</p>

          <div className="dark-banner-values-grid">
            {coreValues.map((item, i) => (
              <div key={i} className="dark-value-card-node">
                <div className="dark-value-icon-circle">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                </div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GUEST EXPERIENCES TESTIMONIAL */}
      <section className="about-testimonials-section bg-gray-light">
        <div className="testimonials-viewport-center">
          <span className="pre-title text-center-block">{t.testiPre}</span>

          <div className="testimonial-editorial-card">
            <div className="star-rating-row">
              {"★".repeat(5)}
            </div>
            <p className="testimonial-quote-body">
              &quot;{t.testiQuote}&quot;
            </p>
            <div className="testimonial-author-meta">
              <strong>Sarah Johnson</strong>
              <span>{t.testiRole}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WORK WITH US: FORM & INFO SPLIT GRID */}
      <section className="about-contact-grid-block" id="about-contact-block">
        <div className="about-scoped-split-container">

          <div className="about-split-form-side">
            <div className="about-form-card-wrapper">
              <h3>{t.formH3}</h3>
              <p>{t.formP}</p>

              <form onSubmit={handleContactSubmit} className="clean-form custom-wander-layout mt-4">

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

                {/* FILA 1: Nombre y Apellido con Iconos vectoriales */}
                <div className="about-form-row-paired">
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
                <div className="about-form-row-paired">
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
                    <input type="tel" className="wander-input" placeholder="+1 (987) 654 3210" disabled={isLoading} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
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

          <div className="about-split-stats-side">
            <div className="about-get-in-touch-node">
              <span className="pre-title">{t.getInTouch}</span>

              <div className="about-touch-item">
                <div className="touch-icon-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div className="touch-text-node">
                  <h4>{t.emailLabel}</h4>
                  <a href="mailto:info@cupontours.com">info@cupontours.com</a>
                </div>
              </div>

              <div className="about-touch-item">
                <div className="touch-icon-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 .81 2.7"></path></svg>
                </div>
                <div className="touch-text-node">
                  <h4>{t.phoneLabel}</h4>
                  <a href="tel:+17866566582">+1 (786) 656-6582</a>
                </div>
              </div>
            </div>

            {/* Bloque de Métricas Inferiores */}
            <div className="about-editorial-metrics-grid">
              {stats.map((stat, i) => (
                <div key={i} className="about-metric-card-node">
                  <h3>{stat.value.split(' ')[0]}</h3>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 7. EXPERIENCIAL BANNER FINAL */}
      <section className="about-experiential-banner">
        <div className="experiential-banner-overlay"></div>
        <div className="experiential-banner-content">
          <h2>{t.finalH2}</h2>
          <p>{t.finalP}</p>
          <Link className="btn-white-pill" href={locale === 'es' ? '/es/properties' : '/properties'}>{t.finalBtn}</Link>
        </div>
      </section>

      <StructuredData type="Organization" data={aboutPageStructuredData} />
    </main>
  );
}

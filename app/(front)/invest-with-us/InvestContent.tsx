"use client";
import React, { useState } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import { sendInvestRequest } from '../../lib/api';
import { TRUST_STATS } from '../../lib/trust'; // Fuente única de métricas de confianza
import './invest.css';
import { getInvest, type Locale } from '@/app/i18n/dictionaries';

const investPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Invest With Us",
  "description": "Explore investment opportunities with Cupontours."
};

export default function InvestContent({ locale = 'en' }: { locale?: Locale }) {
  const t = getInvest(locale);
  const [interestType, setInterestType] = useState('I want to rent');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  // Estados de control para la solicitud local
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estado para controlar el popup de la galería interactiva
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);

  const gettingStarted = [
    { step: '01', title: t.gs1T, desc: t.gs1D },
    { step: '02', title: t.gs2T, desc: t.gs2D },
    { step: '03', title: t.gs3T, desc: t.gs3D }
  ];

  const whyChooseUs = [
    { title: t.wc1T, desc: t.wc1D },
    { title: t.wc2T, desc: t.wc2D },
    { title: t.wc3T, desc: t.wc3D },
    { title: t.wc4T, desc: t.wc4D },
    { title: t.wc5T, desc: t.wc5D }
  ];

  const solutions = [
    { title: t.sol1T, desc: t.sol1D },
    { title: t.sol2T, desc: t.sol2D },
    { title: t.sol3T, desc: t.sol3D },
    { title: t.sol4T, desc: t.sol4D },
    { title: t.sol5T, desc: t.sol5D },
    { title: t.sol6T, desc: t.sol6D },
    { title: t.sol7T, desc: t.sol7D },
    { title: t.sol8T, desc: t.sol8D }
  ];

  const gallery = [
    { title: t.g1, url: 'https://res.cloudinary.com/gt-connections/image/upload/v1679366278/cupon-tours/invest-with-us-cupon-tours-summer-house_nba8ww.jpg' },
    { title: t.g2, url: 'https://res.cloudinary.com/gt-connections/image/upload/v1679366277/cupon-tours/invest-with-us-cupon-tours-primavera-house_s81q77.jpg' },
    { title: t.g3, url: 'https://res.cloudinary.com/gt-connections/image/upload/v1679366277/cupon-tours/invest-with-us-cupon-tours-hyde-hallandale_byhfh5.jpg' },
    { title: t.g4, url: 'https://res.cloudinary.com/gt-connections/image/upload/v1679366277/cupon-tours/invest-with-us-cupon-tours-edgewater_kar5sp.jpg' },
    { title: t.g5, url: 'https://res.cloudinary.com/gt-connections/image/upload/v1679366277/cupon-tours/invest-with-us-cupon-tours-district-house_igrk8e.jpg' },
    { title: t.g6, url: 'https://res.cloudinary.com/gt-connections/image/upload/v1679118467/cupon-tours/background-cupon-tours-call-to-action-put-your-property-to-rent_tuzql5.jpg' }
  ];

  const stats = [
    { value: TRUST_STATS.propertiesManaged, label: t.statProperties },
    { value: TRUST_STATS.guestSatisfaction, label: t.statSatisfaction },
    { value: TRUST_STATS.revenueGenerated, label: t.statRevenue },
    { value: TRUST_STATS.yearsExperience, label: t.statYears }
  ];

  const handleInvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    const payload = { interestType, firstName, lastName, email, phoneNumber, message };

    try {
      const response = await sendInvestRequest(payload);
      setStatusMessage({
        type: 'success',
        text: response.message || t.successMsg
      });
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

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeGalleryIndex === null) return;
    setActiveGalleryIndex(prev => (prev === 0 ? gallery.length - 1 : prev! - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeGalleryIndex === null) return;
    setActiveGalleryIndex(prev => (prev === gallery.length - 1 ? 0 : prev! + 1));
  };

  return (
    <main className="invest-page">
      
      {/* 1. CINEMATIC HERO */}
      <section className="invest-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">{t.heroBadge}</span>
          <h1 className="hero-massive-title">{t.heroTitleA}<br />{t.heroTitleB}</h1>
          <p className="hero-subtitle">{t.heroSub}</p>
          <button className="btn-white-pill mt-4" type="button" onClick={() => document.getElementById('invest-form-block')?.scrollIntoView({ behavior: 'smooth' })}>{t.heroBtn}</button>
        </div>
      </section>

      {/* 2. GETTING STARTED */}
      <section className="steps-section">
        <div className="section-header-center">
          <h2 className="massive-heading">{t.s2Title}</h2>
          <span className="pre-title">{t.s2Pre}</span>
        </div>
        <div className="steps-grid">
          {gettingStarted.map((item, i) => (
            <div key={i} className="step-card">
              <span className="step-number">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. DARK SECTION: WHY CHOOSE US */}
      <section className="why-dark-section">
        <div className="dark-container">
          <div className="section-header-center">
            <span className="pre-title dark-pre">{t.s3Pre}</span>
            <h2 className="massive-heading dark-title">{t.s3Title}</h2>
            <p className="dark-subtitle">{t.s3Sub}</p>
          </div>
          <div className="features-grid-3">
            {whyChooseUs.map((feat, i) => (
              <div key={i} className="dark-feature-item">
                <div className="feature-icon-minimal">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h4>{feat.title}</h4>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
          <div className="center-btn">
            <button className="btn-white-pill" type="button" onClick={() => document.getElementById('invest-form-block')?.scrollIntoView({ behavior: 'smooth' })}>{t.s3Btn}</button>
          </div>
        </div>
      </section>

      {/* 4. SPLIT: PROFILE & SOLUTIONS */}
      <section className="split-section vertical-center-split">
        <div className="split-container">
          <div className="split-image">
            <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" alt="Corporate Buildings" />
          </div>
          <div className="split-text">
            <span className="pre-title">{t.s4Pre}</span>
            <h2 className="section-title">{t.s4TitleA}<br />{t.s4TitleB}</h2>
            <p className="text-content">{t.s4P1}</p>
            <p className="text-content">{t.s4P2}</p>
            <p className="text-content">{t.s4P3}</p>
            <button className="btn-black-pill mt-4" type="button" onClick={() => document.getElementById('invest-form-block')?.scrollIntoView({ behavior: 'smooth' })}>{t.s4Btn}</button>
          </div>
        </div>
      </section>

      {/* 5. TWO ASYMMETRICAL CARDS */}
      <section className="two-cards-section bg-gray-light">
        <div className="cards-grid">
          <div className="service-card">
            <div className="card-img-wrapper">
              <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80" alt="Analyze ROI" />
            </div>
            <div className="card-content">
              <h3>{t.c1T}</h3>
              <p>{t.c1D}</p>
              <a href="#invest-form-block" className="text-link" onClick={(e) => { e.preventDefault(); document.getElementById('invest-form-block')?.scrollIntoView({ behavior: 'smooth' }); }}>{t.cGetStarted}</a>
            </div>
          </div>
          <div className="service-card">
            <div className="card-img-wrapper">
              <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80" alt="Virtual Staging" />
            </div>
            <div className="card-content">
              <h3>{t.c2T}</h3>
              <p>{t.c2D}</p>
              <a href="#invest-form-block" className="text-link" onClick={(e) => { e.preventDefault(); document.getElementById('invest-form-block')?.scrollIntoView({ behavior: 'smooth' }); }}>{t.cGetStarted}</a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SPLIT: DASHBOARD & FAST SIGN UP */}
      <section className="split-section vertical-center-split">
        <div className="split-container reverse">
          <div className="split-image gray-bg-img">
            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" alt="Advanced Dashboard" />
          </div>
          <div className="split-text">
            <h2 className="section-title">{t.s6Title}</h2>
            <p>{t.s6P}</p>
            
            <div className="timeline-list">
              <div className="timeline-item">
                <span className="tl-num-bold">1</span>
                <div>
                  <h4>{t.tl1T}</h4>
                  <p>{t.tl1D}</p>
                </div>
              </div>
              <div className="timeline-item">
                <span className="tl-num-bold">2</span>
                <div>
                  <h4>{t.tl2T}</h4>
                  <p>{t.tl2D}</p>
                </div>
              </div>
              <div className="timeline-item">
                <span className="tl-num-bold">3</span>
                <div>
                  <h4>{t.tl3T}</h4>
                  <p>{t.tl3D}</p>
                </div>
              </div>
              <div className="timeline-item">
                <span className="tl-num-bold">4</span>
                <div>
                  <h4>{t.tl4T}</h4>
                  <p>{t.tl4D}</p>
                </div>
              </div>
            </div>
            <button className="btn-black-pill mt-4" type="button" onClick={() => document.getElementById('invest-form-block')?.scrollIntoView({ behavior: 'smooth' })}>{t.s6Btn}</button>
            <p className="mt-4" style={{ fontSize: '0.9rem', opacity: 0.85 }}>
              {t.partnersQ}{' '}
              <a href="/work-with-us" className="text-link">{t.partnersLink}</a>
            </p>
          </div>
        </div>
      </section>

      {/* 7. ALL SOLUTIONS GRID */}
      <section className="solutions-grid-section bg-gray-light">
        <div className="section-header-center max-width-refinned">
          <h2 className="massive-heading font-elegant-header">
            {t.s7Title}
          </h2>
        </div>
        <div className="solutions-management-grid">
          {solutions.map((item, i) => (
            <div key={i} className="solution-elegant-card">
              <div className="card-top-accent-bar"></div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. OUR WORK GALLERY */}
      <section className="gallery-section">
        <div className="section-header-center">
          <span className="pre-title">{t.s8Pre}</span>
          <h2 className="massive-heading">{t.s8Title}</h2>
          <p className="subtitle">{t.s8Sub}</p>
        </div>
        <div className="masonry-grid">
          {gallery.map((item, i) => (
            <div key={i} className="gallery-item-interactive" onClick={() => setActiveGalleryIndex(i)}>
              <img src={item.url} alt={item.title} />
              <div className="gallery-hover-overlay">
                <span className="hover-title-text">{item.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL MODULAR PANORÁMICO DE VISUALIZACIÓN COMPLETA */}
        {activeGalleryIndex !== null && (
          <div className="gallery-modal-overlay" onClick={() => setActiveGalleryIndex(null)}>
            <div className="modal-content-viewport" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setActiveGalleryIndex(null)} aria-label="Close modal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <button className="modal-nav-arrow left" onClick={handlePrevImage} aria-label="Previous">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              
              <img src={gallery[activeGalleryIndex].url} alt={gallery[activeGalleryIndex].title} className="modal-main-image" />
              
              <button className="modal-nav-arrow right" onClick={handleNextImage} aria-label="Next">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>

              <div className="modal-bottom-caption-bar">
                <span>{gallery[activeGalleryIndex].title}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 9. CONTACT FORM & STATS CON CONTEXTO CONSOLIDADO */}
      <section className="contact-stats-section bg-gray-light vertical-center-split" id="invest-form-block">
        <div className="split-container">
          
          <div className="split-form">
            <div className="form-card animate-form-style">
              <h3>{t.formTitle}</h3>
              <p>{t.formDesc}</p>
              
              <form onSubmit={handleInvestSubmit} className="clean-form custom-wander-layout mt-4">
                
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

                <div className="wander-radio-container">
                  <span className="radio-title-label">{t.radioTitle}</span>
                  <label className="radio-custom-item">
                    <input 
                      type="radio" 
                      name="interestType" 
                      value="I want to rent" 
                      checked={interestType === 'I want to rent'} 
                      disabled={isLoading}
                      onChange={(e) => setInterestType(e.target.value)} 
                    />
                    <span>{t.radRent}</span>
                  </label>
                  <label className="radio-custom-item">
                    <input 
                      type="radio" 
                      name="interestType" 
                      value="I want to buy" 
                      checked={interestType === 'I want to buy'} 
                      disabled={isLoading}
                      onChange={(e) => setInterestType(e.target.value)} 
                    />
                    <span>{t.radBuy}</span>
                  </label>
                </div>

                {/* FILA 1: Nombre y Apellido (CORREGIDA LA CLASE A .invest-form-row-grid PARA DOS COLUMNAS) */}
                <div className="invest-form-row-grid">
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

                {/* FILA 2: Email y Teléfono (CORREGIDA LA CLASE A .invest-form-row-grid PARA DOS COLUMNAS) */}
                <div className="invest-form-row-grid">
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      {t.lblEmail}
                    </label>
                    <input type="email" className="wander-input" placeholder="john@example.com" required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 .81 2.7"></path></svg>
                      {t.lblPhone}
                    </label>
                    <input type="tel" className="wander-input" placeholder="+1 (987) 654 3210" disabled={isLoading} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  </div>
                </div>

                <div className="wander-input-group">
                  <label className="wander-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    {t.lblMsg}
                  </label>
                  <textarea className="wander-textarea" rows={5} placeholder={t.phMsg} required disabled={isLoading} value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
                </div>

                <div className="wander-info-box">
                  <div className="info-box-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    {t.privTitle}
                  </div>
                  <ul className="info-box-list">
                    <li>• {t.privText}</li>
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
          
          <div className="split-stats">
            <div className="contact-info-block-wander-style">
              <span className="pre-title">{t.getInTouch}</span>
              
              <div className="wander-contact-info-item">
                <div className="wander-contact-icon-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div className="wander-contact-text-node">
                  <span className="contact-node-title">{t.cEmail}</span>
                  <a href={`mailto:${process.env.NEXT_PUBLIC_COMPANY_EMAIL || ''}`} className="contact-node-value">{process.env.NEXT_PUBLIC_COMPANY_EMAIL || ''}</a>
                  <span className="contact-node-caption">{t.cEmailCap}</span>
                </div>
              </div>

              <div className="wander-contact-info-item">
                <div className="wander-contact-icon-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 .81 2.7"></path></svg>
                </div>
                <div className="wander-contact-text-node">
                  <span className="contact-node-title">{t.cPhone}</span>
                  <a href={`tel:${process.env.NEXT_PUBLIC_COMPANY_CALL || ''}`} className="contact-node-value">{process.env.NEXT_PUBLIC_COMPANY_PHONE || ''}</a>
                  <span className="contact-node-caption">{t.cPhoneCap}</span>
                </div>
              </div>

              <div className="wander-contact-info-item">
                <div className="wander-contact-icon-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div className="wander-contact-text-node">
                  <span className="contact-node-title">{t.cOffice}</span>
                  <span className="contact-node-value">{ process.env.NEXT_PUBLIC_COMPANY_ADDRESS || '' }</span>
                  <span className="contact-node-caption">{t.cOfficeCap}</span>
                </div>
              </div>

              <div className="wander-contact-info-item">
                <div className="wander-contact-icon-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div className="wander-contact-text-node">
                  <span className="contact-node-title">{t.cSchedule}</span>
                  <span className="contact-node-value highlight-dark-node">{t.cScheduleVal}</span>
                  <span className="contact-node-caption">{t.cScheduleCap}</span>
                </div>
              </div>
            </div>
            
            <div className="massive-stats-grid">
              {stats.map((stat, i) => (
                <div key={i} className="stat-card">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <StructuredData type="Organization" data={investPageStructuredData} />
    </main>
  );
}
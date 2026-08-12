"use client";
import React, { useState, useRef, useEffect } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import { sendJetQuoteRequest } from '../../lib/api';
import Membership from '@/components/Membership';
import './jets.css';
import Link from 'next/link';
import { getJets, type Locale } from '@/app/i18n/dictionaries';

const jetsPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Private Jet Charters",
  "description": "Book private jet charters with Cupontours.",
  "mainEntity": { "@type": "Service", "name": "Private Jet Charter", "serviceType": "Private Aviation" }
};

export default function JetsContent({ locale = 'en' }: { locale?: Locale }) {
  const t = getJets(locale);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [departureDate, setDepartureDate] = useState('');
  const calendarRef = useRef<HTMLDivElement>(null);

  // Estados de control para el flujo de la red
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados del Formulario Unificado de Aviación
  const [departureCity, setDepartureCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [tripType, setTripType] = useState('One Way');
  const [departureTime, setDepartureTime] = useState('');
  const [timePeriod, setTimePeriod] = useState('AM');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [instagram, setInstagram] = useState('');

  const pillars = [
    { title: t.pillar1T, desc: t.pillar1D, img: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=500&q=80' },
    { title: t.pillar2T, desc: t.pillar2D, img: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=500&q=80' },
    { title: t.pillar3T, desc: t.pillar3D, img: 'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=500&q=80' },
    { title: t.pillar4T, desc: t.pillar4D, img: 'https://images.unsplash.com/photo-1524850301259-7729d41d11d9?auto=format&fit=crop&w=500&q=80' }
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    const payload = {
      flightCriteria: { 
        departureCity, 
        destinationCity, 
        passengers, 
        tripType, 
        departureTime: departureTime ? `${departureTime} ${timePeriod}` : 'Not specified', 
        departureDate, 
        returnDate: 'One Way' 
      },
      contact: { 
        firstName, 
        lastName, 
        email, 
        phone: countryCode ? `(${countryCode}) ${phoneNumber}` : phoneNumber, 
        instagram 
      }
    };

    try {
      const response = await sendJetQuoteRequest(payload);
      setStatusMessage({
        type: 'success',
        text: response.message || t.successMsg
      });
      setDepartureCity('');
      setDestinationCity('');
      setPassengers('1');
      setTripType('One Way');
      setDepartureTime('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setCountryCode('');
      setPhoneNumber('');
      setInstagram('');
      setDepartureDate('');
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
    <main className="aviation-page">
      
      {/* 1. CINEMATIC HERO */}
      <section className="aviation-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">{t.heroBadge}</span>
          <h1 className="hero-title">{t.heroTitleA}<br />{t.heroTitleB}</h1>
          <p className="hero-subtitle">{t.heroSubtitle}</p>
        </div>
      </section>

      {/* 2. REQUEST A QUOTE - SPLIT SECTION */}
      <section className="quote-split-section" id="quote-section">
        <div className="split-container">
          <div className="split-text-side">
            <span className="pre-title">{t.qsPre}</span>
            <h2>{t.qsTitle}</h2>
            <p className="body-lead">{t.qsLead}</p>
            <p className="body-text">{t.qsText}</p>
          </div>
          
          <div className="split-form-side">
            <div className="quote-form-card">
              <h3>{t.formTitle}</h3>
              <p className="form-desc">{t.formDesc}</p>
              
              <form onSubmit={handleFormSubmit} className="clean-aviation-form custom-wander-layout">
                
                {/* Capa de Estado Dinámica */}
                {statusMessage && (
                  <div style={{
                    padding: '14px 16px',
                    backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fee2e2'}`,
                    borderRadius: '12px',
                    color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
                    fontSize: '13px',
                    fontWeight: 500,
                    lineHeight: 1.5,
                    marginBottom: '10px'
                  }}>
                    {statusMessage.text}
                  </div>
                )}

                {/* FILA 1: Origen y Destino */}
                <div className="form-row flex-row-layout">
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>
                      {t.lblDeparture}
                    </label>
                    <input type="text" className="wander-input" placeholder={t.phDeparture} required disabled={isLoading} value={departureCity} onChange={(e) => setDepartureCity(e.target.value)} />
                  </div>
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                      {t.lblDestination}
                    </label>
                    <input type="text" className="wander-input" placeholder={t.phDestination} required disabled={isLoading} value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} />
                  </div>
                </div>

                {/* FILA 2: Pasajeros y Tipo de Viaje */}
                <div className="form-row flex-row-layout">
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      {t.lblPassengers}
                    </label>
                    <select className="wander-input select-wander" disabled={isLoading} value={passengers} onChange={(e) => setPassengers(e.target.value)}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, "10+"].map((num) => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 22l1-4h18l1 4H2zM12 2v12M12 2L8 6M12 2l4 4"/></svg>
                      {t.lblTripType}
                    </label>
                    <select className="wander-input select-wander" disabled={isLoading} value={tripType} onChange={(e) => setTripType(e.target.value)}>
                      <option value="One Way">{t.optOneWay}</option>
                      <option value="Round Trip">{t.optRound}</option>
                      <option value="Multi-Leg">{t.optMulti}</option>
                    </select>
                  </div>
                </div>

                {/* FILA 3: Hora de salida */}
                <div className="wander-input-group">
                  <label className="wander-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {t.lblDepTime}
                  </label>
                  <div className="time-input-split">
                    <input type="text" className="wander-input" placeholder="HH:MM" disabled={isLoading} value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
                    <select className="wander-input select-wander time-period-select" disabled={isLoading} value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                {/* TÍTULO DE SECCIÓN: CONTACT INFORMATION */}
                <div className="form-section-divider">
                  <span>{t.contactInfo}</span>
                </div>

                {/* FILA 4: Nombre y Apellido */}
                <div className="form-row flex-row-layout">
                  <div className="wander-input-group">
                    <input type="text" className="wander-input" placeholder={t.phFirst} required disabled={isLoading} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="wander-input-group">
                    <input type="text" className="wander-input" placeholder={t.phLast} required disabled={isLoading} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>

                {/* FILA 5: Email, País y Teléfono */}
                <div className="form-row flex-row-layout contacts-triple-row">
                  <div className="wander-input-group email-flex-group">
                    <input type="email" className="wander-input" placeholder={t.phEmail} required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="wander-input-group country-flex-group">
                    <input type="text" className="wander-input text-center" placeholder={t.phCountry} disabled={isLoading} value={countryCode} onChange={(e) => setCountryCode(e.target.value)} />
                  </div>
                  <div className="wander-input-group phone-flex-group">
                    <input type="tel" className="wander-input" placeholder="(000-000-0000)" required disabled={isLoading} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  </div>
                </div>

                {/* FILA 6: Calendario Simple de Un Mes & Instagram */}
                <div className="form-row flex-row-layout alignment-adjusted-row">
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {t.lblDepDate}
                    </label>
                    <div className="widget-date-picker-box reset-picker-box" ref={calendarRef}>
                      <div 
                        className="date-picker-header" 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isLoading) setIsCalendarOpen(!isCalendarOpen);
                        }}
                        style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                      >
                        <div className="picker-col spec-padding-col">
                          <span className={departureDate ? "selected-value" : ""}>
                            {departureDate ? departureDate.split(',')[0] : "dd/mm/aaaa"}
                          </span>
                        </div>
                      </div>

                      {/* PICKER SENCILLO DE UN SOLO MES CON ALINEACIÓN AJUSTADA */}
                      {isCalendarOpen && (
                        <div className="editorial-calendar-popup tabular-horizon-alignment simple-single-month-picker" onClick={(e) => e.stopPropagation()}>
                          <div className="calendar-months-container">
                            <div className="month-block">
                              <h4>May 2026</h4>
                              <div className="calendar-weekdays">
                                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                              </div>
                              <div className="calendar-days-grid">
                                {Array.from({ length: 5 }).map((_, i) => <div key={`empty-may-${i}`} className="empty-day" />)}
                                {Array.from({ length: 31 }).map((_, i) => {
                                  const day = i + 1;
                                  const dateString = `May ${day}, 2026`;
                                  return (
                                    <button
                                      type="button"
                                      key={`may-${day}`}
                                      className={`day-btn ${departureDate === dateString ? "active-bound" : ""}`}
                                      onClick={() => { 
                                        setDepartureDate(dateString); 
                                        setIsCalendarOpen(false); 
                                      }}
                                    >
                                      {day}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="wander-input-group space-label-matching">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                      {t.lblInstagram}
                    </label>
                    <input type="text" className="wander-input" placeholder="@yourusername" disabled={isLoading} value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-booking-primary override-btn-submit"
                  disabled={isLoading}
                  style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                  {isLoading ? t.btnSubmitting : t.btnSubmit}
                </button>
                
                {/* BLUE BADGE INFO BOX */}
                <div className="wander-info-box">
                  <div className="info-box-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    {t.nextTitle}
                  </div>
                  <ul className="info-box-list">
                    <li>• {t.next1}</li>
                    <li>• {t.next2}</li>
                    <li>• {t.next3}</li>
                  </ul>
                </div>

              </form>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP CLUB SECTION */}
      <Membership />

      {/* 4. PILLARS GRID */}
      <section className="pillars-section">
        <div className="inner-container">
          <div className="pillars-grid">
            {pillars.map((pillar, i) => (
              <div key={i} className="pillar-card">
                <div className="pillar-image-wrapper">
                  <img src={pillar.img} alt={pillar.title} loading="lazy" />
                  <span className="pillar-num">0{i+1}</span>
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. OBJECTIVES SECTION */}
      <section className="objectives-section bg-gray-light">
        <div className="inner-container">
          <div className="objectives-header">
            <h2>{t.objTitle}</h2>
            <br />
            <span className="pre-title">{t.objPre}</span>
            <p className="body-text">{t.objText}</p>
          </div>
          <div className="objectives-grid">
            <div className="obj-card">
              <div className="obj-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>
              </div>
              <h3>{t.obj1T}</h3>
              <p>{t.obj1D}</p>
            </div>
            <div className="obj-card">
              <div className="obj-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <h3>{t.obj2T}</h3>
              <p>{t.obj2D}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BRUTALIST DARK BANNER */}
      <section className="aviation-dark-banner">
        <div className="dark-banner-content">
          <h2>{t.bannerTitle}</h2>
          <p>{t.bannerText}</p>
          <div className="banner-actions">
            <a 
              href="#quote-section" 
              className="btn-white-pill"
              style={{ textDecoration: 'none', display: 'inline-block' }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('quote-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t.flyWithUs}
            </a>
            <Link href="/contact" className="btn-outline-white">{t.contactUs}</Link>
          </div>
        </div>
      </section>

      <StructuredData type="Product" data={jetsPageStructuredData} />
    </main>
  );
}
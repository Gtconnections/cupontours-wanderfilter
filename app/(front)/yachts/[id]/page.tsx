'use client';

import React, { useState, useEffect, use } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import './yacht-detail.css';
import Link from 'next/link';

// IMPORTAMOS LAS LLAMADAS MODULARES DESACOPLADAS
import { getYachtById, YachtDetail } from '../../../lib/api/yachts';
import { sendYachtBookingRequest } from '../../../lib/api';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function YachtDetailPage({ params }: PageProps) {
  const { id } = use(params);

  // Estados de datos y control de carga
  const [yacht, setYacht] = useState<YachtDetail | null>(null);
  const [cleanGallery, setCleanGallery] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Estados de control para el envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados Interactivos del Módulo de Reserva (Calendario)
  const [charterDate, setCharterDate] = useState<number | null>(null);
  const [returnDate, setReturnDate] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Estados del Formulario de Contacto Wander Integrado
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Control del carrusel de imágenes
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const crewFee = 500;

  // Carga de datos dinámicos desde Django
  useEffect(() => {
    async function fetchYachtData() {
      try {
        setIsLoading(true);
        const data = await getYachtById(id);
        setYacht(data);
        
        if (data && Array.isArray(data.gallery)) {
          setCleanGallery(data.gallery);
        } else {
          setCleanGallery(data.img ? [data.img] : []);
        }
        
        setCurrentImageIndex(0);
      } catch (err) {
        setError(true);
      } finally { // ARREGLADO: Corregido de 'finaly:' a 'finally'
        setIsLoading(false);
      }
    }
    fetchYachtData();
  }, [id]);

  // Funciones de navegación del carrusel marino
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cleanGallery.length <= 1) return;
    setCurrentImageIndex((prev) => (prev === cleanGallery.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cleanGallery.length <= 1) return;
    setCurrentImageIndex((prev) => (prev === 0 ? cleanGallery.length - 1 : prev - 1));
  };

  // Simulación de calendario (Mayo y Junio 2026)
  const mayDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const juneDays = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleDayClick = (day: number, month: 'may' | 'june') => {
    const dayIdentifier = month === 'may' ? day : day + 100;
    
    if (!charterDate || (charterDate && returnDate)) {
      setCharterDate(dayIdentifier);
      setReturnDate(null);
    } else if (charterDate && !returnDate) {
      if (dayIdentifier < charterDate) {
        setCharterDate(dayIdentifier);
      } else {
        setReturnDate(dayIdentifier);
        setShowDatePicker(false);
      }
    }
  };

  const formatIdToText = (id: number | null) => {
    if (!id) return 'Select date';
    const isJune = id > 100;
    const day = isJune ? id - 100 : id;
    return `${isJune ? 'June' : 'May'} ${day}, 2026`;
  };

  const calculateDays = () => {
    if (!charterDate || !returnDate) return 1;
    return returnDate - charterDate;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!charterDate || !returnDate) {
      setStatusMessage({ type: 'error', text: 'Please select valid Charter Start and End date parameters.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      yachtId: id,
      yachtName: yacht?.title || '',
      charterStart: formatIdToText(charterDate),
      charterEnd: formatIdToText(returnDate),
      totalDays: calculateDays(),
      client: { fullName, email, phoneNumber, specialRequests }
    };

    try {
      const response = await sendYachtBookingRequest(payload);
      setStatusMessage({
        type: 'success',
        text: response.message || "Your private charter request has been submitted successfully!"
      });
      setFullName('');
      setEmail('');
      setPhoneNumber('');
      setSpecialRequests('');
      setCharterDate(null);
      setReturnDate(null);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: (err instanceof Error ? err.message : undefined) || "Failed to process charter application. Please verify parameters."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="yacht-detail-page py-20 text-center">
        <h2 className="text-xl font-bold">Vessel not found</h2>
        <p className="text-gray-400 mt-2">The requested charter asset is unavailable or doesn&apos;t exist.</p>
        <Link href="/yachts" className="btn-back-editorial inline-flex mt-6">Go back to fleet</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="yacht-detail-page py-20 text-center animate-pulse">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ height: '40px', backgroundColor: '#e4e4e7', borderRadius: '6px', width: '40%', marginBottom: '20px' }}></div>
          <div style={{ height: '450px', backgroundColor: '#e4e4e7', borderRadius: '12px', marginBottom: '40px' }}></div>
        </div>
      </div>
    );
  }

  if (!yacht) {
    return null;
  }

  const basePriceNum = yacht.price_full_day ? parseInt(yacht.price_full_day.replace(/[^0-9]/g, '')) : 9950;
  const totalDays = calculateDays();

  const specs = [
    { label: 'Length', value: yacht.length },
    { label: 'Capacity', value: yacht.capacity },
    { label: 'Staterooms', value: yacht.staterooms },
    { label: 'Bathrooms', value: yacht.bathrooms },
    { label: 'Charter Type', value: 'Premium Experience' },
    { label: 'Location', value: 'Miami, FL' }
  ];

  const dynamicInclusions = [];
  if (yacht.amenities?.certified_captain) dynamicInclusions.push('Certified Captain onboard');
  if (yacht.amenities?.fuel) dynamicInclusions.push('Fuel Policy Agreement Included');
  if (yacht.amenities?.jacuzzi) dynamicInclusions.push('Luxury On-deck Jacuzzi Active');
  if (yacht.amenities?.slide) dynamicInclusions.push('Water Slide Equipment Included');
  if (yacht.amenities?.jet_sky) dynamicInclusions.push('Premium Jet Ski Access');
  if (dynamicInclusions.length === 0) dynamicInclusions.push('Luxury Saloon Layout', 'Teak Deck Living Area');

  const infrastructure = [
    {
      category: 'Amenities & Status',
      items: dynamicInclusions
    },
    {
      category: "What's Included",
      items: ['Professional crew and captain service', 'Full fuel parameters for charter duration', 'Safety equipment and life jackets', 'Complimentary ice and fresh water', 'Sound system and entertainment integration']
    }
  ];

  const baseImgUrl = cleanGallery[currentImageIndex] || yacht.img || "";
  const activeImageUrl = baseImgUrl.includes('?') 
    ? `${baseImgUrl}&imgIndex=${currentImageIndex}` 
    : `${baseImgUrl}?imgIndex=${currentImageIndex}`;

  return (
    <main className="yacht-detail-page">
      <div className="detail-container">
        
        {/* ENCABEZADO */}
        <header className="yacht-detail-header">
          <div className="header-split-row">
            <div className="header-text-side">
              <span className="pre-title">Luxury Yacht Charter • Premium Experience</span>
              <h1 className="massive-heading">{yacht.title}</h1>
              <p className="yacht-location-tag">Miami, Florida, United States</p>
            </div>
            <div className="header-action-side">
              <Link href="/yachts" className="btn-back-editorial">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                <span>Back Yachts</span>
              </Link>
            </div>
          </div>
        </header>

        {/* CARRUSEL INTERACTIVO */}
        <section className="yacht-hero-carousel">
          <div className="carousel-main-viewport">
            <img 
              key={`yacht-viewport-image-idx-${currentImageIndex}`}
              src={activeImageUrl} 
              alt={`${yacht.title} View ${currentImageIndex + 1}`} 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80";
              }}
            />
            
            {cleanGallery.length > 1 && (
              <>
                <button className="carousel-arrow prev" onClick={prevImage} aria-label="Previous image" type="button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button className="carousel-arrow next" onClick={nextImage} aria-label="Next image" type="button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </>
            )}

            <div className="carousel-counter-badge">
              {currentImageIndex + 1} / {cleanGallery.length}
            </div>
          </div>

          <div className="carousel-dots-indicator">
            {cleanGallery.map((_, index: number) => (
              <span 
                key={`dot-${index}`} 
                className={`indicator-dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentImageIndex(index);
                }}
              />
            ))}
          </div>
        </section>

        {/* ESTRUCTURA DE DOS COLUMNAS */}
        <div className="yacht-content-layout">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="content-left-side">
            <div className="yacht-quick-specs">
              {specs.map((spec, i) => (
                <div key={i} className="spec-pill">
                  <span className="spec-label">{spec.label}</span>
                  <span className="spec-value">{spec.value}</span>
                </div>
              ))}
            </div>

            <section className="detail-section-block">
              <h2>About This Yacht</h2>
              <div className="editorial-text">
                <p>{yacht.description}</p>
              </div>
            </section>

            <section className="detail-section-block marine-features-section">
              <h2>Features & Inclusions</h2>
              <div className="marine-categories-grid">
                {infrastructure.map((cat, i) => (
                  <div key={i} className="marine-category-group">
                    <h3>{cat.category}</h3>
                    <ul className="clean-marine-list">
                      {cat.items.map((item, idx) => (
                        <li key={idx}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="content-right-side">
            <form onSubmit={handleBookingSubmit} className="booking-sticky-widget">
              
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
                  marginBottom: '16px'
                }}>
                  {statusMessage.text}
                </div>
              )}

              <div className="widget-price-row">
                <div className="price-container">
                  <span className="widget-price"><strong>{yacht.price_full_day}</strong> / full day</span>
                  {yacht.price_half_day && (
                    <span className="widget-subprice">Half day option: {yacht.price_half_day}</span>
                  )}
                </div>
                <span className="widget-rating">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  5.0
                </span>
              </div>

              {/* Selector de Fechas */}
              <div className="widget-date-picker-box">
                <div className="date-picker-header" onClick={() => !isSubmitting && setShowDatePicker(!showDatePicker)}>
                  <div className="picker-col">
                    <label>Charter Start</label>
                    <span className={charterDate ? 'selected-value' : ''}>{formatIdToText(charterDate)}</span>
                  </div>
                  <div className="picker-divider"></div>
                  <div className="picker-col">
                    <label>Charter End</label>
                    <span className={returnDate ? 'selected-value' : ''}>{formatIdToText(returnDate)}</span>
                  </div>
                </div>

                {showDatePicker && (
                  <div className="editorial-calendar-popup">
                    <div className="calendar-months-container">
                      <div className="month-block">
                        <h4>May 2026</h4>
                        <div className="calendar-weekdays">
                          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                        </div>
                        <div className="calendar-days-grid">
                          <span className="empty-day"></span><span className="empty-day"></span><span className="empty-day"></span><span className="empty-day"></span><span className="empty-day"></span>
                          {mayDays.map(d => (
                            <button 
                              key={d} 
                              type="button"
                              className={`day-btn ${charterDate === d ? 'active-bound' : ''} ${returnDate === d ? 'active-bound' : ''} ${charterDate && returnDate && d > charterDate && d < returnDate ? 'in-range' : ''}`}
                              onClick={() => handleDayClick(d, 'may')}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="month-block">
                        <h4>June 2026</h4>
                        <div className="calendar-weekdays">
                          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                        </div>
                        <div className="calendar-days-grid">
                          <span className="empty-day"></span>
                          {juneDays.map(d => {
                            const id = d + 100;
                            return (
                              <button 
                                key={id} 
                                type="button"
                                className={`day-btn ${charterDate === id ? 'active-bound' : ''} ${returnDate === id ? 'active-bound' : ''} ${charterDate && returnDate && id > charterDate && id < returnDate ? 'in-range' : ''}`}
                                onClick={() => handleDayClick(d, 'june')}
                              >
                                {d}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FORMULARIO INTEGRADO */}
              <div className="wander-contact-fields">
                <div className="wander-input-group">
                  <label className="wander-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Full Name *
                  </label>
                  <input type="text" className="wander-input" placeholder="Enter your full name" required disabled={isSubmitting} value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>

                <div className="wander-input-group">
                  <label className="wander-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    Email Address *
                  </label>
                  <input type="email" className="wander-input" placeholder="Enter your email" required disabled={isSubmitting} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="wander-input-group">
                  <label className="wander-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 .81 2.7"></path></svg>
                    Phone Number
                  </label>
                  <input type="tel" className="wander-input" placeholder="Enter your phone number" disabled={isSubmitting} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>

                <div className="wander-input-group full-width">
                  <label className="wander-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Special Requests & Additional Information
                  </label>
                  <textarea className="wander-textarea" placeholder="Tell us more about your charter needs..." rows={3} disabled={isSubmitting} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
                </div>
              </div>

              {/* Desglose Matemático */}
              <div className="pricing-breakdown-box">
                <div className="price-row-item">
                  <span>Base Yacht Charter Fee (${basePriceNum} x {totalDays} {totalDays === 1 ? 'day' : 'days'})</span>
                  <span>${basePriceNum * totalDays}</span>
                </div>
                <div className="price-row-item">
                  <span>Professional Crew Service</span>
                  <span>${crewFee}</span>
                </div>
                <div className="price-row-item total-row">
                  <span>Total Charter Price</span>
                  <span>${(basePriceNum * totalDays) + crewFee}</span>
                </div>
              </div>

              <button type="submit" className="btn-booking-primary" disabled={isSubmitting}>
                {isSubmitting ? "Requesting..." : "Book Charter Availability"}
              </button>
              
              <div className="wander-info-box">
                <div className="info-box-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  What happens next?
                </div>
                <ul className="info-box-list">
                  <li>• We&apos;ll review your request within 2 hours</li>
                  <li>• You&apos;ll receive a detailed quote with availability</li>
                  <li>• Our team will contact you to finalize details</li>
                </ul>
              </div>
            </form>
          </div>

        </div>

      </div>

      {yacht && (
        <StructuredData
          type="Product"
          data={{
            "@type": "Product",
            "name": yacht.title,
            "description": yacht.description,
            "image": yacht.img,
            "offers": {
              "@type": "Offer",
              "price": yacht.price_full_day?.replace(/[^0-9.]/g, ''),
              "priceCurrency": "USD"
            }
          }}
        />
      )}
    </main>
  );
}
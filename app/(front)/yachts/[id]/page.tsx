'use client';

import React, { useState, useEffect, use } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import './yacht-detail.css';
import Link from 'next/link';
import { getYachtById, YachtDetail } from '../../../lib/api/yachts';
import { sendYachtBookingRequest } from '../../../lib/api';

interface PageProps {
  params: Promise<{ id: string }>;
}

// ============================================
// Galería modal (pantalla completa)
// ============================================
function ImageGalleryModal({
  images,
  onClose,
  initialIndex = 0,
}: {
  images: string[];
  onClose: () => void;
  initialIndex?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [images.length, onClose]);

  return (
    <div className="gallery-modal" onClick={onClose}>
      <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="gallery-close" onClick={onClose} aria-label="Close gallery">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="gallery-main-image">
          <img src={images[currentIndex]} alt={`Yacht image ${currentIndex + 1}`} />
        </div>
        <div className="gallery-counter">{currentIndex + 1} / {images.length}</div>
        {images.length > 1 && (
          <>
            <button className="gallery-nav gallery-prev" onClick={goToPrevious} aria-label="Previous image">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button className="gallery-nav gallery-next" onClick={goToNext} aria-label="Next image">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
            <div className="gallery-thumbnails">
              {images.slice(0, 12).map((img, idx) => (
                <div
                  key={idx}
                  className={`gallery-thumb ${idx === currentIndex ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} />
                </div>
              ))}
              {images.length > 12 && (<div className="gallery-thumb-more">+{images.length - 12}</div>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function YachtDetailPage({ params }: PageProps) {
  const { id } = use(params);

  // Datos y carga
  const [yacht, setYacht] = useState<YachtDetail | null>(null);
  const [cleanGallery, setCleanGallery] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Galería
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);

  // Reserva (calendario)
  const [charterDate, setCharterDate] = useState<number | null>(null);
  const [returnDate, setReturnDate] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Contacto
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const crewFee = 500;

  useEffect(() => {
    async function fetchYachtData() {
      try {
        setIsLoading(true);
        const data = await getYachtById(id);
        setYacht(data);
        if (data && Array.isArray(data.gallery)) {
          setCleanGallery(data.gallery);
        } else {
          setCleanGallery(data?.img ? [data.img] : []);
        }
        setCurrentImageIndex(0);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchYachtData();
  }, [id]);

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
      setStatusMessage({ type: 'error', text: 'Please select valid Charter Start and End dates.' });
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
      client: { fullName, email, phoneNumber, specialRequests },
    };

    try {
      const response = await sendYachtBookingRequest(payload);
      setStatusMessage({ type: 'success', text: response.message || 'Your private charter request has been submitted successfully!' });
      setFullName(''); setEmail(''); setPhoneNumber(''); setSpecialRequests('');
      setCharterDate(null); setReturnDate(null);
    } catch (err) {
      setStatusMessage({ type: 'error', text: (err instanceof Error ? err.message : undefined) || 'Failed to process charter application. Please verify parameters.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openGallery = (index: number) => {
    setGalleryInitialIndex(index);
    setIsGalleryOpen(true);
  };

  // Estados
  if (error) {
    return (
      <main className="yacht-detail-page">
        <div className="detail-container">
          <div className="error-state">
            <h2>Vessel Not Found</h2>
            <p>The requested charter asset is unavailable or doesn&apos;t exist.</p>
            <Link href="/yachts" className="btn-back-editorial">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              <span>Back to Fleet</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="yacht-detail-page">
        <div className="detail-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading charter details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!yacht) return null;

  const basePriceNum = yacht.price_full_day ? parseInt(yacht.price_full_day.replace(/[^0-9]/g, '')) : 9950;
  const totalDays = calculateDays();
  const location = 'Miami, Florida, United States';

  const images = cleanGallery.length > 0
    ? cleanGallery
    : [yacht.img || 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80'];
  const activeImageUrl = images[currentImageIndex] || images[0];

  // Tarjetas de specs
  const statCards = [
    {
      label: 'Length',
      value: yacht.length,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h18" /><path d="M6 9v6" /><path d="M18 9v6" /><path d="M10 10v4" /><path d="M14 10v4" />
        </svg>
      ),
    },
    {
      label: 'Capacity',
      value: yacht.capacity,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Staterooms',
      value: yacht.staterooms,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" />
        </svg>
      ),
    },
  ];

  const trustBadges = [
    { label: 'Verified', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>) },
    { label: 'Five-Star', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>) },
    { label: 'Captained', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 12 0v1" /></svg>) },
  ];

  // Inclusiones dinámicas (features en chips)
  const dynamicInclusions: string[] = [];
  if (yacht.amenities?.certified_captain) dynamicInclusions.push('Certified Captain onboard');
  if (yacht.amenities?.fuel) dynamicInclusions.push('Fuel Policy Included');
  if (yacht.amenities?.jacuzzi) dynamicInclusions.push('On-deck Jacuzzi');
  if (yacht.amenities?.slide) dynamicInclusions.push('Water Slide');
  if (yacht.amenities?.jet_sky) dynamicInclusions.push('Jet Ski Access');
  if (dynamicInclusions.length === 0) dynamicInclusions.push('Luxury Saloon Layout', 'Teak Deck Living Area');

  const features = [
    { category: 'Amenities & Status', items: dynamicInclusions },
    { category: "What's Included", items: ['Professional crew & captain', 'Full fuel for charter duration', 'Safety equipment & life jackets', 'Complimentary ice & fresh water', 'Sound system & entertainment'] },
  ];

  const charterDetails = [
    { label: 'Length', value: yacht.length },
    { label: 'Capacity', value: yacht.capacity },
    { label: 'Staterooms', value: yacht.staterooms },
    { label: 'Bathrooms', value: yacht.bathrooms },
    { label: 'Full-day Rate', value: yacht.price_full_day, accent: true },
  ];

  return (
    <main className="yacht-detail-page">
      <div className="detail-container">

        {/* ENCABEZADO SUPERIOR */}
        <header className="lux-pagehead">
          <div className="lux-headline-text">
            <span className="lux-eyebrow">Luxury Yacht Charter</span>
            <h1 className="lux-title">{yacht.title}</h1>
            <p className="lux-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span>{location}</span>
            </p>
          </div>
          <Link href="/yachts" className="btn-back-editorial">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            <span>Back to Fleet</span>
          </Link>
        </header>

        <div className="property-content-layout">

          {/* ===================== IZQUIERDA ===================== */}
          <div className="content-left-side">

            {/* GALERÍA */}
            <section className="lux-gallery">
              <div className="lux-gallery-main" onClick={() => openGallery(currentImageIndex)}>
                <img
                  key={`viewport-${currentImageIndex}`}
                  src={activeImageUrl}
                  alt={`${yacht.title} view ${currentImageIndex + 1}`}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80'; }}
                />
                {images.length > 1 && (
                  <>
                    <button className="lux-gallery-arrow prev" type="button" aria-label="Previous image"
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <button className="lux-gallery-arrow next" type="button" aria-label="Next image"
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </>
                )}
                <div className="lux-gallery-counter">{currentImageIndex + 1} / {images.length}</div>
              </div>

              {images.length > 1 && (
                <div className="lux-thumb-strip">
                  {images.slice(0, 10).map((img, idx) => (
                    <button key={idx} type="button" className={`lux-thumb ${idx === currentImageIndex ? 'active' : ''}`} onClick={() => setCurrentImageIndex(idx)} aria-label={`View image ${idx + 1}`}>
                      <img src={img} alt={`${yacht.title} thumbnail ${idx + 1}`} />
                    </button>
                  ))}
                  {images.length > 10 && (
                    <button type="button" className="lux-thumb lux-thumb-more" onClick={() => openGallery(10)}>+{images.length - 10}</button>
                  )}
                </div>
              )}
            </section>

            {/* SPECS */}
            <section className="lux-card">
              <div className="lux-stats-grid">
                {statCards.map((s, i) => (
                  <div key={i} className="lux-stat">
                    <span className="lux-stat-icon">{s.icon}</span>
                    <span className="lux-stat-value">{s.value}</span>
                    <span className="lux-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* DESCRIPCIÓN */}
            {yacht.description && (
              <section className="lux-card">
                <h2 className="lux-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  About This Yacht
                </h2>
                <div className="lux-body-text">
                  <p>{yacht.description}</p>
                </div>
              </section>
            )}

            {/* FEATURES (chips) */}
            <section className="lux-card">
              <h2 className="lux-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Features &amp; Inclusions
              </h2>
              <div className="lux-amenities-grid">
                {features.map((cat, i) => (
                  <div key={i} className="lux-amenity-group">
                    <h3>{cat.category}</h3>
                    <ul>
                      {cat.items.map((item, idx) => (
                        <li key={idx}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* ===================== DERECHA ===================== */}
          <aside className="content-right-side">
            <div className="lux-sticky">

              {/* BADGES */}
              <div className="lux-badges-card">
                {trustBadges.map((b, i) => (
                  <div key={i} className="lux-badge">
                    <span className="lux-badge-icon">{b.icon}</span>
                    <span className="lux-badge-label">{b.label}</span>
                  </div>
                ))}
              </div>

              {/* CARD DE RESERVA (formulario del yate) */}
              <div className="lux-reserve-card">
                <span className="lux-eyebrow with-line">Enquire</span>
                <h2 className="lux-reserve-title">Reserve This Yacht</h2>
                <div className="lux-reserve-trust">
                  <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>Secure</span>
                  <span><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>Five-Star</span>
                  <span>24/7 Support</span>
                </div>

                <div className="lux-reserve-price">
                  <span className="lux-reserve-amount">{yacht.price_full_day}</span>
                  <span className="lux-reserve-per">per full day</span>
                </div>
                {yacht.price_half_day && (
                  <p className="lux-reserve-note">Half-day option: {yacht.price_half_day}</p>
                )}

                <form onSubmit={handleBookingSubmit} className="lux-form">
                  {statusMessage && (
                    <div className={`lux-form-status ${statusMessage.type}`}>{statusMessage.text}</div>
                  )}

                  {/* Selector de fechas */}
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
                            <div className="calendar-weekdays"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>
                            <div className="calendar-days-grid">
                              <span className="empty-day"></span><span className="empty-day"></span><span className="empty-day"></span><span className="empty-day"></span><span className="empty-day"></span>
                              {mayDays.map((d) => (
                                <button key={d} type="button"
                                  className={`day-btn ${charterDate === d ? 'active-bound' : ''} ${returnDate === d ? 'active-bound' : ''} ${charterDate && returnDate && d > charterDate && d < returnDate ? 'in-range' : ''}`}
                                  onClick={() => handleDayClick(d, 'may')}>{d}</button>
                              ))}
                            </div>
                          </div>
                          <div className="month-block">
                            <h4>June 2026</h4>
                            <div className="calendar-weekdays"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>
                            <div className="calendar-days-grid">
                              <span className="empty-day"></span>
                              {juneDays.map((d) => {
                                const jid = d + 100;
                                return (
                                  <button key={jid} type="button"
                                    className={`day-btn ${charterDate === jid ? 'active-bound' : ''} ${returnDate === jid ? 'active-bound' : ''} ${charterDate && returnDate && jid > charterDate && jid < returnDate ? 'in-range' : ''}`}
                                    onClick={() => handleDayClick(d, 'june')}>{d}</button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Campos de contacto */}
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
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        Phone Number
                      </label>
                      <input type="tel" className="wander-input" placeholder="Enter your phone number" disabled={isSubmitting} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </div>
                    <div className="wander-input-group">
                      <label className="wander-label">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        Special Requests
                      </label>
                      <textarea className="wander-textarea" placeholder="Tell us more about your charter needs..." rows={3} disabled={isSubmitting} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
                    </div>
                  </div>

                  {/* Desglose de precio */}
                  <div className="pricing-breakdown-box">
                    <div className="price-row-item">
                      <span>Base Charter (${basePriceNum} x {totalDays} {totalDays === 1 ? 'day' : 'days'})</span>
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
                    {isSubmitting ? 'Requesting...' : 'Book Charter Availability'}
                  </button>
                </form>

                <p className="lux-reserve-disclaimer">
                  You won&apos;t be charged yet. We&apos;ll review your request and reply with availability and a detailed quote.
                </p>
              </div>

              {/* DETALLES DEL CHARTER */}
              <div className="lux-card">
                <h2 className="lux-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11l19-9-9 19-2-8-8-2z" />
                  </svg>
                  Charter Details
                </h2>
                <div className="lux-pricing-table">
                  {charterDetails.map((row, i) => (
                    <div key={i} className="lux-pricing-row">
                      <span>{row.label}</span>
                      <strong className={row.accent ? 'accent' : ''}>{row.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* TÉRMINOS DEL CHARTER */}
              <div className="lux-card">
                <h2 className="lux-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Charter Terms
                </h2>
                <ul className="lux-rules">
                  <li><strong>Certified Crew:</strong> A licensed captain and professional crew are included in every charter.</li>
                  <li><strong>Security Deposit:</strong> A refundable hold is arranged under verified protocols before departure.</li>
                  <li><strong>Fuel Policy:</strong> Full fuel for the charter duration is covered per the agreement.</li>
                  <li><strong>Safety First:</strong> Life jackets and safety equipment are provided for all guests onboard.</li>
                </ul>
              </div>

            </div>
          </aside>

        </div>
      </div>

      {isGalleryOpen && (
        <ImageGalleryModal images={images} onClose={() => setIsGalleryOpen(false)} initialIndex={galleryInitialIndex} />
      )}

      {yacht && (
        <StructuredData
          type="Product"
          data={{
            "@type": "Product",
            "name": yacht.title,
            "description": yacht.description,
            "image": yacht.img,
            "offers": { "@type": "Offer", "price": yacht.price_full_day?.replace(/[^0-9.]/g, ''), "priceCurrency": "USD" },
          }}
        />
      )}
    </main>
  );
}

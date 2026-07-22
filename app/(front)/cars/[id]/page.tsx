'use client';

import React, { useState, useEffect, use } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import './car-detail.css';
import Link from 'next/link';
import { getCarById, CarDetail } from '../../../lib/api/cars';
import { sendCarBookingRequest } from '../../../lib/api';

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
          <img src={images[currentIndex]} alt={`Vehicle image ${currentIndex + 1}`} />
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

export default function CarDetailPage({ params }: PageProps) {
  const { id } = use(params);

  // Datos y carga
  const [car, setCar] = useState<CarDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Galería
  const [cleanGallery, setCleanGallery] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);

  // Reserva (calendario)
  const [pickUpDate, setPickUpDate] = useState<number | null>(null);
  const [returnDate, setReturnDate] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Contacto
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const insuranceFee = 45;

  useEffect(() => {
    async function fetchCarData() {
      try {
        setIsLoading(true);
        const data = await getCarById(id);
        setCar(data);
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
    fetchCarData();
  }, [id]);

  const mayDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const juneDays = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleDayClick = (day: number, month: 'may' | 'june') => {
    const dayIdentifier = month === 'may' ? day : day + 100;
    if (!pickUpDate || (pickUpDate && returnDate)) {
      setPickUpDate(dayIdentifier);
      setReturnDate(null);
    } else if (pickUpDate && !returnDate) {
      if (dayIdentifier < pickUpDate) {
        setPickUpDate(dayIdentifier);
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
    if (!pickUpDate || !returnDate) return 1;
    return returnDate - pickUpDate;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickUpDate || !returnDate) {
      setStatusMessage({ type: 'error', text: 'Please select a valid Pick-up and Return date.' });
      return;
    }
    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      carId: id,
      carTitle: car?.title || '',
      pickUpDate: formatIdToText(pickUpDate),
      returnDate: formatIdToText(returnDate),
      totalDays: calculateDays(),
      client: { fullName, email, phoneNumber, specialRequests },
    };

    try {
      const response = await sendCarBookingRequest(payload);
      setStatusMessage({ type: 'success', text: response.message || 'Your luxury booking inquiry has been submitted successfully!' });
      setFullName(''); setEmail(''); setPhoneNumber(''); setSpecialRequests('');
      setPickUpDate(null); setReturnDate(null);
    } catch (err) {
      setStatusMessage({ type: 'error', text: (err instanceof Error ? err.message : undefined) || 'Failed to deliver booking request. Please check your data fields.' });
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
      <main className="car-detail-page">
        <div className="detail-container">
          <div className="error-state">
            <h2>Vehicle Not Found</h2>
            <p>The requested asset is unavailable or doesn&apos;t exist.</p>
            <Link href="/cars" className="btn-back-editorial">
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
      <main className="car-detail-page">
        <div className="detail-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading vehicle details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!car) return null;

  const rawPrice = car.price ? parseInt(car.price.replace(/[^0-9]/g, '')) : 199;
  const totalDays = calculateDays();
  const location = 'Miami, Florida, United States';

  const images = cleanGallery.length > 0
    ? cleanGallery
    : [car.img || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'];
  const activeImageUrl = images[currentImageIndex] || images[0];

  // Tarjetas de specs
  const statCards = [
    {
      label: 'Model Year',
      value: String(car.year),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      label: 'Passengers',
      value: '4-5',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Transmission',
      value: 'Auto',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  const trustBadges = [
    { label: 'Verified', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>) },
    { label: 'Five-Star', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>) },
    { label: 'Insured', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>) },
  ];

  const features = [
    { category: 'Performance & Engine', items: ['Powerful V8 configuration', 'High-tier horsepower', 'Optimized transmission', 'Dynamic drive mode'] },
    { category: 'Interior & Comfort', items: ['Premium leather layout', 'Heated seats', 'Ventilated seats', 'Multi-zone climate', 'Spacious cabin'] },
    { category: 'Technology & Audio', items: ['Surround audio', 'Smart infotainment', 'HD backup camera', 'Apple CarPlay', 'Android Auto'] },
    { category: 'Safety & Assistance', items: ['Collision alerts', 'Adaptive ride leveling', 'Smart emergency brakes', 'Anti-theft tracking'] },
  ];

  const vehicleDetails = [
    { label: 'Fuel Type', value: 'Premium Gasoline' },
    { label: 'Category', value: 'Luxury SUV' },
    { label: 'Minimum Rental', value: '1 day' },
    { label: 'Daily Rate', value: `$${rawPrice}`, accent: true },
  ];

  return (
    <main className="car-detail-page">
      <div className="detail-container">

        {/* ENCABEZADO SUPERIOR */}
        <header className="lux-pagehead">
          <div className="lux-headline-text">
            <span className="lux-eyebrow">Luxury Vehicle</span>
            <h1 className="lux-title">{car.title}</h1>
            <p className="lux-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span>{location}</span>
            </p>
          </div>
          <Link href="/cars" className="btn-back-editorial">
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
                  alt={`${car.title} view ${currentImageIndex + 1}`}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'; }}
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
                      <img src={img} alt={`${car.title} thumbnail ${idx + 1}`} />
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
            {car.description && (
              <section className="lux-card">
                <h2 className="lux-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Description
                </h2>
                <div className="lux-body-text">
                  <p>{car.description}</p>
                </div>
              </section>
            )}

            {/* FEATURES (chips) */}
            <section className="lux-card">
              <h2 className="lux-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Vehicle Features
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

              {/* CARD DE RESERVA (formulario del auto) */}
              <div className="lux-reserve-card">
                <span className="lux-eyebrow with-line">Enquire</span>
                <h2 className="lux-reserve-title">Reserve This Vehicle</h2>
                <div className="lux-reserve-trust">
                  <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>Secure</span>
                  <span><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>Five-Star</span>
                  <span>24/7 Support</span>
                </div>

                <div className="lux-reserve-price">
                  <span className="lux-reserve-amount">${rawPrice}</span>
                  <span className="lux-reserve-per">per day</span>
                </div>

                <form onSubmit={handleBookingSubmit} className="lux-form">
                  {statusMessage && (
                    <div className={`lux-form-status ${statusMessage.type}`}>{statusMessage.text}</div>
                  )}

                  {/* Selector de fechas */}
                  <div className="widget-date-picker-box">
                    <div className="date-picker-header" onClick={() => !isSubmitting && setShowDatePicker(!showDatePicker)}>
                      <div className="picker-col">
                        <label>Pick-up Date</label>
                        <span className={pickUpDate ? 'selected-value' : ''}>{formatIdToText(pickUpDate)}</span>
                      </div>
                      <div className="picker-divider"></div>
                      <div className="picker-col">
                        <label>Return Date</label>
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
                                  className={`day-btn ${pickUpDate === d ? 'active-bound' : ''} ${returnDate === d ? 'active-bound' : ''} ${pickUpDate && returnDate && d > pickUpDate && d < returnDate ? 'in-range' : ''}`}
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
                                    className={`day-btn ${pickUpDate === jid ? 'active-bound' : ''} ${returnDate === jid ? 'active-bound' : ''} ${pickUpDate && returnDate && jid > pickUpDate && jid < returnDate ? 'in-range' : ''}`}
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
                      <textarea className="wander-textarea" placeholder="Tell us more about your rental needs..." rows={3} disabled={isSubmitting} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
                    </div>
                  </div>

                  {/* Desglose de precio */}
                  <div className="pricing-breakdown-box">
                    <div className="price-row-item">
                      <span>${rawPrice} x {totalDays} {totalDays === 1 ? 'day' : 'days'}</span>
                      <span>${rawPrice * totalDays}</span>
                    </div>
                    <div className="price-row-item">
                      <span>Premium Fleet Insurance</span>
                      <span>${insuranceFee}</span>
                    </div>
                    <div className="price-row-item total-row">
                      <span>Total before taxes</span>
                      <span>${(rawPrice * totalDays) + insuranceFee}</span>
                    </div>
                  </div>

                  <button type="submit" className="btn-booking-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Requesting...' : 'Request Rental Availability'}
                  </button>
                </form>

                <p className="lux-reserve-disclaimer">
                  You won&apos;t be charged yet. We&apos;ll review your request and reply with availability and a detailed quote.
                </p>
              </div>

              {/* DETALLES DEL VEHÍCULO */}
              <div className="lux-card">
                <h2 className="lux-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 16.5V14a2 2 0 0 0-2-2H4l1.5-4.5A2 2 0 0 1 7.4 6h6.2a2 2 0 0 1 1.9 1.5L17 12" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
                  </svg>
                  Vehicle Details
                </h2>
                <div className="lux-pricing-table">
                  {vehicleDetails.map((row, i) => (
                    <div key={i} className="lux-pricing-row">
                      <span>{row.label}</span>
                      <strong className={row.accent ? 'accent' : ''}>{row.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* TÉRMINOS DE RENTA */}
              <div className="lux-card">
                <h2 className="lux-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Rental Terms
                </h2>
                <ul className="lux-rules">
                  <li><strong>Driver&apos;s License:</strong> A valid, unexpired domestic or international license is mandatory.</li>
                  <li><strong>Security Deposit:</strong> A hold is executed under verified token protocols during hand-off.</li>
                  <li><strong>Fuel Policy:</strong> Return with the same level of premium gasoline provided at delivery.</li>
                  <li><strong>Prohibitions:</strong> No smoking, track racing, or unauthorized additional operators.</li>
                </ul>
              </div>

            </div>
          </aside>

        </div>
      </div>

      {isGalleryOpen && (
        <ImageGalleryModal images={images} onClose={() => setIsGalleryOpen(false)} initialIndex={galleryInitialIndex} />
      )}

      {car && (
        <StructuredData
          type="Vehicle"
          data={{
            "name": car.title,
            "description": car.description,
            "image": car.img,
            "vehicleModelDate": car.year,
            "offers": { "@type": "Offer", "price": car.price, "priceCurrency": "USD" },
          }}
        />
      )}
    </main>
  );
}

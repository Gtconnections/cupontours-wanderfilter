'use client';

import React, { useState, useEffect, use } from 'react';
import './car-detail.css';
import Link from 'next/link';
import { getCarById } from '../../../lib/api/cars'; 
import { sendCarBookingRequest } from '../../../lib/api'; // Importamos el disparador local

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CarDetailPage({ params }: PageProps) {
  const { id } = use(params);

  // Estados de datos y carga de la base de datos[cite: 12]
  const [car, setCar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Estados de control para el envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Arreglo normalizado de strings de imágenes para el carrusel[cite: 12]
  const [cleanGallery, setCleanGallery] = useState<string[]>([]);

  // Estados Interactivos del Widget de Alquiler (Calendario)[cite: 12]
  const [pickUpDate, setPickUpDate] = useState<number | null>(null);
  const [returnDate, setReturnDate] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Estados del Formulario de Contacto Wander Integrado[cite: 12]
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Estado para el control del carrusel de imágenes[cite: 12]
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const insuranceFee = 45;

  // Carga de datos dinámicos desde Django[cite: 12]
  useEffect(() => {
    async function fetchCarData() {
      try {
        setIsLoading(true);
        const data = await getCarById(id);
        setCar(data);
        
        if (data && Array.isArray(data.gallery)) {
          setCleanGallery(data.gallery);
        } else {
          setCleanGallery(data.img ? [data.img] : []);
        }
        
        setCurrentImageIndex(0);
      } catch (err) {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCarData();
  }, [id]);

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

  // Simulación de calendario (Mayo y Junio 2026)[cite: 12]
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
      setStatusMessage({ type: 'error', text: 'Please select a valid Pick-up and Return date parameter.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      carId: id,
      carTitle: car?.title,
      pickUpDate: formatIdToText(pickUpDate),
      returnDate: formatIdToText(returnDate),
      totalDays: calculateDays(),
      client: { fullName, email, phoneNumber, specialRequests }
    };

    try {
      const response = await sendCarBookingRequest(payload);
      setStatusMessage({
        type: 'success',
        text: response.message || "Your luxury booking inquiry has been submitted successfully!"
      });
      setFullName('');
      setEmail('');
      setPhoneNumber('');
      setSpecialRequests('');
      setPickUpDate(null);
      setReturnDate(null);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || "Failed to deliver booking request. Please check your data fields."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="car-detail-page py-20 text-center">
        <h2 className="text-xl font-bold">Vehicle not found</h2>
        <p className="text-gray-400 mt-2">The requested asset is unavailable or doesn't exist.</p>
        <Link href="/cars" className="btn-back-editorial inline-flex mt-6">Go back to fleet</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="car-detail-page py-20 text-center animate-pulse">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ height: '40px', backgroundColor: '#e4e4e7', borderRadius: '6px', width: '40%', marginBottom: '20px' }}></div>
          <div style={{ height: '450px', backgroundColor: '#e4e4e7', borderRadius: '12px', marginBottom: '40px' }}></div>
        </div>
      </div>
    );
  }

  const rawPrice = car.price ? parseInt(car.price.replace(/[^0-9]/g, '')) : 199;
  const totalDays = calculateDays();

  const specs = [
    { label: 'Model Year', value: String(car.year) },
    { label: 'Passengers', value: '4-5 seats' },
    { label: 'Fuel Type', value: 'Premium Gasoline' },
    { label: 'Transmission', value: 'Automatic' },
    { label: 'Minimum Rental', value: '1 day' },
    { label: 'Category', value: 'Luxury SUV' }
  ];

  const features = [
    {
      category: 'Performance & Engine',
      items: ['Powerful V8 configuration', 'High-tier horsepower parameters', 'Optimized transmission control', 'Responsive dynamic drive mode']
    },
    {
      category: 'Interior & Comfort',
      items: ['Premium leather layout', 'Heated configuration controls', 'Ventilated system support', 'Multi-zone climate balance', 'Spacious cabin setup']
    },
    {
      category: 'Technology & Audio',
      items: ['Surround audio architecture', 'Smart infotainment integration', 'HD backup camera system', 'Apple CarPlay & Android Auto ready']
    },
    {
      category: 'Safety & Drivers Assistance',
      items: ['Active collision alert protocols', 'Adaptive ride leveling parameter', 'Smart emergency brakes', 'Anti-theft secure link tracking']
    }
  ];

  const activeImageUrl = cleanGallery[currentImageIndex] || car.img || "";

  return (
    <main className="car-detail-page">
      <div className="detail-container">
        
        {/* ENCABEZADO */}
        <header className="car-detail-header">
          <div className="header-split-row">
            <div className="header-text-side">
              <span className="pre-title">Luxury Car Rental • Premium Service</span>
              <h1 className="massive-heading">{car.title}</h1>
              <p className="car-location-tag">Miami, Florida, United States</p>
            </div>
            <div className="header-action-side">
              <Link href="/cars" className="btn-back-editorial">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                <span>Back Cars</span>
              </Link>
            </div>
          </div>
        </header>

        {/* CAROUSEL */}
        <section className="car-hero-carousel">
          <div className="carousel-main-viewport">
            <img 
              key={`viewport-image-idx-${currentImageIndex}`}
              src={activeImageUrl} 
              alt={`${car.title} View ${currentImageIndex + 1}`} 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80";
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

        <div className="car-content-layout">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="content-left-side">
            <div className="car-quick-specs">
              {specs.map((spec, i) => (
                <div key={i} className="spec-pill">
                  <span className="spec-label">{spec.label}</span>
                  <span className="spec-value">{spec.value}</span>
                </div>
              ))}
            </div>

            <section className="detail-section-block">
              <h2>Description</h2>
              <div className="editorial-text">
                <p>{car.description}</p>
              </div>
            </section>

            <section className="detail-section-block features-master-section">
              <h2>Vehicle Features</h2>
              <div className="features-categories-grid">
                {features.map((cat, i) => (
                  <div key={i} className="feature-category-group">
                    <h3>{cat.category}</h3>
                    <ul className="clean-features-list">
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

            <section className="detail-section-block rental-rules-section">
              <h2>Rental Terms & Conditions</h2>
              <div className="editorial-text rules-box">
                <p>To maintain our fleet standards and ensure an exceptional rental journey, please review the following active parameters:</p>
                <ul>
                  <li><strong>Driver's License:</strong> A valid, unexpired domestic or international driver's license is mandatory.</li>
                  <li><strong>Security Deposit:</strong> A hold parameter will be executed under verified token protocols during hand-off.</li>
                  <li><strong>Fuel Policy:</strong> Return with the same level of premium gasoline provided at delivery.</li>
                  <li><strong>Prohibitions:</strong> Strictly no smoking, track racing, or unauthorized additional operators allowed.</li>
                </ul>
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
                <span className="widget-price"><strong>{car.price?.split(' ')[0] || `$${rawPrice}`}</strong> / day</span>
                <span className="widget-rating">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {car.rating}
                </span>
              </div>

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
                        <div className="calendar-weekdays">
                          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                        </div>
                        <div className="calendar-days-grid">
                          <span className="empty-day"></span><span className="empty-day"></span><span className="empty-day"></span><span className="empty-day"></span><span className="empty-day"></span>
                          {mayDays.map(d => (
                            <button 
                              key={d} 
                              type="button"
                              className={`day-btn ${pickUpDate === d ? 'active-bound' : ''} ${returnDate === d ? 'active-bound' : ''} ${pickUpDate && returnDate && d > pickUpDate && d < returnDate ? 'in-range' : ''}`}
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
                                className={`day-btn ${pickUpDate === id ? 'active-bound' : ''} ${returnDate === id ? 'active-bound' : ''} ${pickUpDate && returnDate && id > pickUpDate && id < returnDate ? 'in-range' : ''}`}
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

                <div className="wander-input-group full-width">
                  <label className="wander-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Special Requests & Additional Information
                  </label>
                  <textarea className="wander-textarea" placeholder="Tell us more about your rental needs..." rows={3} disabled={isSubmitting} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
                </div>
              </div>

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

              <button 
                type="submit" 
                className="btn-booking-primary"
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting ? "Requesting..." : "Request Rental Availability"}
              </button>

              <div className="wander-info-box">
                <div className="info-box-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  What happens next?
                </div>
                <ul className="info-box-list">
                  <li>• We'll review your request within 2 hours</li>
                  <li>• You'll receive a detailed quote with availability</li>
                  <li>• Our team will contact you to finalize details</li>
                </ul>
              </div>
            </form>
          </div>

        </div>

      </div>
    </main>
  );
}
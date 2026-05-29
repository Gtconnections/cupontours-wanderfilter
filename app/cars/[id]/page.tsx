'use client';

import React, { useState } from 'react';
import './car-detail.css';
import Link from 'next/link';

export default function CarDetailPage() {
  // Estados Interactivos del Widget de Alquiler
  const [pickUpDate, setPickUpDate] = useState<number | null>(null);
  const [returnDate, setReturnDate] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // NUEVO: Estado para el control del carrusel de imágenes
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const pricePerDay = 199;
  const insuranceFee = 45;

  // Galería de imágenes para el carrusel (puedes añadir las 24 reales de tu backend)
  const carImages = [
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?auto=format&fit=crop&w=1200&q=80'
  ];

  // Funciones de navegación del carrusel
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === carImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? carImages.length - 1 : prev - 1));
  };

  // Simulación de calendario (Mayo y Junio 2026)
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

  const specs = [
    { label: 'Model Year', value: '2021' },
    { label: 'Passengers', value: '4-5 seats' },
    { label: 'Fuel Type', value: 'Premium Gasoline' },
    { label: 'Transmission', value: 'Automatic' },
    { label: 'Minimum Rental', value: '1 day' },
    { label: 'Category', value: 'Luxury SUV' }
  ];

  const features = [
    {
      category: 'Performance & Engine',
      items: ['6.2-liter V8 engine', '420 horsepower', '460 lb-ft of torque', '10-speed automatic transmission']
    },
    {
      category: 'Interior & Comfort',
      items: ['Leather seats', 'Heated front seats', 'Ventilated front seats', 'Tri-zone automatic climate control', 'Spacious cabin setup']
    },
    {
      category: 'Technology & Audio',
      items: ['Premium Bose audio system', '8-inch infotainment system', 'Rearview camera', 'Apple CarPlay & Android Auto']
    },
    {
      category: 'Safety & Drivers Assistance',
      items: ['Forward collision alert', 'Smooth adaptive ride control', 'Smart braking parameters', 'Anti-theft tracking system']
    }
  ];

  return (
    <main className="car-detail-page">
      <div className="detail-container">
        
        {/* ENCABEZADO CON BOTÓN DE REGRESO A LA DERECHA */}
        <header className="car-detail-header">
        <div className="header-split-row">
            <div className="header-text-side">
            <span className="pre-title">Luxury Car Rental • Premium Service</span>
            <h1 className="massive-heading">2021 Chevrolet Tahoe SRT</h1>
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

        {/* NUEVO: CAROUSEL CINEMÁTICO DE IMÁGENES INTERACTIVO */}
        <section className="car-hero-carousel">
          <div className="carousel-main-viewport">
            <img src={carImages[currentImageIndex]} alt={`Chevrolet Tahoe View ${currentImageIndex + 1}`} />
            
            {/* Controles de Flechas Premium */}
            <button className="carousel-arrow prev" onClick={prevImage} aria-label="Previous image">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button className="carousel-arrow next" onClick={nextImage} aria-label="Next image">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            {/* Contador Fiel a tu Captura (Ej. 1 / 4) */}
            <div className="carousel-counter-badge">
              {currentImageIndex + 1} / {carImages.length}
            </div>
          </div>

          {/* Fila Inferior de Indicadores en Miniatura */}
          <div className="carousel-dots-indicator">
            {carImages.map((_, index) => (
              <span 
                key={index} 
                className={`indicator-dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </section>

        {/* RESTO DE LA ESTRUCTURA INTACTA */}
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
                <p>Looking for a spacious and versatile SUV for your short-term rental needs? Look no further than our 2021 White Tahoe RST. This stylish and capable vehicle combines comfort, technology, and performance to provide an unforgettable driving experience.</p>
                <p>Under the hood, the 2021 White Tahoe RST boasts a powerful 6.2-liter V8 engine, delivering 420 horsepower and 460 lb-ft of torque. It's paired with a 10-speed automatic transmission and rear-wheel drive, providing a smooth and responsive ride. The 2021 White Tahoe RST also features advanced safety and entertainment technologies, including a rearview camera, forward collision alert, and an 8-inch infotainment display.</p>
                <p>Inside, the 2021 White Tahoe RST is designed to provide comfort and convenience, with leather seats, heated and ventilated front seats, and an advanced infotainment system. It also features tri-zone automatic climate control and a premium Bose audio system, ensuring a comfortable and enjoyable ride. Renting our 2021 White Tahoe RST is easy and hassle-free. Simply visit our website and book your dates today.</p>
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
            <div className="booking-sticky-widget">
              <div className="widget-price-row">
                <span className="widget-price"><strong>${pricePerDay}</strong> / day</span>
                <span className="widget-rating">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  5.0
                </span>
              </div>

              <div className="widget-date-picker-box">
                <div className="date-picker-header" onClick={() => setShowDatePicker(!showDatePicker)}>
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

              <div className="pricing-breakdown-box">
                <div className="price-row-item">
                  <span>${pricePerDay} x 3 days</span>
                  <span>${pricePerDay * 3}</span>
                </div>
                <div className="price-row-item">
                  <span>Premium Fleet Insurance</span>
                  <span>${insuranceFee}</span>
                </div>
                <div className="price-row-item total-row">
                  <span>Total before taxes</span>
                  <span>${(pricePerDay * 3) + insuranceFee}</span>
                </div>
              </div>

              <button type="button" className="btn-booking-primary">Request Rental Availability</button>
              <p className="booking-disclaimer">No immediate charges will apply. Availability status is verified by concierge within minutes.</p>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
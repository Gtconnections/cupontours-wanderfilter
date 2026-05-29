'use client';

import React, { useState } from 'react';
import './yacht-detail.css';
import Link from 'next/link';

export default function YachtDetailPage() {
  // Estados Interactivos del Módulo de Reserva
  const [charterDate, setCharterDate] = useState<number | null>(null);
  const [returnDate, setReturnDate] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Control del carrusel de imágenes
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const pricePerDay = 9950;
  const halfDayOption = 8850;
  const crewFee = 500;

  // Galería de imágenes para el carrusel marino
  const yachtImages = [
    'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1616843413587-9e3a37f7f212?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80'
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === yachtImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? yachtImages.length - 1 : prev - 1));
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

  // Especificaciones técnicas del yate (Riel Horizontal)
  const specs = [
    { label: 'Length', value: '110ft' },
    { label: 'Capacity', value: '13 guests' },
    { label: 'Staterooms', value: '4 Cabins' },
    { label: 'Bathrooms', value: '4 Baths' },
    { label: 'Charter Type', value: 'Premium Experience' },
    { label: 'Location', value: 'Miami, FL' }
  ];

  // Características y servicios categorizados (Estilo amenities)
  const infrastructure = [
    {
      category: 'Amenities',
      items: ['Certified Captain', 'Fuel Policy Agreement Included', 'Luxury Saloon Layout', 'Teak Deck Living Area']
    },
    {
      category: "What's Included",
      items: ['Professional crew and captain', 'Full fuel for charter duration', 'Safety equipment and life jackets', 'Complimentary ice and fresh water', 'Sound system and entertainment integration']
    }
  ];

  return (
    <main className="yacht-detail-page">
      <div className="detail-container">
        
        {/* ENCABEZADO CON BOTÓN DE REGRESO A LA DERECHA */}
        <header className="yacht-detail-header">
        <div className="header-split-row">
            <div className="header-text-side">
            <span className="pre-title">Luxury Yacht Charter • Premium Experience</span>
            <h1 className="massive-heading">110′ Horizon</h1>
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

        {/* CAROUSEL INTERACTIVO DE IMÁGENES */}
        <section className="yacht-hero-carousel">
          <div className="carousel-main-viewport">
            <img src={yachtImages[currentImageIndex]} alt={`Yacht Horizon View ${currentImageIndex + 1}`} />
            
            <button className="carousel-arrow prev" onClick={prevImage} aria-label="Previous image">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button className="carousel-arrow next" onClick={nextImage} aria-label="Next image">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            <div className="carousel-counter-badge">
              {currentImageIndex + 1} / {yachtImages.length}
            </div>
          </div>

          <div className="carousel-dots-indicator">
            {yachtImages.map((_, index) => (
              <span 
                key={index} 
                className={`indicator-dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
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

            {/* Acerca del Yate */}
            <section className="detail-section-block">
              <h2>About This Yacht</h2>
              <div className="editorial-text">
                <p>Experience the ultimate luxury on Miami's pristine waters aboard this magnificent 110ft yacht. Designed for comfort and elegance, this vessel accommodates up to 13 guests across 4 beautifully appointed staterooms and 4 full bathrooms.</p>
                <p>Whether you're planning an intimate gathering, a family celebration, or a corporate event, this yacht provides the perfect setting. With its modern amenities and professional service, every moment aboard becomes a treasured memory.</p>
              </div>
            </section>

            {/* Amenities y Características Especiales */}
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

          {/* COLUMNA DERECHA: WIDGET DE RESERVA FIJO */}
          <div className="content-right-side">
            <div className="booking-sticky-widget">
              <div className="widget-price-row">
                <div className="price-container">
                  <span className="widget-price"><strong>${pricePerDay}</strong> / full day</span>
                  <span className="widget-subprice">Half day option: ${halfDayOption}</span>
                </div>
                <span className="widget-rating">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  5.0
                </span>
              </div>

              {/* Selector de Fechas */}
              <div className="widget-date-picker-box">
                <div className="date-picker-header" onClick={() => setShowDatePicker(!showDatePicker)}>
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

                {/* Calendario Flotante de Doble Mes */}
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

              {/* Desglose Matemático de Tarifas Marítimas */}
              <div className="pricing-breakdown-box">
                <div className="price-row-item">
                  <span>Base Yacht Charter Fee</span>
                  <span>${pricePerDay}</span>
                </div>
                <div className="price-row-item">
                  <span>Professional Crew Service</span>
                  <span>${crewFee}</span>
                </div>
                <div className="price-row-item total-row">
                  <span>Total Charter Price</span>
                  <span>${pricePerDay + crewFee}</span>
                </div>
              </div>

              <button type="button" className="btn-booking-primary">Book Charter Availability</button>
              <p className="booking-disclaimer">No charges applied immediately. Custom itineraries and docking details will be arranged by your concierge agent.</p>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
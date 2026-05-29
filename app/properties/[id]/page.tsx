'use client';

import React, { useState } from 'react';
import './property-detail.css';
import Link from 'next/link';

export default function PropertyDetailPage() {
  // Estados de Reserva Interactivos
  const [checkIn, setCheckIn] = useState<number | null>(null);
  const [checkOut, setCheckOut] = useState<number | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showGuestDropdown, setShowGuestDropdown] = useState<boolean>(false);

  const pricePerNight = 250;
  const cleaningFee = 120;
  const maxGuests = 6;

  // Días para renderizar Mayo y Junio 2026
  const mayDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const juneDays = Array.from({ length: 30 }, (_, i) => i + 1);

  // MANEJADORES DE HUÉSPEDES (Solución al Runtime Error)
  const incrementGuests = () => {
    if (guests < maxGuests) setGuests(guests + 1);
  };

  const decrementGuests = () => {
    if (guests > 1) setGuests(guests - 1);
  };

  const handleDayClick = (day: number, month: 'may' | 'june') => {
    const dayIdentifier = month === 'may' ? day : day + 100;
    
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dayIdentifier);
      setCheckOut(null);
    } else if (checkIn && !checkOut) {
      if (dayIdentifier < checkIn) {
        setCheckIn(dayIdentifier);
      } else {
        setCheckOut(dayIdentifier);
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

  // DATA DE ESPECIFICACIONES FIEL A LA CAPTURA
  const specs = [
    { label: 'Guests', value: `${maxGuests} Guests` },
    { label: 'Bedrooms', value: '2 Bedrooms' },
    { label: 'Beds', value: '3 Beds' },
    { label: 'Bathrooms', value: '3 Bathrooms' },
    { label: 'Minimum Stay', value: '1 nights' },
    { label: 'Cancellation Policy', value: 'Flexible' }
  ];

  // AMENITIES EXTRACTA DEL BACKEND DE TU CAPTURA
  const amenityCategories = [
    {
      category: 'Bathroom',
      items: ['Hot water']
    },
    {
      category: 'Bedroom and laundry',
      items: ['Air conditioning', 'Bedding', 'Suitable for children']
    },
    {
      category: 'General Entries',
      items: ['Kitchen', 'Toaster', 'Microwave', 'Dishwasher', 'Oven', 'Stove', 'Refrigerator', 'Kitchen utensils', 'Coffee maker']
    },
    {
      category: 'Bedroom and laundry',
      items: ['Washing Machine', 'Dryer', 'Hangers', 'Iron']
    },
    {
      category: 'Wellness',
      items: ['Bed sheets', 'Hairdryer', 'Safe', 'First aid kit']
    },
    {
      category: 'Entertainment',
      items: ['Cable Channels']
    },
    {
      category: 'Other',
      items: ['Wi-Fi', 'Smoke and Carbon alarm', 'Coffee and Tea Pack', 'Magazines and Books', 'Private Entrance', 'Heating', 'Room Darkening Shades', 'Long Term Stays Allowed', 'Ironing Products', 'Covered Garage', 'Freezer', 'Wine Glasses']
    },
    {
      category: 'Entertainment',
      items: ['TV']
    },
    {
      category: 'Park and Position',
      items: ['Free Parking']
    },
    {
      category: 'Rooms',
      items: ['Living', 'Bed Room', 'Bath Room']
    }
  ];

  return (
    <main className="property-detail-page">
      <div className="detail-container">
        
        {/* ENCABEZADO CON BOTÓN DE REGRESO A LA DERECHA */}
        <header className="property-detail-header">
          <div className="header-split-row">
            <div className="header-text-side">
              <span className="pre-title">Exclusive Stay</span>
              <h1 className="massive-heading">"Wonderful 6ppl Apt 5 min walking Design District"</h1>
              <p className="property-location-tag">Miami, Florida, United States</p>
            </div>
            <div className="header-action-side">
              <Link href="/properties" className="btn-back-editorial">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                <span>Back Properties</span>
              </Link>
            </div>
          </div>
        </header>

        {/* GALERÍA ASIMÉTRICA */}
        <section className="property-gallery-grid">
          <div className="gallery-main-img">
            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80" alt="Main estate view" />
          </div>
          <div className="gallery-side-imgs">
            <img src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=500&q=80" alt="Interior view 1" />
            <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=500&q=80" alt="Interior view 2" />
          </div>
        </section>

        {/* ESTRUCTURA DE CONTENIDO CO-LINEAL */}
        <div className="property-content-layout">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="content-left-side">
            
            {/* Riel de Especificaciones Actualizado con Beds, Min Stay y Cancellation */}
            <div className="property-quick-specs">
              {specs.map((spec, i) => (
                <div key={i} className="spec-pill">
                  <span className="spec-label">{spec.label}</span>
                  <span className="spec-value">{spec.value}</span>
                </div>
              ))}
            </div>

            {/* About Section */}
            <section className="detail-section-block">
              <h2>About this place</h2>
              <div className="editorial-text">
                <p>Welcome to our beautifully curated multi-family property located in the heart of Miami’s prestigious Design District. This modern apartment offers the perfect balance between architectural space and hotel-grade luxury hospitality.</p>
                <p>Ideal for families or business groups, the unit features a wide open-concept living room layout, premium bedding setups, high-definition smart technology integrations, and robust connectivity parameters.</p>
              </div>
            </section>

            {/* SECCIÓN DE AMENITIES COMPLETA SEGÚN LA CAPTURA RESTRUCTURADA */}
            <section className="detail-section-block amenities-master-section">
              <h2>Amenities</h2>
              <div className="amenities-categories-grid">
                {amenityCategories.map((cat, i) => (
                  <div key={i} className="amenity-category-group">
                    <h3>{cat.category}</h3>
                    <ul className="clean-amenities-list">
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

            {/* SECCIÓN DE NORMAS DE LA CASA (HOUSE RULES) */}
            <section className="detail-section-block house-rules-section">
              <h2>House Rules</h2>
              <div className="editorial-text rules-box">
                <p>Welcome to our luxury property! To ensure a seamless stay, please strictly review our hospitality guidelines:</p>
                <ul>
                  <li><strong>Check-in:</strong> After 4:00 PM. <strong>Check-out:</strong> Before 11:00 AM.</li>
                  <li>No parties, external commercial gatherings, or unverified guests permitted on premises.</li>
                  <li>Please respect quiet hours from 10:00 PM to 8:00 AM out of courtesy for the neighborhood.</li>
                  <li>Any damages, broken amenities, or key losses must be reported immediately to logistics.</li>
                </ul>
              </div>
            </section>

          </div>

          {/* COLUMNA DERECHA: WIDGET DE RESERVA INTEGRAL */}
          <div className="content-right-side">
            <div className="booking-sticky-widget">
              <div className="widget-price-row">
                <span className="widget-price"><strong>${pricePerNight}</strong> / night</span>
                <span className="widget-rating">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  4.9
                </span>
              </div>

              <div className="widget-date-picker-box">
                {/* Cabezal de Fechas */}
                <div className="date-picker-header" onClick={() => { setShowDatePicker(!showDatePicker); setShowGuestDropdown(false); }}>
                  <div className="picker-col">
                    <label>Check-in</label>
                    <span className={checkIn ? 'selected-value' : ''}>{formatIdToText(checkIn)}</span>
                  </div>
                  <div className="picker-divider"></div>
                  <div className="picker-col">
                    <label>Check-out</label>
                    <span className={checkOut ? 'selected-value' : ''}>{formatIdToText(checkOut)}</span>
                  </div>
                </div>

                {/* Fila Huéspedes Protegida contra traslapes */}
                <div className="guests-picker-row" onClick={() => { setShowGuestDropdown(!showGuestDropdown); setShowDatePicker(false); }}>
                  <div className="guests-text-container">
                    <label>Guests</label>
                    <span className="selected-value">{guests} {guests === 1 ? 'guest' : 'guests'}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={showGuestDropdown ? 'rotate-icon' : ''}><polyline points="6 9 12 15 18 9"/></svg>
                </div>

                {/* CALENDARIO ESTILO TOP BAR */}
                {showDatePicker && (
                  <div className="editorial-calendar-popup">
                    <div className="calendar-months-container">
                      
                      {/* Mayo 2026 */}
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
                              className={`day-btn ${checkIn === d ? 'active-bound' : ''} ${checkOut === d ? 'active-bound' : ''} ${checkIn && checkOut && d > checkIn && d < checkOut ? 'in-range' : ''}`}
                              onClick={() => handleDayClick(d, 'may')}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Junio 2026 */}
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
                                className={`day-btn ${checkIn === id ? 'active-bound' : ''} ${checkOut === id ? 'active-bound' : ''} ${checkIn && checkOut && id > checkIn && id < checkOut ? 'in-range' : ''}`}
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

                {/* DROPDOWN DE PASAJEROS */}
                {showGuestDropdown && (
                  <div className="editorial-guests-dropdown">
                    <div className="guest-control-row">
                      <div className="guest-label-side">
                        <span className="main-label">Number of Guests</span>
                        <span className="sub-label">Max. {maxGuests} persons</span>
                      </div>
                      <div className="guest-counter-side">
                        <button type="button" onClick={decrementGuests} disabled={guests <= 1}>−</button>
                        <span className="count-num">{guests}</span>
                        <button type="button" onClick={incrementGuests} disabled={guests >= maxGuests}>+</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tarifas */}
              <div className="pricing-breakdown-box">
                <div className="price-row-item">
                  <span>${pricePerNight} x 2 nights</span>
                  <span>${pricePerNight * 2}</span>
                </div>
                <div className="price-row-item">
                  <span>Cleaning Fee</span>
                  <span>${cleaningFee}</span>
                </div>
                <div className="price-row-item total-row">
                  <span>Total before taxes</span>
                  <span>${(pricePerNight * 2) + cleaningFee}</span>
                </div>
              </div>

              <button type="button" className="btn-booking-primary">Reserve Stay</button>
              <p className="booking-disclaimer">You won't be charged yet. Payouts processed under verified token parameters.</p>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
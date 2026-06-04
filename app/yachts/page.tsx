import React from 'react';
import './yachts.css';
import Link from 'next/link';

interface Yacht {
  id: number;
  title: string;
  location: string;
  duration: string;
  guests: string;
  cabins: string;
  price: string;
  rating: string;
  img: string;
}

export default function YachtsPage() {
  // Catálogo con la información exacta de la distribución de tu captura
  const fleet: Yacht[] = [
    { id: 1, title: '110′ Rivamare Estate', location: 'Miami, FL', duration: '4h - 8h', guests: '12 guests', cabins: '3 cabins', price: '$9,850', rating: '5.0', img: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80' },
    { id: 2, title: '84′ Flybridge Luxury', location: 'Miami, FL', duration: '4h - 8h', guests: '12 guests', cabins: '4 cabins', price: '$4,890', rating: '4.9', img: 'https://images.unsplash.com/photo-1616843413587-9e3a37f7f212?auto=format&fit=crop&w=600&q=80' },
    { id: 3, title: '103′ Sanlorenzo Yacht', location: 'Miami, FL', duration: '4h - 8h', guests: '10 guests', cabins: '5 cabins', price: '$8,250', rating: '5.0', img: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80' },
    { id: 4, title: '50′ Azimut Atlantis', location: 'Miami, FL', duration: '4h', guests: '12 guests', cabins: '2 cabins', price: '$1,500', rating: '4.8', img: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80' },
    { id: 5, title: '100′ Azimut Wide', location: 'Miami, FL', duration: '4h - 8h', guests: '12 guests', cabins: '4 cabins', price: '$8,500', rating: '4.9', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80' },
    { id: 6, title: '80′ Numarine Lounge', location: 'Miami, FL', duration: '4h - 8h', guests: '12 guests', cabins: '3 cabins', price: '$6,250', rating: '4.7', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80' },
    { id: 7, title: '105′ Leopard Speed', location: 'Miami, FL', duration: '4h', guests: '12 guests', cabins: '4 cabins', price: '$12,900', rating: '5.0', img: 'https://images.unsplash.com/photo-1505080851793-4091a3542243?auto=format&fit=crop&w=600&q=80' },
    { id: 8, title: '116′ Custom Mega Yacht', location: 'Miami, FL', duration: '4h - 8h', guests: '20 guests', cabins: '6 cabins', price: '$16,500', rating: '5.0', img: 'https://images.unsplash.com/photo-1621259182978-f09e5e2aa091?auto=format&fit=crop&w=600&q=80' }
  ];

  return (
    <main className="marine-page-container">
      {/* 1. HERO INMERSIVO */}
      <section className="marine-hero">
        <div className="marine-hero-overlay"></div>
        <div className="marine-hero-content">
          <span className="marine-badge">Elite Charters</span>
          <h1 className="marine-title">Luxury Yacht Charters in Miami</h1>
          <p className="marine-subtitle">Set sail on the crystal-clear waters of Miami with our exclusive fleet of luxury yachts. From private sailing experiences to grand oceanic tours, discover the perfect vessel for your aquatic adventure.</p>
        </div>
      </section>

      {/* 2. CONTENEDOR EDITORIAL */}
      <section className="marine-listings-section">
        
        <div className="marine-editorial-header">
          <span className="pre-title">The Fleet</span>
          <h2>Choose Your Dream Yacht</h2>
          <p>Explore our exclusive collection of mega yachts and luxury boats. From intimate catamaran excursions to grand customized charters, we offer the perfect vessel for every occasion.</p>
        </div>

        <div className="marine-meta-row">
          <span className="marine-count">Vessels docked: <strong>{fleet.length}</strong></span>
          <div className="marine-sort">
            <button className="btn-sort-selector">
              <span>Length: All Tiers</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        </div>

        {/* GRID COMPLETADO CON MICRO-ESPECIFICACIONES */}
        <div className="marine-grid">
          {fleet.map((yacht) => (
            <Link href={`/yachts/${yacht.id}`} key={yacht.id} className="link-dinamic">
              <div className="marine-card">
                <div className="marine-image-box">
                  <img src={yacht.img} alt={yacht.title} loading="lazy" />
                  <button className="marine-heart-btn" aria-label="Save yacht">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                </div>
                
                <div className="marine-info-box">
                  <div className="marine-location-row">
                    <span className="location-text">{yacht.location}</span>
                  </div>
                  <h4 className="marine-yacht-title">{yacht.title}</h4>
                  
                  {/* REINTEGRADO: Fila de especificaciones técnicas precisas con iconos limpios */}
                  <div className="marine-technical-specs">
                    <div className="spec-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      <span>{yacht.duration}</span>
                    </div>
                    <div className="spec-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path></svg>
                      <span>{yacht.guests}</span>
                    </div>
                    <div className="spec-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                      <span>{yacht.cabins}</span>
                    </div>
                  </div>
                  
                  <div className="marine-price-row">
                    <span className="price-text"><strong>{yacht.price}</strong> / day</span>
                    <span className="rating-text">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {yacht.rating}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="marine-pagination-container">
          <button className="btn-load-more">View All Vessels</button>
        </div>
      </section>

    </main>
  );
}
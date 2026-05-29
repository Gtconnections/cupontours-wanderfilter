import React from 'react';
import './properties.css';
import Link from 'next/link';

interface Property {
  id: number;
  title: string;
  location: string;
  specs: string;
  price: string;
  rating: string;
  img: string;
}

export default function PropertiesPage() {
  const allProperties: Property[] = [
    { id: 1, title: 'Wander Joshua Tree Elysium', location: 'California, USA', specs: '4 bedrooms • 4.5 baths', price: '$1,354', rating: '4.9', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80' },
    { id: 2, title: 'Modern Beachfront Villa', location: 'Miami Beach, FL', specs: '5 bedrooms • 5.5 baths', price: '$2,100', rating: '5.0', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80' },
    { id: 3, title: 'Wander Friday Harbor', location: 'Washington, USA', specs: '2 bedrooms • 2 baths', price: '$1,530', rating: '4.8', img: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80' },
    { id: 4, title: 'Home in Lake Harmony', location: 'Pennsylvania, USA', specs: '4 bedrooms • 3 baths', price: '$617', rating: 'New', img: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=600&q=80' },
    { id: 5, title: 'Wander Cuttyhunk Waterfront', location: 'Massachusetts, USA', specs: '4 bedrooms • 2.5 baths', price: '$1,321', rating: '4.9', img: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=600&q=80' },
    { id: 6, title: 'Wander Palm Springs Haven', location: 'California, USA', specs: '3 bedrooms • 2 baths', price: '$1,107', rating: '4.7', img: 'https://images.unsplash.com/photo-1505843513577-22bb7abd2638?auto=format&fit=crop&w=600&q=80' },
    { id: 7, title: 'Luxury Penthouse Brickell', location: 'Miami, FL', specs: '2 bedrooms • 2.5 baths', price: '$620', rating: '4.8', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80' },
    { id: 8, title: 'Coastal Villa Florida Keys', location: 'Key West, FL', specs: '3 bedrooms • 3 baths', price: '$850', rating: '5.0', img: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80' }
  ];

  return (
    <main className="catalog-page-container">
      
      {/* 1. HERO CON TEXTO FIEL A TU CAPTURA */}
      <section className="catalog-hero">
        <div className="catalog-hero-overlay"></div>
        <div className="catalog-hero-content">
          <span className="catalog-badge">Premium Collection</span>
          <h1 className="catalog-title">Luxury Properties for Rent</h1>
          <p className="catalog-subtitle">Discover amazing deals on luxury properties, cars, and yachts around the world. Your ultimate ecosystem for premium getaways.</p>
        </div>
      </section>

      {/* 2. SECCIÓN DE LISTADOS (Con título y subtítulo reubicados) */}
      <section className="catalog-listings-section">
        
        {/* REUBICADO AQUÍ: Título y subtítulo elegantes introductorios */}
        <div className="listings-editorial-header">
          <span className="pre-title">The Collection</span>
          <h2>Find Your Perfect Place</h2>
          <p>Explore our complete portfolio of institutionally managed luxury homes, crafted for exceptional stays.</p>
        </div>

        <div className="catalog-meta-row">
          <span className="properties-count">Showing <strong>{allProperties.length}</strong> extraordinary spaces</span>
          <div className="catalog-sort-filter">
            <button className="btn-filter-selector">
              <span>Sort by: Featured</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        </div>

        {/* GRID DE 4 COLUMNAS */}
        <div className="catalog-grid">
          {allProperties.map((prop) => (
            <Link href={`/properties/${prop.id}`} key={prop.id} className="link-dinamic">
              <div className="catalog-card">
                <div className="catalog-image-box">
                  <img src={prop.img} alt={prop.title} loading="lazy" />
                  <button className="catalog-heart-btn" aria-label="Save to wishlist">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                </div>
                
                <div className="catalog-info-box">
                  <div className="catalog-location-row">
                    <span className="location-text">{prop.location}</span>
                  </div>
                  <h4 className="catalog-prop-title">{prop.title}</h4>
                  <p className="catalog-prop-specs">{prop.specs}</p>
                  
                  <div className="catalog-price-row">
                    <span className="price-text"><strong>{prop.price}</strong> / night</span>
                    <span className="rating-text">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {prop.rating}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="catalog-pagination-container">
          <button className="btn-load-more">Load more properties</button>
        </div>
      </section>

    </main>
  );
}
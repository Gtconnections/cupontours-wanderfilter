import React from 'react';
import './cars.css';
import Link from 'next/link';

interface Car {
  id: number;
  title: string;
  location: string;
  specs: string;
  price: string;
  rating: string;
  img: string;
}

export default function CarsPage() {
  // Catálogo optimizado basado en tu flota original de la captura
  const fleet: Car[] = [
    { id: 1, title: '2021 Chevrolet Tahoe RST', location: 'Miami, FL', specs: '7 Seats • Automatic • Gasoline', price: '$199', rating: '5.0', img: 'https://images.unsplash.com/photo-1695662051263-fb5eb834372c?auto=format&fit=crop&w=600&q=80' },
    { id: 2, title: '2022 Maserati Levante', location: 'Miami, FL', specs: '5 Seats • Automatic • Turbo', price: '$189', rating: '4.9', img: 'https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?auto=format&fit=crop&w=600&q=80' },
    { id: 3, title: '2022 Tesla Model X Plaid', location: 'Miami, FL', specs: '6 Seats • Electric • AWD', price: '$220', rating: '5.0', img: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80' },
    { id: 4, title: '2021 Toyota Supra', location: 'Miami, FL', specs: '2 Seats • Automatic • Sport', price: '$159', rating: '4.8', img: 'https://images.unsplash.com/photo-1617469167446-80e3a446ff35?auto=format&fit=crop&w=600&q=80' },
    { id: 5, title: '2019 Alfa Romeo 4C', location: 'Miami, FL', specs: '2 Seats • Automatic • Turbo', price: '$179', rating: '4.7', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80' },
    { id: 6, title: '2019 Porsche Macan', location: 'Miami, FL', specs: '5 Seats • Automatic • Luxury SUV', price: '$139', rating: '4.9', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80' },
    { id: 7, title: '2021 BMW M4 Competition', location: 'Miami, FL', specs: '4 Seats • Automatic • Performance', price: '$249', rating: '5.0', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80' },
    { id: 8, title: '2021 Mercedes-Benz C-Class', location: 'Miami, FL', specs: '5 Seats • Automatic • Sedan', price: '$137', rating: '4.8', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80' }
  ];

  return (
    <main className="fleet-page-container">
      
      {/* 1. HERO CON TEXTO FIEL A TU CAPTURA */}
      <section className="fleet-hero">
        <div className="fleet-hero-overlay"></div>
        <div className="fleet-hero-content">
          <span className="fleet-badge">Premium Fleet</span>
          <h1 className="fleet-title">Luxury Car Rentals in Miami</h1>
          <p className="fleet-subtitle">Discover our premium fleet of luxury vehicles. From elegant sedans to massive SUVs and exotic sports cars, find the perfect match to experience the city in style.</p>
        </div>
      </section>

      {/* 2. CONTENEDOR DEL CATÁLOGO DE AUTOS */}
      <section className="fleet-listings-section">
        
        {/* Cabecera Editorial */}
        <div className="fleet-editorial-header">
          <span className="pre-title">The Collection</span>
          <h2>Premium Car Rentals</h2>
          <p>Explore our curated selection of high-performance vehicles, meticulously maintained and ready to elevate your driving experience.</p>
        </div>

        <div className="fleet-meta-row">
          <span className="fleet-count">Available vehicles: <strong>{fleet.length}</strong></span>
          <div className="fleet-sort">
            <button className="btn-sort-selector">
              <span>Filter by Class: All</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        </div>

        {/* GRID DE 4 COLUMNAS CONCISO */}
        <div className="fleet-grid">
          {fleet.map((car) => (
            <Link href={`/cars/${car.id}`} key={car.id} className="link-dinamic">
              <div className="fleet-card">
                <div className="fleet-image-box">
                  <img src={car.img} alt={car.title} loading="lazy" />
                  <button className="fleet-heart-btn" aria-label="Save vehicle">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                </div>
                
                <div className="fleet-info-box">
                  <div className="fleet-location-row">
                    <span className="location-text">{car.location}</span>
                  </div>
                  <h4 className="fleet-car-title">{car.title}</h4>
                  <p className="fleet-car-specs">{car.specs}</p>
                  
                  <div className="fleet-price-row">
                    <span className="price-text"><strong>{car.price}</strong> / day</span>
                    <span className="rating-text">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {car.rating}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="fleet-pagination-container">
          <button className="btn-load-more">View All Cars</button>
        </div>
      </section>

    </main>
  );
}
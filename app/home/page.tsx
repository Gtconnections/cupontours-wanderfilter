"use client";

import React, { useState, useEffect } from 'react';
import { getCatalogItems, CatalogItem } from '../lib/api'; // Ajusta la ruta relativa si es necesario
import './home.css';

interface RenderRowProps {
  title: string;
  pretitle: string;
  data: CatalogItem[];
  type: 'home' | 'car' | 'yacht';
  isLoading: boolean;
}

export default function HomePage() {
  const [homes, setHomes] = useState<CatalogItem[]>([]);
  const [cars, setCars] = useState<CatalogItem[]>([]);
  const [yachts, setYachts] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      // Ejecutamos las tres llamadas asíncronas en paralelo para máxima velocidad
      const [homesData, carsData, yachtsData] = await Promise.all([
        getCatalogItems('home'),
        getCatalogItems('car'),
        getCatalogItems('yacht')
      ]);

      setHomes(homesData.slice(0, 4));  // Limitamos a 4 items por fila como tu diseño original
      setCars(carsData.slice(0, 4));
      setYachts(yachtsData.slice(0, 4));
      setIsLoading(false);
    }

    loadData();
  }, []);

  const RenderRow = ({ title, pretitle, data, type, isLoading }: RenderRowProps) => (
    <section className="home-row-section">
      <div className="row-header">
        <div className="row-title-area">
          <span className="row-pretitle">{pretitle}</span>
          <h3>{title}</h3>
        </div>
        <div className="carousel-nav">
          <button aria-label="Previous" type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></button>
          <button aria-label="Next" type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></button>
        </div>
      </div>
      
      <div className="property-carousel">
        {isLoading ? (
          // Skeletons de carga elegantes para mantener la estructura mientras llegan los datos
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="prop-card animate-pulse" style={{ opacity: 0.5 }}>
              <div className={`prop-image-container ${type === 'car' ? 'car-ratio' : type === 'yacht' ? 'yacht-ratio' : ''}`} style={{ backgroundColor: '#e4e4e7', height: '200px' }}></div>
              <div style={{ height: '16px', backgroundColor: '#e4e4e7', marginTop: '12px', borderRadius: '4px', width: '80%' }}></div>
              <div style={{ height: '12px', backgroundColor: '#e4e4e7', marginTop: '8px', borderRadius: '4px', width: '50%' }}></div>
            </div>
          ))
        ) : (
          data.map((item) => (
            <div key={item.id} className="prop-card">
              <div className={`prop-image-container ${type === 'car' ? 'car-ratio' : type === 'yacht' ? 'yacht-ratio' : ''}`}>
                <img src={item.img} alt={item.title} />
                <button className="heart-btn" aria-label="Save" type="button">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="prop-info">
                <div className="prop-title-row">
                  <h4>{item.title}</h4>
                </div>
                <p className="prop-specs">{item.specs}</p>
                <div className="prop-price-row">
                  <span className="price">{item.price}</span>
                  <span className="rating">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {item.rating}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );

  return (
    <main className="home-page-container">
      
      {/* 1. CINEMATIC HERO */}
      <section className="home-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">Luxury Vacation Rentals, Cars & Yachts</div>
          <h1 className="hero-title">Experience the world<br />in absolute style.</h1>
          <p className="hero-subtitle">Handcrafted experiences combining institutional-grade real estate assets, exotic car rentals, and elite yacht charters.</p>
        </div>
      </section>

      {/* 2. CATEGORIES FILTER PILLS BAR */}
      <section className="categories-filter-section">
        <div className="filter-wrapper">
          <button className="filter-pill active" type="button">All Collections</button>
          <button className="filter-pill" type="button">Vacation Homes</button>
          <button className="filter-pill" type="button">Premium Fleet</button>
          <button className="filter-pill" type="button">Yacht Charters</button>
        </div>
      </section>

      {/* 3. EXPERIENCES SECTIONS */}
      <div className="home-listings-container">
        <RenderRow 
          pretitle="Curation" 
          title="Enjoy your stay inside one of our properties" 
          data={homes} 
          type="home"
          isLoading={isLoading} 
        />
        
        {/* INTERMEDIATE BANNER 1 */}
        <div className="mid-banner banner-cars">
          <div className="mid-banner-overlay"></div>
          <div className="mid-banner-content">
            <h2>Drive in Style Through Miami</h2>
            <p>Access our premium fleet of SUVs, electric models, and sportscars tailored for your trip.</p>
          </div>
        </div>

        <RenderRow 
          pretitle="The Premium Fleet" 
          title="Exceptional cars for ultimate performance" 
          data={cars} 
          type="car"
          isLoading={isLoading} 
        />

        {/* INTERMEDIATE BANNER 2 */}
        <div className="mid-banner banner-yachts">
          <div className="mid-banner-overlay"></div>
          <div className="mid-banner-content">
            <h2>Set Sail On Your Next Adventure</h2>
            <p>From private day charters to custom multi-cabin mega yachts on coastal waters.</p>
          </div>
        </div>

        <RenderRow 
          pretitle="Yacht Charter Collection" 
          title="Elegance on water, designed for luxury" 
          data={yachts} 
          type="yacht"
          isLoading={isLoading} 
        />
      </div>

      {/* 4. PLATFORMS DISTRIBUTION MARQUEE */}
      <section className="platforms-marquee-section">
        <div className="marquee-wrapper">
          <span className="marquee-title">Platforms & Partnerships</span>
          <div className="marquee-row">
            <span>Airbnb</span>
            <span>Vrbo</span>
            <span>Booking.com</span>
            <span>Tripadvisor</span>
            <span>Turo</span>
            <span>BNB Flow</span>
            <span>PriceLabs</span>
          </div>
        </div>
      </section>

    </main>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import './home.css';

// IMPORTS MODULARES
import { getProperties } from '../lib/api/properties';
import { getCars } from '../lib/api/cars';
import { getYachts } from '../lib/api/yachts';

interface RenderRowProps {
  title: string;
  pretitle: string;
  data: any[]; // Usamos any[] temporalmente para leer cualquier campo de tu BD sin romper tipado
  type: 'home' | 'car' | 'yacht';
  isLoading: boolean;
}

export default function HomePage() {
  const [homes, setHomes] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [yachts, setYachts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        
        // Ejecutamos las llamadas en paralelo hacia tu API de Django
        const [homesData, carsData, yachtsData] = await Promise.all([
          getProperties(),
          getCars(),
          getYachts()
        ]);

        setHomes(homesData.slice(0, 4));
        setCars(carsData.slice(0, 4));
        setYachts(yachtsData.slice(0, 4));
      } catch (error) {
        console.error("Error cargando los datos en el Home:", error);
      } finally {
        setIsLoading(false);
      }
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
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="prop-card animate-pulse" style={{ opacity: 0.5 }}>
              <div className={`prop-image-container ${type === 'car' ? 'car-ratio' : type === 'yacht' ? 'yacht-ratio' : ''}`} style={{ backgroundColor: '#e4e4e7', height: '200px' }}></div>
              <div style={{ height: '16px', backgroundColor: '#e4e4e7', marginTop: '12px', borderRadius: '4px', width: '80%' }}></div>
              <div style={{ height: '12px', backgroundColor: '#e4e4e7', marginTop: '8px', borderRadius: '4px', width: '50%' }}></div>
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="w-full text-center py-8 text-gray-400 text-sm">
            No items available in this collection
          </div>
        ) : (
          data.map((item) => {
            // MAPEO DINÁMICO EN CALIENTE: Evaluamos cómo vienen los datos de tu BD
            const id = item.id || item._id || Math.random();
            
            // Títulos: Soporta tanto 'title' como 'name' o 'brand' + 'model'
            const displayTitle = item.title || item.name || 
              (item.brand ? `${item.brand} ${item.model || ''}` : "Exclusive Asset");

            // Especificaciones: Leemos los campos nativos de autos y yates de tu Django
            let displaySpecs = item.specs || "";
            if (!displaySpecs) {
              if (type === 'home') {
                displaySpecs = `${item.bedrooms || 0} bedrooms • ${item.bathrooms || 0} baths`;
              } else if (type === 'car') {
                displaySpecs = `${item.transmission || item.gearbox || 'Automatic'} • ${item.fuel_type || item.engine || 'Gasoline'}`;
              } else if (type === 'yacht') {
                displaySpecs = `${item.length || item.feet || '60'}ft • ${item.guests || item.capacity || 12} Guests`;
              }
            }

            // Precios: Extrae el monto de un objeto o un número directo
            let displayPrice = item.price;
            if (typeof displayPrice === 'object' && displayPrice !== null) {
              displayPrice = `${displayPrice.currency || '$'}${displayPrice.amount || 0} / day`;
            } else if (displayPrice) {
              displayPrice = String(displayPrice).includes('$') ? displayPrice : `$${displayPrice} / day`;
            } else {
              displayPrice = "$250 / day";
            }

            // Imágenes: Si el fetch modular te devolvió el fallback, buscamos directo en el objeto de la BD
            const displayImg = item.img && !item.img.includes("unsplash.com/photo-161416") && !item.img.includes("unsplash.com/photo-156789")
              ? item.img 
              : (item.images?.[0] || item.image || item.main_image || item.img);

            const displayRating = item.rating ? String(item.rating) : "5.0";

            return (
              <div key={id} className="prop-card">
                <div className={`prop-image-container ${type === 'car' ? 'car-ratio' : type === 'yacht' ? 'yacht-ratio' : ''}`}>
                  <img 
                    src={displayImg} 
                    alt={displayTitle} 
                    onError={(e) => {
                      // Fallback elegante si la URL de la imagen del backend está rota o desactualizada
                      (e.target as HTMLImageElement).src = type === 'car' 
                        ? "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"
                        : "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                  <button className="heart-btn" aria-label="Save" type="button">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                </div>
                <div className="prop-info">
                  <div className="prop-title-row">
                    <h4>{displayTitle}</h4>
                  </div>
                  <p className="prop-specs">{displaySpecs}</p>
                  <div className="prop-price-row">
                    <span className="price">{displayPrice}</span>
                    <span className="rating">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {displayRating}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
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
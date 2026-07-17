"use client";

import React, { useState, useEffect } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import './cars.css';
import Link from 'next/link';

// IMPORTAMOS LA FUNCIÓN DE LA API Y SU INTERFAZ CORREGIDA
import { getCars, CarCatalogItem } from '../../lib/api/cars';

const carsPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Luxury Car Rentals in Miami",
  "description": "Discover our premium fleet of luxury vehicles, from elegant sedans to exotic sports cars.",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Luxury Car Fleet"
  }
};

export default function CarsPage() {
  const [fleet, setFleet] = useState<CarCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCars() {
      try {
        setIsLoading(true);
        const carsData = await getCars();
        setFleet(carsData);
      } catch (error) {
        console.error("Error loading fleet page data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCars();
  }, []);

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
          <span className="fleet-count">
            Available vehicles: <strong>{isLoading ? "..." : fleet.length}</strong>
          </span>
          <div className="fleet-sort">
            <button className="btn-sort-selector" type="button">
              <span>Filter by Class: All</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        </div>

        {/* GRID DE 4 COLUMNAS CONCISO */}
        <div className="fleet-grid">
          {isLoading ? (
            // SKELETONS DE CARGA ELEGANTES MIENTRAS CONECTA CON LA BASE DE DATOS
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="fleet-card animate-pulse" style={{ opacity: 0.5 }}>
                <div className="fleet-image-box" style={{ backgroundColor: '#e4e4e7', height: '220px' }}></div>
                <div className="fleet-info-box">
                  <div style={{ height: '12px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '30%' }}></div>
                  <div style={{ height: '16px', backgroundColor: '#e4e4e7', marginTop: '12px', borderRadius: '4px', width: '80%' }}></div>
                  <div style={{ height: '12px', backgroundColor: '#e4e4e7', marginTop: '8px', borderRadius: '4px', width: '60%' }}></div>
                  <div style={{ height: '14px', backgroundColor: '#e4e4e7', marginTop: '16px', borderRadius: '4px', width: '40%' }}></div>
                </div>
              </div>
            ))
          ) : fleet.length === 0 ? (
            <div className="w-full text-center py-12 text-gray-400 text-sm">
              No vehicles available at the moment.
            </div>
          ) : (
            fleet.map((car) => (
              // RESPETAMOS EL ENLACE EXACTO AL DETALLE DINÁMICO
              <Link href={`/cars/${car.id}`} key={car.id} className="link-dinamic">
                <div className="fleet-card">
                  <div className="fleet-image-box">
                    <img 
                      src={car.img} 
                      alt={car.title} 
                      loading="lazy" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                    <button className="fleet-heart-btn" aria-label="Save vehicle" type="button" onClick={(e) => e.preventDefault()}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                  </div>
                  
                  <div className="fleet-info-box">
                    <div className="fleet-location-row">
                      <span className="location-text">Miami, FL</span>
                    </div>
                    <h4 className="fleet-car-title">{car.title}</h4>
                    <p className="fleet-car-specs">{car.specs}</p>
                    
                    <div className="fleet-price-row">
                      <span className="price-text"><strong>{car.price}</strong></span>
                      <span className="rating-text">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        {car.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="fleet-pagination-container">
          <button className="btn-load-more" type="button">View All Cars</button>
        </div>
      </section>

      <StructuredData type="Product" data={carsPageStructuredData} />
    </main>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import './yachts.css';
import Link from 'next/link';

// IMPORTAMOS LA FUNCIÓN DE LA API Y SU INTERFAZ CORREGIDA
import { getYachts, YachtCatalogItem } from '../../lib/api/yachts';

const yachtsPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Luxury Yacht Charters in Miami",
  "description": "Set sail with our exclusive fleet of luxury yachts, from private sailing to grand oceanic tours.",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Luxury Yacht Fleet"
  }
};

export default function YachtsPage() {
  const [fleet, setFleet] = useState<YachtCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadYachts() {
      try {
        setIsLoading(true);
        const yachtsData = await getYachts();
        setFleet(yachtsData);
      } catch (error) {
        console.error("Error loading yachts page data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadYachts();
  }, []);

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
          <span className="marine-count">
            Vessels docked: <strong>{isLoading ? "..." : fleet.length}</strong>
          </span>
          <div className="marine-sort">
            <button className="btn-sort-selector" type="button">
              <span>Length: All Tiers</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        </div>

        {/* GRID COMPLETADO CON DATOS DINÁMICOS */}
        <div className="marine-grid">
          {isLoading ? (
            // SKELETONS DE CARGA ELEGANTES MIENTRAS LLEGAN LOS DATOS DE DJANGO
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="marine-card animate-pulse" style={{ opacity: 0.5 }}>
                <div className="marine-image-box" style={{ backgroundColor: '#e4e4e7', height: '240px' }}></div>
                <div className="marine-info-box">
                  <div style={{ height: '12px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '25%' }}></div>
                  <div style={{ height: '18px', backgroundColor: '#e4e4e7', marginTop: '12px', borderRadius: '4px', width: '75%' }}></div>
                  <div style={{ height: '14px', backgroundColor: '#e4e4e7', marginTop: '12px', borderRadius: '4px', width: '90%' }}></div>
                  <div style={{ height: '16px', backgroundColor: '#e4e4e7', marginTop: '16px', borderRadius: '4px', width: '40%' }}></div>
                </div>
              </div>
            ))
          ) : fleet.length === 0 ? (
            <div className="w-full text-center py-12 text-gray-400 text-sm">
              No vessels available at the moment.
            </div>
          ) : (
            fleet.map((yacht) => (
              // RESPETAMOS EL ENLACE AL DETALLE DINÁMICO
              <Link href={`/yachts/${yacht.id}`} key={yacht.id} className="link-dinamic">
                <div className="marine-card">
                  <div className="marine-image-box">
                    <img 
                      src={yacht.img} 
                      alt={yacht.title} 
                      loading="lazy" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                    <button className="marine-heart-btn" aria-label="Save yacht" type="button" onClick={(e) => e.preventDefault()}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                  </div>
                  
                  <div className="marine-info-box">
                    <div className="marine-location-row">
                      <span className="location-text">Miami, FL</span>
                    </div>
                    <h4 className="marine-yacht-title">{yacht.title}</h4>
                    
                    {/* FILA DE ESPECIFICACIONES CON LAS CLAVES DE TU BASE DE DATOS TRADUCIDAS (Length • Capacity) */}
                    <div className="marine-technical-specs">
                      <div className="spec-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>4h - 8h</span>
                      </div>
                      <div className="spec-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path></svg>
                        <span>{yacht.specs.split(' • ')[1] || '12 Guests'}</span>
                      </div>
                      <div className="spec-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                        <span>{yacht.specs.split(' • ')[0] || '60ft'}</span>
                      </div>
                    </div>
                    
                    <div className="marine-price-row">
                      <span className="price-text"><strong>{yacht.price}</strong></span>
                      <span className="rating-text">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        {yacht.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="marine-pagination-container">
          <button className="btn-load-more" type="button">View All Vessels</button>
        </div>
      </section>

      <StructuredData type="Product" data={yachtsPageStructuredData} />
    </main>
  );
}
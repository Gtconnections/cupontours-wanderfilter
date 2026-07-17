"use client";

import React, { useState, useEffect } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import './transport.css';
import Link from 'next/link';
import { getPrivateTransport, TransportItem } from '@/app/lib/api/services';

const transportPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Transport Services",
  "description": "Explore Cupontours' private luxury transport services.",
  "mainEntity": { "@type": "ItemList", "name": "Transport Services" }
};

export default function PrivateTransportPage() {
  const [transports, setTransports] = useState<TransportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getPrivateTransport();
        setTransports(data);
      } catch (error) {
        console.error("Error cargando flota de transporte:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalPages = Math.ceil(transports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransports = transports.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: (document.getElementById('catalog-start')?.offsetTop ?? 0) - 100, behavior: 'smooth' });
  };

  return (
    <main className="transport-page">
      <section className="transport-hero">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <span className="pre-title">Luxury Fleet</span>
          <span className="hero-divider"></span>
          <h1 className="massive-heading">Private Transport</h1>
          <p className="hero-subtitle">
            Experience ultimate comfort and prestige. Our exclusive fleet of premium vehicles and professional chauffeurs ensures you arrive at your destination in absolute style.
          </p>
        </div>
      </section>

      <section id="catalog-start" className="transport-catalog-section bg-gray-light">
        <div className="inner-container">
          <div className="section-header text-center">
            <span className="pre-title">The Collection</span>
            <h2>Select your <span className="accent-word">vehicle.</span></h2>
            <p>Browse our curated selection of high-end SUVs, elegant sedans, and exotic models.</p>
          </div>

          <div className="transport-grid">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="transport-card animate-pulse">
                  <div className="transport-img-container" style={{ backgroundColor: '#e4e4e7' }}></div>
                  <div className="transport-info">
                    <div style={{ height: '20px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '70%', marginBottom: '12px' }}></div>
                    <div style={{ height: '14px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '50%', marginBottom: '16px' }}></div>
                    <div style={{ height: '16px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '30%' }}></div>
                  </div>
                </div>
              ))
            ) : currentTransports.length === 0 ? (
              <div className="empty-state">
                <p>No vehicles available at the moment. Please check back later.</p>
              </div>
            ) : (
              currentTransports.map((item) => (
                <div key={item.id} className="transport-card">
                  <Link href={`/services/transport/${item.id}`} className="transport-img-container">
                    <img 
                      src={`https://images.unsplash.com/photo-1627042633145-b780d842ba45?auto=format&fit=crop&w=800&q=80`} 
                      alt={item.name} 
                      className="transport-img"
                      loading="lazy" 
                    />
                    <div className="transport-capacity-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      {item.capacity} Seats
                    </div>
                  </Link>
                  <div className="transport-info">
                    <span className="transport-category">{item.category}</span>
                    <h3>{item.name}</h3>
                    <p className="transport-specs">{item.descripcion}</p>
                    <p className="transport-kit">{item.kit}</p>
                    
                    <div className="transport-footer">
                      <span className="transport-price">${item.price_hour} <span className="price-unit">/ Hour</span></span>
                      <Link href={`/services/transport/${item.id}`} className="btn-black-pill small-btn">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {!isLoading && totalPages > 1 && (
            <div className="pagination-wrapper">
              <button className="page-nav-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button key={index} className={`page-num-btn ${currentPage === index + 1 ? 'active' : ''}`} onClick={() => handlePageChange(index + 1)}>
                    {index + 1}
                  </button>
                ))}
              </div>
              <button className="page-nav-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="transport-cta">
        <div className="cta-container">
          <h2>Need a Custom Itinerary?</h2>
          <p>Our concierge team is available 24/7 to arrange specialized routes, security details, or specific luxury models not listed in our standard catalog.</p>
          <div className="cta-actions">
            <Link href="/contact" className="btn-outline-pill">Contact Concierge</Link>
          </div>
        </div>
      </section>

      <StructuredData type="Product" data={transportPageStructuredData} />
    </main>
  );
}
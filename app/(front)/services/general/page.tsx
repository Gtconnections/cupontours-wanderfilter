"use client";

import React, { useState, useEffect } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import './general.css';
import Link from 'next/link';
import { getGeneralServices, GeneralServiceItem } from '@/app/lib/api/services';

const generalServicesPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "General Services",
  "description": "Explore Cupontours' general concierge services.",
  "mainEntity": { "@type": "ItemList", "name": "General Services" }
};

export default function GeneralServicesPage() {
  const [services, setServices] = useState<GeneralServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getGeneralServices();
        setServices(data);
      } catch (error) {
        console.error("Error cargando servicios generales:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalPages = Math.ceil(services.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentServices = services.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: (document.getElementById('catalog-start')?.offsetTop ?? 0) - 100, behavior: 'smooth' });
  };

  return (
    <main className="gen-page">
      <section className="gen-hero">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <span className="pre-title">Comprehensive Solutions</span>
          <span className="hero-divider"></span>
          <h1 className="massive-heading">Premium Services</h1>
          <p className="hero-subtitle">
            From technical support to event organization and specialized care. Discover our network of trusted professionals ready to elevate your daily life.
          </p>
        </div>
      </section>

      <section id="catalog-start" className="gen-catalog-section bg-gray-light">
        <div className="inner-container">
          <div className="section-header text-center">
            <span className="pre-title">The Collection</span>
            <h2>Select your <span className="accent-word">service.</span></h2>
            <p>Browse our curated selection of essential and lifestyle services.</p>
          </div>

          <div className="gen-grid">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="gen-card animate-pulse">
                  <div className="gen-img-container" style={{ backgroundColor: '#e4e4e7' }}></div>
                  <div className="gen-info">
                    <div style={{ height: '14px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '30%', marginBottom: '12px' }}></div>
                    <div style={{ height: '24px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '80%', marginBottom: '16px' }}></div>
                    <div style={{ height: '20px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '100%' }}></div>
                  </div>
                </div>
              ))
            ) : currentServices.length === 0 ? (
              <div className="empty-state">
                <p>No services available at the moment. Please check back later.</p>
              </div>
            ) : (
              currentServices.map((item) => (
                <div key={item.id} className="gen-card">
                  <Link href={`/services/general/${item.id}`} className="gen-img-container">
                    <img 
                      src={`https://images.unsplash.com/photo-1556745753-b2904692b3cd?auto=format&fit=crop&w=800&q=80`} 
                      alt={item.name} 
                      className="gen-img"
                      loading="lazy" 
                    />
                  </Link>
                  
                  <div className="gen-info">
                    <span className="gen-category">{item.category}</span>
                    <h3>{item.name}</h3>
                    <p className="gen-desc">{item.descripcion}</p>
                    
                    <div className="gen-footer">
                      <span className="gen-price">
                        {item.price_type === 'cotizacion' || !item.price 
                          ? 'Upon Request' 
                          : `$${parseFloat(item.price).toFixed(2)}`}
                        {item.price_type === 'fijo' && <span className="price-unit"> / Base</span>}
                      </span>
                      <Link href={`/services/general/${item.id}`} className="btn-black-pill small-btn">
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

      <section className="gen-cta">
        <div className="cta-container">
          <h2>Need a Specialized Service?</h2>
          <p>Our concierge network extends beyond our standard catalog. Let us know what you need, and we will find the right professional for you.</p>
          <div className="cta-actions">
            <Link href="/contact" className="btn-outline-pill">Contact Concierge</Link>
          </div>
        </div>
      </section>

      <StructuredData type="Product" data={generalServicesPageStructuredData} />
    </main>
  );
}
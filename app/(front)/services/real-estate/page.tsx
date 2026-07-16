"use client";

import React, { useState, useEffect } from 'react';
import './real-estate.css';
import Link from 'next/link';
import { getRealEstate, RealEstateItem } from '@/app/lib/api/services';

export default function RealEstatePage() {
  const [properties, setProperties] = useState<RealEstateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getRealEstate();
        setProperties(data);
      } catch (error) {
        console.error("Error cargando real estate:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProperties = properties.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: document.getElementById('catalog-start')?.offsetTop! - 100, behavior: 'smooth' });
  };

  const formatPrice = (priceStr: string) => {
    const num = parseFloat(priceStr);
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <main className="re-page">
      <section className="re-hero">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <span className="pre-title">Exclusive Portfolio</span>
          <h1 className="massive-heading">Real Estate</h1>
          <p className="hero-subtitle">
            Discover extraordinary properties in the most desirable locations. From luxury villas to premium commercial spaces, find your perfect investment.
          </p>
        </div>
      </section>

      <section id="catalog-start" className="re-catalog-section bg-gray-light">
        <div className="inner-container">
          <div className="section-header text-center">
            <span className="pre-title">The Collection</span>
            <h2>Select your <span style={{ color: '#d4af37', fontStyle: 'italic' }}>property.</span></h2>
            <p>Browse our curated selection of high-end real estate available for rent and sale.</p>
          </div>

          <div className="re-grid">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="re-card animate-pulse">
                  <div className="re-img-container" style={{ backgroundColor: '#e4e4e7' }}></div>
                  <div className="re-info">
                    <div style={{ height: '24px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '50%', marginBottom: '12px' }}></div>
                    <div style={{ height: '16px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '80%', marginBottom: '16px' }}></div>
                    <div style={{ height: '20px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '100%' }}></div>
                  </div>
                </div>
              ))
            ) : currentProperties.length === 0 ? (
              <div className="empty-state">
                <p>No properties available at the moment. Please check back later.</p>
              </div>
            ) : (
              currentProperties.map((item) => (
                <div key={item.id} className="re-card">
                  <Link href={`/services/real-estate/${item.id}`} className="re-img-container">
                    <img 
                      src={`https://images.unsplash.com/photo-1613490908679-fd39d899ec85?auto=format&fit=crop&w=800&q=80`} 
                      alt={item.name} 
                      className="re-img"
                      loading="lazy" 
                    />
                    <div className="badges-container">
                      <div className={`re-badge ${item.operation_type.toLowerCase() === 'venta' ? 'gold' : 'dark'}`}>
                        {item.operation_type.toUpperCase()}
                      </div>
                      <div className="re-badge glass">
                        {item.property_type}
                      </div>
                    </div>
                  </Link>
                  
                  <div className="re-info">
                    <div className="re-price-row">
                      <span className="re-price">${formatPrice(item.price)}</span>
                      <span className="re-location">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {item.location}
                      </span>
                    </div>
                    
                    <h3>{item.name}</h3>
                    <p className="re-address">{item.address}</p>
                    
                    <div className="re-specs">
                      {item.bedrooms > 0 && (
                        <div className="spec-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11v9M21 11v9M3 11V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4M3 11h18"></path></svg>
                          <span>{item.bedrooms} Beds</span>
                        </div>
                      )}
                      {item.bathrooms > 0 && (
                        <div className="spec-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6M9 5v3M15 5v3M12 4v4"></path></svg>
                          <span>{item.bathrooms} Baths</span>
                        </div>
                      )}
                      <div className="spec-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                        <span>{item.sqft} sqft</span>
                      </div>
                    </div>
                    
                    <div className="re-footer">
                      <Link href={`/services/real-estate/${item.id}`} className="btn-black-pill small-btn w-full">
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

      <section className="re-cta">
        <div className="cta-container">
          <h2>Looking for Something Specific?</h2>
          <p>Our real estate advisors have access to exclusive off-market properties and can help you find exactly what you are looking for.</p>
          <div className="cta-actions">
            <Link href="/contact" className="btn-outline-pill">Contact an Advisor</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
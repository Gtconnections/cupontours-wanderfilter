"use client";

import React, { useState, useEffect } from 'react';
import './health.css';
import Link from 'next/link';
import { getHealth, HealthItem } from '@/app/lib/api/services';

export default function HealthPage() {
  const [healthServices, setHealthServices] = useState<HealthItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getHealth();
        setHealthServices(data);
      } catch (error) {
        console.error("Error cargando servicios de salud:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalPages = Math.ceil(healthServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentServices = healthServices.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: (document.getElementById('catalog-start')?.offsetTop ?? 0) - 100, behavior: 'smooth' });
  };

  return (
    <main className="health-page">
      <section className="health-hero">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <span className="pre-title">Premium Care</span>
          <span className="hero-divider"></span>
          <h1 className="massive-heading">Health & Medical</h1>
          <p className="hero-subtitle">
            Access top-tier medical professionals and specialized clinics. Your well-being is our priority, providing exceptional care tailored to your needs.
          </p>
        </div>
      </section>

      <section id="catalog-start" className="health-catalog-section bg-gray-light">
        <div className="inner-container">
          <div className="section-header text-center">
            <span className="pre-title">The Collection</span>
            <h2>Select your <span className="accent-word">consultation.</span></h2>
            <p>Browse our curated network of medical and healthcare services.</p>
          </div>

          <div className="health-grid">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="health-card animate-pulse">
                  <div className="health-img-container" style={{ backgroundColor: '#e4e4e7' }}></div>
                  <div className="health-info">
                    <div style={{ height: '14px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '30%', marginBottom: '12px' }}></div>
                    <div style={{ height: '24px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '80%', marginBottom: '16px' }}></div>
                    <div style={{ height: '20px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '100%' }}></div>
                  </div>
                </div>
              ))
            ) : currentServices.length === 0 ? (
              <div className="empty-state">
                <p>No health services available at the moment. Please check back later.</p>
              </div>
            ) : (
              currentServices.map((item) => (
                <div key={item.id} className="health-card">
                  <Link href={`/services/health/${item.id}`} className="health-img-container">
                    <img 
                      src={`https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80`} 
                      alt={item.name} 
                      className="health-img"
                      loading="lazy" 
                    />
                    <div className="health-duration-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      {item.duration_minutes} Min
                    </div>
                  </Link>
                  
                  <div className="health-info">
                    <div className="health-meta-row">
                      <span className="health-category">{item.category}</span>
                      <span className="health-location">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {item.location}
                      </span>
                    </div>
                    
                    <h3>{item.name}</h3>
                    <p className="health-desc">{item.descripcion}</p>
                    
                    <div className="health-footer">
                      <span className="health-price">${parseFloat(item.price).toFixed(2)} <span className="price-unit">/ Consultation</span></span>
                      <Link href={`/services/health/${item.id}`} className="btn-black-pill small-btn">
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

      <section className="health-cta">
        <div className="cta-container">
          <h2>Need Specialized Care?</h2>
          <p>Our medical concierge can assist in arranging priority appointments, private transportation to clinics, and specialist consultations.</p>
          <div className="cta-actions">
            <Link href="/contact" className="btn-outline-pill">Contact Medical Concierge</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
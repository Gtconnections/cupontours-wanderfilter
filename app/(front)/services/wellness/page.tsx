"use client";

import React, { useState, useEffect } from 'react';
import './wellness.css';
import Link from 'next/link';
import { getWellness, WellnessItem } from '@/app/lib/api/services';

export default function WellnessPage() {
  const [wellnessServices, setWellnessServices] = useState<WellnessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getWellness();
        setWellnessServices(data);
      } catch (error) {
        console.error("Error cargando servicios de wellness:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalPages = Math.ceil(wellnessServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentServices = wellnessServices.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: (document.getElementById('catalog-start')?.offsetTop ?? 0) - 100, behavior: 'smooth' });
  };

  return (
    <main className="well-page">
      <section className="well-hero">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <span className="pre-title">Mind, Body & Soul</span>
          <span className="hero-divider"></span>
          <h1 className="massive-heading">Wellness & Spa</h1>
          <p className="hero-subtitle">
            Restore your balance with our exclusive selection of therapeutic massages, holistic treatments, and fitness sessions designed for ultimate relaxation.
          </p>
        </div>
      </section>

      <section id="catalog-start" className="well-catalog-section bg-gray-light">
        <div className="inner-container">
          <div className="section-header text-center">
            <span className="pre-title">The Collection</span>
            <h2>Select your <span className="accent-word">treatment.</span></h2>
            <p>Browse our curated selection of premium wellness experiences.</p>
          </div>

          <div className="well-grid">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="well-card animate-pulse">
                  <div className="well-img-container" style={{ backgroundColor: '#e4e4e7' }}></div>
                  <div className="well-info">
                    <div style={{ height: '14px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '30%', marginBottom: '12px' }}></div>
                    <div style={{ height: '24px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '80%', marginBottom: '16px' }}></div>
                    <div style={{ height: '20px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '100%' }}></div>
                  </div>
                </div>
              ))
            ) : currentServices.length === 0 ? (
              <div className="empty-state">
                <p>No treatments available at the moment. Please check back later.</p>
              </div>
            ) : (
              currentServices.map((item) => (
                <div key={item.id} className="well-card">
                  <Link href={`/services/wellness/${item.id}`} className="well-img-container">
                    <img 
                      src={`https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80`} 
                      alt={item.name} 
                      className="well-img"
                      loading="lazy" 
                    />
                    <div className="well-duration-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      {item.duration_minutes} Min
                    </div>
                  </Link>
                  
                  <div className="well-info">
                    <div className="well-meta-row">
                      <span className="well-category">{item.category}</span>
                      <span className="well-location">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {item.location}
                      </span>
                    </div>
                    
                    <h3>{item.name}</h3>
                    <p className="well-desc">{item.descripcion}</p>
                    
                    <div className="well-footer">
                      <span className="well-price">${parseFloat(item.price).toFixed(2)} <span className="price-unit">/ Session</span></span>
                      <Link href={`/services/wellness/${item.id}`} className="btn-black-pill small-btn">
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

      <section className="well-cta">
        <div className="cta-container">
          <h2>Looking for a Personalized Plan?</h2>
          <p>Our wellness concierges can design a complete holistic itinerary during your stay, including private trainers and in-villa spa treatments.</p>
          <div className="cta-actions">
            <Link href="/contact" className="btn-outline-pill">Contact Concierge</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
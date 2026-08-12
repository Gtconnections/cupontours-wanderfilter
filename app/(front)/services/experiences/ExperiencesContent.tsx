"use client";

import React, { useState, useEffect } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import './experiences.css';
import Link from 'next/link';
import { getServices, type Locale } from '@/app/i18n/dictionaries';
import { getExperiences, ExperienceItem } from '@/app/lib/api/services';

const experiencesPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Experiences",
  "description": "Explore Cupontours' curated luxury experiences.",
  "mainEntity": { "@type": "ItemList", "name": "Experiences" }
};

export default function ExperiencesContent({ locale = 'en' }: { locale?: Locale }) {
  const t = getServices(locale)["experiences"];
  const c = getServices(locale).common;
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getExperiences();
        setExperiences(data);
      } catch (error) {
        console.error("Error cargando experiencias:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalPages = Math.ceil(experiences.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExperiences = experiences.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: (document.getElementById('catalog-start')?.offsetTop ?? 0) - 100, behavior: 'smooth' });
  };

  return (
    <main className="experiences-page">
      <section className="experiences-hero">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <span className="pre-title">{t.heroPre}</span>
          <span className="hero-divider"></span>
          <h1 className="massive-heading">{t.heroTitle}</h1>
          <p className="hero-subtitle">
            {t.heroSub}
          </p>
        </div>
      </section>

      <section id="catalog-start" className="experiences-catalog-section bg-gray-light">
        <div className="inner-container">
          <div className="section-header text-center">
            <span className="pre-title">{c.secPre}</span>
            <h2>{t.secH2Pre}<span className="accent-word">{t.secAccent}</span></h2>
            <p>{t.secDesc}</p>
          </div>

          <div className="experiences-grid">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="experience-card animate-pulse">
                  <div className="experience-img-container" style={{ backgroundColor: '#e4e4e7' }}></div>
                  <div className="experience-info">
                    <div style={{ height: '20px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '70%', marginBottom: '12px' }}></div>
                    <div style={{ height: '14px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '90%', marginBottom: '16px' }}></div>
                    <div style={{ height: '16px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '40%' }}></div>
                  </div>
                </div>
              ))
            ) : currentExperiences.length === 0 ? (
              <div className="empty-state">
                <p>{t.empty}</p>
              </div>
            ) : (
              currentExperiences.map((item) => (
                <div key={item.id} className="experience-card">
                  <Link href={`/services/experiences/${item.id}`} className="experience-img-container">
                    <img 
                      src={`https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80`} 
                      alt={item.name} 
                      className="experience-img"
                      loading="lazy" 
                    />
                    <div className="badges-container">
                      <div className="experience-badge dark">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {item.duration_days} Day{item.duration_days > 1 ? 's' : ''}
                      </div>
                      {item.pet_friendly === 1 && (
                        <div className="experience-badge gold">Pet Friendly</div>
                      )}
                    </div>
                  </Link>
                  
                  <div className="experience-info">
                    <div className="experience-meta-row">
                      <span className="experience-category">{item.category}</span>
                      <span className="experience-location">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {item.location}
                      </span>
                    </div>
                    
                    <h3>{item.name}</h3>
                    <p className="experience-desc">{item.descripcion}</p>
                    
                    <div className="experience-capacity">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      Capacity: {item.capacity_min} - {item.capacity_max} pax
                    </div>
                    
                    <div className="experience-footer">
                      <span className="experience-price">${item.price} <span className="price-unit">/ Person</span></span>
                      <Link href={`/services/experiences/${item.id}`} className="btn-black-pill small-btn">
                        {c.viewDetails}
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

      <section className="experiences-cta">
        <div className="cta-container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <div className="cta-actions">
            <Link href="/contact" className="btn-outline-pill">{t.ctaBtn}</Link>
          </div>
        </div>
      </section>

      <StructuredData type="Product" data={experiencesPageStructuredData} />
    </main>
  );
}
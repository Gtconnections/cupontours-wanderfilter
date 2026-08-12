"use client";

import React, { useState, useEffect } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import './events.css';
import Link from 'next/link';
import { getServices, type Locale } from '@/app/i18n/dictionaries';
import { getEvents, EventItem } from '@/app/lib/api/services';

const eventsPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Events",
  "description": "Explore Cupontours' luxury event services.",
  "mainEntity": { "@type": "ItemList", "name": "Events" }
};

export default function EventsContent({ locale = 'en' }: { locale?: Locale }) {
  const t = getServices(locale)["events"];
  const c = getServices(locale).common;
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        console.error("Error cargando eventos:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalPages = Math.ceil(events.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEvents = events.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: (document.getElementById('catalog-start')?.offsetTop ?? 0) - 100, behavior: 'smooth' });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <main className="event-page">
      <section className="event-hero">
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

      <section id="catalog-start" className="event-catalog-section bg-gray-light">
        <div className="inner-container">
          <div className="section-header text-center">
            <span className="pre-title">{t.secPre}</span>
            <h2>{t.secH2Pre}<span className="accent-word">{t.secAccent}</span></h2>
            <p>{t.secDesc}</p>
          </div>

          <div className="event-grid">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="event-card animate-pulse">
                  <div className="event-img-container" style={{ backgroundColor: '#e4e4e7' }}></div>
                  <div className="event-info">
                    <div style={{ height: '14px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '30%', marginBottom: '12px' }}></div>
                    <div style={{ height: '24px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '80%', marginBottom: '16px' }}></div>
                    <div style={{ height: '20px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '100%' }}></div>
                  </div>
                </div>
              ))
            ) : currentEvents.length === 0 ? (
              <div className="empty-state">
                <p>{t.empty}</p>
              </div>
            ) : (
              currentEvents.map((item) => (
                <div key={item.id} className="event-card">
                  <Link href={`/services/events/${item.id}`} className="event-img-container">
                    <img 
                      src={`https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80`} 
                      alt={item.name} 
                      className="event-img"
                      loading="lazy" 
                    />
                    <div className="event-date-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      {formatDateTime(item.fecha_hora)}
                    </div>
                  </Link>
                  
                  <div className="event-info">
                    <div className="event-meta-row">
                      <span className="event-category">{item.category}</span>
                      <span className="event-location">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {item.location}
                      </span>
                    </div>
                    
                    <h3>{item.name}</h3>
                    <p className="event-desc">{item.descripcion}</p>
                    
                    <div className="event-capacity">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      {t.capacityA} {item.capacity} {t.guests}
                    </div>
                    
                    <div className="event-footer">
                      <span className="event-price">
                        {parseFloat(item.price) === 0 ? t.freeEntry : `$${parseFloat(item.price).toFixed(2)}`} 
                        {parseFloat(item.price) > 0 && <span className="price-unit">{t.ticketUnit}</span>}
                      </span>
                      <Link href={`/services/events/${item.id}`} className="btn-black-pill small-btn">
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

      <section className="event-cta">
        <div className="cta-container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <div className="cta-actions">
            <Link href="/contact" className="btn-outline-pill">{t.ctaBtn}</Link>
          </div>
        </div>
      </section>

      <StructuredData type="Product" data={eventsPageStructuredData} />
    </main>
  );
}
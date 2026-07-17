"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { StructuredData } from "@/components/seo/structured-data";
import './events-detail.css';
import { getEventById, EventItem } from '@/app/lib/api/services';
import Membership from '@/components/Membership';

// Extendemos la interfaz localmente para incluir la galería
interface EventDetail extends EventItem {
  galeria?: { url: string }[];
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Desenvolvemos la promesa de params usando React.use()
  const { id } = use(params);

  const [eventData, setEventData] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImgIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setIsLoading(true);
        const data = await getEventById(id);
        setEventData(data);
      } catch (error) {
        console.error("Error loading event detail:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (id) fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <main className="ev-page loading-state">
        <div className="ev-container">
          <div className="ev-skeleton animate-pulse"></div>
        </div>
      </main>
    );
  }

  if (!eventData) {
    return (
      <main className="ev-page error-state">
        <div className="ev-container ev-error-container text-center">
          <h2>Event Not Found</h2>
          <p>The exclusive event you are looking for is not available or has already passed.</p>
          <Link href="/services/events" className="btn-black-pill mt-4">Return to Events</Link>
        </div>
      </main>
    );
  }

  // LÓGICA DINÁMICA ESTRICTA: Solo renderiza lo que viene de la BD
  const allImages = [
    eventData.principal_image,
    ...(eventData.galeria?.map(g => g.url) || [])
  ].filter(Boolean);

  // Link dinámico a WhatsApp
  const whatsappNumber = "1234567890";
  const whatsappMessage = encodeURIComponent(`Hello, I'm interested in attending the event "${eventData.name}" on ${eventData.fecha_hora}.`);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Formateador de Fecha y Hora
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const isFree = parseFloat(eventData.price) === 0;

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden'; 
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  return (
    <main className="ev-page">
      <div className="ev-container">
        
        <nav className="ev-breadcrumb">
          <Link href="/">Home</Link> <span>/</span>
          <Link href="/services/events">Events</Link> <span>/</span>
          <span className="current">{eventData.name}</span>
        </nav>

        <header className="ev-header">
          <div className="ev-title-area">
            <span className="ev-category">{eventData.category}</span>
            <h1 className="ev-title">{eventData.name}</h1>
          </div>
        </header>

        <div className="ev-grid">
          
          <div className="ev-main-column">
            
            {/* Galería Principal */}
            <div className="ev-main-image" onClick={() => openLightbox(0)}>
              <img src={allImages[0]} alt={eventData.name} />
              <div className="expand-hint">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
              </div>
            </div>

            {/* Tira de Miniaturas (Se oculta por completo si no hay galería extra en la BD) */}
            {allImages.length > 1 && (
              <div className="ev-gallery-strip">
                {allImages.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="ev-thumb" onClick={() => openLightbox(idx + 1)}>
                    <img src={img} alt={`Gallery ${idx + 1}`} />
                    {idx === 3 && allImages.length > 5 && (
                      <div className="ev-thumb-overlay">+{allImages.length - 5}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <hr className="ev-divider" />

            {/* Detalles del Evento (Descripción) */}
            <section className="ev-section">
              <h2 className="ev-section-title">About The Event</h2>
              <p className="ev-description">
                {eventData.descripcion}
              </p>
            </section>

          </div>

          <aside className="ev-sidebar">
            <div className="ev-booking-widget">
              
              <div className="widget-header">
                <span className={`widget-price ${isFree ? 'free-price' : ''}`}>
                  {isFree ? 'Free Entry' : `$${parseFloat(eventData.price).toFixed(2)}`}
                </span>
                {!isFree && <span className="widget-unit">/ Ticket</span>}
              </div>
              
              {/* Especificaciones dentro de la tarjeta adaptadas a Eventos */}
              <div className="widget-specs">
                <div className="widget-spec-row">
                  <span className="widget-spec-label">Date & Time</span>
                  <span className="widget-spec-value">{formatDateTime(eventData.fecha_hora)}</span>
                </div>
                <div className="widget-spec-row">
                  <span className="widget-spec-label">Location</span>
                  <span className="widget-spec-value">{eventData.location}</span>
                </div>
                <div className="widget-spec-row">
                  <span className="widget-spec-label">Capacity</span>
                  <span className="widget-spec-value">Limited to {eventData.capacity} Guests</span>
                </div>
                <div className="widget-spec-row">
                  <span className="widget-spec-label">Category</span>
                  <span className="widget-spec-value">{eventData.category}</span>
                </div>
              </div>

              <div className="widget-info">
                <p>Please RSVP or purchase your tickets in advance. Access may be restricted once capacity is reached.</p>
              </div>

              <div className="widget-actions">
                {/* Botón de WhatsApp integrado */}
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-black-pill btn-whatsapp full-width"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  {isFree ? 'RSVP Now' : 'Get Tickets'}
                </a>
              </div>

              <div className="widget-assurance">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>Secure and official registration.</span>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* MEMBERSHIP CLUB SECTION */}
      <Membership />

      {/* LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div className="ev-lightbox-overlay" onClick={closeLightbox}>
          <button className="lb-close" onClick={closeLightbox}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          {allImages.length > 1 && (
            <button className="lb-nav lb-prev" onClick={prevImage}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          )}
          
          <img src={allImages[currentImgIndex]} alt="Enlarged" className="lb-image" onClick={(e) => e.stopPropagation()} />
          
          {allImages.length > 1 && (
            <button className="lb-nav lb-next" onClick={nextImage}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          )}

          <div className="lb-counter">
            {currentImgIndex + 1} / {allImages.length}
          </div>
        </div>
      )}

      {eventData && (
        <StructuredData
          type="Product"
          data={{
            "@type": "Event",
            "name": eventData.name,
            "description": eventData.descripcion,
            "image": eventData.principal_image,
            "startDate": eventData.fecha_hora,
            "location": {
              "@type": "Place",
              "name": eventData.location
            },
            "offers": {
              "@type": "Offer",
              "price": eventData.price,
              "priceCurrency": "USD"
            }
          }}
        />
      )}
    </main>
  );
}
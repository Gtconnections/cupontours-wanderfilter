"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { StructuredData } from "@/components/seo/structured-data";
import './wellness-detail.css';
import { getWellnessById, WellnessItem } from '@/app/lib/api/services';
import Membership from '@/components/Membership';

// Extendemos la interfaz localmente para incluir la galería
interface WellnessDetail extends WellnessItem {
  galeria?: { url: string }[];
}

export default function WellnessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Desenvolvemos la promesa de params usando React.use()
  const { id } = use(params);

  const [treatment, setTreatment] = useState<WellnessDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImgIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setIsLoading(true);
        const data = await getWellnessById(id);
        setTreatment(data);
      } catch (error) {
        console.error("Error loading wellness detail:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (id) fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <main className="well-page loading-state">
        <div className="well-container">
          <div className="well-skeleton animate-pulse"></div>
        </div>
      </main>
    );
  }

  if (!treatment) {
    return (
      <main className="well-page error-state">
        <div className="well-container well-error-container text-center">
          <h2>Session Not Found</h2>
          <p>The wellness treatment you are looking for is not available.</p>
          <Link href="/services/wellness" className="btn-black-pill mt-4">Return to Wellness</Link>
        </div>
      </main>
    );
  }

  // LÓGICA DINÁMICA ESTRICTA: Solo renderiza lo que viene de la BD
  const allImages = [
    treatment.principal_image,
    ...(treatment.galeria?.map(g => g.url) || [])
  ].filter(Boolean);

  // Link dinámico a WhatsApp
  const whatsappNumber = "17866566582";
  const whatsappMessage = encodeURIComponent(`Hello, I'm interested in booking the "${treatment.name}" session at ${treatment.location}.`);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

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
    <main className="well-page">
      <div className="well-container">
        
        <nav className="well-breadcrumb">
          <Link href="/">Home</Link> <span>/</span>
          <Link href="/services/wellness">Wellness & Spa</Link> <span>/</span>
          <span className="current">{treatment.name}</span>
        </nav>

        <header className="well-header">
          <div className="well-title-area">
            <span className="well-category">{treatment.category}</span>
            <h1 className="well-title">{treatment.name}</h1>
          </div>
        </header>

        <div className="well-grid">
          
          <div className="well-main-column">
            
            {/* Galería Principal */}
            <div className="well-main-image" onClick={() => openLightbox(0)}>
              <img src={allImages[0]} alt={treatment.name} />
              <div className="expand-hint">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
              </div>
            </div>

            {/* Tira de Miniaturas (Se oculta por completo si no hay galería extra en la BD) */}
            {allImages.length > 1 && (
              <div className="well-gallery-strip">
                {allImages.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="well-thumb" onClick={() => openLightbox(idx + 1)}>
                    <img src={img} alt={`Gallery ${idx + 1}`} />
                    {idx === 3 && allImages.length > 5 && (
                      <div className="well-thumb-overlay">+{allImages.length - 5}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <hr className="well-divider" />

            {/* Detalles de la Sesión (Descripción) */}
            <section className="well-section">
              <h2 className="well-section-title">The Treatment</h2>
              <p className="well-description">
                {treatment.descripcion}
              </p>
            </section>

          </div>

          <aside className="well-sidebar">
            <div className="well-booking-widget">
              
              <div className="widget-header">
                <span className="widget-price">
                  ${parseFloat(treatment.price).toFixed(2)}
                </span>
                <span className="widget-unit">/ Session</span>
              </div>
              
              {/* Especificaciones dentro de la tarjeta adaptadas a Wellness */}
              <div className="widget-specs">
                <div className="widget-spec-row">
                  <span className="widget-spec-label">Location</span>
                  <span className="widget-spec-value">{treatment.location}</span>
                </div>
                <div className="widget-spec-row">
                  <span className="widget-spec-label">Duration</span>
                  <span className="widget-spec-value">{treatment.duration_minutes} Minutes</span>
                </div>
                <div className="widget-spec-row">
                  <span className="widget-spec-label">Category</span>
                  <span className="widget-spec-value">{treatment.category}</span>
                </div>
              </div>

              <div className="widget-info">
                <p>Arrive 15 minutes prior to your scheduled time to fully enjoy our relaxation amenities. Booking is subject to availability.</p>
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
                  Book Session
                </a>
              </div>

              <div className="widget-assurance">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>Certified wellness professionals.</span>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* MEMBERSHIP CLUB SECTION */}
      <Membership />

      {/* LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div className="well-lightbox-overlay" onClick={closeLightbox}>
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

      {treatment && (
        <StructuredData
          type="Product"
          data={{
            "name": treatment.name,
            "description": treatment.descripcion,
            "image": treatment.principal_image,
            "category": treatment.category,
            "offers": {
              "@type": "Offer",
              "price": treatment.price,
              "priceCurrency": "USD"
            }
          }}
        />
      )}
    </main>
  );
}
"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { StructuredData } from "@/components/seo/structured-data";
import './real-estate-detail.css';
import { getRealEstateById, RealEstateItem } from '@/app/lib/api/services';
import Membership from '@/components/Membership';

// Extendemos la interfaz localmente para incluir la galería
interface RealEstateDetail extends RealEstateItem {
  galeria?: { url: string }[];
}

export default function RealEstateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Desenvolvemos la promesa de params usando React.use()
  const { id } = use(params);

  const [property, setProperty] = useState<RealEstateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImgIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setIsLoading(true);
        const data = await getRealEstateById(id);
        setProperty(data);
      } catch (error) {
        console.error("Error loading real estate detail:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (id) fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <main className="re-page loading-state">
        <div className="re-container">
          <div className="re-skeleton animate-pulse"></div>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="re-page error-state">
        <div className="re-container re-error-container text-center">
          <h2>Property Not Found</h2>
          <p>The exclusive property you are looking for is not available.</p>
          <Link href="/services/real-estate" className="btn-black-pill mt-4">Return to Portfolio</Link>
        </div>
      </main>
    );
  }

  // LÓGICA DINÁMICA ESTRICTA: Solo renderiza lo que viene de la BD
  const allImages = [
    property.principal_image,
    ...(property.galeria?.map(g => g.url) || [])
  ].filter(Boolean);

  // Link dinámico a WhatsApp
  const whatsappNumber = "17866566582";
  const whatsappMessage = encodeURIComponent(`Hello, I'm interested in the property "${property.name}" located in ${property.location}.`);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const formatMoney = (priceStr: string, currency?: string) => {
    const num = parseFloat(priceStr);
    if (!num || num <= 0) return 'Price on request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      currencyDisplay: 'code',
      maximumFractionDigits: 0,
    }).format(num);
  };

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
    <main className="re-page">
      <div className="re-container">
        
        <nav className="re-breadcrumb">
          <Link href="/">Home</Link> <span>/</span>
          <Link href="/services/real-estate">Real Estate</Link> <span>/</span>
          <span className="current">{property.name}</span>
        </nav>

        <header className="re-header">
          <div className="re-title-area">
            <span className="re-category">
              {property.property_type} • {property.operation_type.toUpperCase()}
            </span>
            <h1 className="re-title">{property.name}</h1>
          </div>
        </header>

        <div className="re-grid">
          
          <div className="re-main-column">
            
            {/* Galería Principal */}
            <div className="re-main-image" onClick={() => openLightbox(0)}>
              <img src={allImages[0]} alt={property.name} />
              <div className="expand-hint">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
              </div>
            </div>

            {/* Tira de Miniaturas (Se oculta por completo si no hay galería extra en la BD) */}
            {allImages.length > 1 && (
              <div className="re-gallery-strip">
                {allImages.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="re-thumb" onClick={() => openLightbox(idx + 1)}>
                    <img src={img} alt={`Gallery ${idx + 1}`} />
                    {idx === 3 && allImages.length > 5 && (
                      <div className="re-thumb-overlay">+{allImages.length - 5}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <hr className="re-divider" />

            {/* The Property (Descripción) */}
            <section className="re-section">
              <h2 className="re-section-title">The Property</h2>
              <p className="re-description">
                {property.descripcion}
              </p>
            </section>

          </div>

          <aside className="re-sidebar">
            <div className="re-booking-widget">
              <div className="widget-header">
                <span className="widget-price">{formatMoney(property.price, property.currency)}</span>
                <span className="widget-unit">
                  {property.operation_type.toLowerCase() === 'renta' ? '/ Month' : ''}
                </span>
              </div>
              
              {/* Especificaciones Inmobiliarias dentro de la tarjeta */}
              <div className="widget-specs">
                <div className="widget-spec-row">
                  <span className="widget-spec-label">Location</span>
                  <span className="widget-spec-value">{property.location}</span>
                </div>
                {property.bedrooms > 0 && (
                  <div className="widget-spec-row">
                    <span className="widget-spec-label">Bedrooms</span>
                    <span className="widget-spec-value">{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="widget-spec-row">
                    <span className="widget-spec-label">Bathrooms</span>
                    <span className="widget-spec-value">{property.bathrooms}</span>
                  </div>
                )}
                <div className="widget-spec-row">
                  <span className="widget-spec-label">Area</span>
                  <span className="widget-spec-value">{property.sqft} sqft</span>
                </div>
                {property.parking_spaces > 0 && (
                  <div className="widget-spec-row">
                    <span className="widget-spec-label">Parking</span>
                    <span className="widget-spec-value">{property.parking_spaces} Space(s)</span>
                  </div>
                )}
              </div>

              <div className="widget-info">
                <p>Address: {property.address}</p>
                <p style={{ marginTop: '8px' }}>Schedule a private viewing with our real estate advisors.</p>
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
                  Contact Advisor
                </a>
              </div>

              <div className="widget-assurance">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>Verified exclusive listing.</span>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* MEMBERSHIP CLUB SECTION */}
      <Membership />

      {/* LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div className="re-lightbox-overlay" onClick={closeLightbox}>
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

      {property && (
        <StructuredData
          type="RentalProperty"
          data={{
            "name": property.name,
            "description": property.descripcion,
            "image": property.principal_image,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": property.location
            },
            "offers": {
              "@type": "Offer",
              "price": property.price,
              "priceCurrency": property.currency || "USD"
            }
          }}
        />
      )}
    </main>
  );
}
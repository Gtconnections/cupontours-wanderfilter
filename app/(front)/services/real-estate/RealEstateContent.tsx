"use client";

import React, { useState, useEffect } from 'react';
import SmartImage from "@/components/SmartImage";
import { StructuredData } from "@/components/seo/structured-data";
import './real-estate.css';
import Link from 'next/link';
import { getServices, type Locale } from '@/app/i18n/dictionaries';
import { getRealEstate, RealEstateItem } from '@/app/lib/api/services';

const realEstatePageStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Real Estate Services",
  "description": "Explore Cupontours' luxury real estate services.",
  "mainEntity": { "@type": "ItemList", "name": "Real Estate Services" }
};

export default function RealEstateContent({ locale = 'en' }: { locale?: Locale }) {
  const t = getServices(locale)["real-estate"];
  const c = getServices(locale).common;
  const lp = locale === 'es' ? '/es' : '';
  const [properties, setProperties] = useState<RealEstateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [filterOp, setFilterOp] = useState('all');
  const [filterLoc, setFilterLoc] = useState('');
  const [filterBeds, setFilterBeds] = useState('0');

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

  const filtered = properties.filter((p) => {
    if (filterOp !== 'all' && (p.operation_type || '').toLowerCase() !== filterOp) return false;
    if (filterLoc.trim() && !(`${p.location} ${p.name}`).toLowerCase().includes(filterLoc.trim().toLowerCase())) return false;
    if (filterBeds !== '0' && (p.bedrooms || 0) < parseInt(filterBeds)) return false;
    return true;
  });

  useEffect(() => { setCurrentPage(1); }, [filterOp, filterLoc, filterBeds]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProperties = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: (document.getElementById('catalog-start')?.offsetTop ?? 0) - 100, behavior: 'smooth' });
  };

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

  return (
    <main className="re-list-page">
      <section className="re-hero">
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

      <section id="catalog-start" className="re-catalog-section bg-gray-light">
        <div className="inner-container">
          <div className="section-header text-center">
            <span className="pre-title">{c.secPre}</span>
            <h2>{t.secH2Pre}<span className="accent-word">{t.secAccent}</span></h2>
            <p>{t.secDesc}</p>
          </div>

          <div className="re-filters">
            <style dangerouslySetInnerHTML={{ __html: `
              .re-filters { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 28px; align-items: center; justify-content: center; }
              .re-filters select, .re-filters input { padding: 10px 16px; border: 1px solid rgba(140,140,140,0.35); border-radius: 999px; background: transparent; color: inherit; font-size: 13px; }
              .re-filters input { min-width: 240px; }
              .re-filters option { color: #111; }
            ` }} />
            <input placeholder="Buscar por ubicación o nombre…" value={filterLoc} onChange={(e) => setFilterLoc(e.target.value)} />
            <select value={filterOp} onChange={(e) => setFilterOp(e.target.value)}>
              <option value="all">Venta y Renta</option>
              <option value="venta">Venta</option>
              <option value="renta">Renta</option>
            </select>
            <select value={filterBeds} onChange={(e) => setFilterBeds(e.target.value)}>
              <option value="0">Recámaras</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
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
                <p>{t.empty}</p>
              </div>
            ) : (
              currentProperties.map((item) => (
                <div key={item.id} className="re-card">
                  <Link href={`${lp}/services/real-estate/${item.id}`} className="re-img-container">
                    <SmartImage
                      src={item.principal_image}
                      alt={item.name}
                      className="re-img"
                      fallbackSrc="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"
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
                      <span className="re-price">{formatMoney(item.price, item.currency)}</span>
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
                      <Link href={`${lp}/services/real-estate/${item.id}`} className="btn-black-pill small-btn w-full">
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

      <section className="re-cta">
        <div className="cta-container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <div className="cta-actions">
            <Link href={`${lp}/contact`} className="btn-outline-pill">{t.ctaBtn}</Link>
          </div>
        </div>
      </section>

      <StructuredData type="Product" data={realEstatePageStructuredData} />
    </main>
  );
}
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import './cars.css';
import Link from 'next/link';
import Membership from '@/components/Membership';
import HeartButton from '@/components/wishlist/HeartButton';

import { getCarsPage, CarCatalogItem } from '../../lib/api/cars';
import { getVerticals, getCatalogSections, type Locale } from '@/app/i18n/dictionaries';

const carsPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Luxury Car Rentals in Miami",
  "description": "Discover our premium fleet of luxury vehicles, from elegant sedans to exotic sports cars.",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Luxury Car Fleet"
  }
};

const FALLBACK_PAGE_SIZE = 12;

interface Props {
  initialItems: CarCatalogItem[];
  initialCount: number;
  initialPageSize: number;
  locale?: Locale;
}

export default function CarsCatalogClient({ initialItems, initialCount, initialPageSize, locale = 'en' }: Props) {
  const v = getVerticals(locale).cars;
  const s = getCatalogSections(locale).cars;
  const es = locale === 'es';
  const [fleet, setFleet] = useState<CarCatalogItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(initialCount);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Datos de la primera página vienen del servidor (SSR): saltamos el primer fetch.
  const skipFirstFetch = useRef(true);

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }
    let active = true;
    async function loadCars() {
      try {
        setIsLoading(true);
        const { items, count: total } = await getCarsPage(page);
        if (!active) return;
        setFleet(items);
        setCount(total);
        if (page === 1 && items.length > 0 && items.length < total) {
          setPageSize(items.length);
        }
      } catch (error) {
        console.error("Error loading fleet page data:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadCars();
    return () => { active = false; };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const current = Math.min(page, totalPages);

  const pageList: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= current - 1 && i <= current + 1)) {
      pageList.push(i);
    } else if (pageList[pageList.length - 1] !== '...') {
      pageList.push('...');
    }
  }

  const goPage = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    if (typeof document !== 'undefined') {
      document.getElementById('fleet-listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="fleet-page-container">

      {/* 1. HERO */}
      <section className="fleet-hero">
        <div className="fleet-hero-overlay"></div>
        <div className="fleet-hero-content">
          <span className="fleet-badge">{v.badge}</span>
          <h1 className="fleet-title">{v.title}</h1>
          <p className="fleet-subtitle">{v.subtitle}</p>
        </div>
      </section>

      {/* 2. CONTENEDOR DEL CATÁLOGO DE AUTOS */}
      <section className="fleet-listings-section" id="fleet-listings">

        {/* Cabecera Editorial */}
        <div className="fleet-editorial-header">
          <span className="pre-title">{s.secPre}</span>
          <h2>{s.secTitle}</h2>
          <p>{s.secText}</p>
        </div>

        <div className="fleet-meta-row">
          <span className="fleet-count">
            {s.count} <strong>{count > 0 ? count : (isLoading ? "..." : 0)}</strong>
          </span>
        </div>

        {/* GRID DE 4 COLUMNAS */}
        <div className="fleet-grid">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="fleet-card animate-pulse" style={{ opacity: 0.5 }}>
                <div className="fleet-image-box" style={{ backgroundColor: '#e4e4e7', height: '220px' }}></div>
                <div className="fleet-info-box">
                  <div style={{ height: '12px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '30%' }}></div>
                  <div style={{ height: '16px', backgroundColor: '#e4e4e7', marginTop: '12px', borderRadius: '4px', width: '80%' }}></div>
                  <div style={{ height: '12px', backgroundColor: '#e4e4e7', marginTop: '8px', borderRadius: '4px', width: '60%' }}></div>
                  <div style={{ height: '14px', backgroundColor: '#e4e4e7', marginTop: '16px', borderRadius: '4px', width: '40%' }}></div>
                </div>
              </div>
            ))
          ) : fleet.length === 0 ? (
            <div className="w-full text-center py-12 text-gray-400 text-sm">
              {s.empty}
            </div>
          ) : (
            fleet.map((car) => (
              <Link href={`/cars/${car.id}`} key={car.id} className="link-dinamic">
                <div className="fleet-card">
                  <div className="fleet-image-box">
                    <img
                      src={car.img}
                      alt={car.title}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                    <HeartButton
                      className="fleet-heart-btn"
                      item={{ id: String(car.id), type: 'car', title: car.title, image: car.img, price: car.price, href: `/cars/${car.id}`, location: 'Miami, FL' }}
                    />
                  </div>

                  <div className="fleet-info-box">
                    <div className="fleet-location-row">
                      <span className="location-text">Miami, FL</span>
                    </div>
                    <h4 className="fleet-car-title">{car.title}</h4>

                    <div className="fleet-car-specs">
                      {(car.specs || '').split('•').map((s) => s.trim()).filter(Boolean).map((s, i) => (
                        <span key={i} className="spec-item">{s}</span>
                      ))}
                    </div>

                    <div className="fleet-price-row">
                      <span className="price-text"><strong>{car.price}</strong></span>
                      <span className="rating-text">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        {car.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="fleet-pager">
            <button className="fleet-pager-btn" onClick={() => goPage(current - 1)} disabled={current === 1} aria-label={es ? "Página anterior" : "Previous page"}>‹</button>
            {pageList.map((n, idx) =>
              typeof n === 'number' ? (
                <button key={n} className={`fleet-pager-num ${n === current ? 'active' : ''}`} onClick={() => goPage(n)}>{n}</button>
              ) : (
                <span key={`ellipsis-${idx}`} className="fleet-pager-ellipsis">…</span>
              )
            )}
            <button className="fleet-pager-btn" onClick={() => goPage(current + 1)} disabled={current === totalPages} aria-label={es ? "Página siguiente" : "Next page"}>›</button>
          </div>
        )}
      </section>

      {/* 3. SECCIÓN DE MEMBRESÍAS */}
      <Membership />

      <StructuredData type="Product" data={carsPageStructuredData} />
    </main>
  );
}

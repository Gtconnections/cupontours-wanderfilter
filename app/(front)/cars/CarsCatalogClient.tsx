"use client";

import React from 'react';
import SmartImage from "@/components/SmartImage";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { StructuredData } from "@/components/seo/structured-data";
import './cars.css';
import Link from 'next/link';
import Membership from '@/components/Membership';
import HeartButton from '@/components/wishlist/HeartButton';

import { CarCatalogItem } from '../../lib/api/cars';
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
  locale?: Locale;
}

export default function CarsCatalogClient({ initialItems, initialCount, locale = 'en' }: Props) {
  const v = getVerticals(locale).cars;
  const s = getCatalogSections(locale).cars;
  const es = locale === 'es';
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fleet = initialItems;
  const count = initialCount;
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const totalPages = Math.max(1, Math.ceil(count / FALLBACK_PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = fleet.slice((current - 1) * FALLBACK_PAGE_SIZE, current * FALLBACK_PAGE_SIZE);

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
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) params.delete('page'); else params.set('page', String(next));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
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
            {s.count} <strong>{count}</strong>
          </span>
        </div>

        {/* GRID DE 4 COLUMNAS */}
        <div className="fleet-grid">
          {fleet.length === 0 ? (
            <div className="w-full text-center py-12 text-gray-400 text-sm">
              {s.empty}
            </div>
          ) : (
            visible.map((car) => (
              <Link href={`${es ? '/es' : ''}/cars/${car.id}`} key={car.id} className="link-dinamic">
                <div className="fleet-card">
                  <div className="fleet-image-box">
                    <SmartImage
                      src={car.img}
                      alt={car.title}
                      fallbackSrc="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"
                    />
                    <HeartButton
                      className="fleet-heart-btn"
                      item={{ id: String(car.id), type: 'car', title: car.title, image: car.img, price: car.price, href: `${es ? '/es' : ''}/cars/${car.id}`, location: 'Miami, FL' }}
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

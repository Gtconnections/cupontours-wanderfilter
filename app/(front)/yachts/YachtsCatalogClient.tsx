"use client";

import React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { StructuredData } from "@/components/seo/structured-data";
import './yachts.css';
import Link from 'next/link';
import Membership from '@/components/Membership';
import HeartButton from '@/components/wishlist/HeartButton';

import { YachtCatalogItem } from '../../lib/api/yachts';
import { getVerticals, getCatalogSections, type Locale } from '@/app/i18n/dictionaries';

const yachtsPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Luxury Yacht Charters in Miami",
  "description": "Set sail with our exclusive fleet of luxury yachts, from private sailing to grand oceanic tours.",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Luxury Yacht Fleet"
  }
};

const FALLBACK_PAGE_SIZE = 12;

interface Props {
  initialItems: YachtCatalogItem[];
  initialCount: number;
  locale?: Locale;
}

export default function YachtsCatalogClient({ initialItems, initialCount, locale = 'en' }: Props) {
  const v = getVerticals(locale).yachts;
  const s = getCatalogSections(locale).yachts;
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
      document.getElementById('marine-fleet')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="marine-page-container">
      {/* 1. HERO INMERSIVO */}
      <section className="marine-hero">
        <div className="marine-hero-overlay"></div>
        <div className="marine-hero-content">
          <span className="marine-badge">{v.badge}</span>
          <h1 className="marine-title">{v.title}</h1>
          <p className="marine-subtitle">{v.subtitle}</p>
        </div>
      </section>

      {/* 2. CONTENEDOR EDITORIAL */}
      <section className="marine-listings-section" id="marine-fleet">

        <div className="marine-editorial-header">
          <span className="pre-title">{s.secPre}</span>
          <h2>{s.secTitle}</h2>
          <p>{s.secText}</p>
        </div>

        <div className="marine-meta-row">
          <span className="marine-count">
            {s.count} <strong>{count}</strong>
          </span>
        </div>

        {/* GRID COMPLETADO CON DATOS DINÁMICOS */}
        <div className="marine-grid">
          {fleet.length === 0 ? (
            <div className="w-full text-center py-12 text-gray-400 text-sm">
              {s.empty}
            </div>
          ) : (
            visible.map((yacht) => (
              <Link href={`${es ? '/es' : ''}/yachts/${yacht.id}`} key={yacht.id} className="link-dinamic">
                <div className="marine-card">
                  <div className="marine-image-box">
                    <img
                      src={yacht.img}
                      alt={yacht.title}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                    <HeartButton
                      className="marine-heart-btn"
                      item={{ id: String(yacht.id), type: 'yacht', title: yacht.title, image: yacht.img, price: yacht.price, href: `${es ? '/es' : ''}/yachts/${yacht.id}`, location: 'Miami, FL' }}
                    />
                  </div>

                  <div className="marine-info-box">
                    <div className="marine-location-row">
                      <span className="location-text">Miami, FL</span>
                    </div>
                    <h4 className="marine-yacht-title">{yacht.title}</h4>

                    <div className="marine-technical-specs">
                      <div className="spec-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>4h - 8h</span>
                      </div>
                      <div className="spec-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path></svg>
                        <span>{yacht.specs.split(' • ')[1] || (es ? '12 Huéspedes' : '12 Guests')}</span>
                      </div>
                      <div className="spec-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                        <span>{yacht.specs.split(' • ')[0] || '60ft'}</span>
                      </div>
                    </div>

                    <div className="marine-price-row">
                      <span className="price-text"><strong>{yacht.price}</strong></span>
                      <span className="rating-text">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        {yacht.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="marine-pager">
            <button className="marine-pager-btn" onClick={() => goPage(current - 1)} disabled={current === 1} aria-label={es ? "Página anterior" : "Previous page"}>‹</button>
            {pageList.map((n, idx) =>
              typeof n === 'number' ? (
                <button key={n} className={`marine-pager-num ${n === current ? 'active' : ''}`} onClick={() => goPage(n)}>{n}</button>
              ) : (
                <span key={`ellipsis-${idx}`} className="marine-pager-ellipsis">…</span>
              )
            )}
            <button className="marine-pager-btn" onClick={() => goPage(current + 1)} disabled={current === totalPages} aria-label={es ? "Página siguiente" : "Next page"}>›</button>
          </div>
        )}
      </section>

      {/* 3. SECCIÓN DE MEMBRESÍAS */}
      <Membership />

      <StructuredData type="Product" data={yachtsPageStructuredData} />
    </main>
  );
}

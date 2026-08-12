"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { StructuredData } from "@/components/seo/structured-data";
import './properties.css';
import Membership from '@/components/Membership';
import HeartButton from '@/components/wishlist/HeartButton';

import { getPropertiesPage, searchProperties, PropertyCardData } from '../../lib/api/properties';
import { getVerticals, getCatalogSections, type Locale } from '@/app/i18n/dictionaries';

const PAGE_SIZE = 12;

const propertiesPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Luxury Vacation Rentals",
  "description": "Book exclusive luxury vacation rental properties worldwide.",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Luxury Vacation Rental Properties"
  }
};

interface Props {
  initialItems: PropertyCardData[];
  initialCount: number;
  initialHasSearched: boolean;
  locale?: Locale;
}

export default function PropertiesCatalogClient({ initialItems, initialCount, initialHasSearched, locale = 'en' }: Props) {
  const v = getVerticals(locale).properties;
  const s = getCatalogSections(locale).properties;
  const es = locale === 'es';
  const [allProperties, setAllProperties] = useState<PropertyCardData[]>(initialItems);
  const [filteredProperties, setFilteredProperties] = useState<PropertyCardData[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [hasSearched, setHasSearched] = useState(initialHasSearched);
  const [sortOption, setSortOption] = useState('featured');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  // Los datos de la carga inicial ya vienen del servidor (SSR). Saltamos el
  // primer fetch en cliente para no volver a pedir lo mismo y no parpadear.
  const skipFirstFetch = useRef(true);

  // Función para ordenar propiedades
  const sortProperties = (properties: PropertyCardData[], sortType: string) => {
    const sorted = [...properties];
    switch (sortType) {
      case 'price-asc':
        return sorted.sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0));
      case 'price-desc':
        return sorted.sort((a, b) => (b.price?.amount || 0) - (a.price?.amount || 0));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'featured':
      default:
        return sorted;
    }
  };

  // Aplicar ordenamiento cuando cambian las propiedades o el sort
  useEffect(() => {
    // Derived list kept in sync with its own inputs (source data + sort option).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredProperties(sortProperties(allProperties, sortOption));
  }, [allProperties, sortOption]);

  useEffect(() => {
    // Primer render: ya tenemos los datos del servidor, no re-pedimos.
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }

    let active = true;

    async function loadPropertiesData() {
      try {
        setIsLoading(true);

        const city = searchParams.get('city');
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');
        const guests = searchParams.get('guests');

        if (city || checkIn || checkOut || guests) {
          // Modo búsqueda: una sola página con los resultados
          const searchData = await searchProperties({
            city: city || undefined,
            checkIn: checkIn || undefined,
            checkOut: checkOut || undefined,
            guests: guests ? parseInt(guests, 10) : undefined,
            limit: 50
          });
          if (!active) return;
          setHasSearched(true);
          setAllProperties(searchData);
          setCount(searchData.length);
        } else {
          // Modo catálogo: paginado numerado del servidor
          const { items, count: total } = await getPropertiesPage({ page, pageSize: PAGE_SIZE });
          if (!active) return;
          setHasSearched(false);
          setAllProperties(items);
          setCount(total);
        }
      } catch (error) {
        console.error("Error loading properties data:", error);
        if (active) {
          setAllProperties([]);
          setFilteredProperties([]);
          setCount(0);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadPropertiesData();
    return () => { active = false; };
  }, [searchParams]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
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
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) params.delete('page'); else params.set('page', String(next));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    if (typeof document !== 'undefined') {
      document.getElementById('catalog-listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getSortLabel = () => {
    switch (sortOption) {
      case 'featured': return s.sortFeatured;
      case 'price-asc': return s.sortPriceAsc;
      case 'price-desc': return s.sortPriceDesc;
      case 'rating': return s.sortRating;
      default: return s.sortFeatured;
    }
  };

  const getDynamicTitle = () => {
    if (hasSearched && filteredProperties.length > 0) {
      const cityParam = searchParams.get('city');
      return cityParam ? `${es ? 'Propiedades en' : 'Properties in'} ${cityParam}` : (es ? "Resultados de búsqueda" : "Search Results");
    } else if (hasSearched && filteredProperties.length === 0) {
      return es ? "No se encontraron propiedades" : "No Properties Found";
    } else {
      return v.title;
    }
  };

  const getDynamicSubtitle = () => {
    if (hasSearched && filteredProperties.length > 0) {
      return es
        ? `Encontramos ${filteredProperties.length} espacios que coinciden con tu búsqueda. Descubre estilo inigualable abajo.`
        : `Found ${filteredProperties.length} spaces matching your travel criteria. Discover unmatched style below.`;
    } else if (hasSearched && filteredProperties.length === 0) {
      return es ? "No encontramos resultados para tu búsqueda. Ajusta las fechas o elige otra ubicación." : "We couldn't find matches for your search criteria. Try adjusting your dates or choose an alternative location.";
    } else {
      return v.subtitle;
    }
  };

  const sortOptions = [
    { key: 'featured', label: s.sortFeatured },
    { key: 'price-asc', label: s.sortPriceAsc },
    { key: 'price-desc', label: s.sortPriceDesc },
    { key: 'rating', label: s.sortRating },
  ];

  return (
    <main className="catalog-page-container">

      {/* 1. HERO INMERSIVO */}
      <section className="catalog-hero">
        <div className="catalog-hero-overlay"></div>
        <div className="catalog-hero-content">
          <span className="catalog-badge">{v.badge}</span>
          <h1 className="catalog-title">{getDynamicTitle()}</h1>
          <p className="catalog-subtitle">{getDynamicSubtitle()}</p>
        </div>
      </section>

      {/* 2. SECCIÓN DE LISTADOS */}
      <section className="catalog-listings-section" id="catalog-listings">

        <div className="listings-editorial-header">
          <span className="pre-title">{s.secPre}</span>
          <h2>{hasSearched ? s.secTitleSearch : s.secTitleDefault}</h2>
          <p>{s.secText}</p>
        </div>

        <div className="catalog-meta-row">
          <span className="properties-count">
            {s.showingA} <strong>{isLoading ? "..." : (hasSearched ? filteredProperties.length : count)}</strong> {s.showingB}
          </span>

          {/* SORT DROPDOWN (funcional, client-side) */}
          <div className="catalog-sort-filter">
            <button
              className="btn-filter-selector"
              type="button"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            >
              <span>{s.sortBy} {getSortLabel()}</span>
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: isSortDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {isSortDropdownOpen && (
              <div className="sort-dropdown-menu">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.key}
                    className={`sort-option ${sortOption === opt.key ? 'active' : ''}`}
                    onClick={() => { setSortOption(opt.key); setIsSortDropdownOpen(false); }}
                  >
                    <span>{opt.label}</span>
                    {sortOption === opt.key && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* GRID */}
        <div className="catprop-grid">
          {isLoading ? (
            Array.from({ length: PAGE_SIZE }).map((_, idx) => (
              <div key={idx} className="catprop-card animate-pulse" style={{ opacity: 0.5 }}>
                <div className="catalog-image-box" style={{ backgroundColor: '#e4e4e7' }}></div>
                <div className="catalog-info-box">
                  <div style={{ height: '12px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '30%' }}></div>
                  <div style={{ height: '16px', backgroundColor: '#e4e4e7', marginTop: '12px', borderRadius: '4px', width: '85%' }}></div>
                  <div style={{ height: '12px', backgroundColor: '#e4e4e7', marginTop: '8px', borderRadius: '4px', width: '60%' }}></div>
                  <div style={{ height: '24px', backgroundColor: '#e4e4e7', marginTop: '16px', borderRadius: '4px', width: '100%' }}></div>
                </div>
              </div>
            ))
          ) : filteredProperties.length === 0 ? (
            <div className="w-full text-center py-12 text-gray-400 text-sm" style={{ gridColumn: '1 / -1' }}>
              {s.empty}
            </div>
          ) : (
            filteredProperties.map((prop) => (
              <a href={`${es ? '/es' : ''}/properties/${prop.id}`} key={prop.id} className="link-dinamic" style={{ textDecoration: 'none' }}>
                <div className="catprop-card">
                  <div className="catalog-image-box">
                    <img
                      src={prop.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"}
                      alt={prop.title}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                    <HeartButton
                      className="catalog-heart-btn"
                      item={{
                        id: String(prop.id),
                        type: 'property',
                        title: prop.title,
                        image: prop.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
                        price: `${prop.price?.currency || '$'}${prop.price?.amount || 0} / ${prop.price?.period || 'night'}`,
                        href: `${es ? '/es' : ''}/properties/${prop.id}`,
                        location: prop.location || (es ? "Destino exclusivo" : "Exclusive Destination"),
                      }}
                    />
                  </div>

                  <div className="catalog-info-box">
                    <div className="catalog-location-row">
                      <span className="location-text">{prop.location || (es ? "Destino exclusivo" : "Exclusive Destination")}</span>
                    </div>
                    <h4 className="catalog-prop-title">{prop.title}</h4>

                    {/* Specs en chips */}
                    <div className="catalog-prop-specs">
                      <span className="spec-item">{prop.features?.bedrooms || 0} {es ? "hab." : "bedrooms"}</span>
                      <span className="spec-item">{prop.features?.bathrooms || 0} {es ? "baños" : "baths"}</span>
                      {prop.features?.guests ? (
                        <span className="spec-item">{prop.features.guests} {es ? "huéspedes" : "guests"}</span>
                      ) : null}
                    </div>

                    <div className="catalog-price-row">
                      <span className="price-text">
                        <strong>{prop.price?.currency || '$'}{prop.price?.amount || 0}</strong> / {prop.price?.period || (es ? 'noche' : 'night')}
                      </span>
                      <span className="rating-text">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        {prop.rating || "5.0"}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>

        {/* PAGINACIÓN NUMERADA (solo catálogo, no búsqueda) */}
        {!hasSearched && totalPages > 1 && (
          <div className="catprop-pager">
            <button className="catprop-pager-btn" onClick={() => goPage(current - 1)} disabled={current === 1} aria-label={es ? "Página anterior" : "Previous page"}>‹</button>
            {pageList.map((n, idx) =>
              typeof n === 'number' ? (
                <button key={n} className={`catprop-pager-num ${n === current ? 'active' : ''}`} onClick={() => goPage(n)}>{n}</button>
              ) : (
                <span key={`ellipsis-${idx}`} className="catprop-pager-ellipsis">…</span>
              )
            )}
            <button className="catprop-pager-btn" onClick={() => goPage(current + 1)} disabled={current === totalPages} aria-label={es ? "Página siguiente" : "Next page"}>›</button>
          </div>
        )}
      </section>

      {/* 3. SECCIÓN DE MEMBRESÍAS */}
      <Membership />

      <StructuredData type="Product" data={propertiesPageStructuredData} />
    </main>
  );
}

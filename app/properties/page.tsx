"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import './properties.css';
import Link from 'next/link';

// CORRECCIÓN: Importamos el tipo correcto PropertyCardData usando rutas absolutas (@/)
import { getProperties, searchProperties, PropertyCardData } from '../lib/api/properties';

function PropertiesCatalogContent() {
  const [allProperties, setAllProperties] = useState<PropertyCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    async function loadPropertiesData() {
      try {
        setIsLoading(true);
        
        const city = searchParams.get('city');
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');
        const guests = searchParams.get('guests');
        
        if (city || checkIn || checkOut || guests) {
          setHasSearched(true);
          const searchData = await searchProperties({
            city: city || undefined,
            checkIn: checkIn || undefined,
            checkOut: checkOut || undefined,
            guests: guests ? parseInt(guests, 10) : undefined,
            limit: 50
          });
          setAllProperties(searchData);
        } else {
          setHasSearched(false);
          const propertiesData = await getProperties({ limit: 50 });
          setAllProperties(propertiesData);
        }
      } catch (error) {
        console.error("Error loading properties data:", error);
        setAllProperties([]); 
      } finally {
        setIsLoading(false);
      }
    }

    loadPropertiesData();
  }, [searchParams]);

  const getDynamicTitle = () => {
    if (hasSearched && allProperties.length > 0) {
      const cityParam = searchParams.get('city');
      return cityParam ? `Properties in ${cityParam}` : "Search Results";
    } else if (hasSearched && allProperties.length === 0) {
      return "No Properties Found";
    } else {
      return "Luxury Properties for Rent";
    }
  };

  const getDynamicSubtitle = () => {
    if (hasSearched && allProperties.length > 0) {
      return `Found ${allProperties.length} spaces matching your travel criteria. Discover unmatched style below.`;
    } else if (hasSearched && allProperties.length === 0) {
      return "We couldn't find matches for your search criteria. Try adjusting your dates or choose a alternative location.";
    } else {
      return "Discover exceptional vacation rentals and luxury properties. From cozy retreats to grand estates, find your perfect home.";
    }
  };

  return (
    <main className="catalog-page-container">
      
      {/* 1. HERO INMERSIVO */}
      <section className="catalog-hero">
        <div className="catalog-hero-overlay"></div>
        <div className="catalog-hero-content">
          <span className="catalog-badge">Premium Collection</span>
          <h1 className="catalog-title">{getDynamicTitle()}</h1>
          <p className="catalog-subtitle">{getDynamicSubtitle()}</p>
        </div>
      </section>

      {/* 2. SECCIÓN DE LISTADOS ESTILO WANDER */}
      <section className="catalog-listings-section">
        
        <div className="listings-editorial-header">
          <span className="pre-title">The Collection</span>
          <h2>{hasSearched ? "Available Getaways" : "Find Your Perfect Place"}</h2>
          <p>Explore our complete portfolio of institutionally managed luxury homes, crafted for exceptional stays.</p>
        </div>

        <div className="catalog-meta-row">
          <span className="properties-count">
            Showing <strong>{isLoading ? "..." : allProperties.length}</strong> extraordinary spaces
          </span>
          <div className="catalog-sort-filter">
            <button className="btn-filter-selector" type="button">
              <span>Sort by: Featured</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        </div>

        {/* GRID DE COLUMNAS DINÁMICO */}
        <div className="catalog-grid">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="catalog-card animate-pulse" style={{ opacity: 0.5 }}>
                <div className="catalog-image-box" style={{ backgroundColor: '#e4e4e7' }}></div>
                <div className="catalog-info-box">
                  <div style={{ height: '12px', backgroundColor: '#e4e4e7', borderRadius: '4px', width: '30%' }}></div>
                  <div style={{ height: '16px', backgroundColor: '#e4e4e7', marginTop: '12px', borderRadius: '4px', width: '85%' }}></div>
                  <div style={{ height: '12px', backgroundColor: '#e4e4e7', marginTop: '8px', borderRadius: '4px', width: '60%' }}></div>
                  <div style={{ height: '24px', backgroundColor: '#e4e4e7', marginTop: '16px', borderRadius: '4px', width: '100%' }}></div>
                </div>
              </div>
            ))
          ) : allProperties.length === 0 ? (
            <div className="w-full text-center py-12 text-gray-400 text-sm" style={{ gridColumn: '1 / -1' }}>
              No properties available at the moment matching this horizon.
            </div>
          ) : (
            allProperties.map((prop) => (
              <Link href={`/properties/${prop.id}`} key={prop.id} className="link-dinamic" style={{ textDecoration: 'none' }}>
                <div className="catalog-card">
                  <div className="catalog-image-box">
                    <img 
                      src={prop.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"} 
                      alt={prop.title} 
                      loading="lazy" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                    <button className="catalog-heart-btn" aria-label="Save to wishlist" type="button" onClick={(e) => e.preventDefault()}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                  </div>
                  
                  <div className="catalog-info-box">
                    <div className="catalog-location-row">
                      <span className="location-text">{prop.location || "Exclusive Destination"}</span>
                    </div>
                    <h4 className="catalog-prop-title">{prop.title}</h4>
                    <p className="catalog-prop-specs">
                      {prop.features?.bedrooms || 0} bedrooms • {prop.features?.bathrooms || 0} baths
                    </p>
                    
                    <div className="catalog-price-row">
                      <span className="price-text">
                        <strong>{prop.price?.currency || '$'}{prop.price?.amount || 0}</strong> / {prop.price?.period || 'night'}
                      </span>
                      <span className="rating-text">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        {prop.rating || "5.0"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="catalog-pagination-container">
          <button className="btn-load-more" type="button">Load more properties</button>
        </div>
      </section>

    </main>
  );
}

// Envuelto en Suspense por requerimiento estricto de Next.js al usar useSearchParams() fuera de componentes estáticos
export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="w-full text-center py-20 text-sm text-gray-400">Loading catalog horizon...</div>
    }>
      <PropertiesCatalogContent />
    </Suspense>
  );
}
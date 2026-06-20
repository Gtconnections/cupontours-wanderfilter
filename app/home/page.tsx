"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { getProperties } from "@/lib/api/properties";
import { getCars, getYachts } from "@/lib/api";
import { Car, Yacht } from "@/types/globals";
import { PropertyCardData } from "@/components/ui/property-card";
import './home.css';

interface RenderRowProps {
  title: string;
  pretitle: string;
  data: any[]; 
  type: 'home' | 'car' | 'yacht';
  favorites: string[];
  onFavorite: (id: string) => void;
  isLoading: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const results = await Promise.allSettled([
          getProperties({ limit: 8 }).catch(() => []),
          getCars().catch(() => ({ results: [] })),
          getYachts().catch(() => ({ results: [] }))
        ]);
        
        if (results[0].status === 'fulfilled' && Array.isArray(results[0].value)) {
          setProperties(results[0].value);
        }
        
        if (results[1].status === 'fulfilled' && results[1].value?.results) {
          setCars(results[1].value.results.slice(0, 4));
        }
        
        if (results[2].status === 'fulfilled' && results[2].value?.results) {
          setYachts(results[2].value.results.slice(0, 4));
        }
        
      } catch (error) {
        // Fallback silencioso
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const RenderRow = ({ title, pretitle, data, type, favorites, onFavorite, isLoading }: RenderRowProps) => (
    <section className="home-row-section">
      <div className="row-header">
        <div className="row-title-area">
          <span className="row-pretitle">{pretitle}</span>
          <h3>{title}</h3>
        </div>
        <div className="carousel-nav">
          <button aria-label="Previous" type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></button>
          <button aria-label="Next" type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="property-carousel">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="prop-card animate-pulse" style={{ opacity: 0.6 }}>
              <div className={`prop-image-container ${type === 'car' ? 'car-ratio' : type === 'yacht' ? 'yacht-ratio' : ''}`} style={{ background: '#f0f0f2' }}></div>
              <div style={{ height: '14px', background: '#f0f0f2', marginTop: '12px', borderRadius: '4px', width: '70%' }}></div>
              <div style={{ height: '10px', background: '#f0f0f2', marginTop: '8px', borderRadius: '4px', width: '40%' }}></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="property-carousel">
          {data.map((item: any) => {
            const id = String(item.id || item._id);
            const titleText = item.title || item.name || "Exclusive Item";
            
            // CORREGIDO: Extrae de forma segura el array de imágenes mapeado por convertHostawayToPropertyCard
            const imageSrc = item.images?.[0] || item.img || item.image || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80";
            
            // CORREGIDO: Mapeo elástico adaptado a la estructura item.features de tu API
            let specsText = "";
            if (type === 'home') {
              const beds = item.features?.bedrooms ?? item.bedrooms ?? 0;
              const baths = item.features?.bathrooms ?? item.bathrooms ?? 0;
              specsText = `${beds} bedrooms • ${baths} baths`;
            } else if (type === 'car') {
              specsText = item.specs || `${item.seats || 5} Seats • Luxury SUV`;
            } else if (type === 'yacht') {
              specsText = item.specs || `${item.guests || 12} Guests • ${item.cabins || 3} Cabins`;
            }

            // CORREGIDO: Mapeo elástico adaptado al objeto item.price {amount, currency, period}
            let priceText = "";
            if (item.price && typeof item.price === 'object') {
              const amount = item.price.amount ?? 0;
              const currency = item.price.currency ?? '$';
              const period = item.price.period ?? 'night';
              priceText = type === 'home' ? `${currency}${amount} for 2 nights` : `${currency}${amount} / day`;
            } else {
              priceText = item.price ? String(item.price) : "$250 / day";
            }

            const ratingValue = item.rating || "5.0";
            const isFav = favorites.includes(id);

            return (
              <div key={id} className="prop-card" onClick={() => router.push(`/${type === 'home' ? 'properties' : type === 'car' ? 'cars' : 'yachts'}/${id}`)}>
                <div className={`prop-image-container ${type === 'car' ? 'car-ratio' : type === 'yacht' ? 'yacht-ratio' : ''}`}>
                  <img src={imageSrc} alt={titleText} />
                  <button 
                    type="button"
                    className="heart-btn" 
                    aria-label="Save"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      onFavorite(id);
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={isFav ? "text-red-500" : ""}>
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
                <div className="prop-info">
                  <div className="prop-title-row">
                    <h4>{titleText}</h4>
                  </div>
                  <p className="prop-specs">{specsText}</p>
                  <div className="prop-price-row">
                    <span className="price">{priceText}</span>
                    <span className="rating">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {ratingValue}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

  return (
    <main className="home-page-container">
      
      <section className="home-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">Luxury Vacation Rentals, Cars & Yachts</div>
          <h1 className="hero-title">Experience the world<br />in absolute style.</h1>
          <p className="hero-subtitle">Handcrafted experiences combining institutional-grade real estate assets, exotic car rentals, and elite yacht charters.</p>
        </div>
      </section>

      <section className="categories-filter-section">
        <div className="filter-wrapper">
          <button className={`filter-pill ${activeCategory === "" ? "active" : ""}`} onClick={() => handleCategoryChange("")}>All Collections</button>
          <button className={`filter-pill ${activeCategory === "homes" ? "active" : ""}`} onClick={() => handleCategoryChange("homes")}>Vacation Homes</button>
          <button className={`filter-pill ${activeCategory === "cars" ? "active" : ""}`} onClick={() => handleCategoryChange("cars")}>Premium Fleet</button>
          <button className={`filter-pill ${activeCategory === "yachts" ? "active" : ""}`} onClick={() => handleCategoryChange("yachts")}>Yacht Charters</button>
        </div>
      </section>

      <div className="home-listings-container">
        
        {(activeCategory === "" || activeCategory === "homes") && (
          <RenderRow 
            pretitle="Curation" 
            title="Enjoy your stay inside one of our properties" 
            data={properties} 
            type="home"
            favorites={favorites}
            onFavorite={handleFavorite}
            isLoading={isLoading}
          />
        )}
        
        {(activeCategory === "" || activeCategory === "cars") && (
          <div className="mid-banner banner-cars" onClick={() => router.push('/cars')} style={{ cursor: 'pointer' }}>
            <div className="mid-banner-overlay"></div>
            <div className="mid-banner-content">
              <h2>Drive in Style Through Miami</h2>
              <p>Access our premium fleet of SUVs, electric models, and sportscars tailored for your trip.</p>
            </div>
          </div>
        )}

        {(activeCategory === "" || activeCategory === "cars") && (
          <RenderRow 
            pretitle="The Premium Fleet" 
            title="Exceptional cars for ultimate performance" 
            data={cars} 
            type="car"
            favorites={favorites}
            onFavorite={handleFavorite}
            isLoading={isLoading}
          />
        )}

        {(activeCategory === "" || activeCategory === "yachts") && (
          <div className="mid-banner banner-yachts" onClick={() => router.push('/yachts')} style={{ cursor: 'pointer' }}>
            <div className="mid-banner-overlay"></div>
            <div className="mid-banner-content">
              <h2>Set Sail On Your Next Adventure</h2>
              <p>From private day charters to custom multi-cabin mega yachts on coastal waters.</p>
            </div>
          </div>
        )}

        {(activeCategory === "" || activeCategory === "yachts") && (
          <RenderRow 
            pretitle="Yacht Charter Collection" 
            title="Elegance on water, designed for luxury" 
            data={yachts} 
            type="yacht"
            favorites={favorites}
            onFavorite={handleFavorite}
            isLoading={isLoading}
          />
        )}
      </div>

      <section className="platforms-marquee-section">
        <div className="marquee-wrapper">
          <span className="marquee-title">Platforms & Partnerships</span>
          <div className="marquee-row">
            <span>Airbnb</span>
            <span>Vrbo</span>
            <span>Booking.com</span>
            <span>Tripadvisor</span>
            <span>Turo</span>
            <span>BNB Flow</span>
            <span>PriceLabs</span>
          </div>
        </div>
      </section>

    </main>
  );
}
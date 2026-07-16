"use client";

import React, { useState, useEffect } from 'react';
import { StructuredData } from "@/components/seo/structured-data"
import './home.css';
import Link from 'next/link';

// IMPORTAMOS LAS RUTAS DE LA API USANDO EL ALIAS GLOBAL (@/) Y EL NUEVO TIPO
import { getHomeProperties, PropertyCardData } from '../lib/api/properties';
import { getCars, CarCatalogItem } from '../lib/api/cars';
import { getYachts, YachtCatalogItem } from '../lib/api/yachts';

// Page-specific structured data for home page
const homePageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Luxury Travel Deals - Vacation Rentals, Car & Yacht Rentals",
  "description": "Find exclusive deals on luxury vacation rentals, premium car rentals, and yacht charters worldwide",
  "mainEntity": {
    "@type": "TravelAgency",
    "name": "Cupon Tours",
    "serviceType": ["Vacation Rental", "Car Rental", "Yacht Charter"]
  }
}

// Definimos la unión de tipos admitida en el carrusel
type GenericCatalogItem = PropertyCardData | CarCatalogItem | YachtCatalogItem;

interface RenderRowProps {
  title: string;
  pretitle: string;
  data: GenericCatalogItem[];
  type: 'home' | 'car' | 'yacht';
  isLoading: boolean;
}

export default function HomePage() {
  const [homes, setHomes] = useState<PropertyCardData[]>([]);
  const [cars, setCars] = useState<CarCatalogItem[]>([]);
  const [yachts, setYachts] = useState<YachtCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [homesData, carsData, yachtsData] = await Promise.all([
          getHomeProperties(),
          getCars(),
          getYachts()
        ]);

        setHomes(homesData.slice(0, 8));
        setCars(carsData.slice(0, 4));
        setYachts(yachtsData.slice(0, 4));
      } catch (error) {
        console.error("Error al cargar datos globales:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const RenderRow = ({ title, pretitle, data, type, isLoading }: RenderRowProps) => {
    const routePrefix = type === 'home' ? 'properties' : type === 'car' ? 'cars' : 'yachts';

    return (
      <section className="home-row-section">
        <div className="row-header">
          <div className="row-title-area">
            <span className="row-pretitle">{pretitle}</span>
            <h3>{title}</h3>
          </div>
        </div>
        
        <div className="property-carousel">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="prop-card animate-pulse" style={{ opacity: 0.5 }}>
                <div className={`prop-image-container ${type === 'car' ? 'car-ratio' : type === 'yacht' ? 'yacht-ratio' : ''}`} style={{ backgroundColor: '#e4e4e7' }}></div>
                <div style={{ height: '16px', backgroundColor: '#e4e4e7', marginTop: '12px', borderRadius: '4px', width: '80%' }}></div>
                <div style={{ height: '12px', backgroundColor: '#e4e4e7', marginTop: '8px', borderRadius: '4px', width: '50%' }}></div>
              </div>
            ))
          ) : data.length === 0 ? (
            <div className="w-full text-center py-8 text-gray-400 text-sm">
              No elements available in this collection at the moment.
            </div>
          ) : (
            data.map((item) => {
              // Verificamos en tiempo de ejecución si el item es del nuevo formato Hostaway
              const isProperty = type === 'home';
              
              // Mapeo adaptativo dinámico según el tipo de catálogo
              const imgUrl = isProperty 
                ? ((item as PropertyCardData).images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80")
                : (item as CarCatalogItem | YachtCatalogItem).img;

              const displaySpecs = isProperty
                ? `${(item as PropertyCardData).features?.bedrooms || 0} bedrooms • ${(item as PropertyCardData).features?.bathrooms || 0} baths`
                : (item as CarCatalogItem | YachtCatalogItem).specs;

              const displayPrice = isProperty
                ? `${(item as PropertyCardData).price?.currency || '$'}${(item as PropertyCardData).price?.amount || 0} / ${(item as PropertyCardData).price?.period || 'night'}`
                : (item as CarCatalogItem | YachtCatalogItem).price;

              const displayRating = isProperty
                ? ((item as PropertyCardData).rating || "5.0")
                : (item as CarCatalogItem | YachtCatalogItem).rating;

              return (
                <a href={`/${routePrefix}/${item.id}`} key={item.id} className="prop-card-link-wrapper" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="prop-card">
                    <div className={`prop-image-container ${type === 'car' ? 'car-ratio' : type === 'yacht' ? 'yacht-ratio' : ''}`}>
                      <img 
                        src={imgUrl} 
                        alt={item.title} 
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = type === 'car'
                            ? "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"
                            : "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                      <button className="heart-btn" aria-label="Save to wishlist" type="button" onClick={(e) => e.preventDefault()}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </button>
                    </div>
                    <div className="prop-info">
                      <div className="prop-title-row">
                        <h4>{item.title}</h4>
                      </div>
                      <p className="prop-specs">{displaySpecs}</p>
                      <div className="prop-price-row">
                        <span className="price">{displayPrice}</span>
                        <span className="rating">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          {displayRating}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })
          )}
        </div>
      </section>
    );
  };

  // Reusable Check Icon for Membership lists
  const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
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
          <Link href="/properties" className="filter-pill active">Properties</Link>
          <Link href="/cars" className="filter-pill">Luxury Cars</Link>
          <Link href="/yachts" className="filter-pill">Yachts Charters</Link>
          <Link href="/jets" className="filter-pill">Jets</Link>
        </div>
      </section>

      <div className="home-listings-container">
        <RenderRow pretitle="Curation" title="Enjoy your stay inside one of our properties" data={homes} type="home" isLoading={isLoading} />
        
        {/* INTERMEDIATE BANNER PROPERTIES */}
        <div className="mid-banner banner-properties">
          <div className="mid-banner-overlay"></div>
          <div className="mid-banner-content">
            <h2>Book Your Dream Vacation Today!</h2>
            <p>Don't wait to create unforgettable memories. Our luxury properties offer the perfect blend of comfort and elegance for your next getaway. Reserve now and experience hospitality at its finest.</p>
            <Link href="/properties" className="btn-banner-cta">
              Explore Properties
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>
        </div>

        <RenderRow pretitle="The Premium Fleet" title="Exceptional cars for ultimate performance" data={cars} type="car" isLoading={isLoading} />

        {/* INTERMEDIATE BANNER CARS */}
        <div className="mid-banner banner-cars">
          <div className="mid-banner-overlay"></div>
          <div className="mid-banner-content">
            <h2>Drive in Style Through Miami</h2>
            <p>Access our premium fleet of SUVs, electric models, and sportscars tailored for your trip.</p>
            <Link href="/cars" className="btn-banner-cta">
              View Fleet
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>
        </div>

        <RenderRow pretitle="Yacht Charter Collection" title="Elegance on water, designed for luxury" data={yachts} type="yacht" isLoading={isLoading} />
      
        {/* INTERMEDIATE BANNER YACHTS */}
        <div className="mid-banner banner-yachts">
          <div className="mid-banner-overlay"></div>
          <div className="mid-banner-content">
            <h2>Set Sail On Your Next Adventure</h2>
            <p>From private day charters to custom multi-cabin mega yachts on coastal waters.</p>
            <Link href="/yachts" className="btn-banner-cta">
              Explore Charters
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>
        </div>
      </div>

      {/* NEW MEMBERSHIP CLUB SECTION */}
      <section className="membership-section">
        <div className="membership-container">
          <div className="membership-header">
            <span className="membership-pretitle">Membresías</span>
            <h2 className="membership-title">Únete <span>al Club.</span></h2>
            <p className="membership-subtitle">
              Disfrute de los beneficios de formar parte del primer club en Miami que le ofrece una variedad de beneficios en restaurantes exclusivos, spa, compras, eventos y mucho más.
            </p>
          </div>

          <div className="membership-grid">
            {/* ELITE CARD */}
            <div className="membership-card">
              <h3 className="card-tier">Elite</h3>
              <div className="card-price">$95<span>/ MENSUAL</span></div>
              <ul className="card-benefits">
                <li><CheckIcon /> Acceso completo a todos los servicios del club y partners exclusivos con 15% de descuento</li>
                <li><CheckIcon /> Servicios y cuidado personal</li>
                <li><CheckIcon /> Spa y salón a domicilio</li>
                <li><CheckIcon /> Reservas en restaurantes</li>
                <li><CheckIcon /> Planificación y reservas de eventos</li>
                <li><CheckIcon /> Vida nocturna VIP y arreglos a medida</li>
                <li><CheckIcon /> Inyección mensual gratuita de B12 IV</li>
                <li><CheckIcon /> Acceso a las instalaciones del club e invitaciones a eventos privados de networking</li>
              </ul>
              <button className="btn-membership">Solicitar Información</button>
            </div>

            {/* PLATINUM CARD (HIGHLIGHTED) */}
            <div className="membership-card highlight">
              <div className="membership-badge">Más Completo</div>
              <h3 className="card-tier">Platinum</h3>
              <div className="card-price">$300<span>/ MENSUAL</span></div>
              <ul className="card-benefits">
                <li><CheckIcon /> Acceso completo a todos los servicios y partners con 20% de descuento</li>
                <li><CheckIcon /> Servicio completo de inspección residencial</li>
                <li><CheckIcon /> Transporte privado</li>
                <li><CheckIcon /> Servicios y cuidado personal</li>
                <li><CheckIcon /> Housekeeping y servicios a domicilio</li>
                <li><CheckIcon /> Reservas en restaurantes</li>
                <li><CheckIcon /> Viajes y arreglos privados</li>
                <li><CheckIcon /> Experiencia de chef privado y dining</li>
                <li><CheckIcon /> Spa y salón a domicilio</li>
                <li><CheckIcon /> Planificación y reservas de eventos</li>
                <li><CheckIcon /> Inyección mensual gratuita de B12 IV</li>
              </ul>
              <button className="btn-membership">Solicitar Información</button>
            </div>

            {/* CORPORATE CARD */}
            <div className="membership-card">
              <h3 className="card-tier">Corporate</h3>
              <div className="card-price">$200<span>/ MENSUAL</span></div>
              <ul className="card-benefits">
                <li><CheckIcon /> Acceso completo a todos los servicios y partners exclusivos con 15% de descuento</li>
                <li><CheckIcon /> Búsqueda de propiedades corporativas o ejecutivas</li>
                <li><CheckIcon /> Chef privado y catering gourmet para eventos privados</li>
                <li><CheckIcon /> Producción de eventos corporativos, lanzamientos y after-office</li>
                <li><CheckIcon /> Logística para delegaciones o clientes VIP</li>
                <li><CheckIcon /> Transporte privado con chofer</li>
                <li><CheckIcon /> Reserva de jets privados y helicópteros</li>
                <li><CheckIcon /> Reservas ejecutivas y coordinación de viajes VIP</li>
                <li><CheckIcon /> Alquiler de coches premium</li>
              </ul>
              <button className="btn-membership">Solicitar Información</button>
            </div>
          </div>
        </div>
      </section>

      {/* Page-specific structured data for SEO */}
      <StructuredData 
        type="Product" 
        data={homePageStructuredData} 
      />
    </main>
  );
}
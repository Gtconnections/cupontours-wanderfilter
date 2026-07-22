"use client";

import React, { useState, useEffect } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import './cars.css';
import Link from 'next/link';
import Membership from '@/components/Membership';
import HeartButton from '@/components/wishlist/HeartButton';

// IMPORTAMOS LA FUNCIÓN DE LA API Y SU INTERFAZ CORREGIDA
import { getCars, CarCatalogItem } from '../../lib/api/cars';

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

export default function CarsPage() {
  const [fleet, setFleet] = useState<CarCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCars() {
      try {
        setIsLoading(true);
        const carsData = await getCars();
        setFleet(carsData);
      } catch (error) {
        console.error("Error loading fleet page data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCars();
  }, []);

  return (
    <main className="fleet-page-container">

      {/* 1. HERO */}
      <section className="fleet-hero">
        <div className="fleet-hero-overlay"></div>
        <div className="fleet-hero-content">
          <span className="fleet-badge">Premium Fleet</span>
          <h1 className="fleet-title">Luxury Car Rentals in Miami</h1>
          <p className="fleet-subtitle">Discover our premium fleet of luxury vehicles. From elegant sedans to massive SUVs and exotic sports cars, find the perfect match to experience the city in style.</p>
        </div>
      </section>

      {/* 2. CONTENEDOR DEL CATÁLOGO DE AUTOS */}
      <section className="fleet-listings-section">

        {/* Cabecera Editorial */}
        <div className="fleet-editorial-header">
          <span className="pre-title">The Collection</span>
          <h2>Premium Car Rentals</h2>
          <p>Explore our curated selection of high-performance vehicles, meticulously maintained and ready to elevate your driving experience.</p>
        </div>

        <div className="fleet-meta-row">
          <span className="fleet-count">
            Available vehicles: <strong>{isLoading ? "..." : fleet.length}</strong>
          </span>
        </div>

        {/* GRID DE 4 COLUMNAS */}
        <div className="fleet-grid">
          {isLoading ? (
            // SKELETONS DE CARGA ELEGANTES MIENTRAS CONECTA CON LA BASE DE DATOS
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
              No vehicles available at the moment.
            </div>
          ) : (
            fleet.map((car) => (
              // RESPETAMOS EL ENLACE EXACTO AL DETALLE DINÁMICO
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

                    {/* Specs en chips (formato "Model 2023 • Premium Fleet") */}
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
      </section>

      {/* 3. SECCIÓN DE MEMBRESÍAS */}
      <Membership />

      <StructuredData type="Product" data={carsPageStructuredData} />
    </main>
  );
}

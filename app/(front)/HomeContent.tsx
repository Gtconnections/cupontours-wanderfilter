"use client";

import React, { useState, useEffect } from 'react';
import { StructuredData } from "@/components/seo/structured-data"
import './home.css';
import Link from 'next/link';
import Membership from '@/components/Membership';
import HeartButton from '@/components/wishlist/HeartButton';
import { getDict, type Locale } from '@/app/i18n/dictionaries';
import { withLocale } from '@/app/i18n/locale';

import { getHomeProperties, PropertyCardData } from '../lib/api/properties';
import { getCars, CarCatalogItem } from '../lib/api/cars';
import { getYachts, YachtCatalogItem } from '../lib/api/yachts';

const homePageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Luxury Travel Deals - Vacation Rentals, Car & Yacht Rentals",
  "description": "Find exclusive deals on luxury vacation rentals, premium car rentals, and yacht charters worldwide",
  "mainEntity": {
    "@type": "TravelAgency",
    "name": "Cupontours",
    "serviceType": ["Vacation Rental", "Car Rental", "Yacht Charter"]
  }
}

type GenericCatalogItem = PropertyCardData | CarCatalogItem | YachtCatalogItem;

interface RenderRowProps {
  title: string;
  pretitle: string;
  data: GenericCatalogItem[];
  type: 'home' | 'car' | 'yacht';
  isLoading: boolean;
  locale: Locale;
}

function RenderRow({ title, pretitle, data, type, isLoading, locale }: RenderRowProps) {
  const routePrefix = type === 'home' ? 'properties' : type === 'car' ? 'cars' : 'yachts';
  const c = getDict(locale).common;
  const L = (href: string) => withLocale(href, locale);

  return (
    <section className="home-row-section">
      <div className="row-header">
        <div className="row-title-area">
          <span className="row-pretitle">{pretitle}</span>
          <h3>{title}</h3>
        </div>
        <Link href={L(`/${routePrefix}`)} className="row-see-more">
          {c.seeMore}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </Link>
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
            {c.noItems}
          </div>
        ) : (
          data.map((item) => {
            const isProperty = type === 'home';
            const imgUrl = isProperty
              ? ((item as PropertyCardData).images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80")
              : (item as CarCatalogItem | YachtCatalogItem).img;
            const displaySpecs = isProperty
              ? `${(item as PropertyCardData).features?.bedrooms || 0} bd • ${(item as PropertyCardData).features?.bathrooms || 0} ba`
              : (item as CarCatalogItem | YachtCatalogItem).specs;
            const displayPrice = isProperty
              ? `${(item as PropertyCardData).price?.currency || '$'}${(item as PropertyCardData).price?.amount || 0} / ${(item as PropertyCardData).price?.period || 'night'}`
              : (item as CarCatalogItem | YachtCatalogItem).price;
            const displayRating = isProperty
              ? ((item as PropertyCardData).rating || "5.0")
              : (item as CarCatalogItem | YachtCatalogItem).rating;

            return (
              <a href={L(`/${routePrefix}/${item.id}`)} key={item.id} className="prop-card-link-wrapper" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                    <HeartButton
                      className="heart-btn"
                      item={{
                        id: String(item.id),
                        type: type === 'home' ? 'property' : type,
                        title: item.title,
                        image: imgUrl,
                        price: displayPrice,
                        href: L(`/${routePrefix}/${item.id}`),
                        location: isProperty ? ((item as PropertyCardData).location || 'Miami, FL') : 'Miami, FL',
                      }}
                    />
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
}

export default function HomeContent({ locale }: { locale: Locale }) {
  const t = getDict(locale).home;
  const L = (href: string) => withLocale(href, locale);

  const [homes, setHomes] = useState<PropertyCardData[]>([]);
  const [cars, setCars] = useState<CarCatalogItem[]>([]);
  const [yachts, setYachts] = useState<YachtCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [homesData, carsData, yachtsData] = await Promise.all([
          getHomeProperties(), getCars(), getYachts()
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

  return (
    <main className="home-page-container">
      <section className="home-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">{t.heroBadge}</div>
          <h1 className="hero-title">{t.heroTitleA}<br />{t.heroTitleB} <span className="hero-accent">{t.heroAccent}</span></h1>
          <p className="hero-subtitle">{t.heroSubtitle}</p>
        </div>
      </section>

      <section className="categories-filter-section">
        <div className="filter-wrapper">
          <Link href={L('/properties')} className="filter-pill active">{t.pillProperties}</Link>
          <Link href={L('/cars')} className="filter-pill">{t.pillCars}</Link>
          <Link href={L('/yachts')} className="filter-pill">{t.pillYachts}</Link>
          <Link href={L('/jets')} className="filter-pill">{t.pillJets}</Link>
          <Link href={L('/services')} className="filter-pill">{t.pillServices}</Link>
          <Link href="https://luxury.cupontours.com" className="filter-pill" target="_blank">{t.pillVillas}</Link>
        </div>
      </section>

      <div className="home-listings-container">
        <RenderRow pretitle={t.rowHomesPre} title={t.rowHomesTitle} data={homes} type="home" isLoading={isLoading} locale={locale} />

        <div className="mid-banner banner-properties">
          <div className="mid-banner-overlay"></div>
          <div className="mid-banner-content">
            <span className="mid-banner-kicker">{t.bnPropKicker}</span>
            <h2>{t.bnPropTitle}</h2>
            <p>{t.bnPropText}</p>
            <Link href={L('/properties')} className="btn-banner-cta">
              {t.bnPropCta}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>
        </div>

        <RenderRow pretitle={t.rowCarsPre} title={t.rowCarsTitle} data={cars} type="car" isLoading={isLoading} locale={locale} />

        <div className="mid-banner banner-cars">
          <div className="mid-banner-overlay"></div>
          <div className="mid-banner-content">
            <span className="mid-banner-kicker">{t.bnCarsKicker}</span>
            <h2>{t.bnCarsTitle}</h2>
            <p>{t.bnCarsText}</p>
            <Link href={L('/cars')} className="btn-banner-cta">
              {t.bnCarsCta}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>
        </div>

        <RenderRow pretitle={t.rowYachtsPre} title={t.rowYachtsTitle} data={yachts} type="yacht" isLoading={isLoading} locale={locale} />

        <div className="mid-banner banner-yachts">
          <div className="mid-banner-overlay"></div>
          <div className="mid-banner-content">
            <span className="mid-banner-kicker">{t.bnYachtsKicker}</span>
            <h2>{t.bnYachtsTitle}</h2>
            <p>{t.bnYachtsText}</p>
            <Link href={L('/yachts')} className="btn-banner-cta">
              {t.bnYachtsCta}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>
        </div>
      </div>

      <Membership />

      <div className="home-listings-container services-cta-wrapper">
        <div className="mid-banner banner-services">
          <div className="mid-banner-overlay"></div>
          <div className="mid-banner-content">
            <span className="mid-banner-kicker">{t.bnSvcKicker}</span>
            <h2>{t.bnSvcTitle}</h2>
            <p>{t.bnSvcText}</p>
            <Link href={L('/services')} className="btn-banner-cta">
              {t.bnSvcCta}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>
        </div>
      </div>

      <StructuredData type="Product" data={homePageStructuredData} />
    </main>
  );
}

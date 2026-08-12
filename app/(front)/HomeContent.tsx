import { Suspense } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import './home.css';
import Link from 'next/link';
import Membership from '@/components/Membership';
import { getDict, type Locale } from '@/app/i18n/dictionaries';
import { withLocale } from '@/app/i18n/locale';
import { HomesRow, CarsRow, YachtsRow, RowSkeleton } from './HomeRow';

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

export default function HomeContent({ locale }: { locale: Locale }) {
  const t = getDict(locale).home;
  const L = (href: string) => withLocale(href, locale);

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
        <Suspense fallback={<RowSkeleton pretitle={t.rowHomesPre} title={t.rowHomesTitle} type="home" locale={locale} />}>
          <HomesRow locale={locale} pretitle={t.rowHomesPre} title={t.rowHomesTitle} />
        </Suspense>

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

        <Suspense fallback={<RowSkeleton pretitle={t.rowCarsPre} title={t.rowCarsTitle} type="car" locale={locale} />}>
          <CarsRow locale={locale} pretitle={t.rowCarsPre} title={t.rowCarsTitle} />
        </Suspense>

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

        <Suspense fallback={<RowSkeleton pretitle={t.rowYachtsPre} title={t.rowYachtsTitle} type="yacht" locale={locale} />}>
          <YachtsRow locale={locale} pretitle={t.rowYachtsPre} title={t.rowYachtsTitle} />
        </Suspense>

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

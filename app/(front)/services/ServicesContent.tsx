import React from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import './services.css';
import Link from 'next/link';
import { getServicesMain, type Locale } from '@/app/i18n/dictionaries';
import { withLocale } from '@/app/i18n/locale';

const servicesPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Cupontours Services",
  "description": "Explore our full range of luxury concierge services: properties, cars, yachts, jets, transport, real estate, experiences, wellness, health and events.",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Cupontours Services"
  }
};

// Íconos decorativos por categoría — puramente visuales, no alteran ninguna info del catálogo.
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Properties': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11.5L12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </svg>
  ),
  'Luxury Properties': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,17 3,8 8,12 12,6 16,12 21,8 21,17" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
  ),
  'Cars': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="6" rx="2" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
      <path d="M5 11l2-4h10l2 4" />
    </svg>
  ),
  'Yachts': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 15h18l-2 5H5z" />
      <path d="M12 15V4" />
      <path d="M12 4l5 6H8z" />
    </svg>
  ),
  'Private Jet': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  'Private Transport': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="10" width="14" height="7" rx="1" />
      <path d="M16 12h4l2 3v2h-6z" />
      <circle cx="7" cy="19.5" r="1.5" />
      <circle cx="17" cy="19.5" r="1.5" />
    </svg>
  ),
  'Experiences': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polygon points="15.5 8.5 13 13 8.5 15.5 11 11 15.5 8.5" />
    </svg>
  ),
  'Real Estate': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <line x1="9" y1="7.5" x2="9" y2="7.5" strokeWidth="2" />
      <path d="M8.5 7.5h1M14.5 7.5h1M8.5 11.5h1M14.5 11.5h1M8.5 15.5h1M14.5 15.5h1" />
    </svg>
  ),
  'Servicios': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  'Wellness': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-4 3-6 7-6 11a6 6 0 0 0 12 0c0-4-2-8-6-11z" />
      <path d="M12 8v13" />
    </svg>
  ),
  'Health': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </svg>
  ),
  'Events': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  ),
};

export default function ServicesContent({ locale = 'en' }: { locale?: Locale }) {
  const t = getServicesMain(locale);
  const L = (href: string) => withLocale(href, locale);
  // 1. CATÁLOGO ACTUALIZADO (Con Properties, Luxury Properties y enlace reparado)
  const categories = [
    { title: 'Properties', link: '/properties', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80' },
    { title: 'Luxury Properties', link: 'https://luxury.cupontours.com', img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80' },
    { title: 'Cars', link: '/cars', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80' },
    { title: 'Yachts', link: '/yachts', img: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=80' },
    { title: 'Private Jet', link: '/jets', img: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=800&q=80' },
    { title: 'Private Transport', link: '/services/transport', img: 'https://images.unsplash.com/photo-1627042633145-b780d842ba45?auto=format&fit=crop&w=800&q=80' },
    { title: 'Experiences', link: '/services/experiences', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80' },
    { title: 'Real Estate', link: '/services/real-estate', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' }, // Enlace reparado
    { title: 'Servicios', link: '/services/general', img: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?auto=format&fit=crop&w=800&q=80' },
    { title: 'Wellness', link: '/services/wellness', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80' },
    { title: 'Health', link: '/services/health', img: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80' },
    { title: 'Events', link: '/services/events', img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80' }
  ];

  // 2. TUS VARIABLES ORIGINALES INTACTAS
  const whyChooseUs = [
    { title: t.wc1T, desc: t.wc1D, icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>) },
    { title: t.wc2T, desc: t.wc2D, icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>) },
    { title: t.wc3T, desc: t.wc3D, icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>) }
  ];

  const travelServices = [
    { title: t.ts1T, desc: t.ts1D },
    { title: t.ts2T, desc: t.ts2D },
    { title: t.ts3T, desc: t.ts3D }
  ];

  const lifestyleServices = [
    { title: t.ls1T, desc: t.ls1D },
    { title: t.ls2T, desc: t.ls2D },
    { title: t.ls3T, desc: t.ls3D }
  ];

  return (
    <main className="services-page">
      
      {/* 1. HERO INTRODUCTORIO ORIGINAL (con banner de fondo) */}
      <section className="services-hero">
        <div className="services-hero-overlay"></div>
        <div className="hero-container">
          <span className="pre-title">{t.heroPre}</span>
          <h1 className="massive-heading">{t.heroTitle}</h1>
        </div>
      </section>

      {/* 2. NUEVO CATÁLOGO DE SERVICIOS (Centrado y con más padding) */}
      <section className="offer-section bg-gray-light">
        <div className="inner-container">
          
          <div className="section-header">
            <span className="pre-title">{t.secPre}</span>
            <h2>{t.secTitleA}<span style={{ color: '#d4af37', fontStyle: 'italic' }}>{t.secAccent}</span></h2>
            <p>{t.secDesc}</p>
          </div>

          <div className="catalog-grid">
            {categories.map((cat, i) => (
              <Link
                href={L(cat.link)}
                key={i}
                className="catalog-card"
                {...(cat.link.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >

                <img src={cat.img} alt={cat.title} className="catalog-bg-img" />
                <div className="catalog-overlay"></div>

                <div className="catalog-icon-badge">
                  {CATEGORY_ICONS[cat.title]}
                </div>

                <div className="catalog-arrow-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </div>

                <div className="catalog-content">
                  <h3>{t.cat[cat.title as keyof typeof t.cat] ?? cat.title}</h3>
                  <div className="catalog-link-wrapper">
                    <span className="gold-line"></span>
                    <span className="link-text">{t.verCatalogo}</span>
                  </div>
                  <div className="dashed-decor">
                    <span></span><span></span><span></span><span></span>
                  </div>
                </div>

              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 3. WHY CHOOSE CUPONTOURS ORIGINAL */}
      <section className="why-section">
        <div className="inner-container">
          <div className="section-header">
            <span className="pre-title">{t.commitPre}</span>
            <h2>{t.whyTitle}</h2>
            <p>{t.whyDesc}</p>
          </div>
          <div className="why-grid">
            {whyChooseUs.map((item, i) => (
              <div key={i} className="why-card">
                <div className="why-icon-container">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TRAVEL & LIFESTYLE SERVICES ORIGINAL */}
      <section className="split-services-section bg-gray-light">
        <div className="split-services-container">
          
          <div className="services-col">
            <h2 className="col-title">{t.travelTitle}</h2>
            <div className="list-container">
              {travelServices.map((service, i) => (
                <div key={i} className="service-list-item">
                  <h4>{service.title}</h4>
                  <p>{service.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="services-col">
            <h2 className="col-title">{t.lifestyleTitle}</h2>
            <div className="list-container">
              {lifestyleServices.map((service, i) => (
                <div key={i} className="service-list-item">
                  <h4>{service.title}</h4>
                  <p>{service.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 5. CALL TO ACTION ORIGINAL */}
      <section className="services-cta">
        <div className="cta-container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <div className="cta-actions">
            <Link href={L("/contact")} className="btn-black-pill">
              {t.getStarted}
            </Link>
            <Link href={L("/properties")} className="btn-outline-pill">
              {t.viewPortfolio}
            </Link>
          </div>
        </div>
      </section>

      <StructuredData type="Product" data={servicesPageStructuredData} />
    </main>
  );
}
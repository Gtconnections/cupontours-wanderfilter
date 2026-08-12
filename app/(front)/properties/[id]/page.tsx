'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { StructuredData } from "@/components/seo/structured-data";
import './property-detail.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { localeFromPath } from '@/app/i18n/locale';
import { getDetail } from '@/app/i18n/dictionaries';
import { getPropertyById } from '../../../lib/api/properties';
import { HostawayListing } from '../../../lib/services/hostaway';
import BookingWidget from './BookingWidget';
import { useTheme } from '@/components/theme/ThemeProvider';

// ============================================
// WIDGET DE RESERVA HOSTAWAY (motor real)
// Colores afinados a la paleta oscura/dorada
// ============================================
// Colores del widget por tema. En claro: acentos en negro sobre marco blanco.
// En oscuro: acento DORADO (#d4af37), marco oscuro y texto claro, para que el
// calendario no aparezca como un bloque blanco sobre la página oscura.
const HOSTAWAY_WIDGET_COLORS = {
  light: {
    mainColor: "#111111",   // botón "Book now" en negro
    frameColor: "#ffffff",  // fondo del calendario
    textColor: "#111111",   // texto del calendario
  },
  dark: {
    mainColor: "#d4af37",   // botón "Book now" en dorado
    frameColor: "#1c1c20",  // fondo del calendario (surface elevado)
    textColor: "#ece7dd",   // texto del calendario (claro)
  },
} as const;

const HOSTAWAY_SCRIPT_SRC = 'https://d2q3n06xhbi0am.cloudfront.net/calendar.js';

// ============================================
// Componente de galería modal (pantalla completa)
// ============================================
function ImageGalleryModal({
  images,
  onClose,
  initialIndex = 0,
}: {
  images: string[];
  onClose: () => void;
  initialIndex?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [images.length, onClose]);

  return (
    <div className="gallery-modal" onClick={onClose}>
      <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="gallery-close" onClick={onClose} aria-label={c.closeGallery}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="gallery-main-image">
          <img src={images[currentIndex]} alt={`Property image ${currentIndex + 1}`} />
        </div>

        <div className="gallery-counter">
          {currentIndex + 1} / {images.length}
        </div>

        {images.length > 1 && (
          <>
            <button className="gallery-nav gallery-prev" onClick={goToPrevious} aria-label={c.prevImage}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="gallery-nav gallery-next" onClick={goToNext} aria-label={c.nextImage}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <div className="gallery-thumbnails">
              {images.slice(0, 12).map((img, idx) => (
                <div
                  key={idx}
                  className={`gallery-thumb ${idx === currentIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} />
                </div>
              ))}
              {images.length > 12 && (
                <div className="gallery-thumb-more">+{images.length - 12}</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const locale = localeFromPath(usePathname() || '/');
  const t = getDetail(locale).properties;
  const c = getDetail(locale).common;
  const lp = locale === 'es' ? '/es' : '';
  const id = params?.id as string;
  const { theme } = useTheme();

  const [property, setProperty] = useState<HostawayListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  // Cargar datos de la propiedad
  useEffect(() => {
    async function loadProperty() {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await getPropertyById(id);
        if (!data) {
          setError('Property not found');
          setProperty(null);
          return;
        }
        setProperty(data);
        setActiveImage(0);
      } catch {
        setError('Failed to load property details');
        setProperty(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadProperty();
  }, [id]);

  // Inicializar el widget de reservas de Hostaway (motor real) una vez cargada la
  // propiedad. Se re-inicializa al cambiar de tema para repintar el calendario con
  // la paleta correcta (el widget de terceros solo lee los colores al construirse).
  useEffect(() => {
    if (!property || !id) return;

    const config = {
      baseUrl: 'https://book.cupontours.com/',
      listingId: Number(id),
      numberOfMonths: 2,
      openInNewTab: true,
      font: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      rounded: true,
      button: { action: 'checkout', text: 'Book now' },
      clearButtonText: 'Clear dates',
      color: theme === 'dark' ? HOSTAWAY_WIDGET_COLORS.dark : HOSTAWAY_WIDGET_COLORS.light,
    };

    const init = () => {
      const w = window as unknown as { hostawayCalendarWidget?: (config: unknown) => void };
      const container = document.getElementById('hostaway-calendar-widget');
      if (container) container.innerHTML = '';
      if (container && typeof w.hostawayCalendarWidget === 'function') {
        w.hostawayCalendarWidget(config);
      }
    };

    // El widget de Hostaway solo lee sus colores cuando su script arranca y no
    // expone un metodo de re-render. Para reflejar un cambio de tema hay que
    // recargar el script y reconstruir; si solo se limpia el contenedor y se
    // vuelve a llamar a la global, el calendario queda VACIO al togglear. Por eso
    // en cada ejecucion quitamos el script previo + la global y lo re-inyectamos.
    const g = window as unknown as { hostawayCalendarWidget?: unknown };
    const prev = document.querySelector(`script[src="${HOSTAWAY_SCRIPT_SRC}"]`);
    if (prev) prev.remove();
    try {
      delete g.hostawayCalendarWidget;
    } catch {
      g.hostawayCalendarWidget = undefined;
    }

    const script = document.createElement('script');
    script.src = HOSTAWAY_SCRIPT_SRC;
    script.onload = init;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.remove();
    };
  }, [property, id, theme]);

  // Estado: cargando
  if (isLoading) {
    return (
      <main className="property-detail-page">
        <div className="detail-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t.loading}</p>
          </div>
        </div>
      </main>
    );
  }

  // Estado: error / no encontrada
  if (error || !property) {
    return (
      <main className="property-detail-page">
        <div className="detail-container">
          <div className="error-state">
            <h2>{t.notFound}</h2>
            <p>{error || 'The residence you are looking for does not exist.'}</p>
            <Link href={`${lp}/properties`} className="btn-back-editorial">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>{t.backTo}</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ============================================
  // DATOS REALES DE LA PROPIEDAD
  // ============================================
  const propertyName = property.name || 'Luxury Residence';
  const location =
    property.city && property.state
      ? `${property.city}, ${property.state}, ${property.country || 'United States'}`
      : property.city || property.country || 'Exclusive Location';

  const pricePerNight = property.price || 0;
  const cleaningFee = property.cleaningFee || 0;
  const maxGuests = property.personCapacity || 0;
  const bedrooms = property.bedroomsNumber || 0;
  const bathrooms = property.bathroomsNumber || 0;
  const beds = property.bedsNumber || 0;
  const minNights = property.minNights || 1;

  const formatMoney = (n: number) =>
    `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Imágenes
  const images =
    property.listingImages?.length > 0
      ? property.listingImages.sort((a, b) => a.sortOrder - b.sortOrder).map((img) => img.url)
      : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80'];

  // ============================================
  // AMENITIES - Agrupación por categoría
  // ============================================
  const amenities = property.listingAmenities || [];

  const amenityCategoriesMap: Record<string, string> = {
    'Internet': 'Connectivity', 'Wi-Fi': 'Connectivity', 'Wireless': 'Connectivity', 'Ethernet': 'Connectivity',
    'Cable Channels': 'Entertainment', 'TV': 'Entertainment', 'Smart TV': 'Entertainment', 'Magazines and Books': 'Entertainment',
    'Air conditioning': 'Climate Control', 'AC': 'Climate Control', 'Heating': 'Climate Control',
    'Kitchen': 'Kitchen', 'Refrigerator': 'Kitchen', 'Fridge': 'Kitchen', 'Oven': 'Kitchen', 'Stove': 'Kitchen',
    'Microwave': 'Kitchen', 'Dishwasher': 'Kitchen', 'Toaster': 'Kitchen', 'Coffee maker': 'Kitchen',
    'Kitchen utensils': 'Kitchen', 'Wine Glasses': 'Kitchen', 'Hot water kettle': 'Kitchen',
    'Washing Machine': 'Laundry', 'Washer': 'Laundry', 'Dryer': 'Laundry', 'Iron': 'Laundry', 'Hangers': 'Laundry',
    'Hot water': 'Bathroom', 'Hairdryer': 'Bathroom', 'Shampoo': 'Bathroom', 'Essentials': 'Bathroom',
    'Bed sheets': 'Bedroom',
    'Safe': 'Security', 'First aid kit': 'Security', 'Smoke and Carbon alarm': 'Security', 'Fire extinguisher': 'Security',
    'Free Parking': 'Parking', 'Covered Garage': 'Parking',
    'Private Entrance': 'Access',
    'Long Term Stays Allowed': 'Policy',
    'Room Darkening Shades': 'Comfort',
    'Laptop friendly workspace': 'Work',
    'Private living room': 'Living',
  };

  const groupedAmenities: Record<string, string[]> = {};
  amenities.forEach((amenity: { amenityName: string }) => {
    const name = amenity.amenityName || 'Unnamed Amenity';
    const category = amenityCategoriesMap[name] || 'Other';
    if (!groupedAmenities[category]) groupedAmenities[category] = [];
    if (!groupedAmenities[category].includes(name)) groupedAmenities[category].push(name);
  });

  const amenityCategories = Object.entries(groupedAmenities)
    .map(([category, items]) => ({ category, items: items.sort() }))
    .sort((a, b) => a.category.localeCompare(b.category));

  const displayAmenities = amenityCategories.length > 0 ? amenityCategories : [];

  // ============================================
  // TEXTOS
  // ============================================
  const aboutTexts = [
    property.airbnbSummary,
    property.airbnbSpace,
    property.airbnbNeighborhoodOverview,
  ].filter(Boolean);

  const descriptionText = property.description || aboutTexts.join('\n\n');

  // House Rules
  const houseRulesText = property.houseRules || '';
  const houseRulesLines = houseRulesText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('*') && !line.startsWith('-'));

  const checkInTime = property.checkInTimeStart
    ? `${Math.floor(property.checkInTimeStart / 60)}:${String(property.checkInTimeStart % 60).padStart(2, '0')} PM`
    : '4:00 PM';
  const checkOutTime = property.checkOutTime
    ? `${Math.floor(property.checkOutTime / 60)}:${String(property.checkOutTime % 60).padStart(2, '0')} AM`
    : '11:00 AM';

  const openGallery = (index: number) => {
    setGalleryInitialIndex(index);
    setIsGalleryOpen(true);
  };

  // Tarjetas de specs (solo datos reales)
  const statCards = [
    {
      label: 'Bedrooms',
      value: bedrooms,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" />
        </svg>
      ),
    },
    {
      label: 'Bathrooms',
      value: bathrooms,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12V5a2 2 0 0 1 2-2 2 2 0 0 1 2 2" /><line x1="2" y1="12" x2="22" y2="12" />
          <path d="M4 12v3a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5v-3" /><line x1="7" y1="20" x2="6" y2="22" /><line x1="17" y1="20" x2="18" y2="22" />
        </svg>
      ),
    },
    {
      label: 'Max Guests',
      value: maxGuests,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  const trustBadges = [
    {
      label: 'Verified',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
    {
      label: 'Five-Star',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      label: 'Premium',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="8 12 11 15 16 9" />
        </svg>
      ),
    },
  ];

  return (
    <main className="property-detail-page">
      <div className="detail-container">

        {/* ENCABEZADO SUPERIOR: título a la izquierda, volver a la derecha */}
        <header className="lux-pagehead">
          <div className="lux-headline-text">
            <span className="lux-eyebrow">{t.eyebrow}</span>
            <h1 className="lux-title">{propertyName}</h1>
            <p className="lux-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span>{location}</span>
            </p>
          </div>
          <Link href={`${lp}/properties`} className="btn-back-editorial">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>{t.backTo}</span>
          </Link>
        </header>

        <div className="property-content-layout">

          {/* ===================== COLUMNA IZQUIERDA ===================== */}
          <div className="content-left-side">

            {/* GALERÍA CON MINIATURAS */}
            <section className="lux-gallery">
              <div className="lux-gallery-main" onClick={() => openGallery(activeImage)}>
                <img
                  src={images[activeImage]}
                  alt={propertyName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80';
                  }}
                />
                {images.length > 1 && (
                  <>
                    <button
                      className="lux-gallery-arrow prev"
                      aria-label={c.prevImage}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <button
                      className="lux-gallery-arrow next"
                      aria-label={c.nextImage}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </>
                )}
                <div className="lux-gallery-counter">{activeImage + 1} / {images.length}</div>
              </div>

              {images.length > 1 && (
                <div className="lux-thumb-strip">
                  {images.slice(0, 10).map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`lux-thumb ${idx === activeImage ? 'active' : ''}`}
                      onClick={() => setActiveImage(idx)}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img src={img} alt={`${propertyName} thumbnail ${idx + 1}`} />
                    </button>
                  ))}
                  {images.length > 10 && (
                    <button type="button" className="lux-thumb lux-thumb-more" onClick={() => openGallery(10)}>
                      +{images.length - 10}
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* TARJETAS DE SPECS */}
            <section className="lux-card">
              <div className="lux-stats-grid">
                {statCards.map((s, i) => (
                  <div key={i} className="lux-stat">
                    <span className="lux-stat-icon">{s.icon}</span>
                    <span className="lux-stat-value">{s.value}</span>
                    <span className="lux-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* DESCRIPCIÓN */}
            {descriptionText && (
              <section className="lux-card">
                <h2 className="lux-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  {t.secDescription}
                </h2>
                <div className="lux-body-text">
                  {descriptionText.split('\n').filter(Boolean).map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </section>
            )}

            {/* AMENITIES */}
            {displayAmenities.length > 0 && (
              <section className="lux-card">
                <h2 className="lux-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {t.secAmenities}
                </h2>
                <div className="lux-amenities-grid">
                  {displayAmenities.map((cat, i) => (
                    <div key={i} className="lux-amenity-group">
                      <h3>{cat.category}</h3>
                      <ul>
                        {cat.items.map((item, idx) => (
                          <li key={idx}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* ===================== COLUMNA DERECHA ===================== */}
          <aside className="content-right-side">
            <div className="lux-sticky">

              {/* BADGES DE CONFIANZA */}
              <div className="lux-badges-card">
                {trustBadges.map((b, i) => (
                  <div key={i} className="lux-badge">
                    <span className="lux-badge-icon">{b.icon}</span>
                    <span className="lux-badge-label">{b.label}</span>
                  </div>
                ))}
              </div>

              {/* PANEL DE RESERVA (HOSTAWAY) */}
              <div className="lux-reserve-card">
                <span className="lux-eyebrow with-line">{t.tabEnquire}</span>
                <h2 className="lux-reserve-title">{t.reserveTitle}</h2>
                <div className="lux-reserve-trust">
                  <span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    Secure
                  </span>
                  <span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    Five-Star
                  </span>
                  <span>24/7 Support</span>
                </div>

                <div className="lux-reserve-price">
                  <span className="lux-reserve-amount">{formatMoney(pricePerNight)}</span>
                  <span className="lux-reserve-per">{t.perNight}</span>
                </div>

                {/* Widget de reserva propio */}
                <div className="lux-widget-mount">
                  <BookingWidget
                    listingId={Number(id)}
                    propertyName={property?.name || ""}
                  />
                </div>

                <p className="lux-reserve-disclaimer">
                  You won&apos;t be charged yet. Availability and secure checkout are handled by our verified booking engine.
                </p>
              </div>

              {/* DETALLES DE PRECIO */}
              <div className="lux-card">
                <h2 className="lux-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  {t.secPricing}
                </h2>
                <div className="lux-pricing-table">
                  <div className="lux-pricing-row">
                    <span>{t.nightlyRate}</span>
                    <strong className="accent">{formatMoney(pricePerNight)}</strong>
                  </div>
                  <div className="lux-pricing-row">
                    <span>{t.cleaningFee}</span>
                    <strong>{formatMoney(cleaningFee)}</strong>
                  </div>
                  <div className="lux-pricing-row">
                    <span>{t.minStay}</span>
                    <strong>{minNights} {minNights === 1 ? 'night' : 'nights'}</strong>
                  </div>
                  <div className="lux-pricing-row">
                    <span>{t.maxGuests}</span>
                    <strong>{maxGuests} guests</strong>
                  </div>
                  {beds > 0 && (
                    <div className="lux-pricing-row">
                      <span>{t.beds}</span>
                      <strong>{beds}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* NORMAS DE LA CASA */}
              <div className="lux-card">
                <h2 className="lux-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  {t.secRules}
                </h2>
                <ul className="lux-rules">
                  <li><strong>{t.checkIn}</strong> {t.after} {checkInTime}</li>
                  <li><strong>{t.checkOut}</strong> {t.before} {checkOutTime}</li>
                  {houseRulesLines.slice(0, 10).map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>

            </div>
          </aside>

        </div>
      </div>

      {isGalleryOpen && (
        <ImageGalleryModal
          images={images}
          onClose={() => setIsGalleryOpen(false)}
          initialIndex={galleryInitialIndex}
        />
      )}

      {property && (
        <StructuredData
          type="RentalProperty"
          data={{
            name: property.name,
            description: property.description,
            image: property.thumbnailUrl,
            address: {
              '@type': 'PostalAddress',
              addressLocality: property.city,
              addressCountry: property.country,
            },
            offers: {
              '@type': 'Offer',
              price: property.price,
              priceCurrency: 'USD',
            },
          }}
        />
      )}
    </main>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import './property-detail.css';
import Link from 'next/link';
import { ContactBookingCard } from "@/components/ui/contact-booking-card"
import { getPropertyById } from '../../../lib/api/properties';
import { HostawayListing } from '../../../lib/services/hostaway';

// Brand colors from Tailwind theme
const HOSTAWAY_WIDGET_COLORS = {
  mainColor: "#000", // primary blue
  frameColor: "#000", // accent yellow
  textColor: "#000", // dark blue for text
}

// Componente de galería modal
function ImageGalleryModal({ 
  images, 
  onClose, 
  initialIndex = 0 
}: { 
  images: string[], 
  onClose: () => void,
  initialIndex?: number 
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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="gallery-modal" onClick={onClose}>
      <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="gallery-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
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
            <button className="gallery-nav gallery-prev" onClick={goToPrevious}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button className="gallery-nav gallery-next" onClick={goToNext}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            
            <div className="gallery-thumbnails">
              {images.slice(0, 10).map((img, idx) => (
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
              {images.length > 10 && (
                <div className="gallery-thumb-more">+{images.length - 10}</div>
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
  const router = useRouter();
  const id = params?.id as string;

  // Estados de la propiedad
  const [property, setProperty] = useState<HostawayListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Estados de Reserva
  const [checkIn, setCheckIn] = useState<number | null>(null);
  const [checkOut, setCheckOut] = useState<number | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showGuestDropdown, setShowGuestDropdown] = useState<boolean>(false);

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
      } catch (err) {
        console.error('Error loading property:', err);
        setError('Failed to load property details');
        setProperty(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadProperty();
  }, [id]);

  // Si está cargando
  if (isLoading) {
    return (
      <main className="property-detail-page">
        <div className="detail-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading property details...</p>
          </div>
        </div>
      </main>
    );
  }

  // Si hay error o no se encontró la propiedad
  if (error || !property) {
    return (
      <main className="property-detail-page">
        <div className="detail-container">
          <div className="error-state">
            <h2>Property Not Found</h2>
            <p>{error || 'The property you are looking for does not exist.'}</p>
            <Link href="/properties" className="btn-back-editorial">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back to Properties</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Datos de la propiedad
  const propertyName = property.name || 'Luxury Property';
  const location = property.city && property.state 
  ? `${property.city}, ${property.state}, ${property.country || 'United States'}`
  : property.city || property.country || 'Exclusive Location';
  
  const pricePerNight = property.price || 250;
  const cleaningFee = property.cleaningFee || 120;
  const maxGuests = property.personCapacity || 6;
  const bedrooms = property.bedroomsNumber || 0;
  const bathrooms = property.bathroomsNumber || 0;
  const beds = property.bedsNumber || 0;
  const minNights = property.minNights || 1;
  const rating = property.starRating || property.averageReviewRating || 4.9;
  const guestsIncluded = property.guestsIncluded || 4;
  
  // Imágenes
  const images = property.listingImages?.length > 0
    ? property.listingImages.sort((a, b) => a.sortOrder - b.sortOrder).map(img => img.url)
    : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80'];
  
// ============================================
// AMENITIES - Agrupación inteligente (CORREGIDO - SIN DUPLICADOS)
// ============================================
const amenities = property.listingAmenities || [];

const amenityCategoriesMap: Record<string, string> = {
  // Connectivity
  'Internet': 'Connectivity',
  'Wi-Fi': 'Connectivity',
  'Wireless': 'Connectivity',
  'Ethernet': 'Connectivity',
  
  // Entertainment
  'Cable Channels': 'Entertainment',
  'TV': 'Entertainment',
  'Smart TV': 'Entertainment',
  'Magazines and Books': 'Entertainment',
  
  // Climate Control
  'Air conditioning': 'Climate Control',
  'AC': 'Climate Control',
  'Heating': 'Climate Control',
  
  // Kitchen
  'Kitchen': 'Kitchen',
  'Refrigerator': 'Kitchen',
  'Fridge': 'Kitchen',
  'Oven': 'Kitchen',
  'Stove': 'Kitchen',
  'Microwave': 'Kitchen',
  'Dishwasher': 'Kitchen',
  'Toaster': 'Kitchen',
  'Coffee maker': 'Kitchen',
  'Kitchen utensils': 'Kitchen',
  'Wine Glasses': 'Kitchen',
  'Hot water kettle': 'Kitchen',
  
  // Laundry
  'Washing Machine': 'Laundry',
  'Washer': 'Laundry',
  'Dryer': 'Laundry',
  'Iron': 'Laundry',
  'Hangers': 'Laundry',
  
  // Bathroom
  'Hot water': 'Bathroom',
  'Hairdryer': 'Bathroom',
  'Shampoo': 'Bathroom',
  'Essentials': 'Bathroom', // ✅ Solo una vez, aquí está bien ubicado
  
  // Bedroom
  'Bed sheets': 'Bedroom',
  
  // Security
  'Safe': 'Security',
  'First aid kit': 'Security',
  'Smoke and Carbon alarm': 'Security',
  'Fire extinguisher': 'Security',
  
  // Parking
  'Free Parking': 'Parking',
  'Covered Garage': 'Parking',
  
  // Access
  'Private Entrance': 'Access',
  
  // Policy
  'Long Term Stays Allowed': 'Policy',
  
  // Comfort
  'Room Darkening Shades': 'Comfort',
  
  // Work
  'Laptop friendly workspace': 'Work',
  
  // Living
  'Private living room': 'Living',
};

// Agrupar amenities por categoría
const groupedAmenities: Record<string, string[]> = {};

amenities.forEach((amenity: { amenityName: string }) => {
  const name = amenity.amenityName || 'Unnamed Amenity';
  const category = amenityCategoriesMap[name] || 'Other';
  
  if (!groupedAmenities[category]) {
    groupedAmenities[category] = [];
  }
  if (!groupedAmenities[category].includes(name)) {
    groupedAmenities[category].push(name);
  }
});

// Convertir a array para renderizar
const amenityCategories = Object.entries(groupedAmenities)
  .map(([category, items]) => ({ 
    category, 
    items: items.sort()
  }))
  .sort((a, b) => a.category.localeCompare(b.category));

// Si no hay amenities, mostrar categorías por defecto
const displayAmenities = amenityCategories.length > 0 ? amenityCategories : [
  {
    category: 'Amenities',
    items: ['Wi-Fi', 'Air conditioning', 'Kitchen', 'Heating', 'Washer', 'Dryer']
  }
];

  // ============================================
  // SECCIONES DE TEXTO
  // ============================================
  const aboutTexts = [
    property.airbnbSummary,
    property.airbnbSpace,
    property.airbnbNeighborhoodOverview,
  ].filter(Boolean);

  const transitText = property.airbnbTransit;
  const accessText = property.airbnbAccess;
  const interactionText = property.airbnbInteraction;
  const notesText = property.airbnbNotes;

  // House Rules - Parsear en lista
  const houseRulesText = property.houseRules || '';
  const houseRulesLines = houseRulesText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('*') && !line.startsWith('-'));

  // Check-in/out
  const checkInTime = property.checkInTimeStart 
    ? `${Math.floor(property.checkInTimeStart / 60)}:${String(property.checkInTimeStart % 60).padStart(2, '0')} PM`
    : '4:00 PM';
  const checkOutTime = property.checkOutTime 
    ? `${Math.floor(property.checkOutTime / 60)}:${String(property.checkOutTime % 60).padStart(2, '0')} AM`
    : '11:00 AM';

  // Días para renderizar Mayo y Junio 2026
  const mayDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const juneDays = Array.from({ length: 30 }, (_, i) => i + 1);

  // MANEJADORES
  const incrementGuests = () => {
    if (guests < maxGuests) setGuests(guests + 1);
  };

  const decrementGuests = () => {
    if (guests > 1) setGuests(guests - 1);
  };

  const handleDayClick = (day: number, month: 'may' | 'june') => {
    const dayIdentifier = month === 'may' ? day : day + 100;
    
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dayIdentifier);
      setCheckOut(null);
    } else if (checkIn && !checkOut) {
      if (dayIdentifier < checkIn) {
        setCheckIn(dayIdentifier);
      } else {
        setCheckOut(dayIdentifier);
        setShowDatePicker(false);
      }
    }
  };

  const formatIdToText = (id: number | null) => {
    if (!id) return 'Select date';
    const isJune = id > 100;
    const day = isJune ? id - 100 : id;
    return `${isJune ? 'June' : 'May'} ${day}, 2026`;
  };

  // Calcular total
  const nights = checkIn && checkOut ? Math.abs(checkOut - checkIn) : 0;
  const subtotal = nights * pricePerNight;
  const total = subtotal + cleaningFee;

  // Abrir galería
  const openGallery = (index: number) => {
    setGalleryInitialIndex(index);
    setIsGalleryOpen(true);
  };

  // SPECS
  const specs = [
    { label: 'Guests', value: `${maxGuests} Guests` },
    { label: 'Bedrooms', value: `${bedrooms} Bedrooms` },
    { label: 'Beds', value: `${beds} Beds` },
    { label: 'Bathrooms', value: `${bathrooms} Bathrooms` },
    { label: 'Minimum Stay', value: `${minNights} night${minNights > 1 ? 's' : ''}` },
    { label: 'Cancellation Policy', value: property.cancellationPolicy || 'Flexible' }
  ];

  return (
    <main className="property-detail-page">
      <div className="detail-container">
        
        {/* ENCABEZADO */}
        <header className="property-detail-header">
          <div className="header-split-row">
            <div className="header-text-side">
              <span className="pre-title">Exclusive Stay</span>
              <h1 className="massive-heading">&quot;{propertyName}&quot;</h1>
              <p className="property-location-tag">{location}</p>
            </div>
            <div className="header-action-side">
              <Link href="/properties" className="btn-back-editorial">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>Back Properties</span>
              </Link>
            </div>
          </div>
        </header>

        {/* GALERÍA CON POPUP */}
        <section className="property-gallery-grid">
          <div className="gallery-main-img" onClick={() => openGallery(0)}>
            <img src={images[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80'} alt={propertyName} />
            {images.length > 1 && (
              <div className="gallery-show-all-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                <span>Show all photos</span>
              </div>
            )}
          </div>
          <div className="gallery-side-imgs">
            <img 
              src={images[1] || images[0] || 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=500&q=80'} 
              alt={`${propertyName} view 1`}
              onClick={() => openGallery(1)}
            />
            <img 
              src={images[2] || images[0] || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=500&q=80'} 
              alt={`${propertyName} view 2`}
              onClick={() => openGallery(2)}
            />
          </div>
        </section>

        {/* MODAL DE GALERÍA */}
        {isGalleryOpen && (
          <ImageGalleryModal 
            images={images} 
            onClose={() => setIsGalleryOpen(false)}
            initialIndex={galleryInitialIndex}
          />
        )}

        {/* ESTRUCTURA DE CONTENIDO */}
        <div className="property-content-layout">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="content-left-side">
            
            {/* Riel de Especificaciones */}
            <div className="property-quick-specs">
              {specs.map((spec, i) => (
                <div key={i} className="spec-pill">
                  <span className="spec-label">{spec.label}</span>
                  <span className="spec-value">{spec.value}</span>
                </div>
              ))}
            </div>

            {/* About Section */}
            <section className="detail-section-block">
              <h2>About this place</h2>
              <div className="editorial-text">
                {aboutTexts.map((text, idx) => (
                  <p key={idx}>{text}</p>
                ))}
              </div>
            </section>

            {/* Transit Section */}
            {transitText && (
              <section className="detail-section-block">
                <h2>Getting Around</h2>
                <div className="editorial-text">
                  <p>{transitText}</p>
                </div>
              </section>
            )}

            {/* Access Section */}
            {accessText && (
              <section className="detail-section-block">
                <h2>Access</h2>
                <div className="editorial-text">
                  <p>{accessText}</p>
                </div>
              </section>
            )}

            {/* Interaction Section */}
            {interactionText && (
              <section className="detail-section-block">
                <h2>Interaction with Guests</h2>
                <div className="editorial-text">
                  <p>{interactionText}</p>
                </div>
              </section>
            )}

            {/* SECCIÓN DE AMENITIES */}
            <section className="detail-section-block amenities-master-section">
              <h2>Amenities</h2>
              <div className="amenities-categories-grid">
                {displayAmenities.map((cat, i) => (
                  <div key={i} className="amenity-category-group">
                    <h3>{cat.category}</h3>
                    <ul className="clean-amenities-list">
                      {cat.items.map((item, idx) => (
                        <li key={idx}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

            {/* SECCIÓN DE NORMAS DE LA CASA */}
            <section className="detail-section-block house-rules-section">
              <h2>House Rules</h2>
              <div className="editorial-text rules-box">
                <ul>
                  <li><strong>Check-in:</strong> After {checkInTime}</li>
                  <li><strong>Check-out:</strong> Before {checkOutTime}</li>
                  {houseRulesLines.slice(0, 10).map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Notes Section */}
            {notesText && (
              <section className="detail-section-block">
                <br />
                <h2>Additional Notes</h2>
                <div className="editorial-text">
                  <p>{notesText}</p>
                </div>
              </section>
            )}

          </div>

          {/* COLUMNA DERECHA: WIDGET DE RESERVA */}
          <div className="content-right-side">
            <div className="booking-sticky-widget">
              <ContactBookingCard
                price={`$${property.price}`}
                priceLabel="/ night"
                itemType="property"
                rating={5.0}
                additionalFees={property.cleaningFee > 0 ? [
                  { label: "Cleaning fee", amount: `$${property.cleaningFee}` }
                ] : []}
                onBooking={() => setShowBookingModal(true)}
                onContact={() => setShowBookingModal(true)}
                contactMethods={{
                  showCall: false,
                  showEmail: false
                }}
                hostawayWidgetProps={{
                  baseUrl: "https://book.cupontours.com/",
                  listingId: Number(params.id),
                  numberOfMonths: 2,
                  openInNewTab: true,
                  font: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif;",
                  rounded: true,
                  button: {
                    action: "checkout",
                    text: "Book now",
                  },
                  clearButtonText: "Clear",
                  color: HOSTAWAY_WIDGET_COLORS,
                }}
              />
              <p className="booking-disclaimer">You won&apos;t be charged yet. Payouts processed under verified token parameters.</p>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
import React from 'react';
import './home.css';

// 1. DEFINICIÓN DE TIPOS PARA LOS ITEMS DEL CATÁLOGO
interface CatalogItem {
  id: number;
  title: string;
  specs: string;
  price: string;
  rating: string;
  img: string;
}

// 2. INTERFAZ DE TIPOS EXPLÍCITOS PARA LA FUNCIÓN RENDERROW
interface RenderRowProps {
  title: string;
  pretitle: string;
  data: CatalogItem[];
  type: 'home' | 'car' | 'yacht'; // Tipado estricto para evitar strings genéricos
}

export default function HomePage() {
  const homes: CatalogItem[] = [
    { id: 1, title: 'Modern Estate in Miami Beach', specs: '5 bedrooms • 5.5 baths', price: '$1,200 for 2 nights', rating: '4.9', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80' },
    { id: 2, title: 'Wander Joshua Tree Elysium', specs: '4 bedrooms • 4.5 baths', price: '$1,354 for 2 nights', rating: '5.0', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80' },
    { id: 3, title: 'Coastal Villa in Florida Keys', specs: '3 bedrooms • 3 baths', price: '$850 for 2 nights', rating: 'New', img: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80' },
    { id: 4, title: 'Luxury Penthouse Brickell', specs: '2 bedrooms • 2.5 baths', price: '$620 for 1 night', rating: '4.8', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80' },
  ];

  const cars: CatalogItem[] = [
    { id: 1, title: 'Cadillac Escalade Sport', specs: '7 Seats • Luxury SUV', price: '$250 / day', rating: '5.0', img: 'https://images.unsplash.com/photo-1695662051263-fb5eb834372c?auto=format&fit=crop&w=600&q=80' },
    { id: 2, title: 'Tesla Model X Plaid', specs: '6 Seats • Electric Performance', price: '$220 / day', rating: '4.9', img: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80' },
    { id: 3, title: 'Porsche 911 Carrera GTS', specs: '2 Seats • Sportscar', price: '$380 / day', rating: 'New', img: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80' },
    { id: 4, title: 'Mercedes-Benz G63 AMG', specs: '5 Seats • Exotic SUV', price: '$450 / day', rating: '4.9', img: 'https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?auto=format&fit=crop&w=600&q=80' },
  ];

  const yachts: CatalogItem[] = [
    { id: 1, title: 'Azimut 60 Flybridge', specs: '12 Guests • 3 Cabins', price: '$2,800 / day', rating: '5.0', img: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80' },
    { id: 2, title: 'Sunseeker Manhattan 66', specs: '15 Guests • 4 Cabins', price: '$3,500 / day', rating: '4.9', img: 'https://images.unsplash.com/photo-1616843413587-9e3a37f7f212?auto=format&fit=crop&w=600&q=80' },
    { id: 3, title: 'Custom Mega Yacht Mega', specs: '20 Guests • 6 Cabins', price: '$7,200 / day', rating: '5.0', img: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80' },
    { id: 4, title: 'Sea Ray Sundancer 45', specs: '10 Guests • 2 Cabins', price: '$1,400 / day', rating: '4.7', img: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80' },
  ];

  // 3. LA FUNCIÓN INTERNA AHORA TIENE SUS ARGUMENTOS PERFECTAMENTE TIPADOS
  const RenderRow = ({ title, pretitle, data, type }: RenderRowProps) => (
    <section className="home-row-section">
      <div className="row-header">
        <div className="row-title-area">
          <span className="row-pretitle">{pretitle}</span>
          <h3>{title}</h3>
        </div>
        <div className="carousel-nav">
          <button aria-label="Previous"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></button>
          <button aria-label="Next"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></button>
        </div>
      </div>
      
      <div className="property-carousel">
        {data.map((item) => (
          <div key={item.id} className="prop-card">
            <div className={`prop-image-container ${type === 'car' ? 'car-ratio' : type === 'yacht' ? 'yacht-ratio' : ''}`}>
              <img src={item.img} alt={item.title} />
              <button className="heart-btn" aria-label="Save">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
            <div className="prop-info">
              <div className="prop-title-row">
                <h4>{item.title}</h4>
              </div>
              <p className="prop-specs">{item.specs}</p>
              <div className="prop-price-row">
                <span className="price">{item.price}</span>
                <span className="rating">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {item.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <main className="home-page-container">
      
      {/* 1. CINEMATIC HERO */}
      <section className="home-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">Luxury Vacation Rentals, Cars & Yachts</div>
          <h1 className="hero-title">Experience the world<br />in absolute style.</h1>
          <p className="hero-subtitle">Handcrafted experiences combining institutional-grade real estate assets, exotic car rentals, and elite yacht charters.</p>
        </div>
      </section>

      {/* 2. CATEGORIES FILTER PILLS BAR */}
      <section className="categories-filter-section">
        <div className="filter-wrapper">
          <button className="filter-pill active">All Collections</button>
          <button className="filter-pill">Vacation Homes</button>
          <button className="filter-pill">Premium Fleet</button>
          <button className="filter-pill">Yacht Charters</button>
        </div>
      </section>

      {/* 3. EXPERIENCES SECTIONS */}
      <div className="home-listings-container">
        <RenderRow 
          pretitle="Curation" 
          title="Enjoy your stay inside one of our properties" 
          data={homes} 
          type="home" 
        />
        
        {/* INTERMEDIATE BANNER 1 */}
        <div className="mid-banner banner-cars">
          <div className="mid-banner-overlay"></div>
          <div className="mid-banner-content">
            <h2>Drive in Style Through Miami</h2>
            <p>Access our premium fleet of SUVs, electric models, and sportscars tailored for your trip.</p>
          </div>
        </div>

        <RenderRow 
          pretitle="The Premium Fleet" 
          title="Exceptional cars for ultimate performance" 
          data={cars} 
          type="car" 
        />

        {/* INTERMEDIATE BANNER 2 */}
        <div className="mid-banner banner-yachts">
          <div className="mid-banner-overlay"></div>
          <div className="mid-banner-content">
            <h2>Set Sail On Your Next Adventure</h2>
            <p>From private day charters to custom multi-cabin mega yachts on coastal waters.</p>
          </div>
        </div>

        <RenderRow 
          pretitle="Yacht Charter Collection" 
          title="Elegance on water, designed for luxury" 
          data={yachts} 
          type="yacht" 
        />
      </div>

      {/* 4. PLATFORMS DISTRIBUTION MARQUEE */}
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
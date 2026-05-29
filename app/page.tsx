import React from 'react';
import './home.css';

// 1. INTERFAZ PARA DEFINIR LAESTRUCTURA DE CADA PROPIEDAD
interface PropertyItem {
  id: number;
  title: string;
  specs: string;
  price: string;
  rating: string;
  img: string;
}

// 2. INTERFAZ PARA LAS PROPS DEL COMPONENTE PROPERTYROW
interface PropertyRowProps {
  title: string;
  data: PropertyItem[];
}

export default function HomePage() {
  const propertiesRow1: PropertyItem[] = [
    { id: 1, title: 'Wander Joshua Tree Elysium', specs: '4 bedrooms • 4.5 baths', price: '$1,354 for 2 nights', rating: '4.9', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80' },
    { id: 2, title: 'Wander Friday Harbor', specs: '2 bedrooms • 2 baths', price: '$1,530 for 2 nights', rating: '5.0', img: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80' },
    { id: 3, title: 'Home in Lake Harmony', specs: '4 bedrooms • 3 baths', price: '$617 for 2 nights', rating: 'New', img: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=600&q=80' },
    { id: 4, title: 'Wander Cuttyhunk Waterfront', specs: '4 bedrooms • 2.5 baths', price: '$1,321 for 2 nights', rating: 'New', img: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=600&q=80' },
    { id: 5, title: 'Wander Palm Springs Haven', specs: '3 bedrooms • 2 baths', price: '$1,107 for 2 nights', rating: '4.8', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80' },
  ];

  const propertiesRow2: PropertyItem[] = [
    { id: 6, title: 'Home in Long Pond', specs: '3 bedrooms • 3 baths', price: '$824 for 2 nights', rating: 'New', img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80' },
    { id: 7, title: 'Home in Thermal', specs: '6 bedrooms • 8 baths', price: '$7,126 for 3 nights', rating: 'New', img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80' },
    { id: 8, title: 'Home in Burnet', specs: '5 bedrooms • 5.5 baths', price: '$2,360 for 2 nights', rating: '4.9', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80' },
    { id: 9, title: 'Home in Seagrove Beach', specs: '4 bedrooms • 5 baths', price: '$1,076 for 2 nights', rating: '4.8', img: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80' },
    { id: 10, title: 'Wander Lake Buchanan', specs: '5 bedrooms • 4.5 baths', price: '$2,464 for 3 nights', rating: '4.8', img: 'https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?auto=format&fit=crop&w=600&q=80' },
  ];

  const differenceFeatures = [
    { title: 'Only the best homes', desc: 'Every Wander is beautiful and expertly operated, so you can leave stress at the door.' },
    { title: 'Exceptional amenities', desc: 'From ultra fast WiFi to gyms and pools. Wander seamlessly blend work and play.' },
    { title: '24/7 Concierge service', desc: 'Our team is always available to help with trip questions or special requests.' },
    { title: 'Meticulous cleaning', desc: 'Our cleaning teams are meticulous, and there are no chores at checkout.' },
    { title: 'Stunning views', desc: 'Every Wander has views that refresh and inspire your soul. Adventure awaits.' },
    { title: 'Safety and security', desc: 'Every home meets our industry-leading safety standards to give you peace of mind.' },
  ];

  // 3. SE ASIGNA LA INTERFAZ A LAS PROPS DEL COMPONENTE INTERNO
  const PropertyRow = ({ title, data }: PropertyRowProps) => (
    <section className="property-row-section">
      <div className="row-header">
        <h3>{title}</h3>
        <div className="carousel-nav">
          <button aria-label="Previous">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button aria-label="Next">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
      <div className="property-carousel">
        {data.map((prop) => (
          <div key={prop.id} className="prop-card">
            <div className="prop-image-container">
              <img src={prop.img} alt={prop.title} />
              <button className="heart-btn" aria-label="Save">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div className="carousel-dots"><span className="dot active"></span><span className="dot"></span><span className="dot"></span></div>
            </div>
            <div className="prop-info">
              <div className="prop-title-row">
                <h4>{prop.title}</h4>
              </div>
              <p className="prop-specs">{prop.specs}</p>
              <div className="prop-price-row">
                <span className="price">{prop.price}</span>
                <span className="rating">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {prop.rating}
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
      <section className="home-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">Only the best vacation homes with 24/7 concierge service</div>
          <h1 className="hero-title">Find your happy place</h1>
          <p className="hero-subtitle">Over <strong>90%</strong> guest satisfaction. <strong>65,000+</strong> nights booked.</p>
        </div>
      </section>

      <div className="properties-container">
        <PropertyRow title="Homes our guests love" data={propertiesRow1} />
        <PropertyRow title="Lakefront life" data={propertiesRow2} />
        <PropertyRow title="Mountain adventures" data={propertiesRow1.slice().reverse()} />
        <div className="see-more-container">
          <button className="btn-outline-pill">See more properties</button>
        </div>
      </div>

      <section className="wander-difference-section">
        <div className="difference-container">
          <div className="difference-left">
            <span className="difference-pre-title">The Wander difference</span>
            <h2 className="difference-title">
              The quality of a luxury hotel.<br/>
              <span className="text-gray">The comfort of a vacation home.</span>
            </h2>
            <div className="difference-image">
              <img src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80" alt="Wander Home Exterior" />
            </div>
          </div>

          <div className="difference-right">
            <div className="features-grid">
              {differenceFeatures.map((feat, i) => (
                <div key={i} className="feature-item">
                  <div className="feature-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
                  </div>
                  <h4>{feat.title}</h4>
                  <p>{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
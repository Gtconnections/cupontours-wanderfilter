import React from 'react';
import './services.css';
import Link from 'next/link';

export default function ServicesPage() {
  // 1. CATÁLOGO ACTUALIZADO (Con Properties, Luxury Properties y enlace reparado)
  const categories = [
    { title: 'Properties', link: '/properties', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80' },
    { title: 'Luxury Properties', link: '/luxury-properties', img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80' },
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
    { 
      title: 'Expert Team', 
      desc: 'Our experienced professionals are dedicated to providing personalized service and ensuring every detail is perfect.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    { 
      title: 'Trusted & Secure', 
      desc: 'All our services are fully insured and we maintain the highest standards of safety and security.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      )
    },
    { 
      title: '24/7 Support', 
      desc: 'Round-the-clock customer support to assist you before, during, and after your experience with us.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      )
    }
  ];

  const travelServices = [
    { title: 'Premium Accommodations', desc: 'Luxury hotels, resorts, and vacation rentals worldwide.' },
    { title: 'Private Aviation', desc: 'Exclusive jet charters for business and leisure travel.' },
    { title: 'Yacht Experiences', desc: 'Private yacht charters with professional crew.' }
  ];

  const lifestyleServices = [
    { title: 'Luxury Transportation', desc: 'Premium vehicles and chauffeur services.' },
    { title: 'Concierge Services', desc: 'Personal assistance and travel planning.' },
    { title: 'VIP Experiences', desc: 'Exclusive access to events and destinations.' }
  ];

  return (
    <main className="services-page">
      
      {/* 1. HERO INTRODUCTORIO ORIGINAL */}
      <section className="services-hero">
        <div className="hero-container">
          <span className="pre-title">Ecosystem</span>
          <h1 className="massive-heading">Our Premium Services</h1>
        </div>
      </section>

      {/* 2. NUEVO CATÁLOGO DE SERVICIOS (Centrado y con más padding) */}
      <section className="offer-section bg-gray-light">
        <div className="inner-container">
          
          <div className="section-header">
            <span className="pre-title">Portfolio</span>
            <h2>Explora nuestras <span style={{ color: '#d4af37', fontStyle: 'italic' }}>categorías.</span></h2>
            <p>Selecciona una categoría para ver todo el catálogo disponible en Miami. Reserva en segundos.</p>
          </div>

          <div className="catalog-grid">
            {categories.map((cat, i) => (
              <Link href={cat.link} key={i} className="catalog-card">
                
                <img src={cat.img} alt={cat.title} className="catalog-bg-img" />
                <div className="catalog-overlay"></div>
                
                <div className="catalog-arrow-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </div>

                <div className="catalog-content">
                  <h3>{cat.title}</h3>
                  <div className="catalog-link-wrapper">
                    <span className="gold-line"></span>
                    <span className="link-text">Ver Catálogo</span>
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
            <span className="pre-title">Commitment</span>
            <h2>Why Choose Cupontours</h2>
            <p>We are committed to providing exceptional service and unforgettable experiences that exceed your expectations at every step of your journey.</p>
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
            <h2 className="col-title">Travel Services</h2>
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
            <h2 className="col-title">Lifestyle Services</h2>
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
          <h2>Ready to Experience Luxury?</h2>
          <p>Contact us today to start planning your next extraordinary adventure. Our team is ready to create a personalized experience just for you.</p>
          <div className="cta-actions">
            <Link href="/contact" className="btn-black-pill">
              Get Started
            </Link>
            <Link href="/properties" className="btn-outline-pill">
              View Portfolio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
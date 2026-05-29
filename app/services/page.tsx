import React from 'react';
import './services.css';

export default function ServicesPage() {
  const coreOffers = [
    { 
      title: 'Luxury Properties', 
      desc: 'Premium hotels, vacation rentals, and exclusive accommodations in the world\'s most desirable destinations.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    { 
      title: 'Luxury Cars', 
      desc: 'High-end vehicle rentals including sports cars, luxury sedans, and exotic automobiles for any occasion.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      )
    },
    { 
      title: 'Yacht Charters', 
      desc: 'Private yacht rentals ranging from intimate vessels to mega-yachts with professional crew and amenities.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="M12 8v8"></path>
          <path d="M9 11h6"></path>
        </svg>
      )
    },
    { 
      title: 'Private Jets', 
      desc: 'Exclusive aviation services with our fleet of modern aircraft for business or leisure travel worldwide.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      )
    }
  ];

  const whyChooseUs = [
    { 
      title: 'Expert Team', 
      desc: 'Our experienced professionals are dedicated to providing personalized service and ensuring every detail is perfect.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      )
    },
    { 
      title: '24/7 Support', 
      desc: 'Round-the-clock customer support to assist you before, during, and after your experience with us.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      
      {/* 1. HERO INTRODUCTORIO */}
      <section className="services-hero">
        <div className="hero-container">
          <span className="pre-title">Ecosystem</span>
          <h1 className="massive-heading">Our Premium<br />Services</h1>
          <p className="hero-subtitle">
            Discover our comprehensive range of luxury travel and lifestyle services. From exclusive accommodations to private transportation, we provide world-class experiences tailored to your needs.
          </p>
        </div>
      </section>

      {/* 2. WHAT WE OFFER (Con Iconos y Efecto Hover) */}
      <section className="offer-section bg-gray-light">
        <div className="inner-container">
          <div className="section-header">
            <span className="pre-title">Portfolio</span>
            <h2>What We Offer</h2>
            <p>Choose from our premium selection of services designed to make your travel dreams come true.</p>
          </div>
          <div className="offer-grid">
            {coreOffers.map((offer, i) => (
              <div key={i} className="offer-card">
                <div className="offer-icon-wrapper">{offer.icon}</div>
                <h3>{offer.title}</h3>
                <p>{offer.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE CUPONTOURS (Con Iconos Dinámicos) */}
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

      {/* 4. TRAVEL & LIFESTYLE SERVICES (Listas Interactivas) */}
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

      {/* 5. CALL TO ACTION */}
      <section className="services-cta">
        <div className="cta-container">
          <h2>Ready to Experience Luxury?</h2>
          <p>Contact us today to start planning your next extraordinary adventure. Our team is ready to create a personalized experience just for you.</p>
          <div className="cta-actions">
            <button className="btn-black-pill">Get Started</button>
            <button className="btn-outline-pill">View Portfolio</button>
          </div>
        </div>
      </section>
    </main>
  );
}
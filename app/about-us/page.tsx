import React from 'react';
import './about.css';

export default function AboutPage() {
  const stats = [
    { value: '100+', label: 'Luxury Properties Managed' },
    { value: '65K+', label: 'Nights Booked' },
    { value: '98%', label: 'Guest Satisfaction' },
    { value: '24/7', label: 'Dedicated Concierge' }
  ];

  const values = [
    {
      number: '01',
      title: 'Uncompromised Quality',
      desc: 'From architectural curation to interior design and premium amenities, we select only the finest properties to join our collection.'
    },
    {
      number: '02',
      title: 'Quiet Luxury Hospitality',
      desc: 'We offer an invisible yet omnipresent service. Hotel-grade cleaning standards, digital keys, and smart home automation.'
    },
    {
      number: '03',
      title: 'Transparent Partnerships',
      desc: 'We manage property investments with radical clarity. Owners access real-time performance metrics and institutional-grade reports.'
    }
  ];

  return (
    <main className="about-page">
      
      {/* 1. MINIMALIST HERO SECTION */}
      <section className="about-hero">
        <div className="hero-container">
          <span className="pre-title">Our Story</span>
          <h1 className="massive-heading">Elevating the vacation<br />rental experience.</h1>
          <p className="hero-subtitle">
            Cupontours was born out of a simple realization: travelers shouldn't have to choose between the space of a private home and the predictable luxury of a 5-star hotel. 
          </p>
        </div>
      </section>

      {/* 2. STATEMENT & IMAGE SPLIT */}
      <section className="about-split bg-gray-light">
        <div className="split-container">
          <div className="split-text-side">
            <h2 className="statement-text">
              "We don't just manage properties; we curate infrastructure for ungorgettable life experiences."
            </h2>
            <p className="body-text">
              Our Short-Term Property Management firm is dedicated to working on behalf of vacation rental owners to enhance guest satisfaction and maximize revenue at every step of the way. Through advanced technology, smart operations, and hands-on property care, we elevate real estate assets into high-performing hospitality destinations.
            </p>
          </div>
          <div className="split-image-side">
            <div className="image-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80" 
                alt="Modern luxury architectural interior" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. EDITORIAL STATS */}
      <section className="about-stats-section">
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. MISSION & VALUES (Asymmetric Grid) */}
      <section className="about-values-section bg-gray-light">
        <div className="values-container">
          <div className="values-header">
            <span className="pre-title">Our Pillars</span>
            <h2 className="section-title">The principles that<br />drive Cupontours.</h2>
          </div>
          
          <div className="values-list">
            {values.map((val, i) => (
              <div key={i} className="value-row">
                <div className="value-number-col">
                  <span>{val.number}</span>
                </div>
                <div className="value-content-col">
                  <h3>{val.title}</h3>
                  <p>{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. VISION CALL TO ACTION */}
      <section className="about-cta">
        <div className="cta-content">
          <h2>Ready to experience Wander-level hospitality?</h2>
          <p>Whether you are looking for your next escape or want to list your luxury property with us, our team is ready.</p>
          <div className="cta-buttons">
            <a href="/locations" className="btn-black-pill">Explore Homes</a>
            <a href="/work-with-us" className="btn-outline-pill">Partner With Us</a>
          </div>
        </div>
      </section>

    </main>
  );
}
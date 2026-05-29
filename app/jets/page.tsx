import React from 'react';
import './jets.css';

export default function JetsPage() {
  // Pilares con imágenes realistas y descriptivas de aviación ejecutiva
  const pillars = [
    { 
      title: 'Experience', 
      desc: 'Our customized flights offer top-tier luxury alternatives. Elevate your journey with private boarding terminal access.',
      img: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=500&q=80'
    },
    { 
      title: 'Quality', 
      desc: 'Meticulously engineered aircraft coupled with elite hospitality staff ensuring absolute safety and comfort.',
      img: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=500&q=80'
    },
    { 
      title: 'Personal', 
      desc: 'Tailored flight catering schedules, ground logistics, and specific requests arranged down to the last detail.',
      img: 'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=500&q=80'
    },
    { 
      title: 'Aircrafts', 
      desc: 'Access an elite global charter fleet of modern light, mid-size, and heavy private jet structures.',
      img: 'https://images.unsplash.com/photo-1524850301259-7729d41d11d9?auto=format&fit=crop&w=500&q=80'
    }
  ];

  return (
    <main className="aviation-page">
      
      {/* 1. CINEMATIC HERO */}
      <section className="aviation-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">Private Aviation</span>
          <h1 className="hero-title">What Do You<br />Feel Like Flying?</h1>
          <p className="hero-subtitle">Experience the ultimate luxury in aviation with Cupontours. Institutional-grade private jet charters, custom onboard itineraries, and uncompromised privacy in the sky.</p>
        </div>
      </section>

      {/* 2. REQUEST A QUOTE - SPLIT SECTION */}
      <section className="quote-split-section">
        <div className="split-container">
          <div className="split-text-side">
            <span className="pre-title">Charter Solutions</span>
            <h2>On-Demand Private Jet Bookings</h2>
            <p className="body-lead">Discover absolute flexibility with bespoke routing configured entirely around your corporate or personal schedule.</p>
            <p className="body-text">Cupontours provides institutional-grade luxury flight options, bypass commercial lines via elite private terminals (FBOs), secure direct boarding protocols, and customized luggage handling. Complete your quote application to check global fleet availabilities.</p>
          </div>
          
          <div className="split-form-side">
            <div className="quote-form-card">
              <h3>Request a Quote</h3>
              <p className="form-desc">Complete your flight criteria and our private flight specialists will coordinate options.</p>
              <form className="clean-aviation-form">
                <div className="form-row">
                  <div className="input-group">
                    <label>Leaving From</label>
                    <input type="text" placeholder="City or Airport Code" />
                  </div>
                  <div className="input-group">
                    <label>Going To</label>
                    <input type="text" placeholder="City or Airport Code" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>Departure Date</label>
                    <input type="date" />
                  </div>
                  <div className="input-group">
                    <label>Return Date (Optional)</label>
                    <input type="date" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>Passengers</label>
                    <input type="number" min="1" placeholder="1" />
                  </div>
                  <div className="input-group">
                    <label>Aircraft Class Preferred</label>
                    <select>
                      <option>Any Class (Optimized Yield)</option>
                      <option>Light Jet</option>
                      <option>Mid-Size Jet</option>
                      <option>Heavy / Long-Range Jet</option>
                    </select>
                  </div>
                </div>
                <button type="button" className="btn-black-full">Submit Flight Request</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WOULD YOU RATHER (EDITORIAL BLOCK) */}
      <section className="editorial-pitch bg-gray-light">
        <div className="pitch-container">
          <span className="pre-title">The Standard</span>
          <blockquote className="editorial-quote">
            "Your journey is strictly personal. Flight options configured from custom travel horizons are ready to respond to your exact target."
          </blockquote>
          <p className="pitch-subtext">Access our premium array of services, tailored to your lifestyle parameters across any coordinates.</p>
        </div>
      </section>

      {/* 4. PILLARS GRID CON IMÁGENES COMPLETAS */}
      <section className="pillars-section">
        <div className="inner-container">
          <div className="pillars-grid">
            {pillars.map((pillar, i) => (
              <div key={i} className="pillar-card">
                <div className="pillar-image-wrapper">
                  <img src={pillar.img} alt={pillar.title} loading="lazy" />
                  <span className="pillar-num">0{i+1}</span>
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. OBJECTIVES SECTION CON ICONOS ICONOGRÁFICOS VECTORIALES */}
      <section className="objectives-section bg-gray-light">
        <div className="inner-container">
          <div className="objectives-header">
            <span className="pre-title">Objectives</span>
            <h2>Designed to Fulfill Your Needs</h2>
          </div>
          <div className="objectives-grid">
            
            {/* Tarjeta de Best Deal */}
            <div className="obj-card">
              <div className="obj-icon-wrapper">
                {/* Icono de Trato / Porcentaje Premium */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>
              </div>
              <h3>The Best Deal</h3>
              <p>Optimized market positioning ensuring premium tier pricing and operational efficiency across private routes.</p>
            </div>

            {/* Tarjeta de Best Experience */}
            <div className="obj-card">
              <div className="obj-icon-wrapper">
                {/* Icono de Corona / Excelencia */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
              </div>
              <h3>The Best Experience</h3>
              <p>From seamless dynamic check-in layouts to ultimate onboard amenities, we curate an elite aviation journey.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. BRUTALIST DARK BANNER */}
      <section className="aviation-dark-banner">
        <div className="dark-banner-content">
          <h2>You Don't Deserve Less Than This.</h2>
          <p>Experience lifestyle services in luxury space with Cupontours Exclusive Jet Services.</p>
          <div className="banner-actions">
            <button className="btn-white-pill">Fly With Us</button>
            <button className="btn-outline-white">Contact Us</button>
          </div>
        </div>
      </section>

    </main>
  );
}
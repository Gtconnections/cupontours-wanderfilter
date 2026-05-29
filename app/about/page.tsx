import React from 'react';
import './about.css';

export default function AboutPage() {
  const stats = [
    { value: '671K+', label: 'Wanderers on the waitlist' },
    { value: '65K+', label: 'Nights booked' },
    { value: '90%+', label: 'Guest satisfaction' }
  ];

  const team = [
    { name: 'John Andrew Entwistle', role: 'Founder & CEO', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80' },
    { name: 'Kyle Tibbitts', role: 'Chief Operating Officer', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' },
    { name: 'Michael C.', role: 'Chief Financial Officer', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' },
    { name: 'Sarah Waters', role: 'VP of Marketing', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
    { name: 'David Kim', role: 'Head of Product', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
    { name: 'Emma Johnson', role: 'Head of Design', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80' },
    { name: 'Mark Roberts', role: 'Head of Engineering', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' }
  ];

  const news = [
    { publisher: 'Forbes', title: 'Meet The 30 Under 30 Software Wunderkind Taking On Airbnb' },
    { publisher: 'Newsweek', title: 'Real Housewives Of Orange County\' Star Emily Simpson Soaks Up The Sun on St...' },
    { publisher: 'ELLE', title: 'Plan, Book, and Travel More with Wander: How to Make 2026 the Best Travel Year Yet' }
  ];

  const investors = [
    'QED Investors', 'Redpoint', 'Bain Capital', 'Susa Ventures', 'Founders Fund', 'Breyer Capital', 'Authentic Ventures', 'Amplo Ventures'
  ];

  return (
    <main className="about-page">
      
      {/* 1. HERO SECTION */}
      <section className="about-hero">
        <h1 className="about-title">Building the infrastructure<br />to experience the world.</h1>
        <div className="hero-video-container">
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80" alt="Founder smiling" className="video-poster" />
          <div className="video-overlay">
            <div className="video-info">
              <span className="video-title">The Wander Story</span>
              <span className="video-subtitle">By John Andrew Entwistle, Founder</span>
            </div>
            <button className="play-btn" aria-label="Play video">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATS & LETTER SECTION */}
      <section className="about-letter-section">
        <div className="letter-container">
          {/* Los stats ahora están en un grid horizontal a la izquierda */}
          <div className="stats-column">
            <div className="stats-grid">
              {stats.map((stat, i) => (
                <div key={i} className="stat-block">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="letter-column">
            <p>Wander was born out of a desire for a better way to experience the world, bringing the comfort of a luxury hotel to a vacation home.</p>
            <p>We believe in a world where finding a great vacation home is seamlessly integrated into every aspect of life, without stressing about the details. Whether you are seeking adventure, escaping the city, or spending time with loved ones, Wander has a home for every occasion.</p>
            <p>We are creating a world where anyone can invest in the places they visit, building wealth together. By combining smart technology with beautiful design, we are transforming the way people travel and invest.</p>
            <p>Our promise is simple: beautifully designed homes, in inspiring locations, with the amenities of a luxury hotel. No stress, no chores, just a great trip ahead.</p>
            <p>Let's go places, together.</p>
            
            <div className="signature-block">
              <div className="signature-text">John Andrew Entwistle</div>
              <span className="signature-role">Founder and CEO of Wander</span>
              <img src="https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=150&q=80" alt="Stamp" className="stamp-img" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. TEAM SECTION */}
      <section className="team-section">
        <div className="team-header">
          <span className="pre-title">Leadership</span>
          <h2 className="massive-heading">A team on a mission<br /><span className="text-light">to deliver more happiness.</span></h2>
        </div>
        
        <div className="team-grid">
          {team.map((member, i) => (
            <div key={i} className="team-card">
              <div className="member-img">
                <img src={member.img} alt={member.name} />
              </div>
              <div className="member-info">
                <h4>{member.name}</h4>
                <p>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. INVESTORS SECTION */}
      <section className="investors-section">
        <div className="investors-container">
          <div className="investors-text">
            <span className="pre-title">Investors</span>
            <h2 className="massive-heading">Trusted partners.<br /><span className="text-light">Timeless vision.</span></h2>
            <p className="investors-desc">Our team of investors have backed iconic founders and transformative companies. We're proud to have them on our journey to help people find their happy place.</p>
          </div>
          
          <div className="investors-list-wrapper">
            <span className="list-title">Selected investors</span>
            <div className="investors-list-layout">
              <ul className="investor-names">
                {investors.map((inv, i) => (
                  <li key={i}>{inv}</li>
                ))}
              </ul>
              <div className="redpoint-logo">
                {/* Cuadro negro masivo con el logo geométrico rojo */}
                <div className="black-square-logo">
                  <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                    <path d="M20 70L50 40L80 60L90 20" stroke="#FF0033" strokeWidth="12" strokeLinecap="square" strokeLinejoin="miter"/>
                    <polygon points="90,20 75,20 90,35" fill="#FF0033"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DARK SECTION: PRESS & CAREERS */}
      <section className="dark-section">
        
        {/* Press */}
        <div className="press-container">
          <span className="pre-title dark-pre">Press</span>
          <h2 className="massive-heading dark-title">Wander in the news.</h2>
          
          <div className="news-grid">
            {news.map((item, i) => (
              <a href="#" key={i} className="news-card">
                <div className="news-card-header">
                  <span className="publisher">{item.publisher}</span>
                  <div className="arrow-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>
                <h3 className="news-title">{item.title}</h3>
              </a>
            ))}
          </div>
        </div>

        {/* Careers CTA */}
        <div className="careers-cta-container">
          <div className="careers-card">
            <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80" alt="Team at a house" className="careers-bg" />
            <div className="careers-overlay"></div>
            <div className="careers-content">
              <span className="pre-title careers-pre">Open roles</span>
              <h2 className="massive-heading">Join our mission to help<br /><span className="text-light-dark">people find their happy place.</span></h2>
              <button className="btn-white-pill">View open roles</button>
            </div>
          </div>
        </div>

        {/* Logos Bar Footer */}
        <div className="dark-logos-bar">
          <span className="featured-in">Featured in</span>
          <div className="logos-row">
            <span>Forbes</span>
            <span>INSIDER</span>
            <span>FASTCOMPANY</span>
            <span>THE WALL STREET JOURNAL</span>
            <span>RollingStone</span>
            <span>USA TODAY</span>
          </div>
        </div>

      </section>

    </main>
  );
}
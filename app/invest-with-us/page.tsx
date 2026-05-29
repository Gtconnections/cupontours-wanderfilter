import React from 'react';
import './invest.css';

export default function InvestPage() {
  const gettingStarted = [
    { step: '01', title: 'Consultation', desc: 'We assess your property’s potential and create a tailored management strategy to maximize your revenue.' },
    { step: '02', title: 'Onboarding', desc: 'Our team handles the heavy lifting: professional photography, staging advice, and listing creation.' },
    { step: '03', title: 'Go Live', desc: 'Your property goes live across top platforms. Sit back and watch your investment grow.' }
  ];

  const whyChooseUs = [
    { title: 'Peace of mind', desc: 'Comprehensive management so you never have to worry about late-night guest calls or maintenance issues.' },
    { title: 'Maximized returns', desc: 'Dynamic pricing algorithms ensure you get the highest possible yield for every booked night.' },
    { title: '24/7 Guest support', desc: 'Our dedicated concierge team is always available to provide a luxury hotel experience.' },
    { title: 'Transparent reporting', desc: 'Access real-time financial dashboards, occupancy rates, and payout details anytime.' },
    { title: 'Smart pricing', desc: 'We analyze local events, seasonality, and market trends to adjust rates daily.' },
    { title: 'Meticulous care', desc: 'Rigorous cleaning standards and routine inspections keep your asset in pristine condition.' }
  ];

  const solutions = [
    'Pricing & Revenue', 'Guest Relations', 'Marketing', 'Property Maintenance', 
    'Housekeeping', 'Interior Design', 'Legal Compliance', 'Tax & Accounting'
  ];

  const gallery = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505843513577-22bb7abd2638?auto=format&fit=crop&w=800&q=80'
  ];

  const stats = [
    { value: '98%', label: 'Owner Satisfaction' },
    { value: '$10M+', label: 'Revenue Generated' },
    { value: '100+', label: 'Properties Managed' }
  ];

  return (
    <main className="invest-page">
      
      {/* 1. CINEMATIC HERO */}
      <section className="invest-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">Property Management</span>
          <h1 className="hero-massive-title">Welcome to Cupontours<br />Property Management.</h1>
          <p className="hero-subtitle">You own the property, we handle the rest. Maximize your rental income with our expert solutions and industry-leading technology.</p>
          <button className="btn-white-pill mt-4">Join our program</button>
        </div>
      </section>

      {/* 2. GETTING STARTED (Minimalist Steps) */}
      <section className="steps-section">
        <div className="section-header-center">
          <span className="pre-title">Process</span>
          <h2 className="massive-heading">Getting Started is Simple</h2>
        </div>
        <div className="steps-grid">
          {gettingStarted.map((item, i) => (
            <div key={i} className="step-card">
              <span className="step-number">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. DARK SECTION: WHY CHOOSE US */}
      <section className="why-dark-section">
        <div className="dark-container">
          <div className="section-header-center">
            <span className="pre-title dark-pre">The Advantage</span>
            <h2 className="massive-heading dark-title">Why Choose Us</h2>
            <p className="dark-subtitle">Experience the difference of partnering with a premier property management firm dedicated to your success.</p>
          </div>
          <div className="features-grid-3">
            {whyChooseUs.map((feat, i) => (
              <div key={i} className="dark-feature-item">
                <div className="feature-icon-minimal">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h4>{feat.title}</h4>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
          <div className="center-btn">
            <button className="btn-white-pill">Partner with us</button>
          </div>
        </div>
      </section>

      {/* 4. SPLIT: PROFILE & SOLUTIONS */}
      <section className="split-section">
        <div className="split-container">
          <div className="split-image">
            <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" alt="Corporate Buildings" />
          </div>
          <div className="split-text">
            <span className="pre-title">Our Profile</span>
            <h2 className="section-title">A modern approach to<br />real estate management.</h2>
            <p className="text-content">Cupontours provides a full-service, end-to-end management solution for property owners who want luxury hotel standards applied to their vacation rentals.</p>
            <p className="text-content">We leverage advanced technology, dynamic pricing, and meticulous operational standards to ensure your property performs at its absolute best.</p>
            <button className="btn-black-pill mt-4">Learn More</button>
          </div>
        </div>
      </section>

      {/* 5. TWO ASYMMETRICAL CARDS (ROI & Staging) */}
      <section className="two-cards-section bg-gray-light">
        <div className="cards-grid">
          <div className="service-card">
            <div className="card-img-wrapper">
              <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80" alt="Analyze ROI" />
            </div>
            <div className="card-content">
              <h3>Analyze ROI</h3>
              <p>Let our experts run the numbers. We provide detailed financial projections based on historical data and market trends.</p>
              <a href="#" className="text-link">Get a projection &rarr;</a>
            </div>
          </div>
          <div className="service-card">
            <div className="card-img-wrapper">
              <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80" alt="Virtual Staging" />
            </div>
            <div className="card-content">
              <h3>Virtual Staging</h3>
              <p>Enhance your property's visual appeal. Our interior design team can virtually stage empty rooms to attract premium guests.</p>
              <a href="#" className="text-link">See examples &rarr;</a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SPLIT: DASHBOARD & FAST SIGN UP */}
      <section className="split-section">
        <div className="split-container reverse">
          <div className="split-image gray-bg-img">
            {/* Representación limpia del Dashboard */}
            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" alt="Advanced Dashboard" />
          </div>
          <div className="split-text">
            <span className="pre-title">WanderOS</span>
            <h2 className="section-title">Advanced Dashboard &<br />Fast Sign Up.</h2>
            <div className="timeline-list">
              <div className="timeline-item">
                <span className="tl-num">1</span>
                <div>
                  <h4>Create Profile</h4>
                  <p>Register your account in our secure portal.</p>
                </div>
              </div>
              <div className="timeline-item">
                <span className="tl-num">2</span>
                <div>
                  <h4>Property Details</h4>
                  <p>Upload photos, amenities, and ownership documents.</p>
                </div>
              </div>
              <div className="timeline-item">
                <span className="tl-num">3</span>
                <div>
                  <h4>Review & Go Live</h4>
                  <p>Our team approves your listing and pushes it to all platforms.</p>
                </div>
              </div>
            </div>
            <button className="btn-black-pill mt-4">Join Us</button>
          </div>
        </div>
      </section>

      {/* 7. ALL SOLUTIONS GRID */}
      <section className="solutions-grid-section bg-gray-light">
        <div className="section-header-center">
          <h2 className="section-title">Explore our solutions</h2>
        </div>
        <div className="pill-grid">
          {solutions.map((sol, i) => (
            <div key={i} className="solution-pill-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              <span>{sol}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 8. OUR WORK GALLERY */}
      <section className="gallery-section">
        <div className="section-header-center">
          <span className="pre-title">Portfolio</span>
          <h2 className="massive-heading">Our Work</h2>
          <p className="subtitle">Take a look at some of the extraordinary properties we manage.</p>
        </div>
        <div className="masonry-grid">
          {gallery.map((img, i) => (
            <div key={i} className="gallery-item">
              <img src={img} alt={`Property ${i+1}`} />
            </div>
          ))}
        </div>
      </section>

      {/* 9. CONTACT FORM & STATS */}
      <section className="contact-stats-section bg-gray-light">
        <div className="split-container">
          <div className="split-form">
            <div className="form-card">
              <h3>Let's talk about your property</h3>
              <p>Fill out the form and a management specialist will contact you.</p>
              <form className="clean-form mt-4">
                <div className="form-row">
                  <div className="input-group"><label>First Name</label><input type="text" /></div>
                  <div className="input-group"><label>Last Name</label><input type="text" /></div>
                </div>
                <div className="form-row">
                  <div className="input-group"><label>Email</label><input type="email" /></div>
                  <div className="input-group"><label>Phone</label><input type="tel" /></div>
                </div>
                <div className="input-group"><label>Property Address</label><input type="text" /></div>
                <button type="button" className="btn-black-full mt-4">Submit Inquiry</button>
              </form>
            </div>
          </div>
          
          <div className="split-stats">
            <div className="contact-info-block">
              <span className="pre-title">Contact Us</span>
              <p><strong>Email:</strong> info@cupontours.com</p>
              <p><strong>Phone:</strong> +1 (786) 686-6582</p>
              <p><strong>Address:</strong> Miami, Florida</p>
            </div>
            
            <div className="massive-stats-grid">
              {stats.map((stat, i) => (
                <div key={i} className="stat-card">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
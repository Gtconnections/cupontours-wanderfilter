import React from 'react';
import './work.css';

export default function WorkWithUsPage() {
  const revenueEstimates = [
    { beds: '1 Bedroom', price: '$3,000+', desc: '*These estimates are just an idea of how much you can generate. Varies by season and property.' },
    { beds: '2 Bedroom', price: '$4,500+', desc: '*These estimates are just an idea of how much you can generate. Varies by season and property.', highlight: true },
    { beds: '3 Bedroom', price: '$6,000+', desc: '*These estimates are just an idea of how much you can generate. Varies by season and property.' },
  ];

  const whyUsFeatures = [
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15l-2 5-9-5 9-5 2 5z"/><path d="M12 15l2 5 9-5-9-5-2 5z"/></svg>,
      title: 'Experience the Benefits',
      desc: 'As a company, we care about your home properly. All of the return on investment you get for renting your property. The money you make managing properties with us helps to maintain and clean huge properties.'
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>,
      title: 'A Win-Win Situation',
      desc: 'Cupontours is totally transparent in the way we work. We have a robust Property Management service that allows all parties to have an exact picture of how the business works, allowing you to grow together and reach your goals as real estate investors.'
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      title: 'Work with the Dream Team',
      desc: 'Whatever the size of the Short Term Property Management requires, the Cupontours team of professionals is ready to assist you. Our team members include property managers, maintenance, cleaners, and interior designers.'
    }
  ];

  const platforms = [
    'Airbnb', 'Vrbo', 'Booking.com', 'Expedia', 'TripAdvisor', 'Marriott'
  ];

  return (
    <main className="work-page">
      
      {/* 1. HERO MASIVO */}
      <section className="work-hero">
        <div className="hero-text-container">
          <span className="pre-title">Partnerships</span>
          <h1 className="work-massive-title">Join our team of allies for exclusive<br /><span className="text-light">property management.</span></h1>
          <p className="hero-subtitle">Earn a stable income securely joining our team of allies for Short Term Property Management services.</p>
        </div>
        <div className="hero-image-wrapper">
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80" alt="Luxury Property Management" />
        </div>
      </section>

      {/* 2. ABOUT US & FORM SPLIT */}
      <section className="work-split-section">
        <div className="split-container">
          <div className="split-text">
            <span className="pre-title">About Us</span>
            <h2 className="section-title">A company dedicated to working<br />on behalf of your dreams.</h2>
            <div className="text-content">
              <p>Our Short Term Property Management company is dedicated to working on behalf of your dreams. Your property portfolio is our passion and commitment, providing exceptional care in every step of the way.</p>
              <p>Through the use of technology, knowledge based on experience, unwavering discipline, and unwavering passion in what we do, it is our ultimate dedication to be truly integrated with transparency. Our integrated value approach means property management is more than a service, it is taking care of you as an individual.</p>
            </div>
          </div>
          
          <div className="split-form">
            <div className="form-card">
              <h3>Join Our Team</h3>
              <p>Fill out the form below and we will get back to you shortly.</p>
              <form className="ally-form">
                <div className="form-row">
                  <div className="input-group">
                    <label>First Name</label>
                    <input type="text" placeholder="John" />
                  </div>
                  <div className="input-group">
                    <label>Last Name</label>
                    <input type="text" placeholder="Doe" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>Email</label>
                    <input type="email" placeholder="john@example.com" />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <div className="input-group">
                  <label>Your Message</label>
                  <textarea rows={4} placeholder="Tell us about your property..."></textarea>
                </div>
                <p className="form-disclaimer">By sending this form, you agree to our terms and privacy policy. We will never share your personal information.</p>
                <button type="button" className="btn-black-full">Send message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAXIMIZE PROFITS SPLIT (REVERSE) */}
      <section className="work-split-section bg-gray-light">
        <div className="split-container reverse">
          <div className="split-text">
            <span className="pre-title">Solutions</span>
            <h2 className="section-title">Maximize your rental home profits<br />with our solutions.</h2>
            <div className="text-content">
              <p>For over a decade, our Short Term Property Management firm is allowed to effectively manage you maximize your rental home profits. Our comprehensive solutions aim to guarantee 100% of profits without handling anything else.</p>
              <p>We provide full-service end-to-end management solutions that are designed to make your life easier. Our team handles everything from tenant screening and leasing to maintenance and rent collection. You can relax and enjoy the benefits of homeownership without the stress.</p>
            </div>
            <button className="btn-black-pill mt-4">Meet the Team</button>
          </div>
          <div className="split-image">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80" alt="Giving keys to new home" />
          </div>
        </div>
      </section>

      {/* 4. REVENUE ESTIMATES */}
      <section className="revenue-section">
        <div className="section-header center">
          <span className="pre-title">Projections</span>
          <h2 className="section-title">Let's work together and make money.</h2>
          <p className="subtitle-text">Estimates are for Short Term property. Your income can vary depending on seasonality, changes in local average daily rates.</p>
        </div>
        
        <div className="revenue-grid">
          {revenueEstimates.map((item, index) => (
            <div key={index} className={`revenue-card ${item.highlight ? 'highlight' : ''}`}>
              <h4>{item.beds}</h4>
              <div className="price">{item.price}</div>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHY WORK WITH US */}
      <section className="why-us-section bg-gray-light">
        <div className="section-header center">
          <div className="logo-placeholder">Cupontours</div>
          <h2 className="section-title">Why work with us</h2>
        </div>
        
        <div className="features-grid-3">
          {whyUsFeatures.map((feat, i) => (
            <div key={i} className="feature-block">
              <div className="icon-circle">{feat.icon}</div>
              <h4>{feat.title}</h4>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. DARK BANNER */}
      <section className="dark-banner">
        <div className="banner-content">
          <div className="logo-placeholder light">Cupontours</div>
          <h2>Cupontours is more than your trusted ally in the world of property management.<br /><span className="text-light-dark">We are your success partners.</span></h2>
        </div>
      </section>

      {/* 7. PLATFORMS LOGOS */}
      <section className="platforms-section">
        <div className="section-header center">
          <h3 className="small-title">Platforms where you can find us and we use to manage our properties</h3>
        </div>
        <div className="logos-flex">
          {platforms.map((platform, i) => (
            <div key={i} className="platform-logo">{platform}</div>
          ))}
        </div>
      </section>

    </main>
  );
}
"use client";
import React, { useState } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import { sendAllianceRequest } from '../../lib/api';
import './work.css';

const workWithUsPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Work With Us",
  "description": "Partner with Cupontours as a luxury service provider."
};

export default function WorkWithUsPage() {
  // Estados para controlar los campos del formulario de aliados
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  // Estados de control para la solicitud de red local
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const revenueEstimates = [
    { beds: '1 Bedroom', price: '$3,000*', desc: '*That’s $200 USD paid monthly for 15 months, as long as the property remains under management.' },
    { beds: '2 Bedroom', price: '$4,500*', desc: '*That’s $250 USD paid monthly for 18 months, as long as the property remains under management.', highlight: true },
    { beds: '3 Bedroom', price: '$6,000*', desc: '*That’s $300 USD paid monthly for 20 months, as long as the property remains under management.' },
  ];

  const whyUsFeatures = [
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-award w-8 h-8 text-primary" aria-hidden="true"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path><circle cx="12" cy="8" r="6"></circle></svg>,
      title: 'Experience the Benefits of Working with us',
      desc: 'At our company, we specialize in Short Term Property Management. Unlike other companies, we don’t sell or buy properties. Our primary focus is on managing properties to provide the best possible experience for property owners.'
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign w-8 h-8 text-primary" aria-hidden="true"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
      title: 'Experience a Win Win Situation',
      desc: 'Our business model is a win-win for everyone. For our clients, With our Short Term Property Management services, your clients will quickly see the rewards. Both begins and will be instrumental to achieving the main goal, leaving you properly with business in excellent condition.'
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      title: 'Work with the Dream Team',
      desc: 'When you choose our Short Term Property Management services, you’ll be working with the dream team. Our company has a complete administrative, managerial, and customer service team that works around the clock to make your investment profitable.'
    }
  ];

  const handleAllySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    const payload = { firstName, lastName, email, phoneNumber, message };

    try {
      const response = await sendAllianceRequest(payload);
      setStatusMessage({
        type: 'success',
        text: response.message || "Your application was transmitted successfully!"
      });
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setMessage('');
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: (error instanceof Error ? error.message : undefined) || "Something went wrong. Please check your credentials."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="work-page">
      
      {/* 1. HERO MASIVO RE-DISEÑADO CON IMAGEN DE FONDO CINEMÁTICA */}
      <section className="work-hero-cinematic">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">Partnerships</span>
          <h1 className="hero-massive-title">Join Our Team of Allies for Exclusive<br />Short Term Property<br /><span className="text-light-dim">Management Opportunities.</span></h1>
          <p className="hero-subtitle">Earn sizeable commissions by joining our team of allies for Short Term Property Management services.</p>
          <button className="btn-white-pill mt-4" type="button" onClick={() => document.getElementById('alliance-form-block')?.scrollIntoView({ behavior: 'smooth' })}>Schedule a Call Now</button>
        </div>
      </section>

      {/* 2. ABOUT US & FORM SPLIT */}
      <section className="work-split-section" id="alliance-form-block">
        <div className="split-container">
          <div className="split-text">
            <span className="pre-title">About Us</span>
            <h2 className="section-title">A company dedicated to working<br />on behalf of your dreams.</h2>
            <div className="text-content">
              <p>Our Short Term Property Management company is dedicated to working on behalf of our clients&apos; best interests. We focus on our guests and community, providing exceptional service every step of the way.</p>
              <p>Through the use of technology, knowledge-based maintenance, accounting discipline, and outstanding customer service, we help our clients achieve their rental income goals with transparency. Our comprehensive approach to property management ensures that every detail is taken care of, so you can relax and enjoy the benefits of Short Term Property Management.</p>
            </div>
          </div>
          
          <div className="split-form">
            <div className="form-card">
              <h3>Join Our Team</h3>
              <p>Fill out the form below and let&apos;s start working together</p>
              
              <form onSubmit={handleAllySubmit} className="ally-form custom-wander-layout">
                
                {/* Capa de Estado Dinámica */}
                {statusMessage && (
                  <div style={{
                    padding: '14px 16px',
                    backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fee2e2'}`,
                    borderRadius: '12px',
                    color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
                    fontSize: '13px',
                    fontWeight: 500,
                    lineHeight: 1.5
                  }}>
                    {statusMessage.text}
                  </div>
                )}

                {/* FILA 1: Nombre y Apellido */}
                <div className="form-row flex-row-layout">
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      First Name *
                    </label>
                    <input 
                      type="text" 
                      className="wander-input" 
                      placeholder="John" 
                      required 
                      disabled={isLoading}
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                    />
                  </div>
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      Last Name *
                    </label>
                    <input 
                      type="text" 
                      className="wander-input" 
                      placeholder="Doe" 
                      required 
                      disabled={isLoading}
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                    />
                  </div>
                </div>

                {/* FILA 2: Email y Teléfono */}
                <div className="form-row flex-row-layout">
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      Email *
                    </label>
                    <input 
                      type="email" 
                      className="wander-input" 
                      placeholder="john@example.com" 
                      required 
                      disabled={isLoading}
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </div>
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 .81 2.7"></path></svg>
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      className="wander-input" 
                      placeholder="+1 (555) 000-0000" 
                      disabled={isLoading}
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)} 
                    />
                  </div>
                </div>

                {/* FILA 3: Mensaje */}
                <div className="wander-input-group">
                  <label className="wander-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Your Message *
                  </label>
                  <textarea 
                    className="wander-textarea" 
                    rows={4} 
                    placeholder="Tell us about your property..." 
                    required 
                    disabled={isLoading}
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>
                
                {/* NOTA DE PRIVACIDAD */}
                <div className="wander-info-box">
                  <div className="info-box-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Privacy Notice & Terms
                  </div>
                  <ul className="info-box-list">
                    <li>• The information in this form is used solely to evaluate your application as a business partner.</li>
                    <li>• We do not share your data with third parties.</li>
                    <li>• Our partnerships team responds within a maximum of 48 business hours.</li>
                  </ul>
                </div>
                
                <button 
                  type="submit" 
                  className="btn-booking-primary override-btn-submit"
                  disabled={isLoading}
                  style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                  {isLoading ? "Submitting Request..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAXIMIZE PROFITS SPLIT (REVERSE) */}
      <section className="work-split-section bg-gray-light horizontal-centered-split">
        <div className="split-container reverse">
          <div className="split-text">
            <span className="pre-title">Solutions</span>
            <h2 className="section-title">Maximize Your Rental Home Profits with<br />Our Property Management Solutions</h2>
            <div className="text-content">
              <p>Partner with us for Short Term Property Management and discover how we can help you maximize your rental home profits! Our comprehensive services ensure you earn 5% of profits while we handle everything else.</p>
              <p>We provide comprehensive property management solutions that are designed to make your life easier. Our team handles everything from maintenance and repairs to marketing and customer service. You can relax and enjoy the returns while we take care of the rest.</p>
              <p>Choose us for Short Term Property Management and enjoy the results of our expert services. Contact us today to learn more about our property management solutions.</p>
            </div>
            
            <a 
              href="#alliance-form-block" 
              className="btn-black-pill mt-4 text-center-anchor"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('alliance-form-block')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Meet the Team
            </a>
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
          <h2 className="section-title">Let&apos;s Work Together and Make Money</h2>
          <p className="subtitle-text">Partner with us for Short Term Property Management and earn money for every property you bring in for us to manage. Here&apos;s how it works:</p>
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
          <span className="pre-title">Cupontours</span>
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
          <div className="logo-placeholder light">
            <img className="img-logo" alt="Cupon Tours" src="https://res.cloudinary.com/gt-connections/image/upload/v1705168752/cupon-tours/footer-icons/logo-cupontours-footer_maerif.png" />
          </div>
          <h2>Experience it with your friends in the best weather in the world or a luxury machine in the best destinations around the world.</h2>
        </div>
      </section>

      <StructuredData type="Organization" data={workWithUsPageStructuredData} />
    </main>
  );
}
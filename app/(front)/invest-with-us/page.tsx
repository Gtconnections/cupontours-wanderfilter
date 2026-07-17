"use client";
import React, { useState } from 'react';
import { StructuredData } from "@/components/seo/structured-data";
import { sendInvestRequest } from '../../lib/api';
import './invest.css';

const investPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Invest With Us",
  "description": "Explore investment opportunities with Cupontours."
};

export default function InvestPage() {
  const [interestType, setInterestType] = useState('I want to rent');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  // Estados de control para la solicitud local
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estado para controlar el popup de la galería interactiva
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);

  const gettingStarted = [
    { step: '01', title: 'Let’s get started', desc: 'Book an appointment and get expert guidance on the best properties and investment strategies.' },
    { step: '02', title: 'Expertise', desc: 'Manage your property with excellence. Our team will handle every detail to maximize your returns.' },
    { step: '03', title: 'Supervision', desc: 'Monitor all your mobile phone and get part of all the action with comprehensive reporting.' }
  ];

  const whyChooseUs = [
    { title: 'Marketing expertise', desc: 'Professional photography and marketing to attract quality tenants and maximize occupancy rates.' },
    { title: 'Streamlined processes', desc: 'Efficient property management operations to ensure smooth tenant relations and property care.' },
    { title: 'Tenant screening services', desc: 'Thorough background checks and verification to secure reliable, long-term tenants for your property.' },
    { title: 'Maintenance support and management', desc: '24/7 maintenance coordination to keep your property in top condition.' },
    { title: 'Expert guidance', desc: 'Professional consultation with Miami’s laws and regulations for optimal property management.' }
  ];

  const solutions = [
    { title: 'Property Marketing', desc: 'Professional photography and listing optimization across all major platforms to maximize visibility and bookings.' },
    { title: 'Guest Screening', desc: '24/7 service approach to ensure all communication including bookings, tenant verification and problem resolution.' },
    { title: 'Collections', desc: 'Rent collection and deposit collection with automatic payment processing and late fee management.' },
    { title: 'Maintenance Support', desc: '24/7 emergency maintenance services with our network of trusted contractors and service providers.' },
    { title: 'Property Inspections', desc: 'Regular property inspections and detailed reports to ensure your investment is well-maintained.' },
    { title: 'Financial Reporting', desc: 'Comprehensive monthly financial reports with detailed income and expense tracking.' },
    { title: 'Tenant Relations', desc: 'Professional tenant communication and relationship management to ensure tenant satisfaction.' },
    { title: 'Legal Guidance', desc: 'Expert legal support and guidance on landlord-tenant laws and regulations in Miami.' }
  ];

  const gallery = [
    { title: 'House with Pool', url: 'https://res.cloudinary.com/gt-connections/image/upload/v1679366278/cupon-tours/invest-with-us-cupon-tours-summer-house_nba8ww.jpg' },
    { title: 'Pool and Seats', url: 'https://res.cloudinary.com/gt-connections/image/upload/v1679366277/cupon-tours/invest-with-us-cupon-tours-primavera-house_s81q77.jpg' },
    { title: 'Apartment View', url: 'https://res.cloudinary.com/gt-connections/image/upload/v1679366277/cupon-tours/invest-with-us-cupon-tours-hyde-hallandale_byhfh5.jpg' },
    { title: 'Apartment Living Room', url: 'https://res.cloudinary.com/gt-connections/image/upload/v1679366277/cupon-tours/invest-with-us-cupon-tours-edgewater_kar5sp.jpg' },
    { title: 'Modern Kitchen', url: 'https://res.cloudinary.com/gt-connections/image/upload/v1679366277/cupon-tours/invest-with-us-cupon-tours-district-house_igrk8e.jpg' },
    { title: 'Mansion in Cali Colombia', url: 'https://res.cloudinary.com/gt-connections/image/upload/v1679118467/cupon-tours/background-cupon-tours-call-to-action-put-your-property-to-rent_tuzql5.jpg' }
  ];

  const stats = [
    { value: '500+', label: 'Properties Managed' },
    { value: '95%', label: 'Client Satisfaction' },
    { value: '$2M+', label: 'Revenue Generated' },
    { value: '10+', label: 'Years Experience' }
  ];

  const handleInvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    const payload = { interestType, firstName, lastName, email, phoneNumber, message };

    try {
      const response = await sendInvestRequest(payload);
      setStatusMessage({
        type: 'success',
        text: response.message || "Your inquiry was submitted successfully!"
      });
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setMessage('');
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: (error instanceof Error ? error.message : undefined) || "Something went wrong. Please check your data."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeGalleryIndex === null) return;
    setActiveGalleryIndex(prev => (prev === 0 ? gallery.length - 1 : prev! - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeGalleryIndex === null) return;
    setActiveGalleryIndex(prev => (prev === gallery.length - 1 ? 0 : prev! + 1));
  };

  return (
    <main className="invest-page">
      
      {/* 1. CINEMATIC HERO */}
      <section className="invest-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">Property Management</span>
          <h1 className="hero-massive-title">Welcome to Cupontours<br />Property Management.</h1>
          <p className="hero-subtitle">Your partner for maximizing rental income in Miami. Our experts specialize in short-term rental management with personalized services to help you achieve exceptional returns on your investment.</p>
          <button className="btn-white-pill mt-4" type="button" onClick={() => document.getElementById('invest-form-block')?.scrollIntoView({ behavior: 'smooth' })}>Schedule a Strategy Call Today</button>
        </div>
      </section>

      {/* 2. GETTING STARTED */}
      <section className="steps-section">
        <div className="section-header-center">
          <h2 className="massive-heading">Getting Started is Simple</h2>
          <span className="pre-title">We make the investment process straightforward with our proven three-step approach.</span>
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
            <p className="dark-subtitle">Experience the benefits of working with Cupon Tours Property Management. Expert marketing, tenant screening, and maintenance support. Contact us today.</p>
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
            <button className="btn-white-pill" type="button" onClick={() => document.getElementById('invest-form-block')?.scrollIntoView({ behavior: 'smooth' })}>Contact us</button>
          </div>
        </div>
      </section>

      {/* 4. SPLIT: PROFILE & SOLUTIONS */}
      <section className="split-section vertical-center-split">
        <div className="split-container">
          <div className="split-image">
            <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" alt="Corporate Buildings" />
          </div>
          <div className="split-text">
            <span className="pre-title">Our Profile</span>
            <h2 className="section-title">A modern approach to<br />real estate management.</h2>
            <p className="text-content">At Cupon Tours, we have built a reputation as Miami&apos;s premier property management company. Our expertise spans across all aspects of real estate investment, from acquisition to ongoing management.</p>
            <p className="text-content">With over a decade of experience in the Miami market, we understand the unique challenges and opportunities that come with short-term rental investments. Our team is committed to delivering exceptional results for our property owners.</p>
            <p className="text-content">We leverage cutting-edge technology, market insights, and proven strategies to ensure your investment generates maximum returns while maintaining the highest standards of guest experience and property care.</p>
            <button className="btn-black-pill mt-4" type="button" onClick={() => document.getElementById('invest-form-block')?.scrollIntoView({ behavior: 'smooth' })}>Get Started</button>
          </div>
        </div>
      </section>

      {/* 5. TWO ASYMMETRICAL CARDS */}
      <section className="two-cards-section bg-gray-light">
        <div className="cards-grid">
          <div className="service-card">
            <div className="card-img-wrapper">
              <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80" alt="Analyze ROI" />
            </div>
            <div className="card-content">
              <h3>I Want To Rent</h3>
              <p>Looking to rent your property? We offer comprehensive property management services with professional marketing and tenant screening starting at a competitive rate.</p>
              <a href="#invest-form-block" className="text-link" onClick={(e) => { e.preventDefault(); document.getElementById('invest-form-block')?.scrollIntoView({ behavior: 'smooth' }); }}>Get Started &rarr;</a>
            </div>
          </div>
          <div className="service-card">
            <div className="card-img-wrapper">
              <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80" alt="Virtual Staging" />
            </div>
            <div className="card-content">
              <h3>I Want To Buy</h3>
              <p>Ready to invest in Miami real estate? We help you find the perfect investment property with detailed market analysis starting at $300,000.</p>
              <a href="#invest-form-block" className="text-link" onClick={(e) => { e.preventDefault(); document.getElementById('invest-form-block')?.scrollIntoView({ behavior: 'smooth' }); }}>Get Started &rarr;</a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SPLIT: DASHBOARD & FAST SIGN UP */}
      <section className="split-section vertical-center-split">
        <div className="split-container reverse">
          <div className="split-image gray-bg-img">
            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" alt="Advanced Dashboard" />
          </div>
          <div className="split-text">
            <h2 className="section-title">I already have a property</h2>
            <p>If you already have a property and want to optimize your rental income, our management services can help you achieve maximum returns with minimal effort.</p>
            
            <div className="timeline-list">
              <div className="timeline-item">
                <span className="tl-num-bold">1</span>
                <div>
                  <h4>Reports</h4>
                  <p>Comprehensive and fully auditable reports of your property performance, including financial analytics and guest feedback.</p>
                </div>
              </div>
              <div className="timeline-item">
                <span className="tl-num-bold">2</span>
                <div>
                  <h4>Control</h4>
                  <p>Control your income directly from the platform. Monitor bookings, pricing, and revenue in real-time with our advanced dashboard.</p>
                </div>
              </div>
              <div className="timeline-item">
                <span className="tl-num-bold">3</span>
                <div>
                  <h4>Access</h4>
                  <p>Real-time property and guest customer service from your mobile device, anytime, anywhere.</p>
                </div>
              </div>
              <div className="timeline-item">
                <span className="tl-num-bold">4</span>
                <div>
                  <h4>Insurance</h4>
                  <p>We protect your property with $3,000,000 in coverage for incidents and $500,000 for hospitalization.</p>
                </div>
              </div>
            </div>
            <button className="btn-black-pill mt-4" type="button" onClick={() => document.getElementById('invest-form-block')?.scrollIntoView({ behavior: 'smooth' })}>Contact Us</button>
          </div>
        </div>
      </section>

      {/* 7. ALL SOLUTIONS GRID */}
      <section className="solutions-grid-section bg-gray-light">
        <div className="section-header-center max-width-refinned">
          <h2 className="massive-heading font-elegant-header">
            Explore our property management solutions and discover how we can help you maximize your rental home profits
          </h2>
        </div>
        <div className="solutions-management-grid">
          {solutions.map((item, i) => (
            <div key={i} className="solution-elegant-card">
              <div className="card-top-accent-bar"></div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. OUR WORK GALLERY */}
      <section className="gallery-section">
        <div className="section-header-center">
          <span className="pre-title">Portfolio</span>
          <h2 className="massive-heading">Our Work</h2>
          <p className="subtitle">We invite you to discover the extraordinary world of managed properties in our portfolio that are already generating substantial rental income. Browse through our selection and find the ideal property to start generating income today.</p>
        </div>
        <div className="masonry-grid">
          {gallery.map((item, i) => (
            <div key={i} className="gallery-item-interactive" onClick={() => setActiveGalleryIndex(i)}>
              <img src={item.url} alt={item.title} />
              <div className="gallery-hover-overlay">
                <span className="hover-title-text">{item.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL MODULAR PANORÁMICO DE VISUALIZACIÓN COMPLETA */}
        {activeGalleryIndex !== null && (
          <div className="gallery-modal-overlay" onClick={() => setActiveGalleryIndex(null)}>
            <div className="modal-content-viewport" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setActiveGalleryIndex(null)} aria-label="Close modal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <button className="modal-nav-arrow left" onClick={handlePrevImage} aria-label="Previous">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              
              <img src={gallery[activeGalleryIndex].url} alt={gallery[activeGalleryIndex].title} className="modal-main-image" />
              
              <button className="modal-nav-arrow right" onClick={handleNextImage} aria-label="Next">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>

              <div className="modal-bottom-caption-bar">
                <span>{gallery[activeGalleryIndex].title}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 9. CONTACT FORM & STATS CON CONTEXTO CONSOLIDADO */}
      <section className="contact-stats-section bg-gray-light vertical-center-split" id="invest-form-block">
        <div className="split-container">
          
          <div className="split-form">
            <div className="form-card animate-form-style">
              <h3>Receive better advice in this search for the right property for you!</h3>
              <p>Contact our expert team today and discover how we can help you maximize your property investment returns. We&apos;re here to guide you through every step of the process.</p>
              
              <form onSubmit={handleInvestSubmit} className="clean-form custom-wander-layout mt-4">
                
                {/* Capa de Estado Dinámica (Éxito o Error) */}
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

                <div className="wander-radio-container">
                  <span className="radio-title-label">I&apos;m interested in:</span>
                  <label className="radio-custom-item">
                    <input 
                      type="radio" 
                      name="interestType" 
                      value="I want to rent" 
                      checked={interestType === 'I want to rent'} 
                      disabled={isLoading}
                      onChange={(e) => setInterestType(e.target.value)} 
                    />
                    <span>I want to rent</span>
                  </label>
                  <label className="radio-custom-item">
                    <input 
                      type="radio" 
                      name="interestType" 
                      value="I want to buy" 
                      checked={interestType === 'I want to buy'} 
                      disabled={isLoading}
                      onChange={(e) => setInterestType(e.target.value)} 
                    />
                    <span>I want to buy</span>
                  </label>
                </div>

                {/* FILA 1: Nombre y Apellido (CORREGIDA LA CLASE A .invest-form-row-grid PARA DOS COLUMNAS) */}
                <div className="invest-form-row-grid">
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      First Name
                    </label>
                    <input type="text" className="wander-input" placeholder="John" required disabled={isLoading} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      Last Name
                    </label>
                    <input type="text" className="wander-input" placeholder="Doe" required disabled={isLoading} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>

                {/* FILA 2: Email y Teléfono (CORREGIDA LA CLASE A .invest-form-row-grid PARA DOS COLUMNAS) */}
                <div className="invest-form-row-grid">
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      Your Email
                    </label>
                    <input type="email" className="wander-input" placeholder="john@example.com" required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="wander-input-group">
                    <label className="wander-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 .81 2.7"></path></svg>
                      Phone Number
                    </label>
                    <input type="tel" className="wander-input" placeholder="+1 (987) 654 3210" disabled={isLoading} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  </div>
                </div>

                <div className="wander-input-group">
                  <label className="wander-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Your Message
                  </label>
                  <textarea className="wander-textarea" rows={5} placeholder="Message..." required disabled={isLoading} value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
                </div>

                <div className="wander-info-box">
                  <div className="info-box-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Privacy Notice & Terms
                  </div>
                  <ul className="info-box-list">
                    <li>• All the information provided in this form will be used exclusively for investment consultation purposes. We respect your privacy and will never share your information with third parties.</li>
                  </ul>
                </div>

                <button 
                  type="submit" 
                  className="btn-booking-primary override-btn-submit"
                  disabled={isLoading}
                  style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                  {isLoading ? "Sending Request..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
          
          <div className="split-stats">
            <div className="contact-info-block-wander-style">
              <span className="pre-title">Get in Touch</span>
              
              <div className="wander-contact-info-item">
                <div className="wander-contact-icon-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div className="wander-contact-text-node">
                  <span className="contact-node-title">Email</span>
                  <a href={`mailto:${process.env.NEXT_PUBLIC_COMPANY_EMAIL || ''}`} className="contact-node-value">{process.env.NEXT_PUBLIC_COMPANY_EMAIL || ''}</a>
                  <span className="contact-node-caption">We&apos;ll respond within 24 hours</span>
                </div>
              </div>

              <div className="wander-contact-info-item">
                <div className="wander-contact-icon-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 .81 2.7"></path></svg>
                </div>
                <div className="wander-contact-text-node">
                  <span className="contact-node-title">Phone</span>
                  <a href={`tel:${process.env.NEXT_PUBLIC_COMPANY_CALL || ''}`} className="contact-node-value">{process.env.NEXT_PUBLIC_COMPANY_PHONE || ''}</a>
                  <span className="contact-node-caption">Monday - Friday, 9AM - 6PM EST</span>
                </div>
              </div>

              <div className="wander-contact-info-item">
                <div className="wander-contact-icon-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div className="wander-contact-text-node">
                  <span className="contact-node-title">Office</span>
                  <span className="contact-node-value">{ process.env.NEXT_PUBLIC_COMPANY_ADDRESS || '' }</span>
                  <span className="contact-node-caption">Serving South Florida</span>
                </div>
              </div>

              <div className="wander-contact-info-item">
                <div className="wander-contact-icon-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div className="wander-contact-text-node">
                  <span className="contact-node-title">Schedule Consultation</span>
                  <span className="contact-node-value highlight-dark-node">Free 30-minute strategy call</span>
                  <span className="contact-node-caption">Book your appointment online</span>
                </div>
              </div>
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

      <StructuredData type="Organization" data={investPageStructuredData} />
    </main>
  );
}
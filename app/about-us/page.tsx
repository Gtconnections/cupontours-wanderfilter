"use client";
import React, { useState } from 'react';
import './about.css';
import Link from 'next/link';
import { sendAboutContactRequest } from '../lib/api'; // Importación desacoplada local

export default function AboutPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // Estado del campo Phone agregado
  const [message, setMessage] = useState('');

  // Estados de control para la solicitud local
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const stats = [
    { value: '100+ Luxury', label: 'Luxury Properties Managed' },
    { value: '65K+ Nights', label: 'Nights Booked' },
    { value: '98% Guest', label: 'Guest Satisfaction' },
    { value: '24/7 Dedicated', label: 'Dedicated Concierge' }
  ];

  const benefits = [
    {
      title: 'Personalized attention for each client\'s needs and preferences',
      desc: 'Our dedicated team ensures every detail is tailored to your specific requirements.'
    },
    {
      title: 'Expert staff and consultants for any and around consultation',
      desc: '24/7 expert support to help you plan and enjoy your perfect travel experience.'
    },
    {
      title: 'Best experience. Access to the best luxury travel destinations',
      desc: 'Exclusive access to premium locations and experiences around the world.'
    }
  ];

  const pillars = [
    {
      title: 'Quality is our main factor',
      desc: 'We never compromise on quality and ensure every aspect of your journey meets the highest standards of excellence.'
    },
    {
      title: 'Expertise from all destinations is truly deliver-that-take care',
      desc: 'Our team of experts has extensive knowledge of destinations worldwide, ensuring authentic and memorable experiences.'
    },
    {
      title: 'Personal care and attention to every details that might enhance our customer\'s experience',
      desc: 'We pay attention to every detail, from the moment you contact us until you return from your journey, ensuring a seamless experience.'
    }
  ];

  const coreValues = [
    { title: 'Customer Satisfaction', desc: 'Our priority is ensuring every customer has an exceptional experience' },
    { title: 'Trip Improvements', desc: 'Curated experiences that create lasting memories and adventures' },
    { title: 'Always the best travel', desc: 'We consistently deliver the highest quality travel experiences' }
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    const payload = { firstName, lastName, email, phoneNumber, message };

    try {
      const response = await sendAboutContactRequest(payload);
      setStatusMessage({
        type: 'success',
        text: response.message || "Your message has been sent successfully! Our team will contact you shortly."
      });
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setMessage('');
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: error.message || "Failed to deliver message. Please verify your connection."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="about-page">
      
      {/* 1. SECCIÓN HERO */}
      <section className="about-hero-section">
        <div className="about-hero-container">
          <div className="about-hero-text-side">
            <h1 className="about-main-heading">Cupon Tours - About Us</h1>
            <p className="about-hero-description">
              We are a team of passionate professionals dedicated to providing short-term rental management experiences for our hosts. With years of experience in luxury travel, we specialize in maximizing short term rental parameters for our owners.
            </p>
            <p className="about-hero-description">
              Our comprehensive approach balances deep dynamic data arrays, operational maintenance, and meticulous concierge hospitality layers to protect your real estate vectors.
            </p>
            
            {/* Badges de Contacto del Hero */}
            <div className="about-hero-badges-row">
              <div className="about-hero-badge-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
                <span>Trusted & Secure</span>
              </div>
              <div className="about-hero-badge-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path><circle cx="12" cy="8" r="6"></circle></svg>
                <span>Award Winning</span>
              </div>
              <div className="about-hero-badge-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"></path></svg>
                <span>Customer Loved</span>
              </div>
            </div>
          </div>

          <div className="about-hero-image-side">
            <div className="about-hero-image-box">
              <img src="https://res.cloudinary.com/gt-connections/image/upload/v1679366278/cupon-tours/invest-with-us-cupon-tours-summer-house_nba8ww.jpg" alt="Luxury Property View" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENEFITS OF STAYING WITH CUPON TOURS */}
      <section className="about-benefits-section bg-gray-light">
        <div className="about-benefits-container">
          <div className="about-benefits-image-block">
            <img src="https://res.cloudinary.com/gt-connections/image/upload/v1760238624/cupon-tours/cupon-tours-ultimate/cupon-tours-about-us-our-team_cee3cs.png" alt="Happy Partners" />
          </div>
          
          <div className="about-benefits-text-block">
            <h2>Benefits of staying with Cupon Tours</h2>
            <p className="benefits-intro-desc">We offer unique advantages and unmatched quality services that set us apart from the competition. Experience the difference with our premium offerings.</p>
            
            <div className="benefits-cards-vertical-stack">
              {benefits.map((item, i) => (
                <div key={i} className="benefit-minimal-card">
                  <div className="benefit-icon-bullet">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div className="benefit-card-content">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. THINGS WE BELIEVE SECTION */}
      <section className="about-pillars-section">
        <div className="about-pillars-container">
          <div className="about-pillars-text-side">
            <h2>Things we believe, that brings us users's absolute satisfaction</h2>
            
            <div className="pillars-text-stack">
              {pillars.map((item, i) => (
                <div key={i} className="pillar-text-node">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="about-pillars-image-side">
            <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80" alt="Meticulous Care Operations" />
          </div>
        </div>
      </section>

      {/* 4. LUXURY TRAVEL MADE AFFORDABLE (DARK BANNER) */}
      <section className="about-dark-banner">
        <div className="dark-banner-viewport">
          <h2>CuponTours - Luxury Travel Made Affordable</h2>
          <p>Our team of travel experts is available to provide you with personalized recommendations and assistance every step of the way. Contact us today and let us help you plan your next unforgettable adventure.</p>
          
          <div className="dark-banner-values-grid">
            {coreValues.map((item, i) => (
              <div key={i} className="dark-value-card-node">
                <div className="dark-value-icon-circle">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                </div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GUEST EXPERIENCES TESTIMONIAL */}
      <section className="about-testimonials-section bg-gray-light">
        <div className="testimonials-viewport-center">
          <span className="pre-title text-center-block">Our guests and travelers experiences</span>
          
          <div className="testimonial-editorial-card">
            <div className="star-rating-row">
              {"★".repeat(5)}
            </div>
            <p className="testimonial-quote-body">
              "CuponTours exceeded all my expectations. From the moment I contacted them until the end of my trip, everything was perfectly organized. The attention to detail and personal service made my vacation truly unforgettable."
            </p>
            <div className="testimonial-author-meta">
              <strong>Sarah Johnson</strong>
              <span>Frequent Traveler</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WORK WITH US: FORM & INFO SPLIT GRID */}
      <section className="about-contact-grid-block" id="about-contact-block">
        <div className="about-scoped-split-container">
          
          <div className="about-split-form-side">
            <div className="about-form-card-wrapper">
              <h3>Work with us</h3>
              <p>We are always available, from trip planning to concierge service, we are here to make your trip amazing.</p>
              
              <form onSubmit={handleContactSubmit} className="clean-form custom-wander-layout mt-4">
                
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

                {/* FILA 1: Nombre y Apellido con Iconos vectoriales */}
                <div className="about-form-row-paired">
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

                {/* FILA 2: Email y Teléfono (Organizados en dos columnas mediante la clase about-form-row-paired) */}
                <div className="about-form-row-paired">
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

                {/* FILA 3: Mensaje */}
                <div className="wander-input-group">
                  <label className="wander-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Your Message
                  </label>
                  <textarea className="wander-textarea" rows={4} placeholder="Message..." required disabled={isLoading} value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn-booking-primary override-btn-submit"
                  disabled={isLoading}
                  style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                  {isLoading ? "Sending Message..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>

          <div className="about-split-stats-side">
            <div className="about-get-in-touch-node">
              <span className="pre-title">Get in touch</span>
              
              <div className="about-touch-item">
                <div className="touch-icon-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div className="touch-text-node">
                  <h4>Email</h4>
                  <a href="mailto:info@cupontours.com">info@cupontours.com</a>
                </div>
              </div>

              <div className="about-touch-item">
                <div className="touch-icon-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 .81 2.7"></path></svg>
                </div>
                <div className="touch-text-node">
                  <h4>Phone</h4>
                  <a href="tel:+17866866582">+1 (786) 686-6582</a>
                </div>
              </div>
            </div>

            {/* Bloque de Métricas Inferiores */}
            <div className="about-editorial-metrics-grid">
              {stats.map((stat, i) => (
                <div key={i} className="about-metric-card-node">
                  <h3>{stat.value.split(' ')[0]}</h3>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 7. EXPERIENCIAL BANNER FINAL */}
      <section className="about-experiential-banner">
        <div className="experiential-banner-overlay"></div>
        <div className="experiential-banner-content">
          <h2>Experience luxury travel without breaking the bank with CuponTours. Book your next adventure with us today!</h2>
          <p>Ready to start your next unforgettable journey? Contact us now and let our travel experts create the perfect experience for you.</p>
          <Link className="btn-white-pill" href="/properties">Book Now</Link>
        </div>
      </section>

    </main>
  );
}
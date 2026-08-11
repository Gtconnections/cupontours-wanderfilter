"use client"; 

import Link from 'next/link';

export default function Footer() {
  const partnerships = [
    { name: 'Airbnb', logo: 'https://res.cloudinary.com/gt-connections/image/upload/v1701816605/cupon-tours/airbnb-boton_yzaxmu.webp' },
    { name: 'Vrbo', logo: 'https://res.cloudinary.com/gt-connections/image/upload/v1701816583/cupon-tours/vrbo-boton_m0z2jy.webp' },
    { name: 'Booking.com', logo: 'https://res.cloudinary.com/gt-connections/image/upload/v1701816596/cupon-tours/booking-boton_aptaaq.webp' },
    { name: 'Tripadvisor', logo: 'https://res.cloudinary.com/gt-connections/image/upload/v1701816592/cupon-tours/tripadvisor-boton_fbvsd0.webp' },
    { name: 'Turo', logo: 'https://res.cloudinary.com/gt-connections/image/upload/v1701816601/cupon-tours/turo-boton_zmtlqp.webp' },
    { name: 'BNB Flow', logo: 'https://res.cloudinary.com/gt-connections/image/upload/v1682401508/bnb-flow/bnb-flow-ai-logo-1_hsbti5.png' }, 
    { name: 'PriceLabs', logo: 'https://res.cloudinary.com/gt-connections/image/upload/v1760235869/cupon-tours/PriceLabsSquare_n8mtpj.png' } 
  ];

  return (
    <footer className="main-footer">
      
      {/* MARQUESINA DE SOCIOS */}
      <section className="platforms-marquee-section">
        <div className="marquee-wrapper">
          <span className="marquee-title">Platforms & Partnerships</span>
          <div className="marquee-row-cards">
            {partnerships.map((partner, index) => (
              <div key={index} className="partner-card-badge">
                <img 
                  src={partner.logo} 
                  alt={`${partner.name} Logo`}
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallbackSpan = e.target.nextSibling;
                    if (fallbackSpan) fallbackSpan.style.display = 'block';
                  }}
                />
                <span className="partner-fallback-text" style={{ display: 'none' }}>{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER TOP INTEGRADO */}
      <div className="footer-top">
        <span className="follow-text">Follow us @CuponTours</span>
        <div className="social-links">
          <a href={process.env.NEXT_PUBLIC_TWITTER_URL || 'https://x.com/cupontours'} target="_blank" rel="noopener noreferrer">X (Twitter)</a>
          <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/cupontours'} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com/cupontours'} target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </div>

      {/* FOOTER MAIN CON LA PRIMERA COLUMNA ACTUALIZADA */}
      <div className="footer-main">
        
        {/* COLUMNA 1: LOGO, DESCRIPCIÓN Y DATOS DE CONTACTO (image_4e4f4b.png) */}
        <div className="footer-logo-col custom-contact-col">
          <div className="footer-brand-logo">
            {/* Logotipo vectorizado textual simplificado imitando la captura */}
            <span className="brand-cupon">cupon</span><span className="brand-tours">tours</span>
          </div>
          <p className="footer-brand-desc">
            Discover amazing deals on luxury properties, cars, and yachts
          </p>
          
          <div className="footer-contact-info-list">
            <div className="contact-info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>{ process.env.NEXT_PUBLIC_COMPANY_ADDRESS || '' }</span>
            </div>
            <div className="contact-info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <a href={`tel:${process.env.NEXT_PUBLIC_COMPANY_CALL || ''}`}>
                {process.env.NEXT_PUBLIC_COMPANY_PHONE || ''}
              </a>
            </div>
            <div className="contact-info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <a href={`mailto:${process.env.NEXT_PUBLIC_COMPANY_EMAIL || ''}`}>
                {process.env.NEXT_PUBLIC_COMPANY_EMAIL || ''}
              </a>
            </div>
          </div>
        </div>
        
        {/* COLUMNAS COMPLEMENTARIAS */}
        <div className="footer-links-container">
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about-us">About Us</Link></li>
              <li><Link href="/properties">Properties</Link></li>
              <li><Link href="/cars">Cars</Link></li>
              <li><Link href="/yachts">Yachts</Link></li>
              <li><Link href="/work-with-us">Work with Us</Link></li>
              <li><Link href="/invest-with-us">Invest with Us</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Popular Destinations</h4>
            <ul>
              <li><Link href="/properties?city=Miami">Miami, Florida, USA</Link></li>
              <li><Link href="/properties?city=Hallandale">Hallandale, Florida, USA</Link></li>
              <li><Link href="/properties?city=Orlando">Orlando, Florida, USA</Link></li>
              <li><Link href="/properties?city=Atlanta">Atlanta, Georgia, USA</Link></li>
              <li><Link href="/properties?city=Cali">Cali, Colombia</Link></li>
              <li><Link href="/properties?city=Lago%20Calima">Lago Calima, Colombia</Link></li>
              <li><Link href="/properties?city=Valledupar">Valledupar, Colombia</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Operators</h4>
            <ul>
              <li><Link href="/login">Owner Dashboard <span className="new-badge">VIP</span></Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 <a href="https://www.cupontours.com" className='link-footer'>Cupontours LLC</a>. All rights reserved.®</p>
        <button className="btn-circle" aria-label="Copy Link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </button>
      </div>
    </footer>
  );
}
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-top">
        <span className="follow-text">Follow us @CuponTours</span>
        <div className="social-links">
          <Link href="#">X (Twitter)</Link>
          <Link href="#">Instagram</Link>
          <Link href="#">TikTok</Link>
          <Link href="#">LinkedIn</Link>
          <Link href="#">YouTube</Link>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-logo-col">
          {/* Icono de Globo Terráqueo SVG */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </div>
        
        <div className="footer-links-container">
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/home">Home</Link></li>
              <li><Link href="/about">About Us</Link></li>
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
              <li><Link href="#">Miami, Florida, USA</Link></li>
              <li><Link href="#">Hallandale, Florida, USA</Link></li>
              <li><Link href="#">Orlando, Florida, USA</Link></li>
              <li><Link href="#">Atlanta, Georgia, USA</Link></li>
              <li><Link href="#">Cali, Colombia</Link></li>
              <li><Link href="#">Lago Camila, Colombia</Link></li>
              <li><Link href="#">Valledupar, Colombia</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Operators</h4>
            <ul>
              <li><Link href="/login">Owner Dashboard <span className="new-badge">VIP</span></Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/policy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 GT Connections LLC. All rights reserved.®</p>
        <button className="btn-circle" aria-label="Copy Link">
          {/* Icono de Enlace SVG */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </button>
      </div>
    </footer>
  );
}
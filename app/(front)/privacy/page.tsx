import React from 'react';
import './privacy.css';

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <div className="privacy-container">
        
        {/* COLUMNA IZQUIERDA: MENÚ DE NAVEGACIÓN LEGAL STICKY */}
        <aside className="privacy-sidebar">
          <div className="sidebar-sticky">
            <h3>Privacy</h3>
            <nav className="legal-nav">
              <a href="#introduction" className="active">1. Introduction</a>
              <a href="#info-collect">2. Information We Collect</a>
              <a href="#how-use">3. How We Use Information</a>
              <a href="#sharing">4. Sharing & Disclosure</a>
              <a href="#data-security">5. Data Security</a>
              <a href="#user-rights">6. Your Privacy Rights</a>
              <a href="#cookies">7. Cookies & Tracking</a>
            </nav>
          </div>
        </aside>

        {/* COLUMNA DERECHA: TEXTO LEGAL EDITORIAL */}
        <section className="privacy-content">
          <span className="pre-title">Data Protection</span>
          <h1 className="massive-heading">Privacy Policy</h1>
          <p className="last-updated">Last updated: May 2026</p>

          <div className="legal-text-block" id="introduction">
            <h2>1. Introduction</h2>
            <p>
              At Cupontours, we respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy details how we collect, process, utilize, and safeguard your information across our website, mobile apps, and booking ecosystems.
            </p>
            <p>
              By accessing our platform or reserving any premium property, vehicle, or yacht charter, you acknowledge and agree to the data practice standards outlined in this document.
            </p>
          </div>

          <div className="legal-text-block" id="info-collect">
            <h2>2. Information We Collect</h2>
            <p>
              <strong>Personal Identifiers:</strong> We collect information necessary to establish luxury reservations, including your full name, email address, physical billing address, contact numbers, and official government identification profiles required for secure check-ins.
            </p>
            <p>
              <strong>Usage & Device Data:</strong> Our servers automatically track analytical records such as IP addresses, browser specifications, operating systems, platform interactions, and precise cookie-based navigation paths to enhance system speeds.
            </p>
          </div>

          <div className="legal-text-block" id="how-use">
            <h2>3. How We Use Your Information</h2>
            <p>
              We process your operational data exclusively to facilitate premium bookings, customize platform experiences, authenticate account access, issue financial transaction payouts, and coordinate logistics with hospitality management staff.
            </p>
            <p>
              Additionally, with your verified consent, we may utilize contact records to distribute tailored luxury lifestyle market updates and exclusive ecosystem opportunities.
            </p>
          </div>

          <div className="legal-text-block" id="sharing">
            <h2>4. Information Sharing and Disclosure</h2>
            <p>
              Cupontours does not sell, rent, or lease your private personal markers to external marketing syndicates. Data transfers are strictly isolated to verified service providers who assist our firm in executing payment gating, identity verification, property check-ins, or smart infrastructure distribution.
            </p>
            <p>
              We preserve the right to disclose records if mandated by international judicial decrees, local safety hazards, or regulatory compliance protocols.
            </p>
          </div>

          <div className="legal-text-block" id="data-security">
            <h2>5. Data Security Standards</h2>
            <p>
              We maintain advanced administrative, industrial, and digital security architecture designed to prevent unauthorized alteration, accidental loss, data breaches, or illegal exploitation of your database files.
            </p>
            <p>
              While we utilize top-tier encryption frameworks for high-profile client assets, no cloud storage method or web distribution model is entirely impenetrable.
            </p>
          </div>

          <div className="legal-text-block" id="user-rights">
            <h2>6. Your Privacy Rights</h2>
            <p>
              Depending on your local legal jurisdiction, you hold sovereign rights to request clear access to your gathered personal files, demand corrections to inaccurate records, restrict targeted tracking, or request the absolute deletion of your operational account profile.
            </p>
          </div>

          <div className="legal-text-block" id="cookies">
            <h2>7. Cookies and Tracking Technologies</h2>
            <p>
              Our platform implements clean cookie configurations and tracking pixels to store interface configurations, optimize browser load times, and analyze macro traffic patterns. You can manage or entirely block cookie storage variables via your native browser preference menus at any time.
            </p>
          </div>

        </section>

      </div>
    </main>
  );
}
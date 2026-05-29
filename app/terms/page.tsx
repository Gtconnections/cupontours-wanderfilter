import React from 'react';
import './terms.css';

export default function TermsPage() {
  return (
    <main className="terms-page">
      <div className="terms-container">
        
        {/* COLUMNA IZQUIERDA: MENÚ DE NAVEGACIÓN LEGAL STICKY */}
        <aside className="terms-sidebar">
          <div className="sidebar-sticky">
            <h3>Legal</h3>
            <nav className="legal-nav">
              <a href="#welcome" className="active">1. Welcome</a>
              <a href="#services">2. Short Term Rental</a>
              <a href="#user-accounts">3. User Accounts</a>
              <a href="#payments">4. Payouts & Fees</a>
              <a href="#cancellations">5. Cancellations & Refunds</a>
              <a href="#liability">6. Limits of Liability</a>
              <a href="#intellectual">7. Intellectual Property</a>
            </nav>
          </div>
        </aside>

        {/* COLUMNA DERECHA: TEXTO LEGAL EDITORIAL */}
        <section className="terms-content">
          <span className="pre-title">Legal Framework</span>
          <h1 className="massive-heading">Terms and Conditions</h1>
          <p className="last-updated">Last updated: May 2026</p>

          <div className="legal-text-block" id="welcome">
            <h2>1. Welcome to Cupontours</h2>
            <p>
              Welcome to Cupontours. These Terms and Conditions govern your use of our platform, services, property management tools, and reservation ecosystem. By accessing our website, creating an account, or listing a property, you agree to comply with and be bound by the comprehensive framework detailed below.
            </p>
            <p>
              Our platform offers integrated luxury solutions combining premium short-term property management, exotic car rentals, and elite yacht charters. Your access to these individual verticals is strictly subject to these global operational standards.
            </p>
          </div>

          <div className="legal-text-block" id="services">
            <h2>2. Short Term Rental & Management</h2>
            <p>
              Our Short-Term Property Management firm operates dedicated solutions on behalf of vacation rental owners to enhance guest satisfaction and maximize revenue at every step of the way. Owners who list their assets authorize Cupontours to execute dynamic pricing, manage global marketplace distribution, handle 24/7 guest communication, and coordinate meticulous hospitality care.
            </p>
            <p>
              Guests booking through our ecosystem agree to adhere to house rules, check-out protocols, occupancy limitations, and strict behavioral standards specified at the time of reservation.
            </p>
          </div>

          <div className="legal-text-block" id="user-accounts">
            <h2>3. User Accounts & Registration</h2>
            <p>
              To access certain advanced components of our platform—including real-time owner financial dashboards or fast guest checkout portals—you must create a secure user profile. You are entirely responsible for protecting your account credentials and maintaining valid authentication records.
            </p>
            <p>
              Cupontours reserves the right to suspend, terminate, or restrict user access at any time if any fraudulent behavior, policy breach, or unauthorized asset distribution is identified.
            </p>
          </div>

          <div className="legal-text-block" id="payments">
            <h2>4. Payouts, Fees, and Smart Pricing</h2>
            <p>
              All property financial transactions, dynamic pricing changes, and vehicle or vessel booking payments are securely processed through our integrated institutional gates. Property owners receive transparent payouts net of management fees according to verified cycles displayed in their dynamic dashboard.
            </p>
            <p>
              Local taxes, tourist registration fees, and cleaning deposit requirements vary depending on seasonal fluctuations, daily market rates, and specific state legislations.
            </p>
          </div>

          <div className="legal-text-block" id="cancellations">
            <h2>5. Cancellations, Modifications & Refund Policy</h2>
            <p>
              Cancellation rules apply strictly based on the tier of service selected. Guest cancellations made within the protected grace period qualify for fractional refunds, while sudden property unavailability caused by operational emergencies triggers alternative luxury placement or comprehensive compensation options.
            </p>
          </div>

          <div className="legal-text-block" id="liability">
            <h2>6. Limits of Liability</h2>
            <p>
              Cupontours provides its digital solutions and marketplace services on an "as-is" and "as-available" basis. We do not assume direct liability for unforeseen structural accidents, local power failures, guest personal injury during external activities, or asset wear-and-tear inside managed real estate properties beyond standard maintenance guarantees.
            </p>
          </div>

          <div className="legal-text-block" id="intellectual">
            <h2>7. Intellectual Property</h2>
            <p>
              All software infrastructure, design elements, structural code, visual media, photographic content, logos, and written copy published across our platform remain the exclusive property of Cupontours LLC. Unauthorized duplication, modification, data scraping, or syndication without written consent is strictly prohibited and subject to legal action.
            </p>
          </div>

        </section>

      </div>
    </main>
  );
}
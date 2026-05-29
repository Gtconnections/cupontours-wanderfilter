import React from 'react';
import './contact.css';

export default function ContactPage() {
  const contactMethods = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M2 4l10 8 10-8"></path>
        </svg>
      ),
      title: 'Email us:',
      desc: 'Email us for general queries, including marketing and partnership opportunities.',
      action: 'info@cupontours.com',
      isLink: true
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      ),
      title: 'Call us:',
      desc: 'Call us to speak to a member of our team. We are always happy to help.',
      action: '+1 (786) 686-6582',
      isLink: false
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
        </svg>
      ),
      title: 'Support',
      desc: 'Email us for general queries, including marketing and partnership opportunities.',
      action: 'Support Center',
      isLink: true
    }
  ];

  const platforms = [
    'Airbnb', 'Vrbo', 'Booking.com', 'Tripadvisor', 'Turo', 'BNB FLOW', 'PriceLabs'
  ];

  return (
    <main className="contact-page">
      
      {/* 1. HERO & FORM SPLIT */}
      <section className="contact-split-section">
        <div className="split-container">
          
          <div className="split-text-side">
            <span className="pre-title">Get in touch</span>
            <h1 className="massive-heading">Thank you for<br />visiting our website.</h1>
            <p className="contact-subtitle">We appreciate your interest in our services and products. If you have any questions, please fill out the form and our team will get back to you shortly.</p>
          </div>
          
          <div className="split-form-side">
            <div className="contact-form-card">
              <form className="clean-form">
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
                    <label>Your Email</label>
                    <input type="email" placeholder="john.doe@example.com" />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
                <div className="input-group">
                  <label>Your Message</label>
                  <textarea rows={5} placeholder="Write your message here..."></textarea>
                </div>
                
                <div className="privacy-notice">
                  <strong>Privacy Notice:</strong> Your personal information will be used solely to respond to your inquiry. We respect your privacy and will never share your information with third parties. Our team typically responds within 24 hours during business days.
                </div>
                
                <button type="button" className="btn-black-full">Send Message</button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CONTACT METHODS GRID */}
      <section className="contact-methods-section">
        <div className="methods-grid">
          {contactMethods.map((method, i) => (
            <div key={i} className="method-card">
              <div className="method-icon">{method.icon}</div>
              <h3>{method.title}</h3>
              <p>{method.desc}</p>
              {method.isLink ? (
                <a href="#" className="method-action-link">{method.action}</a>
              ) : (
                <span className="method-action-text">{method.action}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. PLATFORMS SECTION (Reutilizado visualmente, pero con CSS local para esta página) */}
      <section className="platforms-section bg-gray-light">
        <div className="section-header-center">
          <h2>Platforms where you can find us and we use to manage our properties</h2>
        </div>
        <div className="logos-flex">
          {platforms.map((platform, i) => (
            <div key={i} className="platform-logo-item">{platform}</div>
          ))}
        </div>
      </section>

    </main>
  );
}
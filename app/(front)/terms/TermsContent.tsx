import React from 'react';
import './terms.css';
import { getTerms, type Locale } from '@/app/i18n/dictionaries';

export default function TermsContent({ locale = 'en' }: { locale?: Locale }) {
  const t = getTerms(locale);
  return (
    <main className="terms-page">
      <div className="terms-container">

        {/* COLUMNA IZQUIERDA: MENÚ DE NAVEGACIÓN LEGAL STICKY */}
        <aside className="terms-sidebar">
          <div className="sidebar-sticky">
            <h3>{t.navTitle}</h3>
            <nav className="legal-nav">
              <a href="#welcome" className="active">{t.n1}</a>
              <a href="#services">{t.n2}</a>
              <a href="#user-accounts">{t.n3}</a>
              <a href="#payments">{t.n4}</a>
              <a href="#cancellations">{t.n5}</a>
              <a href="#liability">{t.n6}</a>
              <a href="#intellectual">{t.n7}</a>
            </nav>
          </div>
        </aside>

        {/* COLUMNA DERECHA: TEXTO LEGAL EDITORIAL */}
        <section className="terms-content">
          <span className="pre-title">{t.pre}</span>
          <h1 className="massive-heading">{t.h1}</h1>
          <p className="last-updated">{t.updated}</p>

          <div className="legal-text-block" id="welcome">
            <h2>{t.s1h}</h2>
            <p>{t.s1p1}</p>
            <p>{t.s1p2}</p>
          </div>

          <div className="legal-text-block" id="services">
            <h2>{t.s2h}</h2>
            <p>{t.s2p1}</p>
            <p>{t.s2p2}</p>
          </div>

          <div className="legal-text-block" id="user-accounts">
            <h2>{t.s3h}</h2>
            <p>{t.s3p1}</p>
            <p>{t.s3p2}</p>
          </div>

          <div className="legal-text-block" id="payments">
            <h2>{t.s4h}</h2>
            <p>{t.s4p1}</p>
            <p>{t.s4p2}</p>
          </div>

          <div className="legal-text-block" id="cancellations">
            <h2>{t.s5h}</h2>
            <p>{t.s5p1}</p>
          </div>

          <div className="legal-text-block" id="liability">
            <h2>{t.s6h}</h2>
            <p>{t.s6p1}</p>
          </div>

          <div className="legal-text-block" id="intellectual">
            <h2>{t.s7h}</h2>
            <p>{t.s7p1}</p>
          </div>

        </section>

      </div>
    </main>
  );
}

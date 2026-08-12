import React from 'react';
import './privacy.css';
import { getPrivacy, type Locale } from '@/app/i18n/dictionaries';

export default function PrivacyContent({ locale = 'en' }: { locale?: Locale }) {
  const t = getPrivacy(locale);
  return (
    <main className="privacy-page">
      <div className="privacy-container">

        {/* COLUMNA IZQUIERDA: MENÚ DE NAVEGACIÓN LEGAL STICKY */}
        <aside className="privacy-sidebar">
          <div className="sidebar-sticky">
            <h3>{t.navTitle}</h3>
            <nav className="legal-nav">
              <a href="#introduction" className="active">{t.n1}</a>
              <a href="#info-collect">{t.n2}</a>
              <a href="#how-use">{t.n3}</a>
              <a href="#sharing">{t.n4}</a>
              <a href="#data-security">{t.n5}</a>
              <a href="#user-rights">{t.n6}</a>
              <a href="#cookies">{t.n7}</a>
            </nav>
          </div>
        </aside>

        {/* COLUMNA DERECHA: TEXTO LEGAL EDITORIAL */}
        <section className="privacy-content">
          <span className="pre-title">{t.pre}</span>
          <h1 className="massive-heading">{t.h1}</h1>
          <p className="last-updated">{t.updated}</p>

          <div className="legal-text-block" id="introduction">
            <h2>{t.s1h}</h2>
            <p>{t.s1p1}</p>
            <p>{t.s1p2}</p>
          </div>

          <div className="legal-text-block" id="info-collect">
            <h2>{t.s2h}</h2>
            <p><strong>{t.s2sA}</strong> {t.s2a}</p>
            <p><strong>{t.s2sB}</strong> {t.s2b}</p>
          </div>

          <div className="legal-text-block" id="how-use">
            <h2>{t.s3h}</h2>
            <p>{t.s3p1}</p>
            <p>{t.s3p2}</p>
          </div>

          <div className="legal-text-block" id="sharing">
            <h2>{t.s4h}</h2>
            <p>{t.s4p1}</p>
            <p>{t.s4p2}</p>
          </div>

          <div className="legal-text-block" id="data-security">
            <h2>{t.s5h}</h2>
            <p>{t.s5p1}</p>
            <p>{t.s5p2}</p>
          </div>

          <div className="legal-text-block" id="user-rights">
            <h2>{t.s6h}</h2>
            <p>{t.s6p1}</p>
          </div>

          <div className="legal-text-block" id="cookies">
            <h2>{t.s7h}</h2>
            <p>{t.s7p1}</p>
          </div>

        </section>

      </div>
    </main>
  );
}

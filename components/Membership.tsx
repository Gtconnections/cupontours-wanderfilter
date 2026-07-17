"use client";

import './Membership.css';

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function StarTierIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );
}

function CrownTierIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18h18l-1.4-9.2-4.6 4-3-6.8-3 6.8-4.6-4L3 18z"></path>
      <line x1="5" y1="21" x2="19" y2="21"></line>
    </svg>
  );
}

function BriefcaseTierIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  );
}

export default function Membership() {
  return (
    <section className="membership-section">
      <div className="membership-glow"></div>
      <div className="membership-container">
        <div className="membership-header">
          <span className="membership-pretitle">Membresías</span>
          <h2 className="membership-title">Únete <span>al Club.</span></h2>
          <span className="membership-header-divider"></span>
          <p className="membership-subtitle">
            Disfrute de los beneficios de formar parte del primer club en Miami que le ofrece una variedad de beneficios en restaurantes exclusivos, spa, compras, eventos y mucho más.
          </p>
        </div>

        <div className="membership-grid">
          {/* ELITE CARD */}
          <div className="membership-card">
            <div className="card-tier-row">
              <span className="tier-icon"><StarTierIcon /></span>
              <h3 className="card-tier">Elite</h3>
            </div>
            <div className="card-price">$95<span>/ MENSUAL</span></div>
            <span className="card-tier-divider"></span>
            <ul className="card-benefits">
              <li><CheckIcon /> Acceso completo a todos los servicios del club y partners exclusivos con 15% de descuento</li>
              <li><CheckIcon /> Servicios y cuidado personal</li>
              <li><CheckIcon /> Spa y salón a domicilio</li>
              <li><CheckIcon /> Reservas en restaurantes</li>
              <li><CheckIcon /> Planificación y reservas de eventos</li>
              <li><CheckIcon /> Vida nocturna VIP y arreglos a medida</li>
              <li><CheckIcon /> Inyección mensual gratuita de B12 IV</li>
              <li><CheckIcon /> Acceso a las instalaciones del club e invitaciones a eventos privados de networking</li>
            </ul>
            <button className="btn-membership">Solicitar Información</button>
          </div>

          {/* PLATINUM CARD (HIGHLIGHTED) */}
          <div className="membership-card highlight">
            <div className="membership-badge">Más Completo</div>
            <div className="card-tier-row">
              <span className="tier-icon"><CrownTierIcon /></span>
              <h3 className="card-tier">Platinum</h3>
            </div>
            <div className="card-price">$300<span>/ MENSUAL</span></div>
            <span className="card-tier-divider"></span>
            <ul className="card-benefits">
              <li><CheckIcon /> Acceso completo a todos los servicios y partners con 20% de descuento</li>
              <li><CheckIcon /> Servicio completo de inspección residencial</li>
              <li><CheckIcon /> Transporte privado</li>
              <li><CheckIcon /> Servicios y cuidado personal</li>
              <li><CheckIcon /> Housekeeping y servicios a domicilio</li>
              <li><CheckIcon /> Reservas en restaurantes</li>
              <li><CheckIcon /> Viajes y arreglos privados</li>
              <li><CheckIcon /> Experiencia de chef privado y dining</li>
              <li><CheckIcon /> Spa y salón a domicilio</li>
              <li><CheckIcon /> Planificación y reservas de eventos</li>
              <li><CheckIcon /> Inyección mensual gratuita de B12 IV</li>
            </ul>
            <button className="btn-membership">Solicitar Información</button>
          </div>

          {/* CORPORATE CARD */}
          <div className="membership-card">
            <div className="card-tier-row">
              <span className="tier-icon"><BriefcaseTierIcon /></span>
              <h3 className="card-tier">Corporate</h3>
            </div>
            <div className="card-price">$200<span>/ MENSUAL</span></div>
            <span className="card-tier-divider"></span>
            <ul className="card-benefits">
              <li><CheckIcon /> Acceso completo a todos los servicios y partners exclusivos con 15% de descuento</li>
              <li><CheckIcon /> Búsqueda de propiedades corporativas o ejecutivas</li>
              <li><CheckIcon /> Chef privado y catering gourmet para eventos privados</li>
              <li><CheckIcon /> Producción de eventos corporativos, lanzamientos y after-office</li>
              <li><CheckIcon /> Logística para delegaciones o clientes VIP</li>
              <li><CheckIcon /> Transporte privado con chofer</li>
              <li><CheckIcon /> Reserva de jets privados y helicópteros</li>
              <li><CheckIcon /> Reservas ejecutivas y coordinación de viajes VIP</li>
              <li><CheckIcon /> Alquiler de coches premium</li>
            </ul>
            <button className="btn-membership">Solicitar Información</button>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState, useEffect, use } from 'react';
import './verify-member-detail.css';
import { getMembershipVerification, MembershipVerification } from '@/app/lib/api/membership';

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

function tierIcon(membresia?: string) {
  switch ((membresia || '').toLowerCase()) {
    case 'platinum':
      return <CrownTierIcon />;
    case 'corporate':
      return <BriefcaseTierIcon />;
    default:
      return <StarTierIcon />;
  }
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  activa: { label: 'Active Member', className: 'status-active' },
  vencida: { label: 'Expired', className: 'status-expired' },
  cancelada: { label: 'Cancelled', className: 'status-cancelled' },
};

export default function VerifyMemberPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = use(params);

  const [result, setResult] = useState<MembershipVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVerification() {
      try {
        setIsLoading(true);
        const data = await getMembershipVerification(hash);
        setResult(data);
      } finally {
        setIsLoading(false);
      }
    }

    if (hash) fetchVerification();
  }, [hash]);

  if (isLoading) {
    return (
      <main className="verify-page">
        <div className="verify-card verify-skeleton"></div>
      </main>
    );
  }

  if (!result || !result.valid) {
    return (
      <main className="verify-page">
        <div className="verify-card verify-card-error">
          <span className="verify-pretitle">Cupon Tours</span>
          <div className="verify-status-badge status-cancelled">Not Found</div>
          <p className="verify-error-text">This membership could not be verified.</p>
        </div>
      </main>
    );
  }

  const status = STATUS_CONFIG[result.estado || 'cancelada'] || STATUS_CONFIG.cancelada;

  return (
    <main className="verify-page">
      <div className="verify-card">
        <span className="verify-pretitle">Cupon Tours</span>

        <div className="verify-tier-row">
          <span className="verify-tier-icon">{tierIcon(result.membresia)}</span>
          <h1 className="verify-tier-name">{result.membresia}</h1>
        </div>

        <div className={`verify-status-badge ${status.className}`}>{status.label}</div>

        <span className="verify-divider"></span>

        <div className="verify-field">
          <span className="verify-field-label">Member</span>
          <span className="verify-field-value">{result.cliente_nombre}</span>
        </div>
        <div className="verify-field">
          <span className="verify-field-label">Start Date</span>
          <span className="verify-field-value">{result.fecha_inicio}</span>
        </div>
        <div className="verify-field">
          <span className="verify-field-label">Valid Until</span>
          <span className="verify-field-value">{result.fecha_fin || 'No expiration'}</span>
        </div>

        <p className="verify-footer-note">Present this screen to redeem membership benefits.</p>
      </div>
    </main>
  );
}

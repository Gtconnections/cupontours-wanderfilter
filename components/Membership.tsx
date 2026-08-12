"use client";

import { useState, useEffect } from 'react';
import './Membership.css';
import { getMembresias, MembershipPlan } from '@/app/lib/api/membership';
import { usePathname } from 'next/navigation';
import { getMembership } from '@/app/i18n/dictionaries';
import { localeFromPath } from '@/app/i18n/locale';

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

function tierIcon(name: string) {
  switch (name.toLowerCase()) {
    case 'platinum':
      return <CrownTierIcon />;
    case 'corporate':
      return <BriefcaseTierIcon />;
    default:
      return <StarTierIcon />;
  }
}

export default function Membership() {
  const pathname = usePathname();
  const t = getMembership(localeFromPath(pathname));
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        setIsLoading(true);
        const data = await getMembresias();
        setPlans(data);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlans();
  }, []);

  if (!isLoading && plans.length === 0) {
    return null;
  }

  return (
    <section className="membership-section">
      <div className="membership-glow"></div>
      <div className="membership-container">
        <div className="membership-header">
          <span className="membership-pretitle">{t.pretitle}</span>
          <h2 className="membership-title">{t.titleA}<span>{t.titleAccent}</span></h2>
          <span className="membership-header-divider"></span>
          <p className="membership-subtitle">
            {t.subtitle}
          </p>
        </div>

        <div className="membership-grid">
          {isLoading ? (
            <>
              <div className="membership-card membership-skeleton"></div>
              <div className="membership-card membership-skeleton"></div>
              <div className="membership-card membership-skeleton"></div>
            </>
          ) : (
            plans.map((plan) => {
              const isFeatured = Number(plan.featured) === 1;
              return (
                <div key={plan.id} className={`membership-card${isFeatured ? ' highlight' : ''}`}>
                  {isFeatured && <div className="membership-badge">{t.badge}</div>}
                  <div className="card-tier-row">
                    <span className="tier-icon">{tierIcon(plan.name)}</span>
                    <h3 className="card-tier">{plan.name}</h3>
                  </div>
                  <div className="card-price">
                    ${parseFloat(plan.price).toFixed(0)}
                    <span>/ {plan.period.toUpperCase()}</span>
                  </div>
                  <span className="card-tier-divider"></span>
                  <ul className="card-benefits">
                    {plan.benefits.map((benefit, idx) => (
                      <li key={idx}><CheckIcon /> {benefit}</li>
                    ))}
                  </ul>
                  <a
                    href={`https://wa.me/17866566582?text=${encodeURIComponent(`${t.wa1}${plan.name}${t.wa2}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-membership"
                  >
                    {t.requestInfo}
                  </a>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getListingsNamesAndIds } from '@/app/lib/api/propertiesAdmin';
import { getCompetitiveSet, CompetitiveSetResponse } from '@/app/lib/api/market';
import '../market.css';

const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

interface ListingOption { id: number; name: string; }

export default function CompetitiveSetPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  const [listings, setListings] = useState<ListingOption[]>([]);
  const [selected, setSelected] = useState<number | ''>('');
  const [data, setData] = useState<CompetitiveSetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    try {
      const data = await getListingsNamesAndIds();
      setListings(data as ListingOption[]);
      if (Array.isArray(data) && data.length && selected === '') setSelected((data[0] as ListingOption).id);
    } catch { /* noop */ }
  }, [selected]);

  useEffect(() => {
    if (isChecking) return;
    if (!checkAuth()) { router.push('/login'); return; }
    loadListings();
  }, [isChecking, checkAuth, router, loadListings]);

  useEffect(() => {
    if (selected === '' || !token) return;
    setLoading(true); setError(null);
    getCompetitiveSet(Number(selected))
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, [selected, token]);

  if (isChecking) return <div className="mk-container"><div className="mk-loading">Cargando…</div></div>;

  const you = data?.you;

  return (
    <div className="mk-container">
      <header className="mk-header">
        <span className="mk-breadcrumb">Revenue / Competitive Set</span>
        <h2>Competitive Set</h2>
        <p className="mk-subtitle">Compara tu propiedad contra la competencia. Tu lado es real; los comps llegan de PriceLabs.</p>
      </header>

      <div className="mk-toolbar">
        <select className="mk-select" value={selected} onChange={e => setSelected(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Selecciona una propiedad…</option>
          {listings.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      {loading && <div className="mk-loading">Cargando métricas…</div>}
      {error && <div className="mk-empty">⚠️ {error}</div>}

      {you && !loading && (
        <>
          <div className="mk-kpis">
            <div className="mk-kpi"><div className="mk-kpi-label">Tu ADR</div><div className="mk-kpi-value">{money(you.adr)}</div><div className="mk-kpi-sub">últimos 90 días</div></div>
            <div className="mk-kpi"><div className="mk-kpi-label">Tu ocupación</div><div className="mk-kpi-value">{you.occupancy}<span className="unit">%</span></div><div className="mk-kpi-sub">últimos 90 días</div></div>
            <div className="mk-kpi"><div className="mk-kpi-label">Tu RevPAR</div><div className="mk-kpi-value">{money(you.revpar)}</div><div className="mk-kpi-sub">por noche disponible</div></div>
            <div className="mk-kpi"><div className="mk-kpi-label">Pacing 30d</div><div className="mk-kpi-value">{you.forward_pacing}<span className="unit">%</span></div><div className="mk-kpi-sub">reservas próximas</div></div>
          </div>

          <div className="mk-card">
            <h3 className="mk-card-title">Tú vs. mercado</h3>
            <p className="mk-card-desc">La comparación relativa (rank, ADR vs comps, ocupación vs comps) se calcula al conectar PriceLabs.</p>
            <div className="mk-pending">
              <span className="mk-pending-badge">Pendiente · PriceLabs</span>
              <h4>Benchmark de competencia</h4>
              <p>{data?.market?.comp_set?.message || 'Conecta PriceLabs para traer el comp set: rank relativo, ADR y ocupación vs. competidores, rating, y calendario comparativo.'}</p>
            </div>
          </div>

          <div className="mk-card">
            <h3 className="mk-card-title">Competidores</h3>
            <p className="mk-card-desc">Tabla de propiedades competidoras (similitud, distancia, ADR, ocupación, rating, reviews).</p>
            <div className="mk-empty">Sin comp set aún — se llena desde PriceLabs.</div>
          </div>
        </>
      )}
    </div>
  );
}

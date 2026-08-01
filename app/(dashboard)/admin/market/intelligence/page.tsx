'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getMarketIntelligence, MarketIntelligenceResponse } from '@/app/lib/api/market';
import PropertyMap from '../PropertyMap';
import '../market.css';

const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);
const PAGE_SIZE = 10;

function Pending({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mk-pending">
      <span className="mk-pending-badge">Pendiente · PriceLabs</span>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );
}

export default function MarketIntelligencePage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  const [data, setData] = useState<MarketIntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    if (!isAuthenticated || !token) { router.push('/login'); return; }
    setLoading(true); setError(null);
    try { setData(await getMarketIntelligence()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar'); }
    finally { setLoading(false); }
  }, [isAuthenticated, token, router]);

  useEffect(() => {
    if (isChecking) return;
    if (!checkAuth()) { router.push('/login'); return; }
    load();
  }, [isChecking, checkAuth, load, router]);

  const allListings = useMemo(() => data?.portfolio?.listings ?? [], [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allListings;
    return allListings.filter(l =>
      (l.name || '').toLowerCase().includes(q) || (l.city || '').toLowerCase().includes(q)
    );
  }, [allListings, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search]);

  if (isChecking || loading) return <div className="mk-container"><div className="mk-loading">Cargando inteligencia de mercado…</div></div>;
  if (error) return <div className="mk-container"><div className="mk-empty">⚠️ {error}</div></div>;

  const p = data?.portfolio;

  return (
    <div className="mk-container">
      <header className="mk-header">
        <span className="mk-breadcrumb">Revenue / Market Intelligence</span>
        <h2>Market Intelligence</h2>
        <p className="mk-subtitle">Tu portafolio con datos reales. El mercado se conecta vía PriceLabs.</p>
      </header>

      <div className="mk-kpis">
        <div className="mk-kpi"><div className="mk-kpi-label">Propiedades</div><div className="mk-kpi-value">{p?.count ?? 0}</div><div className="mk-kpi-sub">sincronizadas</div></div>
        <div className="mk-kpi"><div className="mk-kpi-label">ADR promedio</div><div className="mk-kpi-value">{money(p?.avg_adr ?? 0)}</div><div className="mk-kpi-sub">últimos 90 días</div></div>
        <div className="mk-kpi"><div className="mk-kpi-label">Ocupación promedio</div><div className="mk-kpi-value">{p?.avg_occupancy ?? 0}<span className="unit">%</span></div><div className="mk-kpi-sub">últimos 90 días</div></div>
        <div className="mk-kpi"><div className="mk-kpi-label">RevPAR promedio</div><div className="mk-kpi-value">{money(p?.avg_revpar ?? 0)}</div><div className="mk-kpi-sub">por noche disponible</div></div>
        <div className="mk-kpi"><div className="mk-kpi-label">Revenue total</div><div className="mk-kpi-value">{money(p?.total_revenue ?? 0)}</div><div className="mk-kpi-sub">últimos 90 días</div></div>
      </div>

      <div className="mk-card">
        <h3 className="mk-card-title">Mapa de propiedades</h3>
        <p className="mk-card-desc">Tus propiedades en el mapa, coloreadas por ocupación (últimos 90 días). El sombreado de barrios por datos de mercado se activa con PriceLabs.</p>
        <PropertyMap listings={allListings} />
      </div>

      <div className="mk-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h3 className="mk-card-title">Tu portafolio</h3>
            <p className="mk-card-desc">Métricas propias calculadas desde tus reservas confirmadas.</p>
          </div>
          <input
            className="mk-select"
            style={{ minWidth: '220px' }}
            type="text"
            placeholder="Buscar por nombre o ciudad…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="mk-table">
            <thead><tr>
              <th>Propiedad</th><th>Ciudad</th><th>ADR</th><th>Ocupación</th><th>RevPAR</th><th>Revenue 90d</th><th>Pacing 30d</th><th>Precio base</th>
            </tr></thead>
            <tbody>
              {pageRows.map(l => (
                <tr key={l.listing_id}>
                  <td>{l.name}</td>
                  <td>{l.city || '—'}</td>
                  <td className="mk-num">{money(l.adr)}</td>
                  <td className="mk-num">{l.occupancy}%</td>
                  <td className="mk-num">{money(l.revpar)}</td>
                  <td className="mk-num">{money(l.revenue)}</td>
                  <td className="mk-num">{l.forward_pacing}%</td>
                  <td className="mk-num">{l.base_price != null ? money(l.base_price) : '—'}</td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr><td colSpan={8} className="mk-empty">{search ? 'Sin resultados para tu búsqueda.' : 'Sin datos aún. Sincroniza propiedades y reservas.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#8a8a8a' }}>
              Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="mk-select" style={{ minWidth: 'auto', padding: '8px 12px', cursor: 'pointer' }}
                onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>‹ Anterior</button>
              <span style={{ fontSize: '12px', color: '#8a8a8a' }}>Página {currentPage} de {totalPages}</span>
              <button className="mk-select" style={{ minWidth: 'auto', padding: '8px 12px', cursor: 'pointer' }}
                onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>Siguiente ›</button>
            </div>
          </div>
        )}
      </div>

      <div className="mk-card">
        <h3 className="mk-card-title">Inteligencia de mercado</h3>
        <p className="mk-card-desc">Datos del mercado y la competencia — se activan al conectar PriceLabs.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '16px' }}>
          <Pending title="Score de mercado / barrios" desc="Mapa interactivo con score de potencial, ocupación y ADR estimados por zona (Leaflet + datos de PriceLabs)." />
          <Pending title="ADR y ocupación de mercado" desc="Tarifa promedio y ocupación del mercado en tus zonas, para comparar contra tu portafolio." />
          <Pending title="Eventos locales" desc="Eventos que mueven la demanda (conciertos, ferias, temporadas) para ajustar precios." />
          <Pending title="Forecast 30 / 60 / 90" desc="Proyección de demanda y revenue del mercado a 30/60/90 días." />
        </div>
      </div>
    </div>
  );
}

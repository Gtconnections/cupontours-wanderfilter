'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getClaims, Claim, ClaimStatus } from '@/app/lib/api/claims';
import './claims.css';

const PAGE_SIZE = 8;

const STATUS_TABS: { value: '' | ClaimStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'started', label: 'Started' },
  { value: 'in process', label: 'In Process' },
  { value: 'finished', label: 'Finished' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_CLASS: Record<ClaimStatus, string> = {
  started: 'claims-badge claims-badge--started',
  'in process': 'claims-badge claims-badge--process',
  finished: 'claims-badge claims-badge--finished',
  rejected: 'claims-badge claims-badge--rejected',
};

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
);
const IconComment = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
const IconEmpty = () => (
  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
);
const IconAlert = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);
const IconChevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points={dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} /></svg>
);

export default function ClaimsPage() {
  const router = useRouter();
  const { isChecking, checkAuth } = useAuth();

  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | ClaimStatus>('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadClaims = useCallback(async () => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getClaims(1);
      setClaims(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los reclamos');
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth, router]);

  useEffect(() => {
    if (isChecking) return;
    loadClaims();
  }, [isChecking, loadClaims]);

  // Filtrado (búsqueda + estado)
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return claims.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (!term) return true;
      const subject = c.listing?.name || (c.car_id ? `car #${c.car_id}` : '');
      return (
        (c.code || '').toLowerCase().includes(term) ||
        (c.name || '').toLowerCase().includes(term) ||
        (c.description || '').toLowerCase().includes(term) ||
        subject.toLowerCase().includes(term)
      );
    });
  }, [claims, searchTerm, statusFilter]);

  // Reiniciar a la página 1 cuando cambian filtros o el dataset
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, claims]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const formatDate = (value: string) => {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const subjectOf = (c: Claim) => {
    if (c.listing?.name) return { main: c.listing.name, sub: 'Property' };
    if (c.car_id) return { main: `Car #${c.car_id}`, sub: 'Vehicle' };
    return { main: '—', sub: '' };
  };

  return (
    <div className="claims-container">
      <header className="claims-header">
        <div>
          <span className="claims-breadcrumb">Dashboard / Claims</span>
          <h2>Claims</h2>
          <p className="claims-subtitle">
            {isLoading ? 'Cargando reclamos...' : `${filtered.length} reclamo${filtered.length === 1 ? '' : 's'}`}
            {!isLoading && statusFilter ? ` · ${statusFilter}` : ''}
          </p>
        </div>
        <button className="claims-btn-secondary" onClick={loadClaims} disabled={isLoading}>
          <IconRefresh />
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </header>

      <div className="claims-toolbar">
        <div className="claims-search-box">
          <IconSearch />
          <input
            type="text"
            className="claims-search-input"
            placeholder="Buscar por código, nombre, propiedad o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="claims-filters">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value || 'all'}
              className={`claims-pill ${statusFilter === tab.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="claims-state claims-state--error">
          <h3><IconAlert /> No se pudieron cargar los reclamos</h3>
          <p>{error}</p>
          <button className="claims-btn-secondary" onClick={loadClaims} style={{ marginTop: '8px' }}>
            <IconRefresh /> Reintentar
          </button>
        </div>
      ) : isLoading ? (
        <div className="claims-state">
          <div className="claims-spinner" />
          <p>Cargando lista de reclamos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="claims-empty">
          <IconEmpty />
          <h3>No se encontraron reclamos</h3>
          <p>{searchTerm || statusFilter ? 'Prueba con otro término o filtro.' : 'Todavía no hay reclamos registrados.'}</p>
        </div>
      ) : (
        <div className="claims-table-card">
          <div className="claims-table-scroll">
            <table className="claims-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Reclamo</th>
                  <th>Sujeto</th>
                  <th>Estado</th>
                  <th>Fecha inicial</th>
                  <th>Comentarios</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((c) => {
                  const subject = subjectOf(c);
                  return (
                    <tr key={c.claim_id}>
                      <td><span className="claims-code">{c.code || '—'}</span></td>
                      <td>
                        <div className="claims-subject">
                          {c.name || '—'}
                          {c.description ? <small>{c.description}</small> : null}
                        </div>
                      </td>
                      <td>
                        <div className="claims-subject">
                          {subject.main}
                          {subject.sub ? <small>{subject.sub}</small> : null}
                        </div>
                      </td>
                      <td>
                        <span className={STATUS_CLASS[c.status] || 'claims-badge'}>{c.status}</span>
                      </td>
                      <td className="claims-muted">{formatDate(c.initial_date)}</td>
                      <td>
                        <span className="claims-comments-pill">
                          <IconComment /> {c.comments?.length || 0}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="claims-pagination">
              <button
                className="claims-page-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Anterior"
              >
                <IconChevron dir="left" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`claims-page-btn ${n === safePage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="claims-page-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label="Siguiente"
              >
                <IconChevron dir="right" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

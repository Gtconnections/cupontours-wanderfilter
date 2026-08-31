'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import {
  getAgents, getAgentDashboard, assignAgent,
  createCommission, deleteCommission,
  AgentLite, AgentDashboard,
} from '@/app/lib/api/agents';
import { getListingsNamesAndIdsSync, ListingSimple } from '@/app/lib/api/propertiesAdmin';

const GOLD = '#c8a24b';
const INK = '#17191c';
const MUTED = '#717171';

const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: 20, marginBottom: 20,
};
const input: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 8,
  fontSize: 14, color: INK, background: '#fafafa', boxSizing: 'border-box', outline: 'none',
};
const label: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: MUTED, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 };
const btn: React.CSSProperties = { padding: '9px 18px', borderRadius: 8, border: 'none', background: INK, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const th: React.CSSProperties = { textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: MUTED, padding: '8px 10px', borderBottom: '1px solid #ebebeb' };
const td: React.CSSProperties = { fontSize: 14, color: INK, padding: '10px', borderBottom: '1px solid #f2f2f2' };

const money = (v: string | number) => {
  const n = Number(v || 0);
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
};

export default function AdminAgentsPage() {
  const { user, isChecking } = useAuth();
  const position = String((user?.position as string) || '').toLowerCase();
  // Tras el login la posición es el string crudo ('agent'); tras recargar viene
  // del cookie mapeado a código ('4' = agente). Detectamos ambos.
  const isAgent = position === 'agent' || position === '4';
  const canManage = !isAgent; // admin/staff. El backend igual exige is_staff.

  const [agents, setAgents] = useState<AgentLite[]>([]);
  const [listings, setListings] = useState<ListingSimple[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<number | ''>('');
  const [dash, setDash] = useState<AgentDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  // Formulario asignar
  const [asgListing, setAsgListing] = useState<number | ''>('');
  const [asgAgent, setAsgAgent] = useState<number | ''>('');
  const [asgPct, setAsgPct] = useState<string>('');
  const [asgBusy, setAsgBusy] = useState(false);

  // Formulario comisión
  const [comListing, setComListing] = useState<number | ''>('');
  const [comAmount, setComAmount] = useState<string>('');
  const [comPeriod, setComPeriod] = useState<string>('');
  const [comPaidAt, setComPaidAt] = useState<string>('');
  const [comStatus, setComStatus] = useState<'pending' | 'paid'>('paid');
  const [comNote, setComNote] = useState<string>('');
  const [comBusy, setComBusy] = useState(false);

  const loadDash = useCallback(async (agentId?: number) => {
    setLoading(true); setError(null);
    try {
      const d = await getAgentDashboard(agentId);
      setDash(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
      setDash(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isChecking) return;
    if (isAgent) {
      loadDash(); // el agente ve lo suyo
      return;
    }
    // admin: cargar agentes + listings para los pickers
    (async () => {
      try { setAgents(await getAgents()); } catch { /* */ }
      try { setListings(await getListingsNamesAndIdsSync()); } catch { /* */ }
    })();
  }, [isChecking, isAgent, loadDash]);

  const onPickAgent = (id: number | '') => {
    setSelectedAgent(id);
    if (id) loadDash(Number(id)); else setDash(null);
  };

  const doAssign = async () => {
    if (!asgListing || !asgAgent) { showToast('Elige propiedad y agente'); return; }
    setAsgBusy(true);
    try {
      await assignAgent(Number(asgListing), Number(asgAgent), asgPct === '' ? 0 : asgPct);
      showToast('Propiedad asignada al agente');
      if (selectedAgent && Number(selectedAgent) === Number(asgAgent)) loadDash(Number(asgAgent));
    } catch (e) { showToast(e instanceof Error ? e.message : 'Error al asignar'); }
    finally { setAsgBusy(false); }
  };

  const doCreateCommission = async () => {
    const agentId = isAgent ? dash?.agent.id : Number(selectedAgent);
    if (!agentId) { showToast('Selecciona un agente primero'); return; }
    if (!comAmount) { showToast('Ingresa el monto'); return; }
    setComBusy(true);
    try {
      await createCommission({
        agent: Number(agentId),
        listing: comListing ? Number(comListing) : null,
        amount: comAmount,
        period: comPeriod,
        paid_at: comPaidAt || null,
        status: comStatus,
        note: comNote,
      });
      setComAmount(''); setComPeriod(''); setComPaidAt(''); setComNote(''); setComListing('');
      showToast('Pago de comisión registrado');
      loadDash(Number(agentId));
    } catch (e) { showToast(e instanceof Error ? e.message : 'Error al registrar'); }
    finally { setComBusy(false); }
  };

  const doDeleteCommission = async (id: number) => {
    try {
      await deleteCommission(id);
      showToast('Pago eliminado');
      const agentId = isAgent ? dash?.agent.id : Number(selectedAgent);
      if (agentId) loadDash(Number(agentId));
    } catch (e) { showToast(e instanceof Error ? e.message : 'Error al eliminar'); }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: GOLD }}>
        Cupon Tours
      </div>
      <h1 style={{ margin: '0 0 6px', fontSize: 26, color: INK }}>
        {isAgent ? 'Mi panel de agente' : 'Agentes'}
      </h1>
      <p style={{ margin: '0 0 22px', color: MUTED, fontSize: 14 }}>
        {isAgent
          ? 'Tus propiedades asignadas, producción del mes, contrato y comisiones.'
          : 'Asigna propiedades a agentes, revisa su producción y registra sus comisiones.'}
      </p>

      {toast && (
        <div style={{ ...card, background: '#0f1113', color: '#fff', padding: '12px 18px' }}>{toast}</div>
      )}

      {/* ADMIN: asignar propiedad a agente + selector de agente */}
      {canManage && (
        <>
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 16, color: INK }}>Asignar propiedad a un agente</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'end' }}>
              <div>
                <label style={label}>Propiedad</label>
                <select style={input} value={asgListing} onChange={(e) => setAsgListing(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Elige…</option>
                  {listings.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Agente</label>
                <select style={input} value={asgAgent} onChange={(e) => setAsgAgent(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Elige…</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.name || a.email}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Comisión %</label>
                <input style={input} type="number" step="0.01" placeholder="10" value={asgPct} onChange={(e) => setAsgPct(e.target.value)} />
              </div>
              <button style={{ ...btn, opacity: asgBusy ? 0.6 : 1 }} disabled={asgBusy} onClick={doAssign}>
                {asgBusy ? 'Asignando…' : 'Asignar'}
              </button>
            </div>
          </div>

          <div style={card}>
            <label style={label}>Ver panel de un agente</label>
            <select style={{ ...input, maxWidth: 380 }} value={selectedAgent} onChange={(e) => onPickAgent(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Elige un agente…</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name || a.email}</option>)}
            </select>
          </div>
        </>
      )}

      {error && <div style={{ ...card, color: '#991b1b', background: '#fef2f2', border: '1px solid #fee2e2' }}>⚠️ {error}</div>}
      {loading && <div style={{ ...card, color: MUTED }}>Cargando…</div>}

      {/* DASHBOARD DEL AGENTE (propio o seleccionado) */}
      {dash && !loading && (
        <>
          {/* Totales */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
            <div style={card}>
              <div style={label}>Propiedades</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: INK }}>{dash.totals.listings}</div>
            </div>
            <div style={card}>
              <div style={label}>Comisión pagada</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#166534' }}>{money(dash.totals.commission_paid)}</div>
            </div>
            <div style={card}>
              <div style={label}>Comisión pendiente</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#92400e' }}>{money(dash.totals.commission_pending)}</div>
            </div>
          </div>

          {/* Listings del agente */}
          <div style={card}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: INK }}>Propiedades de {dash.agent.name || dash.agent.email}</h3>
            {dash.listings.length === 0 ? (
              <p style={{ color: MUTED, fontSize: 14 }}>Aún no tiene propiedades asignadas.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                  <thead><tr>
                    <th style={th}>Propiedad</th><th style={th}>Comisión %</th><th style={th}>Mes</th>
                    <th style={th}>Ingresos</th><th style={th}>Neto</th><th style={th}>Contrato</th>
                  </tr></thead>
                  <tbody>
                    {dash.listings.map((l) => (
                      <tr key={l.id}>
                        <td style={td}>
                          <Link href={`/admin/agents/property/${l.id}`} style={{ color: INK, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                            {l.name}
                          </Link>
                        </td>
                        <td style={td}>{Number(l.commission_pct)}%</td>
                        <td style={td}>{l.last_pl?.date || '—'}</td>
                        <td style={td}>{l.last_pl ? money(l.last_pl.total_income) : '—'}</td>
                        <td style={td}>{l.last_pl ? money(l.last_pl.income_minus_expenses) : '—'}</td>
                        <td style={td}>
                          {l.agreement?.url
                            ? <a href={l.agreement.url} target="_blank" rel="noreferrer" style={{ color: GOLD, fontWeight: 600 }}>Ver</a>
                            : <span style={{ color: MUTED }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Registrar comisión (solo admin) */}
          {canManage && (
            <div style={card}>
              <h3 style={{ margin: '0 0 14px', fontSize: 16, color: INK }}>Registrar pago de comisión</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, alignItems: 'end' }}>
                <div>
                  <label style={label}>Propiedad (opcional)</label>
                  <select style={input} value={comListing} onChange={(e) => setComListing(e.target.value ? Number(e.target.value) : '')}>
                    <option value="">General</option>
                    {dash.listings.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div><label style={label}>Monto</label><input style={input} type="number" step="0.01" value={comAmount} onChange={(e) => setComAmount(e.target.value)} /></div>
                <div><label style={label}>Periodo (YYYY-MM)</label><input style={input} placeholder="2026-08" value={comPeriod} onChange={(e) => setComPeriod(e.target.value)} /></div>
                <div><label style={label}>Fecha de pago</label><input style={input} type="date" value={comPaidAt} onChange={(e) => setComPaidAt(e.target.value)} /></div>
                <div>
                  <label style={label}>Estado</label>
                  <select style={input} value={comStatus} onChange={(e) => setComStatus(e.target.value as 'pending' | 'paid')}>
                    <option value="paid">Pagado</option>
                    <option value="pending">Pendiente</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}><label style={label}>Nota</label><input style={input} value={comNote} onChange={(e) => setComNote(e.target.value)} /></div>
                <button style={{ ...btn, opacity: comBusy ? 0.6 : 1 }} disabled={comBusy} onClick={doCreateCommission}>
                  {comBusy ? 'Guardando…' : 'Registrar pago'}
                </button>
              </div>
            </div>
          )}

          {/* Comisiones */}
          <div style={card}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: INK }}>Comisiones</h3>
            {dash.commissions.length === 0 ? (
              <p style={{ color: MUTED, fontSize: 14 }}>Sin comisiones registradas.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                  <thead><tr>
                    <th style={th}>Propiedad</th><th style={th}>Monto</th><th style={th}>Periodo</th>
                    <th style={th}>Fecha pago</th><th style={th}>Estado</th><th style={th}>Nota</th>
                    {canManage && <th style={th}></th>}
                  </tr></thead>
                  <tbody>
                    {dash.commissions.map((c) => (
                      <tr key={c.id}>
                        <td style={td}>{c.listing_name || 'General'}</td>
                        <td style={td}><strong>{money(c.amount)}</strong></td>
                        <td style={td}>{c.period || '—'}</td>
                        <td style={td}>{c.paid_at || '—'}</td>
                        <td style={td}>
                          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                            background: c.status === 'paid' ? '#dcfce7' : '#fef3c7', color: c.status === 'paid' ? '#166534' : '#92400e' }}>
                            {c.status === 'paid' ? 'Pagado' : 'Pendiente'}
                          </span>
                        </td>
                        <td style={td}>{c.note || '—'}</td>
                        {canManage && (
                          <td style={td}>
                            <button onClick={() => doDeleteCommission(c.id)} style={{ border: 'none', background: 'transparent', color: '#991b1b', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                              Eliminar
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!dash && !loading && canManage && (
        <div style={{ ...card, color: MUTED }}>Elige un agente arriba para ver su panel, o asigna una propiedad para empezar.</div>
      )}
    </div>
  );
}

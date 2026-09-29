'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getListingsNamesAndIdsSync } from '@/app/lib/api/propertiesAdmin';
import {
  getDailyPrices,
  savePricingSettings,
  saveDailyOverride,
  deleteDailyOverride,
  getRules,
  saveRules,
  getDateRules,
  addDateRule,
  deleteDateRule,
  generateRecommendations,
  getMarketPrices,
  runPricingAgent,
  getAgentProposals,
  AgentProposal,
  AgentRunResult,
  DailyResponse,
  DailyPrice,
  PricingRules,
  DateRule,
} from '@/app/lib/api/pricing';
import './pricing.css';

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const money = (v: string | null) => (v === null || v === '' ? '—' : `$${Number(v).toFixed(0)}`);

const fmtMonth = (isoDate: string) => {
  const parts = (isoDate || '').split('-');
  if (parts.length < 2) return isoDate || '—';
  const m = parseInt(parts[1], 10) - 1;
  return `${MONTHS_ES[m] ?? ''} ${parts[0]}`.trim();
};

const IconChevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points={dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} /></svg>
);
const IconAlert = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);

interface ListingOption { id: number; name: string; }

const DEFAULT_RULES: PricingRules = {
  enabled: true, last_minute_days: 0, last_minute_discount: 0,
  high_occupancy_threshold: 80, high_occupancy_surge: 0,
  low_occupancy_threshold: 30, low_occupancy_discount: 0,
  gap_night_discount: 0, min_nights: 1,
};

export default function PricingPage() {
  const router = useRouter();
  const { isChecking, checkAuth } = useAuth();

  const [listings, setListings] = useState<ListingOption[]>([]);
  const [listingId, setListingId] = useState<number | null>(null);
  const now = { y: 2026, m: 7 };
  const [year, setYear] = useState(now.y);
  const [month, setMonth] = useState(now.m);

  const [data, setData] = useState<DailyResponse | null>(null);
  const [form, setForm] = useState({ min_price: '', base_price: '', max_price: '', weekend_multiplier: '' });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [selected, setSelected] = useState<DailyPrice | null>(null);
  const [overrideValue, setOverrideValue] = useState('');

  // Fase 1: precio de mercado (PriceLabs) por día
  const [market, setMarket] = useState<Record<string, number | null>>({});
  const [marketEnabled, setMarketEnabled] = useState<boolean | null>(null);
  const [marketMsg, setMarketMsg] = useState<string | null>(null);

  // Fase 2: agente de precios (dry-run)
  const [agentRun, setAgentRun] = useState<AgentRunResult | null>(null);
  const [proposals, setProposals] = useState<AgentProposal[]>([]);
  const [agentBusy, setAgentBusy] = useState(false);
  const [propFilter, setPropFilter] = useState('');
  const [propPage, setPropPage] = useState(0);

  // Fase 2: Rules Engine
  const [rules, setRules] = useState<PricingRules>(DEFAULT_RULES);
  const [dateRules, setDateRules] = useState<DateRule[]>([]);
  const [newDR, setNewDR] = useState({ label: '', start_date: '', end_date: '', adjustment_percent: '', fixed_price: '' });
  const [savingRules, setSavingRules] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genRange, setGenRange] = useState({ start: '', end: '' });

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    const d = new Date();
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    const start = d.toISOString().slice(0, 10);
    const end = new Date(d.getTime() + 60 * 86400000).toISOString().slice(0, 10);
    setGenRange({ start, end });
  }, []);

  useEffect(() => {
    if (isChecking) return;
    if (!checkAuth()) {
      router.push('/login');
      return;
    }
    (async () => {
      try {
        const data = await getListingsNamesAndIdsSync();
        const opts: ListingOption[] = (data || []).map((l: { id: number; name: string }) => ({ id: l.id, name: l.name }));
        setListings(opts);
        if (opts.length && listingId === null) setListingId(opts[0].id);
        else if (!opts.length) setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar propiedades');
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking]);

  const loadDaily = useCallback(async () => {
    if (!listingId) return;
    setLoading(true);
    setError(null);
    setSelected(null);
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    try {
      const resp = await getDailyPrices(listingId, monthStr);
      setData(resp);
      setForm({
        min_price: resp.settings.min_price,
        base_price: resp.settings.base_price,
        max_price: resp.settings.max_price,
        weekend_multiplier: resp.settings.weekend_multiplier,
      });
      // Fase 1: traer precio de mercado (PriceLabs). No rompe si falla o no está configurado.
      try {
        const m = await getMarketPrices(listingId, monthStr);
        const map: Record<string, number | null> = {};
        (m.days || []).forEach((d) => { map[d.date] = d.pricelabs_price; });
        setMarket(map);
        setMarketEnabled(m.enabled);
        setMarketMsg(m.message || null);
      } catch {
        setMarket({}); setMarketEnabled(null); setMarketMsg(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar precios');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [listingId, year, month]);

  useEffect(() => {
    loadDaily();
  }, [loadDaily]);

  // Cargar propuestas del agente: al abrir y cada vez que cambia el buscador
  // (búsqueda del lado del servidor, encuentra aunque haya miles).
  useEffect(() => {
    const q = propFilter.trim();
    const id = setTimeout(() => {
      getAgentProposals(agentRun?.run_id, q || undefined)
        .then((r) => { setProposals(r.proposals); setPropPage(0); })
        .catch(() => { /* noop */ });
    }, 350);
    return () => clearTimeout(id);
  }, [propFilter, agentRun?.run_id]);

  // Cargar reglas + overrides por fecha al cambiar de propiedad
  useEffect(() => {
    if (!listingId) return;
    (async () => {
      try {
        const r = await getRules(listingId);
        setRules({
          enabled: r.enabled,
          last_minute_days: r.last_minute_days,
          last_minute_discount: r.last_minute_discount,
          high_occupancy_threshold: r.high_occupancy_threshold,
          high_occupancy_surge: r.high_occupancy_surge,
          low_occupancy_threshold: r.low_occupancy_threshold,
          low_occupancy_discount: r.low_occupancy_discount,
          gap_night_discount: r.gap_night_discount,
          min_nights: r.min_nights,
        });
      } catch { /* noop */ }
      try { setDateRules(await getDateRules(listingId)); } catch { /* noop */ }
    })();
  }, [listingId]);

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMonth(m);
    setYear(y);
  };

  const handleSaveSettings = async () => {
    if (!listingId) return;
    setSavingSettings(true);
    setError(null);
    try {
      await savePricingSettings({
        listing_id: listingId,
        min_price: form.min_price || 0,
        base_price: form.base_price || 0,
        max_price: form.max_price || 0,
        weekend_multiplier: form.weekend_multiplier || 1,
      });
      flash('Ajustes guardados');
      await loadDaily();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar ajustes');
    } finally {
      setSavingSettings(false);
    }
  };

  const setRuleField = (k: keyof PricingRules, v: string | number | boolean) =>
    setRules((prev) => ({ ...prev, [k]: v }));

  const handleSaveRules = async () => {
    if (!listingId) return;
    setSavingRules(true);
    setError(null);
    try {
      await saveRules({ listing_id: listingId, ...rules });
      flash('Reglas guardadas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar reglas');
    } finally {
      setSavingRules(false);
    }
  };

  const handleAddDateRule = async () => {
    if (!listingId || !newDR.start_date || !newDR.end_date) return;
    try {
      await addDateRule({
        listing_id: listingId,
        label: newDR.label,
        start_date: newDR.start_date,
        end_date: newDR.end_date,
        adjustment_percent: newDR.adjustment_percent || 0,
        fixed_price: newDR.fixed_price === '' ? null : newDR.fixed_price,
      });
      setNewDR({ label: '', start_date: '', end_date: '', adjustment_percent: '', fixed_price: '' });
      setDateRules(await getDateRules(listingId));
      flash('Override agregado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar override');
    }
  };

  const handleDeleteDateRule = async (id: number) => {
    try {
      await deleteDateRule(id);
      if (listingId) setDateRules(await getDateRules(listingId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar override');
    }
  };

  const handleGenerate = async () => {
    if (!listingId || !genRange.start || !genRange.end) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await generateRecommendations({ listing_id: listingId, start_date: genRange.start, end_date: genRange.end });
      flash(`Generadas ${res.generated} recomendaciones`);
      await loadDaily();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar recomendaciones');
    } finally {
      setGenerating(false);
    }
  };

  const handleRunAgent = async (apply = false) => {
    if (apply && !window.confirm(
      'Vas a ESCRIBIR los descuentos en PriceLabs (no es simulación).\n\n' +
      'Solo se aplicarán si el backend tiene PRICING_AGENT_APPLY=1. ¿Continuar?'
    )) return;
    setAgentBusy(true);
    setError(null);
    try {
      const r = await runPricingAgent(0, apply);
      setAgentRun(r);
      const p = await getAgentProposals(r.run_id);
      setProposals(p.proposals);
      if (apply && r.apply_enabled) {
        flash(`Aplicado: ${r.applied_ok} escritas, ${r.applied_fail} fallidas, ${r.reverted} revertidas`);
      } else if (apply && !r.apply_enabled) {
        flash('Simulado: falta PRICING_AGENT_APPLY=1 en el backend para escribir.');
      } else {
        flash(`Agente: ${r.proposed} propuestas, ${r.skipped} saltadas`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al correr el agente');
    } finally {
      setAgentBusy(false);
    }
  };

  const openDay = (d: DailyPrice) => {
    setSelected(d);
    setOverrideValue(d.price ?? '');
  };

  const handleSaveOverride = async () => {
    if (!listingId || !selected) return;
    try {
      await saveDailyOverride({ listing_id: listingId, date: selected.date, price: overrideValue || 0 });
      flash(`Precio del ${selected.date} actualizado`);
      await loadDaily();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el precio del día');
    }
  };

  const handleClearOverride = async () => {
    if (!listingId || !selected) return;
    try {
      await deleteDailyOverride(listingId, selected.date);
      flash('Se restauró la sugerencia');
      await loadDaily();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restaurar la sugerencia');
    }
  };

  const leadingBlanks = data && data.days.length ? (data.days[0].weekday + 1) % 7 : 0;

  return (
    <div className="pr-container">
      <header className="pr-header">
        <span className="pr-breadcrumb">Dashboard / Pricing Engine</span>
        <h2>Motor de Precios</h2>
        <p className="pr-subtitle">
          Precios mínimos/base/máximos por propiedad y sugerencia diaria según ocupación. Haz clic en un día para fijar un precio manual.
        </p>
      </header>

      {toast && <div className="pr-toast">{toast}</div>}

      <div className="pr-controls">
        <div className="pr-field">
          <label>Propiedad</label>
          <select
            className="pr-select"
            value={listingId ?? ''}
            onChange={(e) => setListingId(Number(e.target.value))}
          >
            {listings.length === 0 && <option value="">Sin propiedades</option>}
            {listings.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="pr-field">
          <label>Mes</label>
          <div className="pr-month-nav">
            <button className="pr-icon-btn" onClick={() => changeMonth(-1)} aria-label="Mes anterior"><IconChevron dir="left" /></button>
            <span className="pr-month-label">{MONTHS_ES[month - 1]} {year}</span>
            <button className="pr-icon-btn" onClick={() => changeMonth(1)} aria-label="Mes siguiente"><IconChevron dir="right" /></button>
          </div>
        </div>
      </div>

      {error && (
        <div className="pr-state pr-state--error" style={{ marginBottom: '18px' }}>
          <h3><IconAlert /> {error}</h3>
          <p>Verifica tu sesión (requiere staff) o intenta de nuevo.</p>
        </div>
      )}

      <div className="pr-card" style={{ marginBottom: '20px' }}>
        <div className="pr-settings">
          <div className="pr-settings-title">Umbrales de precio</div>
          <div className="pr-field">
            <label>Mínimo ($)</label>
            <input className="pr-input" type="number" value={form.min_price} onChange={(e) => setForm({ ...form, min_price: e.target.value })} />
          </div>
          <div className="pr-field">
            <label>Base ($)</label>
            <input className="pr-input" type="number" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} />
          </div>
          <div className="pr-field">
            <label>Máximo ($)</label>
            <input className="pr-input" type="number" value={form.max_price} onChange={(e) => setForm({ ...form, max_price: e.target.value })} />
          </div>
          <div className="pr-field">
            <label>Fin de semana (x)</label>
            <input className="pr-input" type="number" step="0.01" value={form.weekend_multiplier} onChange={(e) => setForm({ ...form, weekend_multiplier: e.target.value })} />
          </div>
          <button className="pr-btn pr-btn-gold" onClick={handleSaveSettings} disabled={savingSettings || !listingId}>
            {savingSettings ? 'Guardando...' : 'Guardar ajustes'}
          </button>
          <div className="pr-settings-hint">
            La sugerencia diaria = base × (fin de semana) × factor de demanda por ocupación, limitada entre el mínimo y el máximo.
          </div>
        </div>
      </div>

      {/* Rules Engine (Fase 2) */}
      <div className="pr-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div className="pr-settings-title" style={{ margin: 0 }}>Reglas automáticas (Rules Engine)</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={rules.enabled} onChange={(e) => setRuleField('enabled', e.target.checked)} /> Activar reglas
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '14px', marginTop: '14px' }}>
          <div className="pr-field"><label>Last-minute: días</label><input className="pr-input" type="number" value={rules.last_minute_days} onChange={(e) => setRuleField('last_minute_days', e.target.value)} /></div>
          <div className="pr-field"><label>Last-minute: descuento %</label><input className="pr-input" type="number" value={rules.last_minute_discount} onChange={(e) => setRuleField('last_minute_discount', e.target.value)} /></div>
          <div className="pr-field"><label>Alta ocupación: umbral %</label><input className="pr-input" type="number" value={rules.high_occupancy_threshold} onChange={(e) => setRuleField('high_occupancy_threshold', e.target.value)} /></div>
          <div className="pr-field"><label>Alta ocupación: recargo %</label><input className="pr-input" type="number" value={rules.high_occupancy_surge} onChange={(e) => setRuleField('high_occupancy_surge', e.target.value)} /></div>
          <div className="pr-field"><label>Baja ocupación: umbral %</label><input className="pr-input" type="number" value={rules.low_occupancy_threshold} onChange={(e) => setRuleField('low_occupancy_threshold', e.target.value)} /></div>
          <div className="pr-field"><label>Baja ocupación: descuento %</label><input className="pr-input" type="number" value={rules.low_occupancy_discount} onChange={(e) => setRuleField('low_occupancy_discount', e.target.value)} /></div>
          <div className="pr-field"><label>Noche huérfana: descuento %</label><input className="pr-input" type="number" value={rules.gap_night_discount} onChange={(e) => setRuleField('gap_night_discount', e.target.value)} /></div>
          <div className="pr-field"><label>Mín. noches</label><input className="pr-input" type="number" value={rules.min_nights} onChange={(e) => setRuleField('min_nights', e.target.value)} /></div>
        </div>
        <button className="pr-btn pr-btn-gold" style={{ marginTop: '14px' }} onClick={handleSaveRules} disabled={savingRules || !listingId}>
          {savingRules ? 'Guardando...' : 'Guardar reglas'}
        </button>

        {/* Overrides por fecha */}
        <div style={{ marginTop: '26px' }}>
          <div className="pr-settings-title">Overrides por fecha (temporada / eventos)</div>
          {dateRules.length > 0 && (
            <div style={{ margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {dateRules.map((dr) => (
                <div key={dr.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '8px 12px', border: '1px solid rgba(212,175,55,0.18)', borderRadius: '8px' }}>
                  <span><strong>{dr.label || 'Sin nombre'}</strong> · {dr.start_date} → {dr.end_date} · {dr.fixed_price != null ? `$${dr.fixed_price} fijo` : `${dr.adjustment_percent}%`}</span>
                  <button className="pr-btn pr-btn-ghost" onClick={() => handleDeleteDateRule(dr.id)}>Eliminar</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '10px', alignItems: 'end', marginTop: '10px' }}>
            <div className="pr-field"><label>Etiqueta</label><input className="pr-input" value={newDR.label} onChange={(e) => setNewDR({ ...newDR, label: e.target.value })} placeholder="Navidad" /></div>
            <div className="pr-field"><label>Desde</label><input className="pr-input" type="date" value={newDR.start_date} onChange={(e) => setNewDR({ ...newDR, start_date: e.target.value })} /></div>
            <div className="pr-field"><label>Hasta</label><input className="pr-input" type="date" value={newDR.end_date} onChange={(e) => setNewDR({ ...newDR, end_date: e.target.value })} /></div>
            <div className="pr-field"><label>Ajuste %</label><input className="pr-input" type="number" value={newDR.adjustment_percent} onChange={(e) => setNewDR({ ...newDR, adjustment_percent: e.target.value })} placeholder="+20" /></div>
            <div className="pr-field"><label>Precio fijo $ (opc.)</label><input className="pr-input" type="number" value={newDR.fixed_price} onChange={(e) => setNewDR({ ...newDR, fixed_price: e.target.value })} /></div>
            <button className="pr-btn pr-btn-gold" onClick={handleAddDateRule} disabled={!listingId}>Agregar</button>
          </div>
        </div>

        {/* Generar recomendaciones */}
        <div style={{ marginTop: '26px' }}>
          <div className="pr-settings-title">Generar recomendaciones</div>
          <p className="pr-settings-hint" style={{ marginTop: '6px' }}>Aplica las reglas al rango y llena el calendario automáticamente. No pisa los precios manuales.</p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'end', flexWrap: 'wrap', marginTop: '8px' }}>
            <div className="pr-field"><label>Desde</label><input className="pr-input" type="date" value={genRange.start} onChange={(e) => setGenRange({ ...genRange, start: e.target.value })} /></div>
            <div className="pr-field"><label>Hasta</label><input className="pr-input" type="date" value={genRange.end} onChange={(e) => setGenRange({ ...genRange, end: e.target.value })} /></div>
            <button className="pr-btn pr-btn-gold" onClick={handleGenerate} disabled={generating || !listingId}>
              {generating ? 'Generando...' : 'Generar recomendaciones'}
            </button>
          </div>
        </div>
      </div>

      {/* Agente de precios (Fase 2, dry-run) */}
      <div className="pr-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div className="pr-settings-title" style={{ margin: 0 }}>Agente de precios (temporada baja)</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="pr-btn" onClick={() => handleRunAgent(false)} disabled={agentBusy}>
              {agentBusy ? 'Corriendo...' : 'Simular (dry-run)'}
            </button>
            <button className="pr-btn pr-btn-gold" onClick={() => handleRunAgent(true)} disabled={agentBusy}
              title="Escribe los descuentos en PriceLabs (requiere PRICING_AGENT_APPLY=1)">
              {agentBusy ? '...' : 'Aplicar en PriceLabs'}
            </button>
          </div>
        </div>
        <p className="pr-settings-hint" style={{ marginTop: '8px' }}>
          Analiza la ocupación <strong>mes por mes</strong> hacia adelante y <strong>propone</strong> un descuento por cada mes con baja ocupación (piso protegido, tope de descuento). Una propiedad ocupada esta semana pero libre en octubre recibe descuento para octubre.
          «Simular» solo registra propuestas; «Aplicar» escribe el descuento como <em>override</em> por rango de fechas sobre el precio recomendado de PriceLabs y quita el descuento de los meses que se recuperaron.
        </p>
        {agentRun && (
          <div style={{ fontSize: '13px', margin: '8px 0' }}>
            Última corrida <code>{agentRun.run_id}</code>: <strong>{agentRun.proposed}</strong> propuestas
            {typeof agentRun.properties_with_discount === 'number' && (
              <> en {agentRun.properties_with_discount} propiedades</>
            )} · {agentRun.skipped} meses saltados
            {typeof agentRun.market_hits === 'number' && (
              <> · mercado {agentRun.market_hits}✓/{agentRun.market_misses}✗</>
            )}
            {agentRun.apply_enabled && (
              <> · <strong style={{ color: '#1e7d34' }}>aplicadas {agentRun.applied_ok}</strong>
                {agentRun.applied_fail ? <span style={{ color: '#c0392b' }}> · {agentRun.applied_fail} fallidas</span> : null}
                {agentRun.reverted ? <> · {agentRun.reverted} revertidas</> : null}
              </>
            )}
            {!agentRun.dry_run && !agentRun.apply_enabled && (
              <> · <span style={{ color: '#c0392b' }}>simulado (falta PRICING_AGENT_APPLY=1)</span></>
            )}
            {' '}· umbral &lt;{agentRun.low_occ}% · tope {agentRun.max_disc}% · horizonte {agentRun.window}d ({agentRun.months ?? '·'} meses) {agentRun.pricelabs_enabled ? '· PriceLabs ✓' : '· PriceLabs ✗'}
          </div>
        )}
        {proposals.length > 0 ? (() => {
          const q = propFilter.trim().toLowerCase();
          const filtered = proposals
            .filter((p) => !q || (p.listing_name || '').toLowerCase().includes(q) || fmtMonth(p.window_start).toLowerCase().includes(q))
            .sort((a, b) => Number(b.discount_percent) - Number(a.discount_percent));
          const PER = 15;
          const pageCount = Math.max(1, Math.ceil(filtered.length / PER));
          const page = Math.min(propPage, pageCount - 1);
          const shown = filtered.slice(page * PER, page * PER + PER);
          return (
          <div style={{ overflowX: 'auto', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={propFilter}
                onChange={(e) => setPropFilter(e.target.value)}
                placeholder="Buscar propiedad o mes…"
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '13px', minWidth: '220px' }}
              />
              <span className="pr-settings-hint" style={{ margin: 0 }}>
                {filtered.length === 0 ? 'Sin resultados' : `${page * PER + 1}–${page * PER + shown.length} de ${filtered.length}`}
              </span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(212,175,55,0.25)' }}>
                  <th style={{ padding: '6px 8px' }}>Propiedad</th>
                  <th style={{ padding: '6px 8px' }}>Mes</th>
                  <th style={{ padding: '6px 8px' }}>Ocupación</th>
                  <th style={{ padding: '6px 8px' }}>Descuento</th>
                  <th style={{ padding: '6px 8px' }}>Mercado → Propuesto</th>
                  <th style={{ padding: '6px 8px' }}>Piso</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }} title={p.reason}>
                    <td style={{ padding: '6px 8px' }}>
                      {p.listing_name}
                      {p.status === 'applied' && <span style={{ color: '#1e7d34', fontSize: '11px' }}> ✓aplicada</span>}
                      {p.status === 'reverted' && <span style={{ color: '#8a6d3b', fontSize: '11px' }}> ↩revertida</span>}
                    </td>
                    <td style={{ padding: '6px 8px', textTransform: 'capitalize' }}>{fmtMonth(p.window_start)}</td>
                    <td style={{ padding: '6px 8px' }}>{Math.round(Number(p.occupancy))}%</td>
                    <td style={{ padding: '6px 8px', color: '#c0392b', fontWeight: 600 }}>-{Math.round(Number(p.discount_percent))}%</td>
                    <td style={{ padding: '6px 8px' }}>
                      {p.market_avg ? `$${Math.round(Number(p.market_avg))}` : '—'} → {p.proposed_avg ? `$${Math.round(Number(p.proposed_avg))}` : '—'}
                    </td>
                    <td style={{ padding: '6px 8px', color: '#5b6b7b' }}>${Math.round(Number(p.floor_min))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pageCount > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                <button className="pr-btn" onClick={() => setPropPage(Math.max(0, page - 1))} disabled={page === 0}>
                  ← Anterior
                </button>
                <span className="pr-settings-hint" style={{ margin: 0 }}>Página {page + 1} de {pageCount}</span>
                <button className="pr-btn" onClick={() => setPropPage(Math.min(pageCount - 1, page + 1))} disabled={page >= pageCount - 1}>
                  Siguiente →
                </button>
              </div>
            )}
          </div>
          );
        })() : (
          <div className="pr-settings-hint" style={{ marginTop: '8px' }}>Aún no hay propuestas. Corre el agente para generarlas.</div>
        )}
      </div>

      <div className="pr-legend">
        <span><i className="pr-dot pr-dot--weekend" /> Fin de semana</span>
        <span><i className="pr-dot pr-dot--manual" /> Precio manual</span>
        <span><i className="pr-dot pr-dot--booked" /> Reservado</span>
        {marketEnabled === true && <span><i className="pr-dot" style={{ background: '#2563eb' }} /> PriceLabs (mercado)</span>}
      </div>

      {marketEnabled === false && (
        <div className="pr-state" style={{ marginBottom: '12px', textAlign: 'left', padding: '10px 14px' }}>
          <small>💡 PriceLabs aún no está configurado. Agrega la variable <code>PRICELABS_API_KEY</code> en el backend para ver el precio de mercado por día{marketMsg ? ` (${marketMsg})` : ''}.</small>
        </div>
      )}

      <div className="pr-card">
        {loading ? (
          <div className="pr-state"><div className="pr-spinner" /><p>Cargando precios...</p></div>
        ) : !data || data.days.length === 0 ? (
          <div className="pr-state"><h3>Sin datos</h3><p>Selecciona una propiedad para ver el calendario de precios.</p></div>
        ) : (
          <>
            <div className="pr-weekdays">
              {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
            </div>
            <div className="pr-grid">
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`blank-${i}`} className="pr-day pr-empty" />
              ))}
              {data.days.map((d) => {
                const dayNum = d.date.split('-')[2];
                const cls = [
                  'pr-day',
                  d.is_weekend ? 'pr-weekend' : '',
                  d.is_booked ? 'pr-booked' : '',
                  d.source === 'manual' ? 'pr-manual' : '',
                  selected?.date === d.date ? 'pr-selected' : '',
                ].filter(Boolean).join(' ');
                return (
                  <button key={d.date} className={cls} onClick={() => openDay(d)}>
                    <div className="pr-day-top">
                      <span className="pr-day-num">{dayNum}</span>
                      {d.is_booked ? <span className="pr-day-tag pr-day-tag--booked">Reservado</span>
                        : d.source === 'manual' ? <span className="pr-day-tag pr-day-tag--manual">Manual</span> : null}
                    </div>
                    <span className="pr-day-price">{money(d.price)}</span>
                    {market[d.date] != null && (
                      <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#2563eb', marginTop: '2px' }}>
                        PL ${Math.round(market[d.date] as number)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selected && (
              <div className="pr-editor">
                <div className="pr-editor-info">
                  <strong>{selected.date}</strong>
                  <small>
                    Sugerido: {money(selected.suggested_price)} · Ocupación (30d): {Math.round(selected.occupancy * 100)}%
                    {market[selected.date] != null ? ` · PriceLabs: $${Math.round(market[selected.date] as number)}` : ''}
                    {selected.is_booked ? ' · Reservado' : ''}
                  </small>
                </div>
                <div className="pr-field">
                  <label>Precio del día ($)</label>
                  <input className="pr-input" type="number" value={overrideValue} onChange={(e) => setOverrideValue(e.target.value)} />
                </div>
                <button className="pr-btn pr-btn-gold" onClick={handleSaveOverride}>Guardar precio</button>
                {selected.source === 'manual' && (
                  <button className="pr-btn pr-btn-ghost" onClick={handleClearOverride}>Usar sugerencia</button>
                )}
                <button className="pr-btn pr-btn-ghost" onClick={() => setSelected(null)}>Cerrar</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

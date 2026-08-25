'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import {
  classifyHandoff,
  createTicket,
  updateTicket,
  HandoffItem,
  HandoffResult,
} from '@/app/lib/api/operations';
import { getListingsNamesAndIdsSync } from '@/app/lib/api/propertiesAdmin';
import './handoff.css';

const EXAMPLE = `Entrega de turno:
- Guest de FM 1602 reporta que el apartamento huele a humo, dice que se fue y pidió full refund, pero se le dice que no y hasta el momento no ha cancelado.
- FM 405 y 505 reportan que el aire no enfría bien.
- 509 pide una cobija, Jackie ya se la entregó.
- Todos los check-ins reportados (Cozy Brickell, Bezel 2507, Calle 8 Apt 6).
- Reviews al día.`;

const BUCKET_META: Record<string, { label: string; cls: string }> = {
  urgente: { label: 'Urgente', cls: 'b-urg' },
  low_stock: { label: 'Low / Amenities', cls: 'b-low' },
  turnover: { label: 'Turnover', cls: 'b-turn' },
  checkin: { label: 'Check-in', cls: 'b-chk' },
  limpieza: { label: 'Limpieza', cls: 'b-clean' },
  info: { label: 'Info', cls: 'b-info' },
};

// Categorías válidas del ticket (deben coincidir con TICKET_CATEGORY del backend)
const TICKET_CATEGORIES: [string, string][] = [
  ['plomeria', 'Plomería'],
  ['electricidad', 'Electricidad'],
  ['aire', 'Aire acondicionado'],
  ['cerrajeria', 'Cerrajería'],
  ['pintura', 'Pintura / Acabados'],
  ['electrodomesticos', 'Electrodomésticos'],
  ['limpieza', 'Limpieza / Fumigación'],
  ['otro', 'Otro'],
];
const TICKET_PRIORITIES: [string, string][] = [
  ['baja', 'Baja'],
  ['media', 'Media'],
  ['alta', 'Alta'],
  ['urgente', 'Urgente'],
];
const VALID_CATS = new Set(TICKET_CATEGORIES.map((c) => c[0]));
const mapCategory = (c: string) => (VALID_CATS.has(c) ? c : 'otro');

interface ListingOption { id: number; name: string; }
interface RowState {
  listingId: string;
  category: string;
  priority: string;
  status: 'idle' | 'creating' | 'done' | 'error';
  ticketId?: number;
  error?: string;
}

// Ítems que se pueden convertir en ticket (no los informativos ni los check-ins)
const isTicketable = (it: HandoffItem) => it.bucket !== 'info' && it.bucket !== 'checkin';

export default function HandoffPage() {
  const router = useRouter();
  const { isChecking, checkAuth } = useAuth();

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HandoffResult | null>(null);

  const [listings, setListings] = useState<ListingOption[]>([]);
  const [rows, setRows] = useState<RowState[]>([]);

  useEffect(() => {
    if (isChecking) return;
    if (!checkAuth()) { router.push('/login'); return; }
    getListingsNamesAndIdsSync()
      .then((ls) => setListings((ls as ListingOption[]) || []))
      .catch(() => setListings([]));
  }, [isChecking]); // eslint-disable-line react-hooks/exhaustive-deps

  const onClassify = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setRows([]);
    try {
      const res = await classifyHandoff(text.trim());
      setResult(res);
      setRows(
        res.items.map((it) => ({
          listingId: it.listing_id ? String(it.listing_id) : '',
          category: mapCategory(it.category),
          priority: TICKET_PRIORITIES.some((p) => p[0] === it.priority) ? it.priority : 'media',
          status: 'idle' as const,
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo clasificar.');
    } finally {
      setLoading(false);
    }
  };

  const patchRow = (idx: number, patch: Partial<RowState>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const createOne = async (idx: number) => {
    if (!result) return;
    const it = result.items[idx];
    const rs = rows[idx];
    if (!rs || rs.status === 'creating' || rs.status === 'done') return;
    if (!rs.listingId) { patchRow(idx, { status: 'error', error: 'Elige una propiedad.' }); return; }
    patchRow(idx, { status: 'creating', error: undefined });
    try {
      const description = [it.excerpt, it.action].filter(Boolean).join(' — ');
      const ticket = await createTicket({
        listing: Number(rs.listingId),
        title: it.title || 'Ticket de mantenimiento',
        category: rs.category,
        priority: rs.priority,
        description,
      });
      if (it.resolved) {
        try {
          await updateTicket(ticket.id, {
            status: 'resuelto',
            resolution_note: 'Reportado como resuelto en la entrega de turno.',
          });
        } catch { /* si falla el update, el ticket igual quedó creado */ }
      }
      patchRow(idx, { status: 'done', ticketId: ticket.id });
    } catch (e) {
      patchRow(idx, { status: 'error', error: e instanceof Error ? e.message : 'No se pudo crear.' });
    }
  };

  const createAll = async () => {
    if (!result) return;
    for (let i = 0; i < result.items.length; i++) {
      if (isTicketable(result.items[i]) && rows[i]?.status === 'idle' && rows[i]?.listingId) {
        // eslint-disable-next-line no-await-in-loop
        await createOne(i);
      }
    }
  };

  const accionables = result ? result.items.filter(isTicketable).length : 0;
  const pendientes = result
    ? result.items.filter((it, i) => isTicketable(it) && rows[i]?.status !== 'done').length
    : 0;

  return (
    <div className="handoff-page">
      <header className="handoff-head">
        <span className="handoff-eyebrow">Operaciones · Beta</span>
        <h1>Entrega de turno → Dashboard</h1>
        <p>Pega el reporte del turno. Claude lo clasifica y, si estás de acuerdo, creas los tickets de mantenimiento directo desde aquí.</p>
      </header>

      <section className="handoff-card">
        <div className="handoff-card-head">
          <h2>1 · Entrega de turno</h2>
          <button type="button" className="handoff-example" onClick={() => setText(EXAMPLE)}>
            Usar ejemplo
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Pega aquí el texto de la entrega de turno…"
          rows={8}
        />
        <div className="handoff-actions">
          <button type="button" className="handoff-btn" onClick={onClassify} disabled={loading || !text.trim()}>
            {loading ? 'Clasificando…' : '✦ Clasificar con IA'}
          </button>
        </div>
        {error && <p className="handoff-error">{error}</p>}
      </section>

      {result && (
        <section className="handoff-card">
          <div className="handoff-card-head">
            <h2>2 · Propuesta</h2>
            <div className="handoff-head-actions">
              <span className="handoff-count">{result.count} detectados · {accionables} accionables</span>
              {pendientes > 0 && (
                <button type="button" className="handoff-btn sm" onClick={createAll}>
                  Crear todos ({pendientes})
                </button>
              )}
            </div>
          </div>

          {result.items.length === 0 && (
            <p className="handoff-empty">La IA no detectó items. Prueba con más detalle.</p>
          )}

          {result.items.map((it: HandoffItem, idx: number) => {
            const meta = BUCKET_META[it.bucket] || BUCKET_META.info;
            const rs = rows[idx];
            const ticketable = isTicketable(it);
            return (
              <div className="handoff-item" key={idx}>
                <span className={`handoff-badge ${meta.cls}`}>{meta.label}</span>
                <div className="handoff-item-body">
                  <div className="handoff-item-title">{it.title || '(sin título)'}</div>
                  <div className="handoff-item-meta">
                    {it.listing_name ? (
                      <span className="handoff-pill match">✓ {it.listing_name}</span>
                    ) : it.property ? (
                      <span className="handoff-pill">{it.property}</span>
                    ) : (
                      <span className="handoff-pill muted">sin propiedad</span>
                    )}
                    {ticketable && <span>· prioridad {it.priority}</span>}
                    {it.resolved && <span className="handoff-resolved">· ya resuelto</span>}
                    {typeof it.confidence === 'number' && (
                      <span className="handoff-conf">· {Math.round(it.confidence * 100)}%</span>
                    )}
                  </div>
                  {it.excerpt && <div className="handoff-item-excerpt">“{it.excerpt}”</div>}

                  {ticketable && rs && (
                    <div className="handoff-ticket-form">
                      {rs.status === 'done' ? (
                        <span className="handoff-created">✓ Ticket #{rs.ticketId} creado{it.resolved ? ' (resuelto)' : ''}</span>
                      ) : (
                        <>
                          <select
                            className="handoff-select"
                            value={rs.listingId}
                            onChange={(e) => patchRow(idx, { listingId: e.target.value, error: undefined })}
                          >
                            <option value="">Propiedad…</option>
                            {listings.map((l) => (
                              <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                          </select>
                          <select
                            className="handoff-select"
                            value={rs.category}
                            onChange={(e) => patchRow(idx, { category: e.target.value })}
                          >
                            {TICKET_CATEGORIES.map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                          <select
                            className="handoff-select"
                            value={rs.priority}
                            onChange={(e) => patchRow(idx, { priority: e.target.value })}
                          >
                            {TICKET_PRIORITIES.map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="handoff-btn sm"
                            onClick={() => createOne(idx)}
                            disabled={rs.status === 'creating'}
                          >
                            {rs.status === 'creating' ? 'Creando…' : 'Crear ticket'}
                          </button>
                          {rs.status === 'error' && <span className="handoff-row-error">{rs.error}</span>}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <p className="handoff-foot">
            Modelo: {result.model}. Los ítems marcados “ya resuelto” se crean como ticket resuelto para dejar historial.
          </p>
        </section>
      )}
    </div>
  );
}

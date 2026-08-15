'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { classifyHandoff, HandoffItem, HandoffResult } from '@/app/lib/api/operations';
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

export default function HandoffPage() {
  const router = useRouter();
  const { isChecking, checkAuth } = useAuth();

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HandoffResult | null>(null);

  useEffect(() => {
    if (isChecking) return;
    if (!checkAuth()) router.push('/login');
  }, [isChecking]); // eslint-disable-line react-hooks/exhaustive-deps

  const onClassify = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await classifyHandoff(text.trim());
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo clasificar.');
    } finally {
      setLoading(false);
    }
  };

  const accionables = result ? result.items.filter((i) => i.bucket !== 'info').length : 0;

  return (
    <div className="handoff-page">
      <header className="handoff-head">
        <span className="handoff-eyebrow">Operaciones · Beta</span>
        <h1>Entrega de turno → Dashboard</h1>
        <p>Pega el reporte del turno. Claude lo clasifica y te muestra la propuesta. En esta fase <strong>solo clasifica</strong>, no crea registros todavía.</p>
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
            <span className="handoff-count">
              {result.count} detectados · {accionables} accionables
            </span>
          </div>

          {result.items.length === 0 && (
            <p className="handoff-empty">La IA no detectó items. Prueba con más detalle.</p>
          )}

          {result.items.map((it: HandoffItem, idx: number) => {
            const meta = BUCKET_META[it.bucket] || BUCKET_META.info;
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
                    {it.bucket !== 'info' && <span>· {it.category}</span>}
                    {it.bucket !== 'info' && <span>· prioridad {it.priority}</span>}
                    {it.resolved && <span className="handoff-resolved">· ya resuelto</span>}
                    {typeof it.confidence === 'number' && (
                      <span className="handoff-conf">· {Math.round(it.confidence * 100)}%</span>
                    )}
                  </div>
                  {it.action && it.bucket !== 'info' && (
                    <div className="handoff-item-action">→ {it.action}</div>
                  )}
                  {it.excerpt && <div className="handoff-item-excerpt">“{it.excerpt}”</div>}
                </div>
              </div>
            );
          })}

          <p className="handoff-foot">
            Modelo: {result.model}. Revisa que la clasificación sea correcta — cuando confíes en ella,
            el siguiente paso es conectar la creación de Tickets/Turnovers y el aviso a limpieza.
          </p>
        </section>
      )}
    </div>
  );
}

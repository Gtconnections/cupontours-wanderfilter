'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAgentListing, AgentListingDetail } from '@/app/lib/api/agents';

const GOLD = '#c8a24b';
const INK = '#17191c';
const MUTED = '#717171';

const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: 20, marginBottom: 20,
};
const th: React.CSSProperties = { textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: MUTED, padding: '8px 10px', borderBottom: '1px solid #ebebeb' };
const td: React.CSSProperties = { fontSize: 14, color: INK, padding: '10px', borderBottom: '1px solid #f2f2f2' };
const label: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: MUTED, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 };

const money = (v: string | number) => {
  const n = Number(v || 0);
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
};

export default function AgentPropertyDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const [data, setData] = useState<AgentListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const d = await getAgentListing(id);
        if (active) setData(d);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Error al cargar la propiedad');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <Link href="/admin/agents" style={{ color: GOLD, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
        ← Volver a mi panel
      </Link>

      {loading && <div style={{ ...card, marginTop: 16, color: MUTED }}>Cargando…</div>}
      {error && !loading && (
        <div style={{ ...card, marginTop: 16, color: '#991b1b', background: '#fef2f2', border: '1px solid #fee2e2' }}>
          ⚠️ {error}
        </div>
      )}

      {data && !loading && (
        <>
          <div style={{ marginTop: 14, marginBottom: 6, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: GOLD }}>
            Propiedad
          </div>
          <h1 style={{ margin: '0 0 4px', fontSize: 26, color: INK }}>{data.name}</h1>
          <p style={{ margin: '0 0 18px', color: MUTED, fontSize: 14 }}>
            {data.public_name && data.public_name !== 'public_name' ? data.public_name : ''}
            {data.address ? `${data.public_name && data.public_name !== 'public_name' ? ' · ' : ''}${data.address}` : ''}
          </p>

          {/* Foto principal */}
          {data.principal_photo && (
            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.principal_photo} alt={data.name} style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Ficha */}
          <div style={card}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16 }}>
              <div><div style={label}>Tipo</div><div style={{ color: INK, fontSize: 15 }}>{data.listing_type || '—'}</div></div>
              <div><div style={label}>Estado</div><div style={{ color: INK, fontSize: 15 }}>{data.status || '—'}</div></div>
              <div><div style={label}>Habitaciones</div><div style={{ color: INK, fontSize: 15 }}>{data.beds ?? '—'}</div></div>
              <div><div style={label}>Baños</div><div style={{ color: INK, fontSize: 15 }}>{data.bath ?? '—'}</div></div>
              <div><div style={label}>Huéspedes</div><div style={{ color: INK, fontSize: 15 }}>{data.max_of_guest ?? '—'}</div></div>
              <div><div style={label}>Mi comisión</div><div style={{ color: INK, fontSize: 15, fontWeight: 700 }}>{Number(data.commission_pct)}%</div></div>
            </div>
            {data.description && (
              <p style={{ marginTop: 16, marginBottom: 0, color: '#3f3f46', fontSize: 14, lineHeight: 1.6 }}>{data.description}</p>
            )}
          </div>

          {/* Galería */}
          {data.photos.length > 0 && (
            <div style={card}>
              <h3 style={{ margin: '0 0 12px', fontSize: 16, color: INK }}>Galería</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                {data.photos.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt={`${data.name} ${i + 1}`} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8, border: '1px solid #ebebeb' }} />
                ))}
              </div>
            </div>
          )}

          {/* Contrato */}
          <div style={card}>
            <h3 style={{ margin: '0 0 10px', fontSize: 16, color: INK }}>Contrato</h3>
            {data.agreement ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: INK, fontSize: 15, fontWeight: 600 }}>{data.agreement.title}</div>
                  <div style={{ color: MUTED, fontSize: 13 }}>
                    {data.agreement.expiration_date ? `Vence: ${data.agreement.expiration_date}` : 'Sin fecha de vencimiento'}
                  </div>
                </div>
                {data.agreement.url && (
                  <a href={data.agreement.url} target="_blank" rel="noreferrer" style={{ color: GOLD, fontWeight: 600, fontSize: 14 }}>Ver documento</a>
                )}
              </div>
            ) : (
              <p style={{ color: MUTED, fontSize: 14, margin: 0 }}>Sin contrato registrado.</p>
            )}
          </div>

          {/* P&L histórico */}
          <div style={card}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: INK }}>Producción (últimos meses)</h3>
            {data.pl_history.length === 0 ? (
              <p style={{ color: MUTED, fontSize: 14, margin: 0 }}>Aún no hay reportes de producción.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                  <thead><tr>
                    <th style={th}>Mes</th><th style={th}>Ingresos</th><th style={th}>Gastos</th>
                    <th style={th}>Neto</th><th style={th}>Neto socio</th>
                  </tr></thead>
                  <tbody>
                    {data.pl_history.map((pl, i) => (
                      <tr key={i}>
                        <td style={td}>{pl.date || '—'}</td>
                        <td style={td}>{money(pl.total_income)}</td>
                        <td style={td}>{money(pl.total_expenses)}</td>
                        <td style={td}><strong>{money(pl.income_minus_expenses)}</strong></td>
                        <td style={td}>{money(pl.partner_net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

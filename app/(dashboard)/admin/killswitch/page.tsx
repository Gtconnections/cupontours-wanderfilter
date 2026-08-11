'use client';

import React, { useState, useEffect, useCallback } from 'react';

// OJO: NEXT_PUBLIC_API_URL_LOCAL apunta al backend PHP (gthomework.com), NO a Django.
// Por eso la tarjeta de Django usa su propia URL fija hacia el backend Django real.
const DJANGO_BASE =
  process.env.NEXT_PUBLIC_DJANGO_API_URL ||
  'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api';
const PHP_BASE =
  process.env.NEXT_PUBLIC_PHP_API_URL || 'https://gthomework.com/api';

interface Backend { key: string; name: string; url: string; }
const BACKENDS: Backend[] = [
  { key: 'django', name: 'Backend Principal (Django)', url: `${DJANGO_BASE}/system/killswitch/` },
  { key: 'php', name: 'Backend Servicios (PHP)', url: `${PHP_BASE}/system/killswitch` },
];

const getToken = (): string => {
  try {
    const t = localStorage.getItem('accessToken') || '';
    try { return JSON.parse(t); } catch { return t; }
  } catch { return ''; }
};

const STYLE = `
.ks-wrap { max-width: 820px; margin: 0 auto; padding: 40px 24px 80px; font-family: system-ui, sans-serif; }
.ks-title { font-size: 26px; font-weight: 800; margin: 0 0 4px; }
.ks-sub { color: #888; margin: 0 0 24px; font-size: 14px; }
.ks-warn { background: #fff4f4; border: 1px solid #f3c6c6; color: #a12a2a; border-radius: 12px; padding: 14px 16px; font-size: 13.5px; margin-bottom: 24px; line-height: 1.5; }
.ks-pin { display: flex; gap: 10px; align-items: center; margin-bottom: 24px; }
.ks-pin input { padding: 11px 14px; border: 1px solid #ddd; border-radius: 10px; font-size: 15px; letter-spacing: 3px; width: 160px; }
.ks-pin label { font-weight: 600; font-size: 13px; color: #444; }
.ks-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.ks-card { border: 1px solid #e6e6e6; border-radius: 14px; padding: 20px; }
.ks-card h3 { margin: 0 0 12px; font-size: 15px; }
.ks-pill { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 700; padding: 5px 12px; border-radius: 999px; }
.ks-pill.on { background: #e7f6ec; color: #1c7a3f; }
.ks-pill.off { background: #fdeaea; color: #b12727; }
.ks-pill.unk { background: #f0f0f0; color: #888; }
.ks-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.ks-btns { display: flex; gap: 10px; margin-top: 18px; }
.ks-btn { flex: 1; padding: 11px; border-radius: 10px; border: none; font-weight: 700; font-size: 13px; cursor: pointer; }
.ks-btn.stop { background: #c0392b; color: #fff; }
.ks-btn.stop:hover { background: #a12a2a; }
.ks-btn.go { background: #1c7a3f; color: #fff; }
.ks-btn.go:hover { background: #155f31; }
.ks-btn:disabled { opacity: .5; cursor: not-allowed; }
.ks-msg { margin-top: 22px; padding: 12px 14px; border-radius: 10px; background: #f5f5f5; font-size: 13.5px; }
@media (max-width: 640px) { .ks-cards { grid-template-columns: 1fr; } }
`;

export default function KillSwitchPage() {
  const [state, setState] = useState<Record<string, boolean | null>>({ django: null, php: null });
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const load = useCallback(async (b: Backend) => {
    try {
      const r = await fetch(b.url, { headers: { Authorization: `Token ${getToken()}` }, cache: 'no-store' });
      if (!r.ok) throw new Error(String(r.status));
      const d = await r.json();
      setState((s) => ({ ...s, [b.key]: !!d.maintenance_mode }));
    } catch {
      setState((s) => ({ ...s, [b.key]: null }));
    }
  }, []);

  useEffect(() => { BACKENDS.forEach(load); }, [load]);

  const toggle = async (b: Backend, enable: boolean) => {
    if (!pin.trim()) { setMsg('⚠️ Ingresa el PIN primero.'); return; }
    setBusy(b.key); setMsg('');
    try {
      const r = await fetch(b.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${getToken()}` },
        body: JSON.stringify({ enable, pin: pin.trim() }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setMsg(`❌ ${b.name}: ${d.message || d.detail || 'Error ' + r.status}`);
      } else {
        setState((s) => ({ ...s, [b.key]: !!d.maintenance_mode }));
        setMsg(`✅ ${b.name} → ${d.maintenance_mode ? 'DETENIDO (mantenimiento)' : 'ACTIVO'}`);
      }
    } catch {
      setMsg(`❌ ${b.name}: error de red / CORS.`);
    } finally {
      setBusy(null);
    }
  };

  const pill = (v: boolean | null) =>
    v === null
      ? <span className="ks-pill unk"><span className="ks-dot" /> Desconocido</span>
      : v
        ? <span className="ks-pill off"><span className="ks-dot" /> DETENIDO</span>
        : <span className="ks-pill on"><span className="ks-dot" /> ACTIVO</span>;

  return (
    <div className="ks-wrap">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <h1 className="ks-title">Kill Switch / Mantenimiento</h1>
      <p className="ks-sub">Detiene por completo cada backend (HTTP 503 en toda la API). Requiere PIN.</p>

      <div className="ks-warn">
        <b>Cuidado:</b> al DETENER un backend, todo el sitio que depende de él deja de funcionar (incluido este dashboard,
        excepto esta misma página y el login). Para reactivar, vuelve aquí e ingresa el PIN → “Reactivar”.
      </div>

      <div className="ks-pin">
        <label>PIN:</label>
        <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" />
      </div>

      <div className="ks-cards">
        {BACKENDS.map((b) => (
          <div className="ks-card" key={b.key}>
            <h3>{b.name}</h3>
            {pill(state[b.key])}
            <div className="ks-btns">
              <button className="ks-btn stop" disabled={busy === b.key} onClick={() => toggle(b, true)}>Detener</button>
              <button className="ks-btn go" disabled={busy === b.key} onClick={() => toggle(b, false)}>Reactivar</button>
            </div>
          </div>
        ))}
      </div>

      {msg && <div className="ks-msg">{msg}</div>}
    </div>
  );
}

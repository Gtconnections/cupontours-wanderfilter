'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { checkAvailability, createReservation, AvailabilityResult } from '@/app/lib/api/booking';
import './booking-widget.css';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);
const pad = (n: number) => String(n).padStart(2, '0');
const ds = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const todayStr = () => new Date().toISOString().slice(0, 10);
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WD = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

interface Props { listingId: number; propertyName?: string; }
interface DayInfo { available: boolean; price: number; }
const isAvail = (v: number | boolean | string) => v === 1 || v === true || v === '1';

const Chevron = ({ left }: { left?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points={left ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} /></svg>
);

export default function BookingWidget({ listingId }: Props) {
  const start = new Date();
  const [viewYear, setViewYear] = useState(start.getFullYear());
  const [viewMonth, setViewMonth] = useState(start.getMonth() + 1); // 1-12

  const [monthMap, setMonthMap] = useState<Record<string, DayInfo>>({});
  const [loadingMonth, setLoadingMonth] = useState(true);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [quote, setQuote] = useState<AvailabilityResult | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [rangeError, setRangeError] = useState<string | null>(null);

  const [step, setStep] = useState<'calendar' | 'details' | 'done'>('calendar');
  const [guests, setGuests] = useState(1);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ code: string | number | null; total: number } | null>(null);

  // Cargar disponibilidad del mes visible
  const loadMonth = useCallback(async () => {
    const mStart = ds(viewYear, viewMonth, 1);
    const nextM = viewMonth === 12 ? 1 : viewMonth + 1;
    const nextY = viewMonth === 12 ? viewYear + 1 : viewYear;
    const mEnd = ds(nextY, nextM, 1);
    setLoadingMonth(true);
    try {
      const r = await checkAvailability(listingId, mStart, mEnd);
      const map: Record<string, DayInfo> = {};
      (r.nightly || []).forEach((n) => { map[n.date] = { available: isAvail(n.available), price: Number(n.price) || 0 }; });
      setMonthMap(map);
    } catch {
      setMonthMap({});
    } finally {
      setLoadingMonth(false);
    }
  }, [listingId, viewYear, viewMonth]);

  useEffect(() => { loadMonth(); }, [loadMonth]);

  // Cotizar el rango elegido
  useEffect(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) { setQuote(null); return; }
    let cancelled = false;
    setQuoting(true); setRangeError(null);
    checkAvailability(listingId, checkIn, checkOut)
      .then((r) => {
        if (cancelled) return;
        if (!r.available) { setRangeError('Hay noches ocupadas en ese rango. Elige otras fechas.'); setCheckOut(''); setQuote(null); }
        else setQuote(r);
      })
      .catch((e) => { if (!cancelled) setRangeError(e instanceof Error ? e.message : 'Error verificando'); })
      .finally(() => { if (!cancelled) setQuoting(false); });
    return () => { cancelled = true; };
  }, [listingId, checkIn, checkOut]);

  const changeMonth = (delta: number) => {
    let m = viewMonth + delta, y = viewYear;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setViewMonth(m); setViewYear(y);
  };

  const onDayClick = (date: string) => {
    setStep('calendar');
    if (!checkIn || (checkIn && checkOut)) { setCheckIn(date); setCheckOut(''); setQuote(null); setRangeError(null); return; }
    if (date <= checkIn) { setCheckIn(date); return; }
    setCheckOut(date);
  };

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.email) { setError('Completa nombre, apellido y email.'); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await createReservation({
        listing_id: listingId, arrival: checkIn, departure: checkOut,
        first_name: form.first_name, last_name: form.last_name,
        email: form.email, phone: form.phone, guests, message: form.message,
      });
      setConfirmation({ code: res.reservation.confirmation_code, total: res.reservation.total });
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'done' && confirmation) {
    return (
      <div className="bw">
        <div className="bw-done">
          <span className="bw-done-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </span>
          <h4>¡Reserva confirmada!</h4>
          <p>{checkIn} → {checkOut}</p>
          {confirmation.code != null && <p>Código: <strong>{confirmation.code}</strong></p>}
          <p>Total: <strong>{fmt(confirmation.total)}</strong></p>
          <p style={{ marginTop: '10px' }}>Te enviaremos los detalles a <strong>{form.email}</strong>. No se realizó ningún cargo todavía.</p>
        </div>
      </div>
    );
  }

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0=Dom
  const today = todayStr();

  return (
    <div className="bw">
      {step === 'calendar' && (
        <>
          <div className="bw-cal-head">
            <div className="bw-cal-title">{MONTHS[viewMonth - 1]} {viewYear}</div>
            <div className="bw-cal-nav">
              <button onClick={() => changeMonth(-1)} aria-label="Mes anterior"><Chevron left /></button>
              <button onClick={() => changeMonth(1)} aria-label="Mes siguiente"><Chevron /></button>
            </div>
          </div>

          <div className="bw-cal-weekdays">{WD.map((w) => <span key={w}>{w}</span>)}</div>

          <div className="bw-cal-grid">
            {Array.from({ length: firstWeekday }).map((_, i) => <div key={`b-${i}`} className="bw-cal-day bw-cal-empty" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const date = ds(viewYear, viewMonth, d);
              const info = monthMap[date];
              const past = date < today;
              const occupied = !!info && !info.available;
              const noData = !info;
              const disabled = past || occupied || noData;
              const isIn = date === checkIn;
              const isOut = date === checkOut;
              const inRange = !!checkIn && !!checkOut && date > checkIn && date < checkOut;
              const cls = ['bw-cal-day'];
              if (past) cls.push('bw-cal-past');
              if (occupied) cls.push('bw-cal-occupied');
              if (isIn || isOut) cls.push('bw-cal-endpoint');
              if (inRange) cls.push('bw-cal-inrange');
              return (
                <button key={date} className={cls.join(' ')} disabled={disabled} onClick={() => onDayClick(date)}>
                  <span>{d}</span>
                  {!disabled && info && info.price > 0 && <span className="bw-cal-price">{fmt(info.price)}</span>}
                </button>
              );
            })}
          </div>

          <div className="bw-cal-legend">
            <span><i className="bw-legend-avail" /> Disponible</span>
            <span><i className="bw-legend-occ" /> Ocupado</span>
          </div>

          {loadingMonth && <div className="bw-cal-hint">Cargando disponibilidad…</div>}
          {!checkIn && !loadingMonth && <div className="bw-cal-hint">Elige tu fecha de llegada</div>}
          {checkIn && !checkOut && <div className="bw-cal-hint">Ahora elige la fecha de salida</div>}
          {rangeError && <div className="bw-status bw-status--no">{rangeError}</div>}
          {quoting && <div className="bw-status bw-status--info">Calculando total…</div>}

          {quote && quote.available && (
            <>
              <div className="bw-breakdown">
                <div className="bw-line"><span>{fmt(quote.nights ? quote.nightly_total / quote.nights : 0)} × {quote.nights} noche{quote.nights === 1 ? '' : 's'}</span><span>{fmt(quote.nightly_total)}</span></div>
                {quote.cleaning_fee > 0 && <div className="bw-line"><span>Limpieza</span><span>{fmt(quote.cleaning_fee)}</span></div>}
                <div className="bw-line bw-total"><span>Total</span><span>{fmt(quote.total)}</span></div>
              </div>
              <div className="bw-field">
                <label>Huéspedes</label>
                <input className="bw-input" type="number" min={1} value={guests} onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))} />
              </div>
              <button className="bw-btn" onClick={() => { setError(null); setStep('details'); }}>Continuar</button>
            </>
          )}
        </>
      )}

      {step === 'details' && quote && (
        <>
          <div className="bw-breakdown">
            <div className="bw-line"><span>{checkIn} → {checkOut}</span><span>{quote.nights} noche{quote.nights === 1 ? '' : 's'}</span></div>
            <div className="bw-line bw-total"><span>Total</span><span>{fmt(quote.total)}</span></div>
          </div>
          <div className="bw-row">
            <div className="bw-field"><label>Nombre *</label><input className="bw-input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
            <div className="bw-field"><label>Apellido *</label><input className="bw-input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
          </div>
          <div className="bw-field"><label>Email *</label><input className="bw-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="bw-field"><label>Teléfono</label><input className="bw-input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="bw-field"><label>Mensaje (opcional)</label><input className="bw-input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Solicitudes especiales" /></div>
          {error && <div className="bw-err">{error}</div>}
          <button className="bw-btn" disabled={submitting} onClick={handleSubmit}>{submitting ? 'Reservando…' : 'Confirmar reserva'}</button>
          <button className="bw-btn bw-btn--ghost" onClick={() => setStep('calendar')}>Volver</button>
        </>
      )}
    </div>
  );
}

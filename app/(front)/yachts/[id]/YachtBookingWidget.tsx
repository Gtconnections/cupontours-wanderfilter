'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getYachtAvailability,
  createYachtReservation,
  YachtDayAvail,
  YachtDuration,
} from '@/app/lib/api/yachtBooking';
import { sendYachtBookingRequest } from '@/app/lib/api';
import './yacht-booking-widget.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WD = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const pad = (n: number) => String(n).padStart(2, '0');
const ds = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const OCCASIONS = [
  { value: 'fun_day_at_sea', label: 'Fun day at sea' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'family_trip', label: 'Family trip' },
  { value: 'bachelorette', label: 'Bachelorette' },
  { value: 'business_lunch', label: 'Business lunch' },
  { value: 'other', label: 'Other' },
];

const DURATIONS: { value: YachtDuration; label: string; kind: 'full' | 'morning' | 'afternoon' }[] = [
  { value: 'full_day', label: 'Full day', kind: 'full' },
  { value: 'half_day_in_the_morning', label: 'Half day · Morning', kind: 'morning' },
  { value: 'half_day_in_the_afternoon', label: 'Half day · Afternoon', kind: 'afternoon' },
];

interface Props { yachtId: number; yachtName?: string; }

const Chevron = ({ left }: { left?: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points={left ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} /></svg>
);

export default function YachtBookingWidget({ yachtId, yachtName }: Props) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [days, setDays] = useState<Record<string, YachtDayAvail>>({});
  const [priceFull, setPriceFull] = useState(0);
  const [priceHalf, setPriceHalf] = useState(0);
  const [loadingMonth, setLoadingMonth] = useState(true);

  const [step, setStep] = useState<'calendar' | 'details' | 'done'>('calendar');
  const [selDate, setSelDate] = useState<string>('');
  const [duration, setDuration] = useState<YachtDuration | ''>('');

  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', occasion: 'fun_day_at_sea', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMonth = useCallback(async () => {
    setLoadingMonth(true);
    try {
      const r = await getYachtAvailability(yachtId, viewYear, viewMonth);
      setDays(r.days || {});
      setPriceFull(Number(r.price_full_day) || 0);
      setPriceHalf(Number(r.price_half_day) || 0);
    } catch {
      setDays({});
    } finally {
      setLoadingMonth(false);
    }
  }, [yachtId, viewYear, viewMonth]);

  useEffect(() => { loadMonth(); }, [loadMonth]);

  const resetSel = () => { setSelDate(''); setDuration(''); };
  const prevMonth = () => { resetSel(); if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1); } else setViewMonth((m) => m - 1); };
  const nextMonth = () => { resetSel(); if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1); } else setViewMonth((m) => m + 1); };

  const firstDow = new Date(viewYear, viewMonth - 1, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const todayStr = ds(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const dayAvail = (dateStr: string): YachtDayAvail => days[dateStr] || { full_day: true, morning: true, afternoon: true };
  const dayHasFree = (a: YachtDayAvail) => a.full_day || a.morning || a.afternoon;
  const dayPartial = (a: YachtDayAvail) => dayHasFree(a) && !(a.full_day && a.morning && a.afternoon);

  const selAvail = selDate ? dayAvail(selDate) : null;
  const durationEnabled = (kind: 'full' | 'morning' | 'afternoon') =>
    selAvail ? (kind === 'full' ? selAvail.full_day : kind === 'morning' ? selAvail.morning : selAvail.afternoon) : false;
  const durationPrice = (d: YachtDuration) => (d === 'full_day' ? priceFull : priceHalf);

  const pickDay = (dateStr: string) => {
    const a = dayAvail(dateStr);
    if (dateStr < todayStr || !dayHasFree(a)) return;
    setSelDate(dateStr);
    setDuration('');
  };

  const submit = async () => {
    if (!selDate || !duration) return;
    if (!form.first_name.trim() || !form.email.trim()) { setError('First name and email are required.'); return; }
    setSubmitting(true); setError(null);
    try {
      const durLabel = DURATIONS.find((d) => d.value === duration)?.label || duration;
      await createYachtReservation({
        yacht_id: yachtId,
        date: selDate,
        duration: duration as YachtDuration,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        occasion: form.occasion,
        observation: form.message.trim(),
      });
      try {
        await sendYachtBookingRequest({
          yachtId: String(yachtId),
          yachtName: yachtName || '',
          charterStart: `${selDate} (${durLabel})`,
          charterEnd: selDate,
          totalDays: 1,
          client: {
            fullName: `${form.first_name} ${form.last_name}`.trim(),
            email: form.email.trim(),
            phoneNumber: form.phone.trim(),
            specialRequests: form.message.trim(),
          },
        });
      } catch { /* email best-effort; the DB reservation already succeeded */ }
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not complete the reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  const selPrice = duration ? durationPrice(duration as YachtDuration) : 0;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  /* ---------- DONE ---------- */
  if (step === 'done') {
    return (
      <div className="ybw">
        <div className="ybw-done">
          <div className="ybw-done-check">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h3>Charter requested</h3>
          <p>Your reservation for {yachtName || 'this yacht'} on <strong>{selDate}</strong> is booked. Our concierge will confirm the details shortly.</p>
          <button className="ybw-btn" onClick={() => { setStep('calendar'); resetSel(); setForm({ first_name: '', last_name: '', email: '', phone: '', occasion: 'fun_day_at_sea', message: '' }); loadMonth(); }}>
            Book another date
          </button>
        </div>
      </div>
    );
  }

  /* ---------- DETAILS ---------- */
  if (step === 'details') {
    const durLabel = DURATIONS.find((d) => d.value === duration)?.label || '';
    return (
      <div className="ybw">
        <div className="ybw-summary">
          <div>
            <span className="ybw-summary-label">Selected charter</span>
            <div className="ybw-summary-main">{selDate} · {durLabel}</div>
          </div>
          <div className="ybw-summary-price">{fmt(selPrice)}</div>
        </div>

        <div className="ybw-fields">
          <div className="ybw-row2">
            <input className="ybw-input" placeholder="First name *" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <input className="ybw-input" placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
          <input className="ybw-input" type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="ybw-input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <select className="ybw-input" value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })}>
            {OCCASIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <textarea className="ybw-input ybw-textarea" placeholder="Special requests (catering, decoration, etc.)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>

        {error && <div className="ybw-error">{error}</div>}

        <div className="ybw-actions">
          <button className="ybw-btn ybw-btn--ghost" onClick={() => { setStep('calendar'); setError(null); }} disabled={submitting}>Back</button>
          <button className="ybw-btn" onClick={submit} disabled={submitting}>{submitting ? 'Booking…' : 'Confirm reservation'}</button>
        </div>
        <p className="ybw-disclaimer">No payment is charged now. This request also reaches our concierge by email.</p>
      </div>
    );
  }

  /* ---------- CALENDAR ---------- */
  return (
    <div className="ybw">
      <div className="ybw-cal-head">
        <button className="ybw-nav" onClick={prevMonth} aria-label="Previous month"><Chevron left /></button>
        <span className="ybw-cal-title">{MONTHS[viewMonth - 1]} {viewYear}</span>
        <button className="ybw-nav" onClick={nextMonth} aria-label="Next month"><Chevron /></button>
      </div>

      <div className="ybw-wd">{WD.map((w) => <span key={w}>{w}</span>)}</div>

      <div className={`ybw-grid ${loadingMonth ? 'ybw-grid--loading' : ''}`}>
        {cells.map((d, i) => {
          if (d === null) return <span key={`b${i}`} className="ybw-cell ybw-cell--empty" />;
          const dateStr = ds(viewYear, viewMonth, d);
          const a = dayAvail(dateStr);
          const past = dateStr < todayStr;
          const free = dayHasFree(a) && !past;
          const sel = selDate === dateStr;
          const cls = ['ybw-cell'];
          if (past) cls.push('ybw-cell--past');
          else if (!dayHasFree(a)) cls.push('ybw-cell--booked');
          else cls.push('ybw-cell--free');
          if (dayPartial(a) && !past) cls.push('ybw-cell--partial');
          if (sel) cls.push('ybw-cell--sel');
          return (
            <button key={dateStr} className={cls.join(' ')} disabled={!free} onClick={() => pickDay(dateStr)}>
              {d}
            </button>
          );
        })}
      </div>

      <div className="ybw-legend">
        <span><i className="ybw-dot ybw-dot--free" /> Available</span>
        <span><i className="ybw-dot ybw-dot--partial" /> Partly booked</span>
        <span><i className="ybw-dot ybw-dot--booked" /> Booked</span>
      </div>

      {selDate && (
        <div className="ybw-slots">
          <span className="ybw-slots-label">Choose a slot for {selDate}</span>
          <div className="ybw-slot-row">
            {DURATIONS.map((d) => {
              const on = durationEnabled(d.kind);
              return (
                <button
                  key={d.value}
                  className={`ybw-slot ${duration === d.value ? 'active' : ''}`}
                  disabled={!on}
                  onClick={() => setDuration(d.value)}
                >
                  <span className="ybw-slot-label">{d.label}</span>
                  <span className="ybw-slot-price">{fmt(durationPrice(d.value))}</span>
                </button>
              );
            })}
          </div>
          <button className="ybw-btn ybw-btn--full" disabled={!duration} onClick={() => { setStep('details'); setError(null); }}>
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

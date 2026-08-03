'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import {
  getGuest,
  updateGuest,
  addIncidental,
  deleteIncidental,
  GuestDetail,
} from '@/app/lib/api/operations';
import '../guests.css';

interface PageProps { params: Promise<{ id: string }>; }

const money = (s: string) => `$${Number(s || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const DURATION_LABEL: Record<string, string> = {
  full_day: 'Full day',
  half_day_in_the_morning: 'Half day · Morning',
  half_day_in_the_afternoon: 'Half day · Afternoon',
};

export default function GuestDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const guestId = Number(id);
  const router = useRouter();
  const { isChecking, checkAuth } = useAuth();

  const [guest, setGuest] = useState<GuestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [incTitle, setIncTitle] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incDate, setIncDate] = useState('');
  const [incNotes, setIncNotes] = useState('');
  const [addingInc, setAddingInc] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const g = await getGuest(guestId);
      setGuest(g);
      setFullName(g.full_name); setPhone(g.phone); setNotes(g.notes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load guest');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isChecking) return;
    if (!checkAuth()) { router.push('/login'); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking]);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateGuest(guestId, { full_name: fullName.trim(), phone: phone.trim(), notes });
    } catch { /* */ } finally { setSavingProfile(false); }
  };

  const submitIncidental = async () => {
    if (!incTitle.trim()) return;
    setAddingInc(true);
    try {
      await addIncidental(guestId, {
        title: incTitle.trim(),
        amount: incAmount ? Number(incAmount) : 0,
        date: incDate || undefined,
        notes: incNotes.trim(),
      });
      setIncTitle(''); setIncAmount(''); setIncDate(''); setIncNotes('');
      await load();
    } catch { /* */ } finally { setAddingInc(false); }
  };

  const removeIncidental = async (incId: number) => {
    try { await deleteIncidental(incId); await load(); } catch { /* */ }
  };

  if (loading) return <div className="crm-container"><div className="crm-loading">Loading guest…</div></div>;
  if (error || !guest) return <div className="crm-container"><div className="crm-err">{error || 'Guest not found'}</div><Link href="/admin/guests" className="crm-link">← Back to guests</Link></div>;

  return (
    <div className="crm-container">
      <div className="crm-header">
        <div>
          <Link href="/admin/guests" className="crm-link">← Guests</Link>
          <h2>{guest.full_name}</h2>
          <div className="crm-sub">{guest.email}{guest.phone ? ` · ${guest.phone}` : ''}</div>
        </div>
      </div>

      <div className="crm-stats">
        <div className="crm-stat"><span className="crm-stat-num">{guest.totals.reservations}</span><span className="crm-stat-label">Reservations</span></div>
        <div className="crm-stat"><span className="crm-stat-num">{money(guest.totals.total_spend)}</span><span className="crm-stat-label">Total spend</span></div>
        <div className="crm-stat"><span className="crm-stat-num">{money(guest.totals.incidentals_total)}</span><span className="crm-stat-label">Incidentals</span></div>
      </div>

      <div className="crm-grid2">
        {/* Profile */}
        <div className="crm-card">
          <h3 className="crm-card-title">Profile</h3>
          <div className="crm-field"><label>Full name</label><input className="crm-input" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
          <div className="crm-field"><label>Email</label><input className="crm-input" value={guest.email} disabled /></div>
          <div className="crm-field"><label>Phone</label><input className="crm-input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div className="crm-field"><label>Notes</label><textarea className="crm-input crm-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferences, VIP status, allergies…" /></div>
          <button className="crm-btn crm-btn--sm" onClick={saveProfile} disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save profile'}</button>
        </div>

        {/* Incidentals */}
        <div className="crm-card">
          <h3 className="crm-card-title">Incidentals</h3>
          {guest.incidentals.length === 0 ? (
            <div className="crm-muted" style={{ marginBottom: 12 }}>No extra charges recorded.</div>
          ) : (
            <div className="crm-inc-list">
              {guest.incidentals.map((i) => (
                <div key={i.id} className="crm-inc-row">
                  <div>
                    <div className="crm-name">{i.title} · <span className="crm-inc">{money(i.amount)}</span></div>
                    <div className="crm-muted">{i.date || i.created_at.slice(0, 10)}{i.notes ? ` · ${i.notes}` : ''}</div>
                  </div>
                  <button className="crm-del" onClick={() => removeIncidental(i.id)}>Remove</button>
                </div>
              ))}
            </div>
          )}
          <div className="crm-inc-form">
            <input className="crm-input" placeholder="Charge (e.g. Late checkout)" value={incTitle} onChange={(e) => setIncTitle(e.target.value)} />
            <div className="crm-inc-form-row">
              <input className="crm-input" type="number" min="0" step="0.01" placeholder="Amount" value={incAmount} onChange={(e) => setIncAmount(e.target.value)} />
              <input className="crm-input" type="date" value={incDate} onChange={(e) => setIncDate(e.target.value)} />
            </div>
            <input className="crm-input" placeholder="Notes (optional)" value={incNotes} onChange={(e) => setIncNotes(e.target.value)} />
            <button className="crm-btn crm-btn--sm" onClick={submitIncidental} disabled={addingInc || !incTitle.trim()}>{addingInc ? 'Adding…' : 'Add incidental'}</button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="crm-card" style={{ marginTop: 20 }}>
        <h3 className="crm-card-title">Reservation history</h3>
        {guest.property_reservations.length === 0 && guest.yacht_reservations.length === 0 ? (
          <div className="crm-muted">No reservations linked to this email yet.</div>
        ) : (
          <div className="crm-hist">
            {guest.property_reservations.map((r, i) => (
              <div key={`p${i}`} className="crm-hist-row">
                <span className="crm-tag crm-tag--prop">Property</span>
                <div className="crm-hist-main">
                  <div className="crm-name">{r.listing_name}</div>
                  <div className="crm-muted">{r.start_date} → {r.end_date || '—'} · {r.nights} nights · {r.guests} guests · {r.confirmation_code}</div>
                </div>
                <div className="crm-strong">{money(r.earnings)}</div>
              </div>
            ))}
            {guest.yacht_reservations.map((r, i) => (
              <div key={`y${i}`} className="crm-hist-row">
                <span className="crm-tag crm-tag--yacht">Yacht</span>
                <div className="crm-hist-main">
                  <div className="crm-name">{r.yacht_name}</div>
                  <div className="crm-muted">{r.date} · {DURATION_LABEL[r.duration || ''] || r.duration}{r.occasion ? ` · ${r.occasion}` : ''}</div>
                </div>
                <div className="crm-strong">{money(r.earnings)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

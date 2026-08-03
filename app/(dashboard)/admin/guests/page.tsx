'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getGuests, createGuest, GuestListItem } from '@/app/lib/api/operations';
import './guests.css';

const money = (s: string) => `$${Number(s || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

function NewGuestModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!fullName.trim() || !email.trim()) { setErr('Name and email are required.'); return; }
    setSaving(true); setErr(null);
    try {
      await createGuest({ full_name: fullName.trim(), email: email.trim(), phone: phone.trim(), notes: notes.trim() });
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not create guest');
      setSaving(false);
    }
  };

  return (
    <div className="crm-modal-overlay" onClick={onClose}>
      <div className="crm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>New Guest</h3>
        <div className="crm-field"><label>Full name *</label><input className="crm-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" /></div>
        <div className="crm-field"><label>Email *</label><input className="crm-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@email.com" /></div>
        <div className="crm-field"><label>Phone</label><input className="crm-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 …" /></div>
        <div className="crm-field"><label>Notes</label><input className="crm-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferences, VIP, etc." /></div>
        {err && <div className="crm-err">{err}</div>}
        <div className="crm-modal-actions">
          <button className="crm-btn crm-btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="crm-btn" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Create guest'}</button>
        </div>
      </div>
    </div>
  );
}

export default function GuestsPage() {
  const router = useRouter();
  const { isChecking, checkAuth } = useAuth();
  const [guests, setGuests] = useState<GuestListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await getGuests(search || undefined);
      setGuests(r.guests);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load guests');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (isChecking) return;
    if (!checkAuth()) { router.push('/login'); return; }
    const t = setTimeout(() => { load(); }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking, load]);

  return (
    <div className="crm-container">
      <div className="crm-header">
        <div>
          <span className="crm-breadcrumb">Properties Business</span>
          <h2>Guests</h2>
          <div className="crm-sub">Guest profiles unified by email, with reservation history and incidentals.</div>
        </div>
        <button className="crm-btn" onClick={() => setShowModal(true)}>+ New Guest</button>
      </div>

      <div className="crm-toolbar">
        <input className="crm-input" placeholder="Search by name, email or phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error && <div className="crm-err">{error}</div>}

      {loading ? (
        <div className="crm-loading">Loading guests…</div>
      ) : guests.length === 0 ? (
        <div className="crm-empty">No guests yet. They appear from reservations (run the backfill) or add one with “+ New Guest”.</div>
      ) : (
        <div className="crm-list">
          <div className="crm-row crm-row--head">
            <div>Guest</div><div>Reservations</div><div>Total spend</div><div>Incidentals</div>
          </div>
          {guests.map((g) => (
            <Link key={g.id} href={`/admin/guests/${g.id}`} className="crm-row crm-row--link">
              <div>
                <div className="crm-name">{g.full_name}</div>
                <div className="crm-muted">{g.email}{g.phone ? ` · ${g.phone}` : ''}</div>
              </div>
              <div>
                <span className="crm-count">{g.reservations}</span>
                <span className="crm-muted"> ({g.property_reservations}P / {g.yacht_reservations}Y)</span>
              </div>
              <div className="crm-strong">{money(g.total_spend)}</div>
              <div>{Number(g.incidentals_total) > 0 ? <span className="crm-inc">{money(g.incidentals_total)}</span> : <span className="crm-muted">—</span>}</div>
            </Link>
          ))}
        </div>
      )}

      {showModal && <NewGuestModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); load(); }} />}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getListingsNamesAndIdsSync } from '@/app/lib/api/propertiesAdmin';
import {
  getTurnovers,
  updateTurnover,
  getVendors,
  getChecklistTemplates,
  Turnover,
  TurnoverSummary,
  Vendor,
  ChecklistTemplate,
} from '@/app/lib/api/operations';
import '../operations.css';

interface ListingOption { id: number; name: string; }

const TRN_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];
const DAY_WINDOWS = [15, 30, 60, 90];
const PAGE_SIZE = 12;
const labelFrom = (arr: { value: string; label: string }[], v: string) =>
  arr.find((x) => x.value === v)?.label || v;

const fmtDay = (s: string | null) => {
  if (!s) return '—';
  const d = new Date(`${s}T00:00:00`);
  return d.toLocaleDateString('en', { weekday: 'short', day: '2-digit', month: 'short' });
};

const EMPTY_SUMMARY: TurnoverSummary = { today: 0, next7: 0, same_day: 0, unassigned: 0 };

/* ---------------- Turnover row ---------------- */
function TurnoverRow({ trn, vendors, templates, expanded, onToggle, onSaved }: {
  trn: Turnover;
  vendors: Vendor[];
  templates: ChecklistTemplate[];
  expanded: boolean;
  onToggle: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<string>(trn.status);
  const [cleaner, setCleaner] = useState<string>(trn.cleaner ? String(trn.cleaner) : '');
  const [notes, setNotes] = useState<string>(trn.notes ?? '');
  const [tpl, setTpl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setStatus(trn.status);
    setCleaner(trn.cleaner ? String(trn.cleaner) : '');
    setNotes(trn.notes ?? '');
    setTpl('');
  }, [trn]);

  const save = async (overrideStatus?: string) => {
    setSaving(true); setErr(null);
    try {
      await updateTurnover({
        listing_id: trn.listing,
        checkout_date: trn.checkout_date,
        status: overrideStatus || status,
        cleaner: cleaner ? Number(cleaner) : null,
        notes,
        template: (!trn.checklist && tpl) ? Number(tpl) : undefined,
      });
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save');
      setSaving(false);
    }
  };

  return (
    <div className={`ops-trn-row ${trn.same_day ? 'sameday' : ''}`}>
      <div className="ops-trn-top" onClick={onToggle}>
        <div>
          <div className="ops-trn-date">
            {fmtDay(trn.checkout_date)}
            <span className={`ops-badge ops-trn-st-${trn.status}`}>{trn.status_display}</span>
            {trn.same_day
              ? <span className="ops-badge-sameday">Same-day</span>
              : trn.gap_days !== null
                ? <span className="ops-badge-gap">{trn.gap_days}d gap</span>
                : <span className="ops-badge-gap">No next booking</span>}
          </div>
          <div className="ops-trn-sub">{trn.listing_name}</div>
          <div className="ops-trn-flow">
            <span>Out {trn.departing_code}</span>
            <span className="ops-trn-arrow">→</span>
            {trn.next_checkin
              ? <span>In {fmtDay(trn.next_checkin)}{trn.next_code ? ` (${trn.next_code})` : ''}</span>
              : <span>no upcoming check-in</span>}
          </div>
        </div>
        <div className="ops-trn-right">
          <span>{trn.cleaner_name || 'Unassigned'}</span>
          {trn.checklist ? <span>Checklist {trn.checklist_done}/{trn.checklist_total}</span> : <span>No checklist</span>}
        </div>
      </div>

      {expanded && (
        <div className="ops-detail">
          <div className="ops-field">
            <label>Status</label>
            <select className="ops-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {TRN_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="ops-field">
            <label>Cleaner</label>
            <select className="ops-select" value={cleaner} onChange={(e) => setCleaner(e.target.value)}>
              <option value="">— Unassigned —</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>

          <div className="ops-field ops-desc">
            <label>Notes</label>
            <input className="ops-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Access, special instructions, etc." />
          </div>

          <div className="ops-field ops-desc">
            <label>Checklist</label>
            {trn.checklist ? (
              <div className="ops-trn-sub">
                Attached · {trn.checklist_done}/{trn.checklist_total} done. Manage it in the Checklists tab.
              </div>
            ) : templates.length ? (
              <select className="ops-select" value={tpl} onChange={(e) => setTpl(e.target.value)}>
                <option value="">— Attach a checklist from template —</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            ) : (
              <div className="ops-trn-sub">No templates yet. Create one in the Checklists tab to attach here.</div>
            )}
          </div>

          {err && <div className="ops-err">{err}</div>}

          <div className="ops-detail-actions">
            <button className="ops-btn ops-btn--sm" onClick={() => save()} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            {status !== 'done' && (
              <button className="ops-btn ops-btn--dark ops-btn--sm" onClick={() => save('done')} disabled={saving}>
                Set as done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Page ---------------- */
export default function TurnoversPage() {
  const router = useRouter();
  const { isChecking, checkAuth } = useAuth();

  const [listings, setListings] = useState<ListingOption[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [turnovers, setTurnovers] = useState<Turnover[]>([]);
  const [summary, setSummary] = useState<TurnoverSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [days, setDays] = useState(30);
  const [statusFilter, setStatusFilter] = useState('');
  const [propFilter, setPropFilter] = useState<string>('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await getTurnovers({
        days,
        status: statusFilter || undefined,
        listing_id: propFilter ? Number(propFilter) : undefined,
      });
      setSummary(res.summary);
      setTurnovers(res.turnovers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load turnovers');
    } finally {
      setLoading(false);
    }
  }, [days, statusFilter, propFilter]);

  useEffect(() => {
    if (isChecking) return;
    if (!checkAuth()) { router.push('/login'); return; }
    (async () => {
      try {
        const [ls, vs, tpls] = await Promise.all([getListingsNamesAndIdsSync(), getVendors(), getChecklistTemplates()]);
        setListings((ls || []).map((l) => ({ id: l.id, name: l.name })));
        setVendors(vs || []);
        setTemplates(tpls || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load data');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking]);

  useEffect(() => {
    if (isChecking) return;
    const t = setTimeout(() => { load(); }, 200);
    return () => clearTimeout(t);
  }, [isChecking, load]);

  useEffect(() => { setPage(1); }, [days, statusFilter, propFilter]);

  const totalPages = Math.max(1, Math.ceil(turnovers.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = turnovers.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const summaryCards: { key: keyof TurnoverSummary; cls: string; label: string }[] = [
    { key: 'today', cls: 'stock', label: 'Today' },
    { key: 'next7', cls: 'progreso', label: 'Next 7 days' },
    { key: 'same_day', cls: 'urgentes', label: 'Same-day' },
    { key: 'unassigned', cls: 'abiertos', label: 'Unassigned' },
  ];

  return (
    <div className="ops-container">
      <div className="ops-header">
        <div>
          <span className="ops-breadcrumb">Operations</span>
          <h2>Turnovers</h2>
          <div className="ops-sub">Cleaning &amp; prep between guests, derived from your synced reservations.</div>
        </div>
      </div>

      <div className="ops-kpis">
        {summaryCards.map((k) => (
          <div key={k.key} className={`ops-kpi ${k.cls}`}>
            <div className="ops-kpi-num">{summary[k.key]}</div>
            <div className="ops-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="ops-toolbar">
        <div className="ops-filterbtns">
          {DAY_WINDOWS.map((d) => (
            <button key={d} className={`ops-fbtn ${days === d ? 'active' : ''}`} onClick={() => setDays(d)}>{d}d</button>
          ))}
        </div>
        <div className="ops-filterbtns">
          <button className={`ops-fbtn ${statusFilter === '' ? 'active' : ''}`} onClick={() => setStatusFilter('')}>All</button>
          {TRN_STATUSES.map((s) => (
            <button key={s.value} className={`ops-fbtn ${statusFilter === s.value ? 'active' : ''}`} onClick={() => setStatusFilter(s.value)}>{s.label}</button>
          ))}
        </div>
        <select className="ops-select" value={propFilter} onChange={(e) => setPropFilter(e.target.value)}>
          <option value="">All properties</option>
          {listings.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      {error && <div className="ops-err">{error}</div>}

      {loading ? (
        <div className="ops-loading">Loading turnovers…</div>
      ) : turnovers.length === 0 ? (
        <div className="ops-empty">No turnovers in this window. They appear automatically from confirmed reservations (check-outs).</div>
      ) : (
        <>
          <div className="ops-list">
            {pageItems.map((t) => {
              const key = `${t.listing}-${t.checkout_date}-${t.departing_code}`;
              return (
                <TurnoverRow
                  key={key}
                  trn={t}
                  vendors={vendors}
                  templates={templates}
                  expanded={expanded === key}
                  onToggle={() => setExpanded(expanded === key ? null : key)}
                  onSaved={load}
                />
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="ops-pager">
              <button className="ops-btn ops-btn--ghost ops-btn--sm" onClick={() => setPage((pv) => Math.max(1, pv - 1))} disabled={current === 1}>Prev</button>
              <span className="ops-pager-info">Page {current} of {totalPages} · {turnovers.length} turnovers</span>
              <button className="ops-btn ops-btn--ghost ops-btn--sm" onClick={() => setPage((pv) => Math.min(totalPages, pv + 1))} disabled={current === totalPages}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

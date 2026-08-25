'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getListingsNamesAndIdsSync } from '@/app/lib/api/propertiesAdmin';
import {
  getTickets,
  createTicket,
  updateTicket,
  getVendors,
  createVendor,
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getChecklists,
  createChecklist,
  setChecklistItem,
  setChecklistStatus,
  deleteChecklist,
  getChecklistTemplates,
  createChecklistTemplate,
  deleteChecklistTemplate,
  Ticket,
  TicketKpis,
  Vendor,
  InventoryItem,
  Checklist,
  ChecklistTemplate,
} from '@/app/lib/api/operations';
import './operations.css';

interface ListingOption { id: number; name: string; }

const CATEGORIES = [
  { value: 'plomeria', label: 'Plumbing' },
  { value: 'electricidad', label: 'Electrical' },
  { value: 'aire', label: 'Air conditioning' },
  { value: 'cerrajeria', label: 'Locksmith' },
  { value: 'pintura', label: 'Paint / Finishes' },
  { value: 'electrodomesticos', label: 'Appliances' },
  { value: 'limpieza', label: 'Cleaning / Pest control' },
  { value: 'otro', label: 'Other' },
];
const INV_CATEGORIES = [
  { value: 'limpieza', label: 'Cleaning' },
  { value: 'amenidades', label: 'Amenities' },
  { value: 'lenceria', label: 'Linens / Towels' },
  { value: 'cocina', label: 'Kitchen' },
  { value: 'bano', label: 'Bathroom' },
  { value: 'mantenimiento', label: 'Maintenance' },
  { value: 'otro', label: 'Other' },
];
const PRIORITIES = [
  { value: 'baja', label: 'Low' },
  { value: 'media', label: 'Medium' },
  { value: 'alta', label: 'High' },
  { value: 'urgente', label: 'Urgent' },
];
const STATUSES = [
  { value: 'abierto', label: 'Open' },
  { value: 'en_progreso', label: 'In progress' },
  { value: 'resuelto', label: 'Resolved' },
];
const CHECKLIST_TYPES = [
  { value: 'check_in', label: 'Check-in' },
  { value: 'check_out', label: 'Check-out' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'other', label: 'Other' },
];

const labelFrom = (arr: { value: string; label: string }[], v: string) =>
  arr.find((x) => x.value === v)?.label || v;

const EMPTY_KPIS: TicketKpis = { urgentes: 0, abiertos: 0, en_progreso: 0, resueltos: 0, stock_bajo: 0 };

const fmtDate = (s: string | null) => {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' });
};
const num = (s: string | null) => (s === null || s === '' ? 0 : Number(s));
const PAGE_SIZE = 12;

function paginate<T>(arr: T[], pg: number): { items: T[]; totalPages: number; current: number } {
  const totalPages = Math.max(1, Math.ceil(arr.length / PAGE_SIZE));
  const current = Math.min(pg, totalPages);
  return { items: arr.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE), totalPages, current };
}


function Pager({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="ops-pager">
      <button className="ops-btn ops-btn--ghost ops-btn--sm" onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</button>
      <span className="ops-pager-info">Page {page} of {totalPages}</span>
      <button className="ops-btn ops-btn--ghost ops-btn--sm" onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Next</button>
    </div>
  );
}

/* ---------------- Ticket row ---------------- */
function TicketRow({ ticket, vendors, expanded, onToggle, onUpdated }: {
  ticket: Ticket;
  vendors: Vendor[];
  expanded: boolean;
  onToggle: () => void;
  onUpdated: (t: Ticket) => void;
}) {
  const [vendorId, setVendorId] = useState<string>(ticket.vendor ? String(ticket.vendor) : '');
  const [status, setStatus] = useState<string>(ticket.status);
  const [priority, setPriority] = useState<string>(ticket.priority);
  const [cost, setCost] = useState<string>(ticket.cost ?? '');
  const [note, setNote] = useState<string>(ticket.resolution_note ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setVendorId(ticket.vendor ? String(ticket.vendor) : '');
    setStatus(ticket.status);
    setPriority(ticket.priority);
    setCost(ticket.cost ?? '');
    setNote(ticket.resolution_note ?? '');
  }, [ticket]);

  const save = async (overrideStatus?: string) => {
    setSaving(true); setErr(null);
    try {
      const updated = await updateTicket(ticket.id, {
        status: overrideStatus || status,
        vendor: vendorId ? Number(vendorId) : null,
        priority,
        cost: cost === '' ? null : cost,
        resolution_note: note,
      });
      onUpdated(updated);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ops-ticket">
      <div className="ops-ticket-top" onClick={onToggle}>
        <div>
          <div className="ops-ticket-title">
            {ticket.title}
            <span className={`ops-badge ops-pri-${ticket.priority}`}>{labelFrom(PRIORITIES, ticket.priority)}</span>
            <span className={`ops-badge ops-st-${ticket.status}`}>{labelFrom(STATUSES, ticket.status)}</span>
          </div>
          <div className="ops-ticket-meta">
            {ticket.listing_name} · {labelFrom(CATEGORIES, ticket.category)}
            {ticket.vendor_name ? ` · ${ticket.vendor_name}` : ''}
          </div>
        </div>
        <div className="ops-ticket-right">
          #{ticket.id}<br />{fmtDate(ticket.created_at)}
        </div>
      </div>

      {expanded && (
        <div className="ops-detail">
          {ticket.description && <div className="ops-desc">{ticket.description}</div>}

          <div className="ops-field">
            <label>Vendor</label>
            <select className="ops-select" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
              <option value="">— Unassigned —</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>

          <div className="ops-field">
            <label>Status</label>
            <select className="ops-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="ops-field">
            <label>Priority</label>
            <select className="ops-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div className="ops-field">
            <label>Cost (USD)</label>
            <input className="ops-input" type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
          </div>

          <div className="ops-field ops-desc">
            <label>Resolution note</label>
            <input className="ops-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was done, parts used, etc." />
          </div>

          {err && <div className="ops-err">{err}</div>}

          <div className="ops-detail-actions">
            <button className="ops-btn ops-btn--sm" onClick={() => save()} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            {status !== 'resuelto' && (
              <button className="ops-btn ops-btn--dark ops-btn--sm" onClick={() => save('resuelto')} disabled={saving}>
                Mark resolved
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Inventory row ---------------- */
function InventoryRow({ item, onChanged, onDeleted }: {
  item: InventoryItem;
  onChanged: (it: InventoryItem) => void;
  onDeleted: (id: number) => void;
}) {
  const [busy, setBusy] = useState(false);

  const adjust = async (delta: number) => {
    const next = Math.max(0, num(item.current_qty) + delta);
    setBusy(true);
    try {
      const updated = await updateInventoryItem(item.id, { current_qty: next });
      onChanged(updated);
    } catch { /* */ } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try { await deleteInventoryItem(item.id); onDeleted(item.id); }
    catch { setBusy(false); }
  };

  return (
    <div className={`ops-inv-row ${item.low_stock ? 'low' : ''}`}>
      <div>
        <div className="ops-inv-name">
          {item.name}
          {item.low_stock && <span className="ops-badge-low">Low stock</span>}
        </div>
        <div className="ops-inv-sub">{item.listing ? item.listing_name : 'All properties'} · {labelFrom(INV_CATEGORIES, item.category)}</div>
      </div>
      <div>
        <span className="ops-inv-cell-label">Quantity</span>
        <div className="ops-qtybox">
          <button className="ops-qtybtn" onClick={() => adjust(-1)} disabled={busy}>−</button>
          <span className="ops-inv-qty">{num(item.current_qty)}</span>
          <button className="ops-qtybtn" onClick={() => adjust(1)} disabled={busy}>+</button>
        </div>
        <div className="ops-inv-sub">{item.unit}</div>
      </div>
      <div>
        <span className="ops-inv-cell-label">Minimum</span>
        {num(item.min_qty)}
      </div>
      <div>
        <span className="ops-inv-cell-label">Unit cost</span>
        {item.unit_cost ? `$${Number(item.unit_cost).toFixed(2)}` : '—'}
      </div>
      <div>
        <span className="ops-inv-cell-label">Updated</span>
        <span className="ops-inv-sub">{fmtDate(item.updated_at)}</span>
      </div>
      <div>
        <button className="ops-inv-del" onClick={remove} disabled={busy}>Remove</button>
      </div>
    </div>
  );
}

/* ---------------- Checklist run card ---------------- */
function ChecklistCard({ chk, expanded, onToggle, onChanged, onDeleted }: {
  chk: Checklist;
  expanded: boolean;
  onToggle: () => void;
  onChanged: (c: Checklist) => void;
  onDeleted: (id: number) => void;
}) {
  const [busy, setBusy] = useState(false);
  const total = chk.total_items;
  const done = chk.done_items;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const completed = chk.status === 'completed';

  const toggleItem = async (itemId: number, current: boolean) => {
    setBusy(true);
    try { onChanged(await setChecklistItem(chk.id, itemId, !current)); }
    catch { /* */ } finally { setBusy(false); }
  };

  const toggleStatus = async () => {
    setBusy(true);
    try { onChanged(await setChecklistStatus(chk.id, completed ? 'open' : 'completed')); }
    catch { /* */ } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try { await deleteChecklist(chk.id); onDeleted(chk.id); }
    catch { setBusy(false); }
  };

  return (
    <div className={`ops-chk-card ${completed ? 'done' : ''}`}>
      <div className="ops-chk-top" onClick={onToggle}>
        <div>
          <div className="ops-chk-title">
            {chk.name}
            <span className="ops-badge-type">{labelFrom(CHECKLIST_TYPES, chk.type)}</span>
            {completed && <span className="ops-badge-done">Completed</span>}
          </div>
          <div className="ops-chk-sub">{chk.listing_name} · {fmtDate(chk.created_at)}</div>
        </div>
        <div className="ops-chk-prog">
          <div className="ops-chk-prog-num">{done}/{total}</div>
          <div className={`ops-chk-bar ${total && done === total ? 'full' : ''}`}>
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {expanded && (
        <>
          <div className="ops-chk-items">
            {chk.items.map((it) => (
              <label key={it.id} className={`ops-chk-item ${it.done ? 'checked' : ''}`}>
                <input type="checkbox" checked={it.done} disabled={busy} onChange={() => toggleItem(it.id, it.done)} />
                <span>{it.text}</span>
              </label>
            ))}
            {chk.items.length === 0 && <div className="ops-chk-sub">This checklist has no items.</div>}
          </div>
          <div className="ops-detail-actions">
            <button className="ops-btn ops-btn--dark ops-btn--sm" onClick={toggleStatus} disabled={busy}>
              {completed ? 'Reopen' : 'Mark complete'}
            </button>
            <button className="ops-btn ops-btn--ghost ops-btn--sm" onClick={remove} disabled={busy}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Template card ---------------- */
function TemplateCard({ tpl, expanded, onToggle, onDeleted }: {
  tpl: ChecklistTemplate;
  expanded: boolean;
  onToggle: () => void;
  onDeleted: (id: number) => void;
}) {
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    try { await deleteChecklistTemplate(tpl.id); onDeleted(tpl.id); }
    catch { setBusy(false); }
  };
  return (
    <div className="ops-chk-card">
      <div className="ops-chk-top" onClick={onToggle}>
        <div>
          <div className="ops-chk-title">
            {tpl.name}
            <span className="ops-badge-type">{labelFrom(CHECKLIST_TYPES, tpl.type)}</span>
          </div>
          <div className="ops-chk-sub">{tpl.item_count} item{tpl.item_count === 1 ? '' : 's'}</div>
        </div>
      </div>
      {expanded && (
        <>
          <div className="ops-chk-items">
            {tpl.items.map((it) => <div key={it.id} className="ops-tpl-item-line">• {it.text}</div>)}
          </div>
          <div className="ops-detail-actions">
            <button className="ops-btn ops-btn--ghost ops-btn--sm" onClick={remove} disabled={busy}>Delete template</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Modal: new ticket ---------------- */
function TicketModal({ listings, onClose, onCreated }: {
  listings: ListingOption[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [listing, setListing] = useState<string>(listings.length ? String(listings[0].id) : '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('plomeria');
  const [priority, setPriority] = useState('media');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!listing || !title.trim()) { setErr('Property and title are required.'); return; }
    setSaving(true); setErr(null);
    try {
      await createTicket({ listing: Number(listing), title: title.trim(), category, priority, description: description.trim() });
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not create ticket');
      setSaving(false);
    }
  };

  return (
    <div className="ops-modal-overlay" onClick={onClose}>
      <div className="ops-modal" onClick={(e) => e.stopPropagation()}>
        <h3>New Ticket</h3>

        <div className="ops-field">
          <label>Property *</label>
          <select className="ops-select" value={listing} onChange={(e) => setListing(e.target.value)}>
            {listings.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        <div className="ops-field">
          <label>Problem title *</label>
          <input className="ops-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Leak under the bathroom sink" />
        </div>

        <div className="ops-field">
          <label>Category *</label>
          <select className="ops-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="ops-field">
          <label>Priority</label>
          <select className="ops-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div className="ops-field">
          <label>Description</label>
          <input className="ops-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Problem details" />
        </div>

        {err && <div className="ops-err">{err}</div>}

        <div className="ops-modal-actions">
          <button className="ops-btn ops-btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="ops-btn" onClick={submit} disabled={saving}>{saving ? 'Creating…' : 'Create ticket'}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Modal: new vendor ---------------- */
function VendorModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void; }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('otro');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) { setErr('Name is required.'); return; }
    setSaving(true); setErr(null);
    try {
      await createVendor({ name: name.trim(), category, phone: phone.trim(), email: email.trim(), notes: notes.trim() });
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not create vendor');
      setSaving(false);
    }
  };

  return (
    <div className="ops-modal-overlay" onClick={onClose}>
      <div className="ops-modal" onClick={(e) => e.stopPropagation()}>
        <h3>New Vendor</h3>

        <div className="ops-field">
          <label>Name *</label>
          <input className="ops-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. General Services Inc." />
        </div>

        <div className="ops-field">
          <label>Specialty</label>
          <select className="ops-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="ops-field">
          <label>Phone</label>
          <input className="ops-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+507 …" />
        </div>

        <div className="ops-field">
          <label>Email</label>
          <input className="ops-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@vendor.com" />
        </div>

        <div className="ops-field">
          <label>Notes</label>
          <input className="ops-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Hours, rates, etc." />
        </div>

        {err && <div className="ops-err">{err}</div>}

        <div className="ops-modal-actions">
          <button className="ops-btn ops-btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="ops-btn" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Modal: new inventory item ---------------- */
function InventoryModal({ listings, onClose, onCreated }: {
  listings: ListingOption[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [listing, setListing] = useState<string>('');
  const [category, setCategory] = useState('limpieza');
  const [unit, setUnit] = useState('units');
  const [currentQty, setCurrentQty] = useState('0');
  const [minQty, setMinQty] = useState('0');
  const [unitCost, setUnitCost] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) { setErr('Name is required.'); return; }
    setSaving(true); setErr(null);
    try {
      await createInventoryItem({
        name: name.trim(),
        listing: listing ? Number(listing) : null,
        category,
        unit: unit.trim() || 'units',
        current_qty: Number(currentQty) || 0,
        min_qty: Number(minQty) || 0,
        unit_cost: unitCost === '' ? null : Number(unitCost),
      });
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not create item');
      setSaving(false);
    }
  };

  return (
    <div className="ops-modal-overlay" onClick={onClose}>
      <div className="ops-modal" onClick={(e) => e.stopPropagation()}>
        <h3>New Inventory Item</h3>

        <div className="ops-field">
          <label>Name *</label>
          <input className="ops-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bath towels" />
        </div>

        <div className="ops-field">
          <label>Property</label>
          <select className="ops-select" value={listing} onChange={(e) => setListing(e.target.value)}>
            <option value="">All properties</option>
            {listings.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        <div className="ops-field">
          <label>Category</label>
          <select className="ops-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {INV_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="ops-field">
          <label>Unit</label>
          <input className="ops-input" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="units, rolls, liters…" />
        </div>

        <div className="ops-field">
          <label>Current quantity</label>
          <input className="ops-input" type="number" min="0" step="1" value={currentQty} onChange={(e) => setCurrentQty(e.target.value)} />
        </div>

        <div className="ops-field">
          <label>Minimum quantity (threshold)</label>
          <input className="ops-input" type="number" min="0" step="1" value={minQty} onChange={(e) => setMinQty(e.target.value)} />
        </div>

        <div className="ops-field">
          <label>Unit cost (USD)</label>
          <input className="ops-input" type="number" min="0" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="0.00" />
        </div>

        {err && <div className="ops-err">{err}</div>}

        <div className="ops-modal-actions">
          <button className="ops-btn ops-btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="ops-btn" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Modal: new checklist (from template) ---------------- */
function ChecklistModal({ listings, templates, onClose, onCreated }: {
  listings: ListingOption[];
  templates: ChecklistTemplate[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [listing, setListing] = useState<string>(listings.length ? String(listings[0].id) : '');
  const [template, setTemplate] = useState<string>(templates.length ? String(templates[0].id) : '');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!listing || !template) { setErr('Property and template are required.'); return; }
    setSaving(true); setErr(null);
    try {
      await createChecklist({ listing: Number(listing), template: Number(template), name: name.trim() || undefined });
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not create checklist');
      setSaving(false);
    }
  };

  return (
    <div className="ops-modal-overlay" onClick={onClose}>
      <div className="ops-modal" onClick={(e) => e.stopPropagation()}>
        <h3>New Checklist</h3>

        {templates.length === 0 ? (
          <div className="ops-empty">Create a template first, then start a checklist from it.</div>
        ) : (
          <>
            <div className="ops-field">
              <label>Property *</label>
              <select className="ops-select" value={listing} onChange={(e) => setListing(e.target.value)}>
                {listings.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            <div className="ops-field">
              <label>Template *</label>
              <select className="ops-select" value={template} onChange={(e) => setTemplate(e.target.value)}>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name} ({labelFrom(CHECKLIST_TYPES, t.type)})</option>)}
              </select>
            </div>

            <div className="ops-field">
              <label>Name (optional)</label>
              <input className="ops-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Defaults to the template name" />
            </div>

            {err && <div className="ops-err">{err}</div>}
          </>
        )}

        <div className="ops-modal-actions">
          <button className="ops-btn ops-btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
          {templates.length > 0 && (
            <button className="ops-btn" onClick={submit} disabled={saving}>{saving ? 'Creating…' : 'Start checklist'}</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Modal: new template ---------------- */
function TemplateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void; }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('cleaning');
  const [itemsText, setItemsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) { setErr('Name is required.'); return; }
    const items = itemsText.split('\n').map((x) => x.trim()).filter(Boolean);
    if (items.length === 0) { setErr('Add at least one item (one per line).'); return; }
    setSaving(true); setErr(null);
    try {
      await createChecklistTemplate({ name: name.trim(), type, items });
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not create template');
      setSaving(false);
    }
  };

  return (
    <div className="ops-modal-overlay" onClick={onClose}>
      <div className="ops-modal" onClick={(e) => e.stopPropagation()}>
        <h3>New Template</h3>

        <div className="ops-field">
          <label>Name *</label>
          <input className="ops-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard check-out" />
        </div>

        <div className="ops-field">
          <label>Type</label>
          <select className="ops-select" value={type} onChange={(e) => setType(e.target.value)}>
            {CHECKLIST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="ops-field">
          <label>Items (one per line)</label>
          <textarea className="ops-textarea" value={itemsText} onChange={(e) => setItemsText(e.target.value)} placeholder={'Strip the beds\nCheck for damages\nRestock amenities\nTake out the trash'} />
        </div>

        {err && <div className="ops-err">{err}</div>}

        <div className="ops-modal-actions">
          <button className="ops-btn ops-btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="ops-btn" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save template'}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */
function OperationsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isChecking, checkAuth } = useAuth();

  const [listings, setListings] = useState<ListingOption[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [kpis, setKpis] = useState<TicketKpis>(EMPTY_KPIS);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [invLoading, setInvLoading] = useState(true);
  const [chkLoading, setChkLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<'maintenance' | 'inventory' | 'checklists'>(() => {
    const t = searchParams.get('tab');
    if (t === 'inventory') return 'inventory';
    if (t === 'checklists') return 'checklists';
    return 'maintenance';
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [propFilter, setPropFilter] = useState<string>('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const [invSearch, setInvSearch] = useState('');
  const [invProp, setInvProp] = useState<string>('');
  const [invLowOnly, setInvLowOnly] = useState(false);

  const [chkSub, setChkSub] = useState<'runs' | 'templates'>('runs');
  const [chkProp, setChkProp] = useState<string>('');
  const [chkStatus, setChkStatus] = useState<string>('');
  const [chkExpanded, setChkExpanded] = useState<number | null>(null);
  const [tplExpanded, setTplExpanded] = useState<number | null>(null);
  const [ticketPage, setTicketPage] = useState(1);
  const [invPage, setInvPage] = useState(1);
  const [chkPage, setChkPage] = useState(1);
  const [tplPage, setTplPage] = useState(1);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showInvModal, setShowInvModal] = useState(false);
  const [showChkModal, setShowChkModal] = useState(false);
  const [showTplModal, setShowTplModal] = useState(false);

  useEffect(() => {
    const t = searchParams.get('tab');
    setTab(t === 'inventory' ? 'inventory' : t === 'checklists' ? 'checklists' : 'maintenance');
  }, [searchParams]);

  const goTab = (t: 'maintenance' | 'inventory' | 'checklists') => {
    setTab(t);
    const q = t === 'inventory' ? '?tab=inventory' : t === 'checklists' ? '?tab=checklists' : '';
    router.replace(`/admin/operations${q}`);
  };

  const loadVendors = useCallback(async () => {
    try { setVendors((await getVendors()) || []); } catch { /* */ }
  }, []);

  const loadTemplates = useCallback(async () => {
    try { setTemplates((await getChecklistTemplates()) || []); } catch { /* */ }
  }, []);

  const loadTickets = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await getTickets({
        search: search || undefined,
        status: statusFilter || undefined,
        listing_id: propFilter ? Number(propFilter) : undefined,
      });
      setKpis(res.kpis);
      setTickets(res.tickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load tickets');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, propFilter]);

  const loadInventory = useCallback(async () => {
    setInvLoading(true); setError(null);
    try {
      const res = await getInventory({
        search: invSearch || undefined,
        listing_id: invProp ? Number(invProp) : undefined,
        low_stock: invLowOnly || undefined,
      });
      setInventory(res.items);
      setKpis((prev) => ({ ...prev, stock_bajo: res.stock_bajo }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load inventory');
    } finally {
      setInvLoading(false);
    }
  }, [invSearch, invProp, invLowOnly]);

  const loadChecklists = useCallback(async () => {
    setChkLoading(true); setError(null);
    try {
      const res = await getChecklists({
        listing_id: chkProp ? Number(chkProp) : undefined,
        status: chkStatus || undefined,
      });
      setChecklists(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load checklists');
    } finally {
      setChkLoading(false);
    }
  }, [chkProp, chkStatus]);

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
    const t = setTimeout(() => { loadTickets(); }, 250);
    return () => clearTimeout(t);
  }, [isChecking, loadTickets]);

  useEffect(() => {
    if (isChecking) return;
    const t = setTimeout(() => { loadInventory(); }, 250);
    return () => clearTimeout(t);
  }, [isChecking, loadInventory]);

  useEffect(() => {
    if (isChecking) return;
    const t = setTimeout(() => { loadChecklists(); }, 250);
    return () => clearTimeout(t);
  }, [isChecking, loadChecklists]);

  const onTicketUpdated = (t: Ticket) => {
    setTickets((prev) => prev.map((x) => (x.id === t.id ? t : x)));
    loadTickets();
  };
  const onInvChanged = (it: InventoryItem) => {
    setInventory((prev) => prev.map((x) => (x.id === it.id ? it : x)));
    loadInventory();
  };
  const onInvDeleted = (id: number) => {
    setInventory((prev) => prev.filter((x) => x.id !== id));
    loadInventory();
  };
  const onChkChanged = (c: Checklist) => {
    setChecklists((prev) => prev.map((x) => (x.id === c.id ? c : x)));
  };
  const onChkDeleted = (id: number) => {
    setChecklists((prev) => prev.filter((x) => x.id !== id));
  };
  const onTplDeleted = (id: number) => {
    setTemplates((prev) => prev.filter((x) => x.id !== id));
  };

  useEffect(() => { setTicketPage(1); }, [search, statusFilter, propFilter]);
  useEffect(() => { setInvPage(1); }, [invSearch, invProp, invLowOnly]);
  useEffect(() => { setChkPage(1); }, [chkProp, chkStatus]);

  const pgTickets = paginate(tickets, ticketPage);
  const pgInventory = paginate(inventory, invPage);
  const pgChecklists = paginate(checklists, chkPage);
  const pgTemplates = paginate(templates, tplPage);

  const kpiCards: { key: keyof TicketKpis; cls: string; label: string }[] = [
    { key: 'urgentes', cls: 'urgentes', label: 'Urgent' },
    { key: 'abiertos', cls: 'abiertos', label: 'Open' },
    { key: 'en_progreso', cls: 'progreso', label: 'In progress' },
    { key: 'resueltos', cls: 'resueltos', label: 'Resolved' },
    { key: 'stock_bajo', cls: 'stock', label: 'Low stock' },
  ];

  return (
    <div className="ops-container">
      <div className="ops-header">
        <div>
          <span className="ops-breadcrumb">Operations</span>
          <h2>Operations</h2>
          <div className="ops-sub">Maintenance, vendors, inventory and turnover checklists for your synced properties.</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tab === 'maintenance' && (
            <>
              <button className="ops-btn ops-btn--ghost" onClick={() => setShowVendorModal(true)}>+ Vendor</button>
              <button className="ops-btn" onClick={() => setShowTicketModal(true)}>+ New Ticket</button>
            </>
          )}
          {tab === 'inventory' && (
            <button className="ops-btn" onClick={() => setShowInvModal(true)}>+ New Item</button>
          )}
          {tab === 'checklists' && (
            chkSub === 'runs'
              ? <button className="ops-btn" onClick={() => setShowChkModal(true)}>+ New Checklist</button>
              : <button className="ops-btn" onClick={() => setShowTplModal(true)}>+ New Template</button>
          )}
        </div>
      </div>

      <div className="ops-kpis">
        {kpiCards.map((k) => (
          <div key={k.key} className={`ops-kpi ${k.cls}`}>
            <div className="ops-kpi-num">{kpis[k.key]}</div>
            <div className="ops-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="ops-tabs">
        <button className={`ops-tab ${tab === 'maintenance' ? 'active' : ''}`} onClick={() => goTab('maintenance')}>Maintenance</button>
        <button className={`ops-tab ${tab === 'inventory' ? 'active' : ''}`} onClick={() => goTab('inventory')}>Inventory</button>
        <button className={`ops-tab ${tab === 'checklists' ? 'active' : ''}`} onClick={() => goTab('checklists')}>Checklists</button>
      </div>

      {tab === 'maintenance' && (
        <>
          <div className="ops-toolbar">
            <input className="ops-input" placeholder="Search by title or description…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="ops-filterbtns">
              <button className={`ops-fbtn ${statusFilter === '' ? 'active' : ''}`} onClick={() => setStatusFilter('')}>All</button>
              {STATUSES.map((s) => (
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
            <div className="ops-loading">Loading tickets…</div>
          ) : tickets.length === 0 ? (
            <div className="ops-empty">No tickets match these filters. Create the first one with “+ New Ticket”.</div>
          ) : (
            <>
              <div className="ops-list">
                {pgTickets.items.map((t) => (
                  <TicketRow
                    key={t.id}
                    ticket={t}
                    vendors={vendors}
                    expanded={expanded === t.id}
                    onToggle={() => setExpanded(expanded === t.id ? null : t.id)}
                    onUpdated={onTicketUpdated}
                  />
                ))}
              </div>
              <Pager page={pgTickets.current} totalPages={pgTickets.totalPages} onPage={setTicketPage} />
            </>
          )}
        </>
      )}

      {tab === 'inventory' && (
        <>
          <div className="ops-toolbar">
            <input className="ops-input" placeholder="Search item…" value={invSearch} onChange={(e) => setInvSearch(e.target.value)} />
            <div className="ops-filterbtns">
              <button className={`ops-fbtn ${!invLowOnly ? 'active' : ''}`} onClick={() => setInvLowOnly(false)}>All</button>
              <button className={`ops-fbtn ${invLowOnly ? 'active' : ''}`} onClick={() => setInvLowOnly(true)}>Low stock only</button>
            </div>
            <select className="ops-select" value={invProp} onChange={(e) => setInvProp(e.target.value)}>
              <option value="">All properties</option>
              {listings.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          {error && <div className="ops-err">{error}</div>}

          {invLoading ? (
            <div className="ops-loading">Loading inventory…</div>
          ) : inventory.length === 0 ? (
            <div className="ops-empty">No items match these filters. Add the first one with “+ New Item”.</div>
          ) : (
            <>
              <div className="ops-list">
                <div className="ops-inv-row ops-inv-head">
                  <div>Item</div><div>Quantity</div><div>Minimum</div><div>Unit cost</div><div>Updated</div><div></div>
                </div>
                {pgInventory.items.map((it) => (
                  <InventoryRow key={it.id} item={it} onChanged={onInvChanged} onDeleted={onInvDeleted} />
                ))}
              </div>
              <Pager page={pgInventory.current} totalPages={pgInventory.totalPages} onPage={setInvPage} />
            </>
          )}
        </>
      )}

      {tab === 'checklists' && (
        <>
          <div className="ops-seg">
            <button className={chkSub === 'runs' ? 'active' : ''} onClick={() => setChkSub('runs')}>Checklists</button>
            <button className={chkSub === 'templates' ? 'active' : ''} onClick={() => setChkSub('templates')}>Templates</button>
          </div>

          {chkSub === 'runs' && (
            <>
              <div className="ops-toolbar">
                <div className="ops-filterbtns">
                  <button className={`ops-fbtn ${chkStatus === '' ? 'active' : ''}`} onClick={() => setChkStatus('')}>All</button>
                  <button className={`ops-fbtn ${chkStatus === 'open' ? 'active' : ''}`} onClick={() => setChkStatus('open')}>Open</button>
                  <button className={`ops-fbtn ${chkStatus === 'completed' ? 'active' : ''}`} onClick={() => setChkStatus('completed')}>Completed</button>
                </div>
                <select className="ops-select" value={chkProp} onChange={(e) => setChkProp(e.target.value)}>
                  <option value="">All properties</option>
                  {listings.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              {error && <div className="ops-err">{error}</div>}

              {chkLoading ? (
                <div className="ops-loading">Loading checklists…</div>
              ) : checklists.length === 0 ? (
                <div className="ops-empty">No checklists yet. Start one from a template with “+ New Checklist”.</div>
              ) : (
                <>
                  <div className="ops-list">
                    {pgChecklists.items.map((c) => (
                      <ChecklistCard
                        key={c.id}
                        chk={c}
                        expanded={chkExpanded === c.id}
                        onToggle={() => setChkExpanded(chkExpanded === c.id ? null : c.id)}
                        onChanged={onChkChanged}
                        onDeleted={onChkDeleted}
                      />
                    ))}
                  </div>
                  <Pager page={pgChecklists.current} totalPages={pgChecklists.totalPages} onPage={setChkPage} />
                </>
              )}
            </>
          )}

          {chkSub === 'templates' && (
            <>
              {templates.length === 0 ? (
                <div className="ops-empty">No templates yet. Create one with “+ New Template” (e.g. Check-out, Cleaning).</div>
              ) : (
                <>
                  <div className="ops-list">
                    {pgTemplates.items.map((t) => (
                      <TemplateCard
                        key={t.id}
                        tpl={t}
                        expanded={tplExpanded === t.id}
                        onToggle={() => setTplExpanded(tplExpanded === t.id ? null : t.id)}
                        onDeleted={onTplDeleted}
                      />
                    ))}
                  </div>
                  <Pager page={pgTemplates.current} totalPages={pgTemplates.totalPages} onPage={setTplPage} />
                </>
              )}
            </>
          )}
        </>
      )}

      {showTicketModal && (
        <TicketModal
          listings={listings}
          onClose={() => setShowTicketModal(false)}
          onCreated={() => { setShowTicketModal(false); loadTickets(); }}
        />
      )}
      {showVendorModal && (
        <VendorModal
          onClose={() => setShowVendorModal(false)}
          onCreated={() => { setShowVendorModal(false); loadVendors(); }}
        />
      )}
      {showInvModal && (
        <InventoryModal
          listings={listings}
          onClose={() => setShowInvModal(false)}
          onCreated={() => { setShowInvModal(false); loadInventory(); }}
        />
      )}
      {showChkModal && (
        <ChecklistModal
          listings={listings}
          templates={templates}
          onClose={() => setShowChkModal(false)}
          onCreated={() => { setShowChkModal(false); loadChecklists(); }}
        />
      )}
      {showTplModal && (
        <TemplateModal
          onClose={() => setShowTplModal(false)}
          onCreated={() => { setShowTplModal(false); loadTemplates(); }}
        />
      )}
    </div>
  );
}

export default function OperationsPage() {
  return (
    <Suspense fallback={<div className="ops-loading">Loading…</div>}>
      <OperationsInner />
    </Suspense>
  );
}

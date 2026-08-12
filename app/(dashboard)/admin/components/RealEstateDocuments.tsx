'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getRealEstateDocuments,
  uploadRealEstateDocuments,
  updateRealEstateDocument,
  deleteRealEstateDocument,
  RealEstateDocument,
} from '@/app/lib/api/realAdmin';

const fmtSize = (b: number) => {
  if (!b) return '';
  const mb = b / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
};

export default function RealEstateDocuments({ realEstateId }: { realEstateId: number }) {
  const [docs, setDocs] = useState<RealEstateDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [makePublic, setMakePublic] = useState(true);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setDocs(await getRealEstateDocuments(realEstateId));
    } catch (e) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Error cargando documentos' });
    } finally {
      setLoading(false);
    }
  }, [realEstateId]);

  useEffect(() => { load(); }, [load]);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const invalid = files.find((f) => f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf'));
    if (invalid) { setMsg({ type: 'err', text: 'Solo se permiten archivos PDF.' }); if (fileRef.current) fileRef.current.value = ''; return; }
    try {
      setUploading(true); setMsg(null);
      await uploadRealEstateDocuments(realEstateId, files, makePublic);
      await load();
      setMsg({ type: 'ok', text: `${files.length} documento(s) subido(s).` });
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error al subir' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const togglePublic = async (d: RealEstateDocument) => {
    const next = d.is_public ? 0 : 1;
    setDocs((ds) => ds.map((x) => (x.id === d.id ? { ...x, is_public: next } : x)));
    try { await updateRealEstateDocument(realEstateId, d.id, { is_public: next }); }
    catch { setDocs((ds) => ds.map((x) => (x.id === d.id ? { ...x, is_public: d.is_public } : x))); setMsg({ type: 'err', text: 'No se pudo cambiar la visibilidad.' }); }
  };

  const remove = async (d: RealEstateDocument) => {
    if (!confirm(`¿Eliminar "${d.title}"?`)) return;
    try { await deleteRealEstateDocument(realEstateId, d.id); setDocs((ds) => ds.filter((x) => x.id !== d.id)); }
    catch (e) { setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Error al eliminar' }); }
  };

  return (
    <div className="wander-detail-info-section" style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h3 className="wander-detail-info-title" style={{ margin: 0 }}>Documentos (PDF)</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555', cursor: 'pointer' }}>
            <input type="checkbox" checked={makePublic} onChange={(e) => setMakePublic(e.target.checked)} />
            Público
          </label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}
          >
            {uploading ? 'Subiendo…' : '+ Subir PDF'}
          </button>
          <input ref={fileRef} type="file" accept="application/pdf,.pdf" multiple hidden onChange={onPick} />
        </div>
      </div>

      {msg && (
        <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, fontSize: 13, background: msg.type === 'ok' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'ok' ? '#166534' : '#991b1b', border: `1px solid ${msg.type === 'ok' ? '#bbf7d0' : '#fee2e2'}` }}>
          {msg.text}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        {loading ? (
          <p style={{ color: '#999', fontSize: 13 }}>Cargando…</p>
        ) : docs.length === 0 ? (
          <p style={{ color: '#999', fontSize: 13 }}>Sin documentos todavía. Sube brochures, planos o listas de precios en PDF.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {docs.map((d) => (
              <li key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid #ececec', borderRadius: 10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ color: '#111', fontWeight: 600, fontSize: 14, textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</a>
                  <span style={{ fontSize: 12, color: '#999' }}>{(d.file_type || 'pdf').toUpperCase()}{d.size ? ` · ${fmtSize(d.size)}` : ''}</span>
                </div>
                <button type="button" onClick={() => togglePublic(d)} title="Público / privado"
                  style={{ border: '1px solid', borderColor: d.is_public ? '#16a34a' : '#d4d4d4', color: d.is_public ? '#16a34a' : '#999', background: 'transparent', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {d.is_public ? 'Público' : 'Privado'}
                </button>
                <button type="button" onClick={() => remove(d)} aria-label="Eliminar"
                  style={{ border: 'none', background: 'transparent', color: '#b91c1c', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

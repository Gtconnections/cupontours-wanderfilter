'use client';

import React, { useEffect, useRef } from 'react';
import type { ListingMetrics } from '@/app/lib/api/market';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

// Tipos mínimos de Leaflet (evitamos `any` para no romper el build)
interface LMap {
  remove(): void;
  setView(center: [number, number], zoom: number): LMap;
  fitBounds(bounds: unknown, opts?: unknown): LMap;
}
interface LLayer { addTo(map: LMap): LLayer; bindPopup(html: string): LLayer; }
interface LStatic {
  map(el: HTMLElement, opts?: unknown): LMap;
  tileLayer(url: string, opts?: unknown): LLayer;
  circleMarker(latlng: [number, number], opts?: unknown): LLayer;
  latLngBounds(latlngs: [number, number][]): unknown;
}

function getL(): LStatic | null {
  const w = window as unknown as { L?: LStatic };
  return w.L ?? null;
}

function occColor(occ: number): string {
  const o = Math.max(0, Math.min(100, occ));
  if (o < 40) return '#e05252';
  if (o < 70) return '#d4af37';
  return '#3fae6a';
}

function loadLeaflet(): Promise<void> {
  return new Promise((resolve) => {
    if (getL()) { resolve(); return; }
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`) as HTMLScriptElement | null;
    if (existing) {
      if (getL()) { resolve(); return; }
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}

interface Props { listings: ListingMetrics[]; }

export default function PropertyMap({ listings }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    const points = listings.filter(l => typeof l.lat === 'number' && typeof l.lng === 'number');

    loadLeaflet().then(() => {
      const L = getL();
      if (cancelled || !containerRef.current || !L) return;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

      const map = L.map(containerRef.current, { scrollWheelZoom: false });
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap', maxZoom: 19,
      }).addTo(map);

      if (points.length === 0) {
        map.setView([25.7617, -80.1918], 10);
        return;
      }

      const latlngs: [number, number][] = [];
      points.forEach(l => {
        const lat = l.lat as number, lng = l.lng as number;
        latlngs.push([lat, lng]);
        L.circleMarker([lat, lng], {
          radius: 9, fillColor: occColor(l.occupancy),
          color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.85,
        }).addTo(map).bindPopup(
          `<div style="font-family:inherit;min-width:160px">
             <strong>${l.name}</strong><br/>
             <span style="color:#888">${l.city || ''}</span>
             <div style="margin-top:6px;font-size:12px;line-height:1.6">
               Ocupación: <b>${l.occupancy}%</b><br/>
               ADR: <b>$${l.adr}</b><br/>
               RevPAR: <b>$${l.revpar}</b><br/>
               Pacing 30d: <b>${l.forward_pacing}%</b>
             </div>
           </div>`
        );
      });

      map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40], maxZoom: 13 });
    });

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [listings]);

  return (
    <div>
      <div ref={containerRef} style={{ height: '440px', width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 0 }} />
      <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '11px', color: '#8a8a8a', flexWrap: 'wrap' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 5, background: '#3fae6a', marginRight: 5 }} />Ocupación alta (70%+)</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 5, background: '#d4af37', marginRight: 5 }} />Media (40-70%)</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 5, background: '#e05252', marginRight: 5 }} />Baja (&lt;40%)</span>
      </div>
    </div>
  );
}

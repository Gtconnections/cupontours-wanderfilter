'use client';

import React, { useState } from 'react';

export interface ExtraField { label: string; value: string; }
export interface UnitRow { tower: string; unit_code: string; size: string; price: string; currency: string; }
export interface PaymentRow { stage: string; value: string; }
export interface NearbyRow { place: string; time: string; }

interface Props {
  extraInfo: ExtraField[];
  setExtraInfo: (v: ExtraField[]) => void;
  amenities: string[];
  setAmenities: (v: string[]) => void;
  paymentPlan: PaymentRow[];
  setPaymentPlan: (v: PaymentRow[]) => void;
  nearby: NearbyRow[];
  setNearby: (v: NearbyRow[]) => void;
  units: UnitRow[];
  setUnits: (v: UnitRow[]) => void;
}

const STYLE = `
.re-dyn { display: flex; flex-direction: column; gap: 22px; margin-top: 8px; }
.re-dyn-section { border: 1px solid #e5e5e5; border-radius: 12px; padding: 16px; background: #fafafa; }
.re-dyn-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.re-dyn-head h4 { margin: 0; font-size: 14px; font-weight: 700; letter-spacing: .3px; color: #222; }
.re-dyn-add { background: #111; color: #fff; border: none; border-radius: 8px; padding: 7px 12px; font-size: 12px; font-weight: 600; cursor: pointer; }
.re-dyn-add:hover { background: #d4af37; color: #111; }
.re-dyn-empty { margin: 0; font-size: 12.5px; color: #999; font-style: italic; }
.re-dyn-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.re-dyn-row > input { flex: 1; min-width: 0; }
.re-dyn-rm { flex: 0 0 auto; width: 32px; height: 32px; border: 1px solid #e0c9c9; background: #fff; color: #c0392b; border-radius: 8px; font-size: 18px; line-height: 1; cursor: pointer; }
.re-dyn-rm:hover { background: #c0392b; color: #fff; border-color: #c0392b; }
.re-dyn-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.re-dyn-chip { display: inline-flex; align-items: center; gap: 6px; background: #fff; border: 1px solid #e0d4ad; color: #7a6a2f; border-radius: 999px; padding: 5px 10px; font-size: 12.5px; }
.re-dyn-chip button { border: none; background: transparent; color: #b08a2a; cursor: pointer; font-size: 15px; line-height: 1; padding: 0; }
.re-dyn-units-head, .re-dyn-unit-row { display: grid; grid-template-columns: 1.3fr 1fr 1fr .9fr .8fr 34px; gap: 8px; align-items: center; }
.re-dyn-units-head { margin-bottom: 6px; }
.re-dyn-units-head span { font-size: 10.5px; text-transform: uppercase; letter-spacing: .6px; color: #999; font-weight: 600; }
.re-dyn-unit-row { margin-bottom: 8px; }
.re-dyn-hint { margin: 0 0 10px; font-size: 12px; color: #888; }
`;

export const RealEstateDynamicFields: React.FC<Props> = ({
  extraInfo, setExtraInfo, amenities, setAmenities,
  paymentPlan, setPaymentPlan, nearby, setNearby, units, setUnits,
}) => {
  const [amenityInput, setAmenityInput] = useState('');

  const addField = () => setExtraInfo([...extraInfo, { label: '', value: '' }]);
  const updField = (i: number, key: keyof ExtraField, val: string) =>
    setExtraInfo(extraInfo.map((f, idx) => (idx === i ? { ...f, [key]: val } : f)));
  const rmField = (i: number) => setExtraInfo(extraInfo.filter((_, idx) => idx !== i));

  const addAmenity = () => {
    const v = amenityInput.trim();
    if (v && !amenities.includes(v)) setAmenities([...amenities, v]);
    setAmenityInput('');
  };
  const rmAmenity = (i: number) => setAmenities(amenities.filter((_, idx) => idx !== i));

  const addPay = () => setPaymentPlan([...paymentPlan, { stage: '', value: '' }]);
  const updPay = (i: number, key: keyof PaymentRow, val: string) =>
    setPaymentPlan(paymentPlan.map((p, idx) => (idx === i ? { ...p, [key]: val } : p)));
  const rmPay = (i: number) => setPaymentPlan(paymentPlan.filter((_, idx) => idx !== i));

  const addNear = () => setNearby([...nearby, { place: '', time: '' }]);
  const updNear = (i: number, key: keyof NearbyRow, val: string) =>
    setNearby(nearby.map((n, idx) => (idx === i ? { ...n, [key]: val } : n)));
  const rmNear = (i: number) => setNearby(nearby.filter((_, idx) => idx !== i));

  const addUnit = () => setUnits([...units, { tower: '', unit_code: '', size: '', price: '', currency: 'USD' }]);
  const updUnit = (i: number, key: keyof UnitRow, val: string) =>
    setUnits(units.map((u, idx) => (idx === i ? { ...u, [key]: val } : u)));
  const rmUnit = (i: number) => setUnits(units.filter((_, idx) => idx !== i));

  return (
    <div className="re-dyn">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />

      {/* Ficha técnica */}
      <div className="re-dyn-section">
        <div className="re-dyn-head">
          <h4>Ficha técnica</h4>
          <button type="button" className="re-dyn-add" onClick={addField}>+ Agregar campo</button>
        </div>
        <p className="re-dyn-hint">Cualquier dato extra (Developer, Arquitecto, Pisos, Vistas, Entrega, Acabados…).</p>
        {extraInfo.length === 0 && <p className="re-dyn-empty">Sin campos todavía.</p>}
        {extraInfo.map((f, i) => (
          <div className="re-dyn-row" key={i}>
            <input className="wander-form-input" placeholder="Etiqueta (ej. Developer)" value={f.label} onChange={(e) => updField(i, 'label', e.target.value)} />
            <input className="wander-form-input" placeholder="Valor (ej. Related Group)" value={f.value} onChange={(e) => updField(i, 'value', e.target.value)} />
            <button type="button" className="re-dyn-rm" onClick={() => rmField(i)} aria-label="Eliminar">×</button>
          </div>
        ))}
      </div>

      {/* Amenidades */}
      <div className="re-dyn-section">
        <div className="re-dyn-head"><h4>Amenidades</h4></div>
        <div className="re-dyn-row">
          <input className="wander-form-input" placeholder="Ej. Beach club, Spa, Golf…" value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }} />
          <button type="button" className="re-dyn-add" onClick={addAmenity}>Agregar</button>
        </div>
        {amenities.length > 0 && (
          <div className="re-dyn-chips">
            {amenities.map((a, i) => (
              <span className="re-dyn-chip" key={i}>{a}<button type="button" onClick={() => rmAmenity(i)} aria-label="Quitar">×</button></span>
            ))}
          </div>
        )}
      </div>

      {/* Plan de pagos */}
      <div className="re-dyn-section">
        <div className="re-dyn-head">
          <h4>Plan de pagos</h4>
          <button type="button" className="re-dyn-add" onClick={addPay}>+ Agregar etapa</button>
        </div>
        <p className="re-dyn-hint">Etapa y monto/porcentaje (ej. &quot;Al contrato&quot; → &quot;15%&quot;).</p>
        {paymentPlan.length === 0 && <p className="re-dyn-empty">Sin plan de pagos.</p>}
        {paymentPlan.map((p, i) => (
          <div className="re-dyn-row" key={i}>
            <input className="wander-form-input" placeholder="Etapa (ej. Al contrato)" value={p.stage} onChange={(e) => updPay(i, 'stage', e.target.value)} />
            <input className="wander-form-input" placeholder="Valor (ej. 15%)" value={p.value} onChange={(e) => updPay(i, 'value', e.target.value)} />
            <button type="button" className="re-dyn-rm" onClick={() => rmPay(i)} aria-label="Eliminar">×</button>
          </div>
        ))}
      </div>

      {/* Puntos cercanos */}
      <div className="re-dyn-section">
        <div className="re-dyn-head">
          <h4>Puntos cercanos</h4>
          <button type="button" className="re-dyn-add" onClick={addNear}>+ Agregar lugar</button>
        </div>
        <p className="re-dyn-hint">Lugar y distancia/tiempo (ej. &quot;Aeropuerto&quot; → &quot;45 min&quot;).</p>
        {nearby.length === 0 && <p className="re-dyn-empty">Sin puntos cercanos.</p>}
        {nearby.map((n, i) => (
          <div className="re-dyn-row" key={i}>
            <input className="wander-form-input" placeholder="Lugar (ej. Aeropuerto PVR)" value={n.place} onChange={(e) => updNear(i, 'place', e.target.value)} />
            <input className="wander-form-input" placeholder="Tiempo (ej. 45 min)" value={n.time} onChange={(e) => updNear(i, 'time', e.target.value)} />
            <button type="button" className="re-dyn-rm" onClick={() => rmNear(i)} aria-label="Eliminar">×</button>
          </div>
        ))}
      </div>

      {/* Unidades */}
      <div className="re-dyn-section">
        <div className="re-dyn-head">
          <h4>Unidades</h4>
          <button type="button" className="re-dyn-add" onClick={addUnit}>+ Agregar unidad</button>
        </div>
        <p className="re-dyn-hint">Opcional. Torre/tipo, unidad, tamaño y precio. Se muestran como tabla en el detalle.</p>
        {units.length === 0 && <p className="re-dyn-empty">Sin unidades.</p>}
        {units.length > 0 && (
          <div className="re-dyn-units-head">
            <span>Tipo / Torre</span><span>Unidad</span><span>Tamaño</span><span>Precio</span><span>Moneda</span><span></span>
          </div>
        )}
        {units.map((u, i) => (
          <div className="re-dyn-unit-row" key={i}>
            <input className="wander-form-input" placeholder="Torre 1 / Residences" value={u.tower} onChange={(e) => updUnit(i, 'tower', e.target.value)} />
            <input className="wander-form-input" placeholder="PH 1 / 3 Bedrooms" value={u.unit_code} onChange={(e) => updUnit(i, 'unit_code', e.target.value)} />
            <input className="wander-form-input" placeholder="633 m2" value={u.size} onChange={(e) => updUnit(i, 'size', e.target.value)} />
            <input className="wander-form-input" type="number" placeholder="0" value={u.price} onChange={(e) => updUnit(i, 'price', e.target.value)} />
            <select className="wander-form-select" value={u.currency} onChange={(e) => updUnit(i, 'currency', e.target.value)}>
              <option value="USD">USD</option>
              <option value="MXN">MXN</option>
            </select>
            <button type="button" className="re-dyn-rm" onClick={() => rmUnit(i)} aria-label="Eliminar">×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealEstateDynamicFields;

// app/(dashboard)/admin/components/ModalSaveTransaction.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { createTransaccion, updateTransaccion, Transaccion, SaveTransaccionData } from '@/app/lib/api/transaccionAdmin';
import './ModalEditService.css';

const SERVICIO_TIPO_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'transporte_privado', label: 'Transport' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'servicios_generales', label: 'General Services' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'health', label: 'Health' },
  { value: 'events', label: 'Events' },
];

interface ModalSaveTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: Transaccion | null;
}

export default function ModalSaveTransaction({ isOpen, onClose, onSuccess, item }: ModalSaveTransactionProps) {
  const isEditing = !!item;

  const [formData, setFormData] = useState({
    tipo: 'ingreso',
    monto: '',
    fecha: '',
    servicio_tipo: '',
    servicio_id: '',
    reserva_id: '',
    categoria: '',
    descripcion: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fills the form from the record being edited (or resets it for a new one) when the modal opens.
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        tipo: item?.tipo || 'ingreso',
        monto: item?.monto?.toString() || '',
        fecha: item?.fecha ? item.fecha.slice(0, 10) : '',
        servicio_tipo: item?.servicio_tipo || '',
        servicio_id: item?.servicio_id?.toString() || '',
        reserva_id: item?.reserva_id?.toString() || '',
        categoria: item?.categoria || '',
        descripcion: item?.descripcion || '',
      });
      setError(null);
    }
  }, [isOpen, item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.monto) {
      setError('Please enter an amount');
      return;
    }
    if (!formData.fecha) {
      setError('Please select a date');
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload: SaveTransaccionData = {
      tipo: formData.tipo as 'ingreso' | 'gasto',
      monto: parseFloat(formData.monto) || 0,
      fecha: formData.fecha,
      servicio_tipo: formData.servicio_tipo || null,
      servicio_id: formData.servicio_tipo && formData.servicio_id ? parseInt(formData.servicio_id) : null,
      reserva_id: formData.reserva_id ? parseInt(formData.reserva_id) : null,
      categoria: formData.categoria,
      descripcion: formData.descripcion,
    };

    try {
      if (isEditing && item) {
        await updateTransaccion(item.id, payload);
      } else {
        await createTransaccion(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Error al guardar transacción:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error saving transaction');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-edit-service-overlay" onClick={onClose}>
      <div className="wander-edit-service-container" onClick={(e) => e.stopPropagation()}>
        <div className="wander-edit-service-header">
          <h2>{isEditing ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button className="wander-edit-service-close" onClick={onClose} disabled={isLoading}>
            <FiX size={20} />
          </button>
        </div>

        <div className="wander-edit-service-body">
          <form onSubmit={handleSubmit}>
            <div className="wander-edit-service-grid">
              <div className="wander-edit-service-group">
                <label htmlFor="tipo" className="wander-edit-service-label">
                  Type <span className="wander-edit-service-required">*</span>
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="wander-edit-service-select"
                  disabled={isLoading}
                  required
                >
                  <option value="ingreso">Income</option>
                  <option value="gasto">Expense</option>
                </select>
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="monto" className="wander-edit-service-label">
                  Amount <span className="wander-edit-service-required">*</span>
                </label>
                <input
                  type="number"
                  id="monto"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="150.00"
                  step="0.01"
                  min="0"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="wander-edit-service-group full-width">
                <label htmlFor="fecha" className="wander-edit-service-label">
                  Date <span className="wander-edit-service-required">*</span>
                </label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="servicio_tipo" className="wander-edit-service-label">Linked Service</label>
                <select
                  id="servicio_tipo"
                  name="servicio_tipo"
                  value={formData.servicio_tipo}
                  onChange={handleChange}
                  className="wander-edit-service-select"
                  disabled={isLoading}
                >
                  {SERVICIO_TIPO_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="servicio_id" className="wander-edit-service-label">Service ID</label>
                <input
                  type="number"
                  id="servicio_id"
                  name="servicio_id"
                  value={formData.servicio_id}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="e.g., 12"
                  min="0"
                  disabled={isLoading || !formData.servicio_tipo}
                />
                <span className="wander-edit-service-hint">Only used when a service is selected above</span>
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="reserva_id" className="wander-edit-service-label">Reservation ID</label>
                <input
                  type="number"
                  id="reserva_id"
                  name="reserva_id"
                  value={formData.reserva_id}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="Optional"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group">
                <label htmlFor="categoria" className="wander-edit-service-label">Category</label>
                <input
                  type="text"
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="wander-edit-service-input"
                  placeholder="e.g., Payroll, Maintenance, Booking"
                  disabled={isLoading}
                />
              </div>

              <div className="wander-edit-service-group full-width">
                <label htmlFor="descripcion" className="wander-edit-service-label">Description</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="wander-edit-service-textarea"
                  placeholder="Additional notes about this transaction..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="wander-edit-service-error">
                <FiX size={16} />
                {error}
              </div>
            )}

            <div className="wander-edit-service-footer">
              <button
                type="button"
                className="wander-edit-service-btn-cancel"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="wander-edit-service-btn-submit"
                disabled={isLoading}
              >
                <FiSave size={16} />
                {isLoading ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

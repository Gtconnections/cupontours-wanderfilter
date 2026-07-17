// app/(dashboard)/admin/components/CreateSuscripcionForm.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FiLoader } from 'react-icons/fi';
import { getMembresiasAdmin, Membresia } from '@/app/lib/api/membresiaAdmin';
import './CreateWellnessForm.css';

interface CreateSuscripcionFormProps {
  onSubmit: (data: {
    membresia_id: number;
    cliente_nombre: string;
    cliente_email: string;
    cliente_telefono: string;
    monto_acordado: number;
    fecha_inicio: string;
    fecha_fin?: string;
    notas?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CreateSuscripcionForm: React.FC<CreateSuscripcionFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [plans, setPlans] = useState<Membresia[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  const [formData, setFormData] = useState({
    membresia_id: '',
    cliente_nombre: '',
    cliente_email: '',
    cliente_telefono: '',
    monto_acordado: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    notas: ''
  });

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await getMembresiasAdmin();
        setPlans(data.results || []);
      } catch (err) {
        console.error('❌ Error cargando membresías para el formulario:', err);
      } finally {
        setIsLoadingPlans(false);
      }
    }
    loadPlans();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      // Al elegir el plan, sugerimos su precio de lista como monto acordado si aún no se ha tocado.
      if (name === 'membresia_id') {
        const plan = plans.find(p => p.id === parseInt(value));
        if (plan && !prev.monto_acordado) {
          next.monto_acordado = plan.price;
        }
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      membresia_id: parseInt(formData.membresia_id),
      cliente_nombre: formData.cliente_nombre,
      cliente_email: formData.cliente_email,
      cliente_telefono: formData.cliente_telefono,
      monto_acordado: parseFloat(formData.monto_acordado) || 0,
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin || undefined,
      notas: formData.notas || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="wander-create-form">
      <div className="wander-form-grid">
        <div className="wander-form-group full-width">
          <label htmlFor="membresia_id" className="wander-form-label">
            Membership Plan <span className="wander-form-required">*</span>
          </label>
          <select
            id="membresia_id"
            name="membresia_id"
            value={formData.membresia_id}
            onChange={handleChange}
            className="wander-form-select"
            required
            disabled={isLoadingPlans}
          >
            <option value="">{isLoadingPlans ? 'Loading plans...' : 'Select a plan'}</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.name} — ${parseFloat(plan.price).toFixed(0)}/{plan.period}
              </option>
            ))}
          </select>
        </div>

        <div className="wander-form-group full-width">
          <label htmlFor="cliente_nombre" className="wander-form-label">
            Client Name <span className="wander-form-required">*</span>
          </label>
          <input
            type="text"
            id="cliente_nombre"
            name="cliente_nombre"
            value={formData.cliente_nombre}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., Juan Pérez"
            required
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="cliente_email" className="wander-form-label">
            Client Email <span className="wander-form-required">*</span>
          </label>
          <input
            type="email"
            id="cliente_email"
            name="cliente_email"
            value={formData.cliente_email}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="juan@mail.com"
            required
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="cliente_telefono" className="wander-form-label">
            Client Phone <span className="wander-form-required">*</span>
          </label>
          <input
            type="text"
            id="cliente_telefono"
            name="cliente_telefono"
            value={formData.cliente_telefono}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="8091234567"
            required
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="monto_acordado" className="wander-form-label">
            Agreed Amount <span className="wander-form-required">*</span>
          </label>
          <input
            type="number"
            id="monto_acordado"
            name="monto_acordado"
            value={formData.monto_acordado}
            onChange={handleChange}
            className="wander-form-input"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="fecha_inicio" className="wander-form-label">
            Start Date <span className="wander-form-required">*</span>
          </label>
          <input
            type="date"
            id="fecha_inicio"
            name="fecha_inicio"
            value={formData.fecha_inicio}
            onChange={handleChange}
            className="wander-form-input"
            required
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="fecha_fin" className="wander-form-label">Valid Until</label>
          <input
            type="date"
            id="fecha_fin"
            name="fecha_fin"
            value={formData.fecha_fin}
            onChange={handleChange}
            className="wander-form-input"
          />
        </div>

        <div className="wander-form-group full-width">
          <label htmlFor="notas" className="wander-form-label">Notes</label>
          <textarea
            id="notas"
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            className="wander-form-textarea"
            placeholder="Optional internal notes"
            rows={2}
          />
        </div>
      </div>

      <div className="wander-form-actions">
        <button type="button" onClick={onCancel} className="wander-form-btn cancel" disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="wander-form-btn submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <FiLoader size={16} className="wander-spinner" />
              Creating...
            </>
          ) : (
            'Create Subscription'
          )}
        </button>
      </div>
    </form>
  );
};

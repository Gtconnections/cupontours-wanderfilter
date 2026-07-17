// app/(dashboard)/admin/components/LuxuryAccessForm.tsx

'use client';

import React, { useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import type { LuxuryAccess, LuxuryAccessData } from '@/app/lib/api/luxuryAccessAdmin';
import './CreateWellnessForm.css';

interface LuxuryAccessFormProps {
  onSubmit: (data: LuxuryAccessData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: LuxuryAccess | null;
}

export const LuxuryAccessForm: React.FC<LuxuryAccessFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialData = null,
}) => {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    code: initialData?.code ?? '',
    is_active: initialData ? String(Number(initialData.is_active)) : '1',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateCode = () => {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, code: `LUX-${rand}` }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      code: formData.code.trim(),
      is_active: Number(formData.is_active),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="wander-create-form">
      <div className="wander-form-grid">
        <div className="wander-form-group full-width">
          <label htmlFor="name" className="wander-form-label">
            Full Name <span className="wander-form-required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="e.g., John Doe"
            required
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="email" className="wander-form-label">
            Email <span className="wander-form-required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="member@email.com"
            required
          />
        </div>

        <div className="wander-form-group">
          <label htmlFor="phone" className="wander-form-label">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone ?? ''}
            onChange={handleChange}
            className="wander-form-input"
            placeholder="+1 (754) 231-9275"
          />
        </div>

        <div className="wander-form-group full-width">
          <label htmlFor="code" className="wander-form-label">
            Access Code <span className="wander-form-required">*</span>
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="wander-form-input"
              placeholder="e.g., LUX-A1B2C3"
              style={{ flex: 1 }}
              required
            />
            <button
              type="button"
              onClick={generateCode}
              className="wander-form-btn cancel"
              style={{ whiteSpace: 'nowrap' }}
            >
              Generate
            </button>
          </div>
        </div>

        <div className="wander-form-group">
          <label htmlFor="is_active" className="wander-form-label">Status</label>
          <select
            id="is_active"
            name="is_active"
            value={formData.is_active}
            onChange={handleChange}
            className="wander-form-select"
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
      </div>

      <div className="wander-form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="wander-form-btn cancel"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="wander-form-btn submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <FiLoader size={16} className="wander-spinner" />
              {isEdit ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            isEdit ? 'Save Changes' : 'Create Access'
          )}
        </button>
      </div>
    </form>
  );
};

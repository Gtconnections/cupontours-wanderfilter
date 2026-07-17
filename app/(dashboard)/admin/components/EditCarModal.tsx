// components/EditCarModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CarDetail } from '@/app/lib/api/carsAdmin';

interface EditCarModalProps {
  isOpen: boolean;
  car: CarDetail | null;
  onClose: () => void;
  onSave: (carId: number, data: unknown) => Promise<void>;
}

const EXPENSES_OPTIONS = [
  { value: 'after_expenses', label: 'After Expenses' },
  { value: 'before_expenses', label: 'Before Expenses' },
];

export default function EditCarModal({ isOpen, car, onClose, onSave }: EditCarModalProps) {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    plate: '',
    rent_price: '',
    external_id: '',
    percentage: '',
    expenses: 'after_expenses',
    miles: '',
    description: '',
    owner_id: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (car && isOpen) {
      // Pre-fills the form from the record being edited when the modal opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        brand: car.brand || '',
        model: car.model || '',
        year: car.year?.toString() || '',
        plate: car.plate || '',
        rent_price: car.rent_price?.toString() || '',
        external_id: car.external_id || '',
        percentage: car.percentage?.toString() || '',
        expenses: car.expenses_type || 'after_expenses',
        miles: car.miles?.toString() || '',
        description: car.description || '',
        owner_id: car.owner_id?.toString() || '',
      });
      setError(null);
    }
  }, [car, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!car) return;

    // Validaciones
    if (!formData.brand.trim()) {
      setError('La marca es requerida');
      return;
    }
    if (!formData.model.trim()) {
      setError('El modelo es requerido');
      return;
    }
    if (!formData.rent_price || parseFloat(formData.rent_price) <= 0) {
      setError('El precio de renta es requerido y debe ser mayor a 0');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dataToSend = {
        owner_id: parseInt(formData.owner_id),
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        plate: formData.plate,
        rent_price: parseFloat(formData.rent_price),
        external_id: formData.external_id,
        percentage: parseInt(formData.percentage) || 0,
        expenses: formData.expenses,
        miles: parseFloat(formData.miles) || 0,
        description: formData.description,
      };

      await onSave(car.car_id, dataToSend);
      onClose();
    } catch (err) {
      console.error('Error al guardar:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al actualizar el auto');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !car) return null;

  return (
    <div className="wander-modal-overlay" onClick={onClose}>
      <div className="wander-modal wander-modal-edit-car" onClick={(e) => e.stopPropagation()}>
        <div className="wander-modal-header">
          <h2>Edit car</h2>
          <button className="wander-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="wander-modal-form">
          {error && (
            <div className="wander-modal-error">
              ⚠️ {error}
            </div>
          )}

          <div className="wander-edit-grid">
            <div className="wander-form-group">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Brand"
                required
                disabled={isLoading}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="owner_id">Owner</label>
              <select
                id="owner_id"
                name="owner_id"
                value={formData.owner_id}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Select a value</option>
                <option value="2">Gerardo Cornejo</option>
                <option value="3">Magnetic Investments</option>
                <option value="4">Wilda Valdez</option>
              </select>
            </div>

            <div className="wander-form-group">
              <label htmlFor="rent_price">Rent price</label>
              <input
                type="number"
                id="rent_price"
                name="rent_price"
                value={formData.rent_price}
                onChange={handleChange}
                placeholder="Rent price"
                step="0.01"
                min="0"
                required
                disabled={isLoading}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="miles">Miles</label>
              <input
                type="number"
                id="miles"
                name="miles"
                value={formData.miles}
                onChange={handleChange}
                placeholder="Miles"
                step="0.01"
                min="0"
                disabled={isLoading}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="model">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Model"
                required
                disabled={isLoading}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="plate">Plate</label>
              <input
                type="text"
                id="plate"
                name="plate"
                value={formData.plate}
                onChange={handleChange}
                placeholder="Plate"
                disabled={isLoading}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="external_id">External id</label>
              <input
                type="text"
                id="external_id"
                name="external_id"
                value={formData.external_id}
                onChange={handleChange}
                placeholder="External id"
                disabled={isLoading}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="year">Year</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="Year"
                min="1900"
                max={new Date().getFullYear() + 1}
                disabled={isLoading}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="expenses">Expenses</label>
              <select
                id="expenses"
                name="expenses"
                value={formData.expenses}
                onChange={handleChange}
                disabled={isLoading}
              >
                {EXPENSES_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="wander-form-group">
              <label htmlFor="percentage">Percentage</label>
              <input
                type="number"
                id="percentage"
                name="percentage"
                value={formData.percentage}
                onChange={handleChange}
                placeholder="Percentage"
                min="0"
                max="100"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="wander-form-group wander-form-full">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              rows={6}
              disabled={isLoading}
            />
          </div>

          <div className="wander-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="wander-btn-cancel"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="wander-btn-save"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="wander-spinner"></span>
                  Guardando...
                </>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
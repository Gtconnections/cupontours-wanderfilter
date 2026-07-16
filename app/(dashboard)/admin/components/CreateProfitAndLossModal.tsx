// components/CreateProfitAndLossModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { getAllCars, Car } from '@/app/lib/api/carsAdmin';

interface CreateProfitAndLossModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { type: string; start_date: string; list_car_id: number[] }) => Promise<void>;
  isSubmitting: boolean;
}

export default function CreateProfitAndLossModal({ 
  isOpen, 
  onClose, 
  onCreate,
  isSubmitting 
}: CreateProfitAndLossModalProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    type: 'annual',
    start_date: new Date().toISOString().split('T')[0],
    list_car_id: [] as number[],
  });

  // Cargar autos
  useEffect(() => {
    if (!isOpen) return;

    const loadCars = async () => {
      setIsLoading(true);
      try {
        const data = await getAllCars();
        setCars(data);
      } catch (err: any) {
        console.error('Error cargando autos:', err);
        setError(err.message || 'Error al cargar los autos');
      } finally {
        setIsLoading(false);
      }
    };

    loadCars();
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCarToggle = (carId: number) => {
    setFormData(prev => ({
      ...prev,
      list_car_id: prev.list_car_id.includes(carId)
        ? prev.list_car_id.filter(id => id !== carId)
        : [...prev.list_car_id, carId]
    }));
  };

  const handleSelectAll = () => {
    if (formData.list_car_id.length === cars.length) {
      setFormData(prev => ({ ...prev, list_car_id: [] }));
    } else {
      setFormData(prev => ({ ...prev, list_car_id: cars.map(car => car.id) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.list_car_id.length === 0) {
      setError('Selecciona al menos un auto');
      return;
    }

    if (!formData.start_date) {
      setError('La fecha de inicio es requerida');
      return;
    }

    setError(null);
    await onCreate(formData);
  };

  const handleClose = () => {
    setError(null);
    setFormData({
      type: 'annual',
      start_date: new Date().toISOString().split('T')[0],
      list_car_id: [],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="wander-modal-overlay" onClick={handleClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
    }}>
      <div className="wander-modal wander-modal-pl" onClick={(e) => e.stopPropagation()} style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '540px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        animation: 'slideUp 0.3s ease',
      }}>
        <div className="wander-modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 28px 16px',
          borderBottom: '1px solid #ebebeb',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#000000',
            margin: 0,
          }}>Create Profit and Loss</h2>
          <button className="wander-modal-close" onClick={handleClose} style={{
            width: '36px',
            height: '36px',
            border: 'none',
            background: 'transparent',
            fontSize: '22px',
            cursor: 'pointer',
            color: '#717171',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="wander-modal-form" style={{ padding: '24px 28px 28px' }}>
          {error && (
            <div className="wander-modal-error" style={{
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '8px',
              color: '#991b1b',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              ⚠️ {error}
            </div>
          )}

          <div className="wander-form-group" style={{ marginBottom: '18px' }}>
            <label htmlFor="type" style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#333333',
              marginBottom: '6px',
            }}>
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#000000',
                background: '#fafafa',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              <option value="annual">Annual</option>
              <option value="semi-annual">Semi-Annual</option>
              <option value="quarterly">Quarterly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="wander-form-group" style={{ marginBottom: '18px' }}>
            <label htmlFor="start_date" style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#333333',
              marginBottom: '6px',
            }}>
              Start Date
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#000000',
                background: '#fafafa',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div className="wander-form-group" style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#333333',
              }}>
                Select Cars
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                style={{
                  fontSize: '12px',
                  color: '#2563eb',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
                disabled={isLoading}
              >
                {formData.list_car_id.length === cars.length && cars.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '8px',
              background: '#fafafa',
            }}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#717171' }}>
                  Cargando autos...
                </div>
              ) : cars.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#717171' }}>
                  No hay autos disponibles
                </div>
              ) : (
                cars.map((car) => (
                  <label
                    key={car.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: formData.list_car_id.includes(car.id) ? '#f0f0f0' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!formData.list_car_id.includes(car.id)) {
                        e.currentTarget.style.background = '#f5f5f5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!formData.list_car_id.includes(car.id)) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.list_car_id.includes(car.id)}
                      onChange={() => handleCarToggle(car.id)}
                      disabled={isSubmitting}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: '#000000',
                      }}
                    />
                    <span style={{
                      fontSize: '13px',
                      color: '#333333',
                      fontWeight: formData.list_car_id.includes(car.id) ? 600 : 400,
                    }}>
                      {car.brand} {car.model} {car.year}
                      <span style={{ fontSize: '11px', color: '#999999', marginLeft: '6px' }}>
                        (ID: {car.id})
                      </span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#717171', marginTop: '6px' }}>
              {formData.list_car_id.length} auto(s) seleccionado(s)
            </div>
          </div>

          <div className="wander-modal-actions" style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            paddingTop: '20px',
            borderTop: '1px solid #ebebeb',
            marginTop: '4px',
          }}>
            <button
              type="button"
              onClick={handleClose}
              className="wander-btn-cancel"
              disabled={isSubmitting}
              style={{
                padding: '10px 24px',
                background: 'transparent',
                border: '1px solid #d0d0d0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#717171',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="wander-btn-save"
              disabled={isSubmitting || formData.list_car_id.length === 0}
              style={{
                padding: '10px 28px',
                background: '#000000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: (isSubmitting || formData.list_car_id.length === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: (isSubmitting || formData.list_car_id.length === 0) ? 0.6 : 1,
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="wander-spinner" style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}></span>
                  Creando...
                </>
              ) : (
                'Create PL'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
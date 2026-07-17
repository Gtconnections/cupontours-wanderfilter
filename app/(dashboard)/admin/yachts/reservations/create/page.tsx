'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getAllYachts, Yacht, createYachtReservation, CreateYachtReservationData } from '@/app/lib/api/yachtsAdmin';
import { FiArrowLeft, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './create-reservation.css';

const OCCASION_OPTIONS = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'family_trip', label: 'Family Trip' },
  { value: 'fun_day_at_sea', label: 'Fun Day at Sea' },
  { value: 'bachelorette', label: 'Bachelorette' },
  { value: 'business_lunch', label: 'Business Lunch' },
  { value: 'other', label: 'Other' },
];

const DURATION_OPTIONS = [
  { value: 'full_day', label: 'Full Day' },
  { value: 'half_day_in_the_morning', label: 'Half Day (Morning)' },
  { value: 'half_day_in_the_afternoon', label: 'Half Day (Afternoon)' },
];

const LoadingSkeleton = () => (
  <div className="wander-create-reservation-container">
    <div className="wander-create-reservation-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando...</p>
    </div>
  </div>
);

function CreateYachtReservationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();

  const yachtIdFromUrl = searchParams?.get('yacht_id');

  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateYachtReservationData>({
    yacht_id: yachtIdFromUrl ? parseInt(yachtIdFromUrl) : 0,
    first_name: '',
    last_name: '',
    phone: '',
    date: '',
    duration: 'full_day',
    occasion: 'other',
    earnings: 0,
    observation: '',
    order: 1,
  });

  const loadYachts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllYachts();
      setYachts(data);

      if (!yachtIdFromUrl && data.length > 0) {
        setFormData(prev => ({ ...prev, yacht_id: data[0].id }));
      }
    } catch (err) {
      console.error('Error cargando yates:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar los yates');
    } finally {
      setIsLoading(false);
    }
  }, [yachtIdFromUrl]);

  useEffect(() => {
    if (isChecking) return;

    const hasAuth = checkAuth();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthVerified(true);

    if (!hasAuth) {
      router.push('/login');
      return;
    }

    loadYachts();
  }, [isChecking, checkAuth, router, loadYachts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'yacht_id' || name === 'earnings' || name === 'order'
        ? Number(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.yacht_id) {
      setError('El yate es requerido');
      return;
    }
    if (!formData.first_name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!formData.last_name.trim()) {
      setError('El apellido es requerido');
      return;
    }
    if (!formData.phone.trim()) {
      setError('El número de teléfono es requerido');
      return;
    }
    if (!formData.date) {
      setError('La fecha es requerida');
      return;
    }
    if (formData.earnings < 0) {
      setError('Las ganancias no pueden ser negativas');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: CreateYachtReservationData = {
        yacht_id: formData.yacht_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        date: formData.date,
        duration: formData.duration,
        occasion: formData.occasion,
        earnings: formData.earnings,
        observation: formData.observation || '',
        order: formData.order,
      };

      const result = await createYachtReservation(payload);

      setSuccess('Reservación creada exitosamente');

      setTimeout(() => {
        router.push(`/admin/yachts/reservations/${result.yacht_id}`);
      }, 1500);

    } catch (err) {
      console.error('Error al crear reservación:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al crear la reservación');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking || !isAuthVerified || isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const isYachtDisabled = !!yachtIdFromUrl;

  return (
    <div className="wander-create-reservation-container">
      <header className="wander-create-reservation-header">
        <div>
          <span className="wander-breadcrumb">Listings / Yachts / Create Reservation</span>
          <h2>Create Reservation</h2>
        </div>
        <button
          onClick={() => router.back()}
          className="wander-btn-secondary"
        >
          <FiArrowLeft size={16} />
          Volver
        </button>
      </header>

      {error && (
        <div className="wander-error-state">
          <p><FiAlertCircle size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{error}</p>
        </div>
      )}

      {success && (
        <div className="wander-success-state">
          <p><FiCheckCircle size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="wander-create-reservation-form">
        <div className="wander-form-section">
          <h3>Primary info</h3>
          <div className="wander-form-grid">
            <div className="wander-form-group">
              <label htmlFor="yacht_id">YACHT</label>
              <select
                id="yacht_id"
                name="yacht_id"
                value={formData.yacht_id || ''}
                onChange={handleChange}
                disabled={isYachtDisabled || isSubmitting}
                required
              >
                <option value="">Select a value</option>
                {yachts.map((yacht) => (
                  <option key={yacht.id} value={yacht.id}>
                    {yacht.name} (ID: {yacht.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="wander-form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First Name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last Name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <div className="wander-form-section">
          <h3>Booking details</h3>
          <div className="wander-form-grid">
            <div className="wander-form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="duration">Duration</label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="wander-form-group">
              <label htmlFor="occasion">Occasion</label>
              <select
                id="occasion"
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                {OCCASION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="wander-form-group">
              <label htmlFor="order">Order</label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order || ''}
                onChange={handleChange}
                placeholder="1"
                min="1"
                step="1"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <div className="wander-form-section">
          <h3>Additional info</h3>
          <div className="wander-form-grid">
            <div className="wander-form-group">
              <label htmlFor="earnings">Earnings</label>
              <input
                type="number"
                id="earnings"
                name="earnings"
                value={formData.earnings || ''}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                min="0"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <div className="wander-form-section">
          <h3>Observations</h3>
          <div className="wander-form-group">
            <label htmlFor="observation">Observations</label>
            <textarea
              id="observation"
              name="observation"
              value={formData.observation}
              onChange={handleChange}
              placeholder="Observations"
              rows={4}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="wander-form-actions">
          <button
            type="button"
            onClick={() => router.back()}
            className="wander-btn-secondary"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="wander-btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="wander-spinner"></span>
                Creando...
              </>
            ) : (
              'Crear Reservación'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateYachtReservationPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CreateYachtReservationContent />
    </Suspense>
  );
}

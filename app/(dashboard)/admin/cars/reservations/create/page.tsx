'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getAllCars, Car, createReservation, CreateReservationData } from '@/app/lib/api/carsAdmin';
import './create-reservation.css';

const LoadingSkeleton = () => (
  <div className="wander-create-reservation-container">
    <div className="wander-create-reservation-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando...</p>
    </div>
  </div>
);

// Opciones de gas level
const GAS_LEVEL_OPTIONS = [
  { value: '-', label: '-' },
  { value: '0', label: '0' },
  { value: 'empty', label: 'Empty' },
  { value: '1/8', label: '1/8' },
  { value: '1/4', label: '1/4' },
  { value: '3/8', label: '3/8' },
  { value: '1/2', label: '1/2' },
  { value: '5/8', label: '5/8' },
  { value: '3/4', label: '3/4' },
  { value: '7/8', label: '7/8' },
  { value: '1', label: '1' },
  { value: 'full', label: 'Full' },
];

export default function CreateReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const carIdFromUrl = searchParams?.get('car_id');
  
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 🔥 Estado del formulario - CON total_earnings Y miles_drive
  const [formData, setFormData] = useState<CreateReservationData>({
    car_id: carIdFromUrl ? parseInt(carIdFromUrl) : 0,
    driver: '',
    phone: '',
    check_in: '',
    check_out: '',
    check_in_time: '',
    check_out_time: '',
    earnings: 0,
    extra_charges: 0,
    total_earnings: 0,
    miles_pre_trip: 0,
    miles_post_trip: 0,
    miles_drive: 0,
    gas_level_pre_trip: '',
    gas_level_post_trip: '',
    observations: '',
  });

  // Verificar autenticación y cargar autos
  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }

    loadCars();
  }, [isChecking, checkAuth, router]);

  const loadCars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllCars();
      setCars(data);
      
      if (!carIdFromUrl && data.length > 0) {
        setFormData(prev => ({ ...prev, car_id: data[0].id }));
      }
    } catch (err: any) {
      console.error('❌ Error cargando autos:', err);
      setError(err.message || 'Error al cargar los autos');
    } finally {
      setIsLoading(false);
    }
  }, [carIdFromUrl]);

  // 🔥 Función para extraer la hora de una fecha
  const extractTime = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 🔥 Función para formatear fecha al formato requerido por la API
  const formatDateForAPI = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 🔥 Calcular total_earnings automáticamente
  useEffect(() => {
    const total = formData.earnings + formData.extra_charges;
    setFormData(prev => ({ ...prev, total_earnings: total }));
  }, [formData.earnings, formData.extra_charges]);

  // 🔥 Calcular miles_drive automáticamente
  useEffect(() => {
    const drive = formData.miles_post_trip - formData.miles_pre_trip;
    setFormData(prev => ({ ...prev, miles_drive: drive >= 0 ? drive : 0 }));
  }, [formData.miles_pre_trip, formData.miles_post_trip]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'check_in' || name === 'check_out') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        [name === 'check_in' ? 'check_in_time' : 'check_out_time']: extractTime(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'car_id' || name === 'earnings' || name === 'extra_charges' || 
                name === 'total_earnings' || name === 'miles_pre_trip' || 
                name === 'miles_post_trip' || name === 'miles_drive'
                  ? Number(value) 
                  : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.car_id) {
      setError('El auto es requerido');
      return;
    }
    if (!formData.driver.trim()) {
      setError('El conductor es requerido');
      return;
    }
    if (!formData.phone.trim()) {
      setError('El número de teléfono es requerido');
      return;
    }
    if (!formData.check_in || !formData.check_out) {
      setError('Las fechas de check in y check out son requeridas');
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
      // 🔥 Construir el payload en el formato exacto que espera la API
      const payload = {
        driver: formData.driver,
        phone: formData.phone,
        car_id: formData.car_id,
        check_in: formatDateForAPI(formData.check_in),
        check_out: formatDateForAPI(formData.check_out),
        miles_pre_trip: formData.miles_pre_trip,
        miles_post_trip: formData.miles_post_trip,
        gas_level_pre_trip: formData.gas_level_pre_trip || '-',
        gas_level_post_trip: formData.gas_level_post_trip || '-',
        earnings: formData.earnings,
        extra_charges: formData.extra_charges,
        observations: formData.observations || '',
        check_in_time: formData.check_in_time || '00:00',
        check_out_time: formData.check_out_time || '00:00',
        miles_drive: formData.miles_drive,
        total_earnings: formData.total_earnings,
      };
      
      console.log('📤 Enviando payload:', payload);
      
      const result = await createReservation(payload);
      console.log('✅ Reservación creada:', result);
      
      setSuccess('Reservación creada exitosamente');
      
      setTimeout(() => {
        router.push(`/admin/cars/reservations/${formData.car_id}`);
      }, 1500);
      
    } catch (err: any) {
      console.error('Error al crear reservación:', err);
      setError(err.message || 'Error al crear la reservación');
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

  const isCarDisabled = !!carIdFromUrl;

  return (
    <div className="wander-create-reservation-container">
      <header className="wander-create-reservation-header">
        <div>
          <span className="wander-breadcrumb">Listings / Cars / Create Reservation</span>
          <h2>Create Reservation</h2>
        </div>
        <button 
          onClick={() => router.back()}
          className="wander-btn-secondary"
        >
          ← Volver
        </button>
      </header>

      {error && (
        <div className="wander-error-state">
          <p>⚠️ {error}</p>
        </div>
      )}

      {success && (
        <div className="wander-success-state">
          <p>✅ {success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="wander-create-reservation-form">
        {/* 🔥 SECCIÓN: PRIMARY INFO */}
        <div className="wander-form-section">
          <h3>Primary info</h3>
          <div className="wander-form-grid">
            <div className="wander-form-group">
              <label htmlFor="car_id">CAR</label>
              <select
                id="car_id"
                name="car_id"
                value={formData.car_id || ''}
                onChange={handleChange}
                disabled={isCarDisabled || isSubmitting}
                required
              >
                <option value="">Select a value</option>
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.brand} {car.model} {car.year} (ID: {car.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="wander-form-group">
              <label htmlFor="driver">Driver</label>
              <input
                type="text"
                id="driver"
                name="driver"
                value={formData.driver}
                onChange={handleChange}
                placeholder="Driver"
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

        {/* 🔥 SECCIÓN: CHECK IN / CHECK OUT */}
        <div className="wander-form-section">
          <h3>Check in / Check out</h3>
          <div className="wander-form-grid">
            <div className="wander-form-group">
              <label htmlFor="check_in">Check In</label>
              <input
                type="datetime-local"
                id="check_in"
                name="check_in"
                value={formData.check_in}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="check_out">Check Out</label>
              <input
                type="datetime-local"
                id="check_out"
                name="check_out"
                value={formData.check_out}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* 🔥 SECCIÓN: MORE INFO */}
        <div className="wander-form-section">
          <h3>More Info</h3>
          <div className="wander-form-grid">
            <div className="wander-form-group">
              <label htmlFor="miles_pre_trip">Miles Pre-Trip</label>
              <input
                type="number"
                id="miles_pre_trip"
                name="miles_pre_trip"
                value={formData.miles_pre_trip || ''}
                onChange={handleChange}
                placeholder="Miles Pre-Trip"
                step="0.01"
                min="0"
                disabled={isSubmitting}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="miles_post_trip">Miles Post-Trip</label>
              <input
                type="number"
                id="miles_post_trip"
                name="miles_post_trip"
                value={formData.miles_post_trip || ''}
                onChange={handleChange}
                placeholder="Miles Post-Trip"
                step="0.01"
                min="0"
                disabled={isSubmitting}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="gas_level_pre_trip">Gas Level Pre-Trip</label>
              <select
                id="gas_level_pre_trip"
                name="gas_level_pre_trip"
                value={formData.gas_level_pre_trip}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Select a value</option>
                {GAS_LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="wander-form-group">
              <label htmlFor="gas_level_post_trip">Gas Level Post-Trip</label>
              <select
                id="gas_level_post_trip"
                name="gas_level_post_trip"
                value={formData.gas_level_post_trip}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Select a value</option>
                {GAS_LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="wander-form-group">
              <label htmlFor="miles_drive">Miles Drive</label>
              <input
                type="number"
                id="miles_drive"
                name="miles_drive"
                value={formData.miles_drive || ''}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                disabled={true}
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>
          </div>
        </div>

        {/* 🔥 SECCIÓN: ADDITIONAL INFO */}
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

            <div className="wander-form-group">
              <label htmlFor="extra_charges">Extra Charges</label>
              <input
                type="number"
                id="extra_charges"
                name="extra_charges"
                value={formData.extra_charges || ''}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                min="0"
                disabled={isSubmitting}
              />
            </div>

            <div className="wander-form-group">
              <label htmlFor="total_earnings">Total Earnings</label>
              <input
                type="number"
                id="total_earnings"
                name="total_earnings"
                value={formData.total_earnings || ''}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                disabled={true}
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>
          </div>
        </div>

        {/* 🔥 SECCIÓN: OBSERVATIONS */}
        <div className="wander-form-section">
          <h3>Observations</h3>
          <div className="wander-form-group">
            <label htmlFor="observations">Observations</label>
            <textarea
              id="observations"
              name="observations"
              value={formData.observations}
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
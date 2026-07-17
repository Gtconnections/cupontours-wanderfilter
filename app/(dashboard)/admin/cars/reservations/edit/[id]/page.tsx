'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getAllCars, Car } from '@/app/lib/api/carsAdmin';
import './edit-reservation.css';

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

interface ReservationData {
  id: number;
  car_id: number;
  driver: string;
  phone: string;
  check_in: string;
  check_out: string;
  check_in_time: string;
  check_out_time: string;
  earnings: number;
  extra_charges: number;
  total_earnings: number;
  miles_pre_trip: number;
  miles_post_trip: number;
  miles_drive: number;
  gas_level_pre_trip: string;
  gas_level_post_trip: string;
  observation: string;
}

const LoadingSkeleton = () => (
  <div className="wander-edit-reservation-container">
    <div className="wander-edit-reservation-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando...</p>
    </div>
  </div>
);

export default function EditReservationPage() {
  const router = useRouter();
  const params = useParams();
  const reservationId = parseInt(params.id as string);
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [carInfo, setCarInfo] = useState<{ brand: string; model: string } | null>(null);

  const [formData, setFormData] = useState<ReservationData>({
    id: 0,
    car_id: 0,
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
    observation: '',
  });

  // Cargar datos de la reservación
  const loadReservation = useCallback(async () => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    try {
      const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
      
      let authToken: string | null = null;
      const cookieToken = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
      if (cookieToken) {
        authToken = cookieToken.split('=')[1];
      }
      if (!authToken) {
        authToken = localStorage.getItem('accessToken');
      }

      const response = await fetch(`${API_BASE_URL}/cars-reservation/${reservationId}/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo cargar la reservación`);
      }

      const data = await response.json();
      
      // Extraer fecha y hora
      const checkInDate = data.check_in ? new Date(data.check_in) : null;
      const checkOutDate = data.check_out ? new Date(data.check_out) : null;
      
      const formatDateTime = (date: Date | null) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      const formatTime = (date: Date | null) => {
        if (!date) return '';
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      };

      setFormData({
        id: data.id,
        car_id: data.car_id,
        driver: data.driver || '',
        phone: data.phone || '',
        check_in: formatDateTime(checkInDate),
        check_out: formatDateTime(checkOutDate),
        check_in_time: formatTime(checkInDate),
        check_out_time: formatTime(checkOutDate),
        // 🔥 Asegurar que sean números
        earnings: typeof data.earnings === 'number' ? data.earnings : parseFloat(data.earnings) || 0,
        extra_charges: typeof data.extra_charges === 'number' ? data.extra_charges : parseFloat(data.extra_charges) || 0,
        total_earnings: typeof data.total_earnings === 'number' ? data.total_earnings : parseFloat(data.total_earnings) || 0,
        miles_pre_trip: typeof data.miles_pre_trip === 'number' ? data.miles_pre_trip : parseFloat(data.miles_pre_trip) || 0,
        miles_post_trip: typeof data.miles_post_trip === 'number' ? data.miles_post_trip : parseFloat(data.miles_post_trip) || 0,
        miles_drive: typeof data.miles_drive === 'number' ? data.miles_drive : parseFloat(data.miles_drive) || 0,
        gas_level_pre_trip: data.gas_level_pre_trip || '',
        gas_level_post_trip: data.gas_level_post_trip || '',
        observation: data.observation || '',
      });

      setCarInfo({ brand: data.brand, model: data.model });

    } catch (err) {
      console.error('Error al cargar reservación:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar la reservación');
    }
  }, [reservationId, token, isAuthenticated, router]);

  // Cargar autos para el select
  const loadCars = useCallback(async () => {
    try {
      const data = await getAllCars();
      setCars(data);
    } catch (err) {
      console.error('Error al cargar autos:', err);
    }
  }, []);

  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    // Auth check reads cookies/localStorage, only available after mount; deferring
    // to an effect (rather than a lazy initializer) avoids an SSR hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadReservation(), loadCars()]);
      setIsLoading(false);
    };

    if (reservationId && !isNaN(reservationId)) {
      loadData();
    } else {
      setError('ID de reservación inválido');
      setIsLoading(false);
    }
  }, [reservationId, isAuthenticated, isChecking, loadReservation, loadCars, router, checkAuth]);

  // 🔥 Calcular total_earnings automáticamente - CORREGIDO
  useEffect(() => {
    const earnings = typeof formData.earnings === 'number' ? formData.earnings : parseFloat(formData.earnings) || 0;
    const extraCharges = typeof formData.extra_charges === 'number' ? formData.extra_charges : parseFloat(formData.extra_charges) || 0;
    const total = earnings + extraCharges;
    // Derived total_earnings kept in sync with its own inputs inside the same form state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(prev => ({ ...prev, total_earnings: total }));
  }, [formData.earnings, formData.extra_charges]);

  // 🔥 Calcular miles_drive automáticamente - CORREGIDO
  useEffect(() => {
    const preTrip = typeof formData.miles_pre_trip === 'number' ? formData.miles_pre_trip : parseFloat(formData.miles_pre_trip) || 0;
    const postTrip = typeof formData.miles_post_trip === 'number' ? formData.miles_post_trip : parseFloat(formData.miles_post_trip) || 0;
    const drive = postTrip - preTrip;
    // Derived miles_drive kept in sync with its own inputs inside the same form state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(prev => ({ ...prev, miles_drive: drive >= 0 ? drive : 0 }));
  }, [formData.miles_pre_trip, formData.miles_post_trip]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'check_in' || name === 'check_out') {
      const date = new Date(value);
      const timeStr = date ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00` : '';
      setFormData(prev => ({
        ...prev,
        [name]: value,
        [name === 'check_in' ? 'check_in_time' : 'check_out_time']: timeStr,
      }));
    } else if (name === 'earnings' || name === 'extra_charges' || name === 'miles_pre_trip' || name === 'miles_post_trip') {
      // 🔥 Para campos numéricos, convertir a número
      const numValue = value === '' ? 0 : parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
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

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
      
      let authToken: string | null = null;
      const cookieToken = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
      if (cookieToken) {
        authToken = cookieToken.split('=')[1];
      }
      if (!authToken) {
        authToken = localStorage.getItem('accessToken');
      }

      // Formatear check_in y check_out para la API
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
        observation: formData.observation || '---',
        check_in_time: formData.check_in_time || '00:00:00',
        check_out_time: formData.check_out_time || '00:00:00',
        miles_drive: formData.miles_drive,
        total_earnings: formData.total_earnings,
      };
      
      console.log('📤 Enviando payload PATCH:', payload);

      const response = await fetch(`${API_BASE_URL}/cars-reservation/${reservationId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudo actualizar la reservación'}`);
      }

      const result = await response.json();
      console.log('✅ Reservación actualizada:', result);
      
      setSuccess('Reservación actualizada exitosamente');
      
      setTimeout(() => {
        router.push(`/admin/cars/reservations/${formData.car_id}`);
      }, 1500);
      
    } catch (err) {
      console.error('Error al actualizar reservación:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al actualizar la reservación');
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

  return (
    <div className="wander-edit-reservation-container">
      <header className="wander-edit-reservation-header">
        <div>
          <span className="wander-breadcrumb">Listings / Cars / Edit Reservation</span>
          <h2>
            Edit Reservation #{reservationId}
            {carInfo && ` - ${carInfo.brand} ${carInfo.model}`}
          </h2>
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

      <form onSubmit={handleSubmit} className="wander-edit-reservation-form">
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
                disabled={isSubmitting}
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
              {/* 🔥 CORREGIDO: select con todos los atributos */}
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
                Guardando...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
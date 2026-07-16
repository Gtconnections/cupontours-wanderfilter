// app/admin/properties/reservations/edit/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { 
  getListingsNamesAndIds, 
  ListingSimple, 
  getReservationDetail, 
  ReservationDetail,
  updateReservation,
  UpdateReservationData  // 🔥 Importar la interfaz correcta
} from '@/app/lib/api/propertiesAdmin';
import { FiArrowLeft, FiSave, FiCalendar, FiUser, FiPhone, FiTag, FiDollarSign, FiClock, FiUsers, FiX } from 'react-icons/fi';
import './edit.css';

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

const PLATFORM_OPTIONS = [
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'vrbo', label: 'Vrbo' },
  { value: 'booking', label: 'Booking.com' },
  { value: 'cupon', label: 'Cupon Tours' },
  { value: 'direct', label: 'Direct' },
  { value: 'other', label: 'Other' },
];

export default function EditReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('id');
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [listings, setListings] = useState<ListingSimple[]>([]);
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isLoadingReservation, setIsLoadingReservation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAuthVerified, setIsAuthVerified] = useState(false);

  // Form state - usando los nombres correctos para la API
  const [formData, setFormData] = useState<UpdateReservationData>({
    confirmation_code: '',
    booked: '',
    listing_id: 0,
    start_date: '',
    end_date: '',
    status: 'confirmed',
    platform_reservation: 'airbnb',
    guest_name: '',
    guest_phone: '',
    number_of_guest: 1,
    earnings: '0',
    observations: '',
  });

  // Verificar autenticación
  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isChecking, checkAuth, router]);

  // Validar que hay un ID
  useEffect(() => {
    if (isAuthVerified && isAuthenticated) {
      if (!reservationId) {
        setError('No reservation ID provided');
        return;
      }
      loadData();
    }
  }, [isAuthVerified, isAuthenticated, reservationId]);

  // Cargar datos (listings y detalle de reservación)
  const loadData = async () => {
    setIsLoadingListings(true);
    setIsLoadingReservation(true);
    setError(null);

    try {
      // Cargar listings y detalle en paralelo
      const [listingsData, reservationData] = await Promise.all([
        getListingsNamesAndIds(),
        getReservationDetail(parseInt(reservationId!))
      ]);

      setListings(listingsData);
      setReservation(reservationData);
      
      // Setear form data con los datos de la reservación - usando los nombres correctos
      setFormData({
        confirmation_code: reservationData.confirmation_code || '',
        booked: reservationData.booked || '',
        listing_id: reservationData.listing_id || 0,
        start_date: reservationData.start_date || '',
        end_date: reservationData.end_date || '',
        status: reservationData.status || 'confirmed',
        platform_reservation: reservationData.platform_reservation || 'airbnb',
        guest_name: reservationData.guest_name || '',
        guest_phone: reservationData.guest_phone || '',
        number_of_guest: reservationData.number_of_guest || 1,
        earnings: reservationData.earnings?.toString() || '0',
        observations: reservationData.observations || '',
      });

    } catch (err: any) {
      console.error('❌ Error al cargar datos:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setIsLoadingListings(false);
      setIsLoadingReservation(false);
    }
  };

  // Manejar cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.listing_id) {
      setError('Please select a listing');
      return;
    }
    if (!formData.confirmation_code.trim()) {
      setError('Please enter a confirmation code');
      return;
    }
    if (!formData.booked) {
      setError('Please select a booking date');
      return;
    }
    if (!formData.start_date) {
      setError('Please select a start date');
      return;
    }
    if (!formData.end_date) {
      setError('Please select an end date');
      return;
    }
    if (!formData.guest_name.trim()) {
      setError('Please enter the guest name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Preparar los datos para la API - con los nombres correctos
      const payload = {
        confirmation_code: formData.confirmation_code,
        booked: formData.booked,
        listing_id: formData.listing_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        platform_reservation: formData.platform_reservation,
        guest_name: formData.guest_name,
        guest_phone: formData.guest_phone,
        number_of_guest: formData.number_of_guest,
        earnings: formData.earnings.toString(),
        observations: formData.observations,
      };

      const result = await updateReservation(parseInt(reservationId!), payload);
      console.log('✅ Reservación actualizada:', result);
      
      setToastMessage('✅ Reservation updated successfully!');
      setTimeout(() => setToastMessage(null), 3000);
      
      // Redirigir a la lista de reservaciones de la propiedad
      setTimeout(() => {
        router.push(`/admin/properties/reservations/${formData.listing_id}`);
      }, 1500);
      
    } catch (err: any) {
      console.error('❌ Error al actualizar reservación:', err);
      setError(err.message || 'Error al actualizar la reservación');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking || !isAuthVerified) {
    return (
      <div className="wander-edit-reservation-container">
        <div className="wander-edit-reservation-loading">
          <div className="wander-loading-spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Si está cargando los datos
  if (isLoadingListings || isLoadingReservation) {
    return (
      <div className="wander-edit-reservation-container">
        <div className="wander-edit-reservation-loading">
          <div className="wander-loading-spinner"></div>
          <p>Cargando datos de la reservación...</p>
        </div>
      </div>
    );
  }

  if (error && !reservation) {
    return (
      <div className="wander-edit-reservation-container">
        <div className="wander-edit-reservation-header">
          <div className="wander-edit-reservation-header-content">
            <div>
              <div className="wander-edit-reservation-breadcrumb">
                LISTINGS / PROPERTIES / RESERVATIONS / EDIT
              </div>
              <h1>Edit Reservation</h1>
            </div>
          </div>
        </div>
        <div className="wander-edit-reservation-error-state">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={() => router.back()} className="wander-edit-reservation-btn-back">
            <FiArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-edit-reservation-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="wander-toast">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="wander-edit-reservation-header">
        <div className="wander-edit-reservation-header-content">
          <div>
            <div className="wander-edit-reservation-breadcrumb">
              LISTINGS / PROPERTIES / RESERVATIONS / EDIT
            </div>
            <h1>Edit Reservation</h1>
            {reservation && (
              <div className="wander-edit-reservation-subtitle">
                Editing reservation #{reservation.id} for {reservation.listing_name}
              </div>
            )}
          </div>
          <div className="wander-edit-reservation-header-actions">
            <Link 
              href={formData.listing_id ? `/admin/properties/reservations/${formData.listing_id}` : '/admin/properties/profit-and-loss'}
              className="wander-edit-reservation-btn back"
            >
              <FiArrowLeft size={16} />
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="wander-edit-reservation-form">
        {/* Sección Primary Info */}
        <div className="wander-edit-reservation-section">
          <h2>Primary info</h2>
          <div className="wander-edit-reservation-grid">
            <div className="wander-edit-reservation-field">
              <label className="wander-edit-reservation-label">
                <FiTag size={16} />
                Confirmation code
              </label>
              <input
                type="text"
                name="confirmation_code"
                className="wander-edit-reservation-input"
                placeholder="Enter confirmation code..."
                value={formData.confirmation_code}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="wander-edit-reservation-field">
              <label className="wander-edit-reservation-label">
                <FiCalendar size={16} />
                Booking date
              </label>
              <input
                type="date"
                name="booked"
                className="wander-edit-reservation-input"
                value={formData.booked}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="wander-edit-reservation-field">
              <label className="wander-edit-reservation-label">
                <FiTag size={16} />
                Listing
              </label>
              <select
                name="listing_id"
                className="wander-edit-reservation-select"
                value={formData.listing_id}
                onChange={handleChange}
                disabled={true}
                required
              >
                <option value={0}>Select a value</option>
                {listings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.name} (ID: {listing.id})
                  </option>
                ))}
              </select>
              <span className="wander-edit-reservation-locked">
                (Cannot be changed)
              </span>
            </div>

            <div className="wander-edit-reservation-field">
              <label className="wander-edit-reservation-label">
                <FiCalendar size={16} />
                Start date
              </label>
              <input
                type="date"
                name="start_date"
                className="wander-edit-reservation-input"
                value={formData.start_date}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="wander-edit-reservation-field">
              <label className="wander-edit-reservation-label">
                <FiCalendar size={16} />
                End date
              </label>
              <input
                type="date"
                name="end_date"
                className="wander-edit-reservation-input"
                value={formData.end_date}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="wander-edit-reservation-field">
              <label className="wander-edit-reservation-label">
                <FiClock size={16} />
                Reservation status
              </label>
              <select
                name="status"
                className="wander-edit-reservation-select"
                value={formData.status}
                onChange={handleChange}
                disabled={isLoading}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="wander-edit-reservation-field">
              <label className="wander-edit-reservation-label">
                <FiTag size={16} />
                Platform
              </label>
              <select
                name="platform_reservation"
                className="wander-edit-reservation-select"
                value={formData.platform_reservation}
                onChange={handleChange}
                disabled={isLoading}
              >
                {PLATFORM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sección Guest Info */}
        <div className="wander-edit-reservation-section">
          <h2>Guest info</h2>
          <div className="wander-edit-reservation-grid">
            <div className="wander-edit-reservation-field">
              <label className="wander-edit-reservation-label">
                <FiUsers size={16} />
                Number of guests
              </label>
              <input
                type="number"
                name="number_of_guest"
                className="wander-edit-reservation-input"
                placeholder="Number of guests..."
                value={formData.number_of_guest}
                onChange={handleChange}
                disabled={isLoading}
                min="1"
                required
              />
            </div>

            <div className="wander-edit-reservation-field">
              <label className="wander-edit-reservation-label">
                <FiUser size={16} />
                Guest name
              </label>
              <input
                type="text"
                name="guest_name"
                className="wander-edit-reservation-input"
                placeholder="Enter guest name..."
                value={formData.guest_name}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="wander-edit-reservation-field">
              <label className="wander-edit-reservation-label">
                <FiPhone size={16} />
                Guest phone
              </label>
              <input
                type="text"
                name="guest_phone"
                className="wander-edit-reservation-input"
                placeholder="Enter guest phone..."
                value={formData.guest_phone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="wander-edit-reservation-field">
              <label className="wander-edit-reservation-label">
                <FiDollarSign size={16} />
                Earnings
              </label>
              <input
                type="text"
                name="earnings"
                className="wander-edit-reservation-input"
                placeholder="0.00"
                value={formData.earnings}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="wander-edit-reservation-field full-width">
              <label className="wander-edit-reservation-label">
                <FiTag size={16} />
                Observations
              </label>
              <textarea
                name="observations"
                className="wander-edit-reservation-textarea"
                placeholder="Enter observations..."
                value={formData.observations}
                onChange={handleChange}
                disabled={isLoading}
                rows={4}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="wander-edit-reservation-error">
            <FiX size={16} />
            {error}
          </div>
        )}

        <div className="wander-edit-reservation-footer">
          <button
            type="button"
            className="wander-edit-reservation-btn cancel"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="wander-edit-reservation-btn submit"
            disabled={isLoading}
          >
            <FiSave size={16} />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
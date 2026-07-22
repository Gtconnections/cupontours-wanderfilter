// app/admin/properties/reservations/create/page.tsx

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getListingsNamesAndIds, ListingSimple, createReservation, CreateReservationData } from '@/app/lib/api/propertiesAdmin';
import { FiArrowLeft, FiSave, FiCalendar, FiUser, FiPhone, FiTag, FiDollarSign, FiClock, FiUsers, FiX } from 'react-icons/fi';
import './create.css';

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

const PLATFORM_OPTIONS = [
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'vrbo', label: 'Vrbo' },
  { value: 'cupon', label: 'Cupon Tours' },
];

function CreateReservationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingIdParam = searchParams.get('listing_id');
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [listings, setListings] = useState<ListingSimple[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAuthVerified, setIsAuthVerified] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateReservationData>({
    confirmation_code: '',
    booked: '',
    listing_id: 0,
    check_in: '',
    check_out: '',
    reservation_status: 'confirmed',
    platform_reservation: 'airbnb',
    guest_name: '',
    guest_phone: '',
    number_of_guest: 1,
    earnings: 0,
    observations: '',
  });

  const [isListingLocked, setIsListingLocked] = useState(false);

  // Verificar autenticación
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
  }, [isAuthenticated, isChecking, checkAuth, router]);

  // Cargar listings desde la API
  const loadListings = async () => {
    setIsLoadingListings(true);
    try {
      const data = await getListingsNamesAndIds();
      setListings(data);
      
      // Verificar si viene un listing_id en la URL
      if (listingIdParam) {
        const id = parseInt(listingIdParam);
        const listingExists = data.some(l => l.id === id);
        if (listingExists) {
          setFormData(prev => ({ ...prev, listing_id: id }));
          setIsListingLocked(true);
        }
      }
    } catch (err) {
      console.error('❌ Error al cargar listings:', err);
      setError('Error al cargar la lista de propiedades');
    } finally {
      setIsLoadingListings(false);
    }
  };

  // Cargar listings
  useEffect(() => {
    if (isAuthVerified && isAuthenticated) {
      // Fetches data once auth is confirmed.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadListings();
    }
  }, [isAuthVerified, isAuthenticated]);

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
    if (!formData.check_in) {
      setError('Please select a check-in date');
      return;
    }
    if (!formData.check_out) {
      setError('Please select a check-out date');
      return;
    }
    if (!formData.guest_name.trim()) {
      setError('Please enter the guest name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createReservation(formData);
      
      setToastMessage('✅ Reservation created successfully!');
      setTimeout(() => setToastMessage(null), 3000);
      
      // Redirigir a la lista de reservaciones de la propiedad
      setTimeout(() => {
        router.push(`/admin/properties/reservations/${formData.listing_id}`);
      }, 1500);
      
    } catch (err) {
      console.error('❌ Error al crear reservación:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al crear la reservación');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking || !isAuthVerified) {
    return (
      <div className="wander-create-reservation-container">
        <div className="wander-create-reservation-loading">
          <div className="wander-loading-spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // 🔥 Determinar la URL de back basada en si hay listing_id o no
  const backUrl = formData.listing_id 
    ? `/admin/properties/reservations/${formData.listing_id}`
    : '/admin/properties/profit-and-loss';

  return (
    <div className="wander-create-reservation-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="wander-toast">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="wander-create-reservation-header">
        <div className="wander-create-reservation-header-content">
          <div>
            <div className="wander-create-reservation-breadcrumb">
              LISTINGS / PROPERTIES / RESERVATIONS / CREATE
            </div>
            <h1>Create Reservation</h1>
          </div>
          {/* 🔥 Solo mostrar Back si hay listing_id */}
          {formData.listing_id > 0 && (
            <div className="wander-create-reservation-header-actions">
              <Link 
                href={backUrl}
                className="wander-create-reservation-btn back"
              >
                <FiArrowLeft size={16} />
                Back
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="wander-create-reservation-form">
        {/* Sección Primary Info */}
        <div className="wander-create-reservation-section">
          <h2>Primary info</h2>
          <div className="wander-create-reservation-grid">
            <div className="wander-create-reservation-field">
              <label className="wander-create-reservation-label">
                <FiTag size={16} />
                Confirmation code
              </label>
              <input
                type="text"
                name="confirmation_code"
                className="wander-create-reservation-input"
                placeholder="Enter confirmation code..."
                value={formData.confirmation_code}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="wander-create-reservation-field">
              <label className="wander-create-reservation-label">
                <FiCalendar size={16} />
                Booking date
              </label>
              <input
                type="date"
                name="booked"
                className="wander-create-reservation-input"
                value={formData.booked}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="wander-create-reservation-field">
              <label className="wander-create-reservation-label">
                <FiTag size={16} />
                Listing
              </label>
              <select
                name="listing_id"
                className="wander-create-reservation-select"
                value={formData.listing_id}
                onChange={handleChange}
                disabled={isLoading || isLoadingListings || isListingLocked}
                required
              >
                <option value={0}>Select a value</option>
                {listings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.name} (ID: {listing.id})
                  </option>
                ))}
              </select>
              {isListingLocked && (
                <span className="wander-create-reservation-locked">
                  (Locked from property detail)
                </span>
              )}
              {isLoadingListings && (
                <div className="wander-create-reservation-loading-list">
                  Loading listings...
                </div>
              )}
            </div>

            <div className="wander-create-reservation-field">
              <label className="wander-create-reservation-label">
                <FiCalendar size={16} />
                Check in
              </label>
              <input
                type="date"
                name="check_in"
                className="wander-create-reservation-input"
                value={formData.check_in}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="wander-create-reservation-field">
              <label className="wander-create-reservation-label">
                <FiCalendar size={16} />
                Check out
              </label>
              <input
                type="date"
                name="check_out"
                className="wander-create-reservation-input"
                value={formData.check_out}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="wander-create-reservation-field">
              <label className="wander-create-reservation-label">
                <FiClock size={16} />
                Reservation status
              </label>
              <select
                name="reservation_status"
                className="wander-create-reservation-select"
                value={formData.reservation_status}
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

            <div className="wander-create-reservation-field">
              <label className="wander-create-reservation-label">
                <FiTag size={16} />
                Platform
              </label>
              <select
                name="platform_reservation"
                className="wander-create-reservation-select"
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
        <div className="wander-create-reservation-section">
          <h2>Guest info</h2>
          <div className="wander-create-reservation-grid">
            <div className="wander-create-reservation-field">
              <label className="wander-create-reservation-label">
                <FiUsers size={16} />
                Number of guests
              </label>
              <input
                type="number"
                name="number_of_guest"
                className="wander-create-reservation-input"
                placeholder="Number of guests..."
                value={formData.number_of_guest}
                onChange={handleChange}
                disabled={isLoading}
                min="1"
                required
              />
            </div>

            <div className="wander-create-reservation-field">
              <label className="wander-create-reservation-label">
                <FiUser size={16} />
                Guest name
              </label>
              <input
                type="text"
                name="guest_name"
                className="wander-create-reservation-input"
                placeholder="Enter guest name..."
                value={formData.guest_name}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="wander-create-reservation-field">
              <label className="wander-create-reservation-label">
                <FiPhone size={16} />
                Guest phone
              </label>
              <input
                type="text"
                name="guest_phone"
                className="wander-create-reservation-input"
                placeholder="Enter guest phone..."
                value={formData.guest_phone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="wander-create-reservation-field">
              <label className="wander-create-reservation-label">
                <FiDollarSign size={16} />
                Earnings
              </label>
              <input
                type="number"
                name="earnings"
                className="wander-create-reservation-input"
                placeholder="0.00"
                value={formData.earnings}
                onChange={handleChange}
                disabled={isLoading}
                step="0.01"
                min="0"
              />
            </div>

            <div className="wander-create-reservation-field full-width">
              <label className="wander-create-reservation-label">
                <FiTag size={16} />
                Observations
              </label>
              <textarea
                name="observations"
                className="wander-create-reservation-textarea"
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
          <div className="wander-create-reservation-error">
            <FiX size={16} />
            {error}
          </div>
        )}

        <div className="wander-create-reservation-footer">
          <button
            type="button"
            className="wander-create-reservation-btn cancel"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="wander-create-reservation-btn submit"
            disabled={isLoading}
          >
            <FiSave size={16} />
            {isLoading ? 'Saving...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateReservationPage() {
  return (
    <Suspense fallback={null}>
      <CreateReservationContent />
    </Suspense>
  );
}
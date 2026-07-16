// app/admin/properties/components/ModalReservationDetail.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiUser, FiPhone, FiMapPin, FiDollarSign, FiTag, FiClock } from 'react-icons/fi';
import { ReservationDetail } from '@/app/lib/api/propertiesAdmin';
import './ModalReservationDetail.css';

interface ModalReservationDetailProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: ReservationDetail | null;
  isLoading: boolean;
}

export default function ModalReservationDetail({
  isOpen,
  onClose,
  reservation,
  isLoading,
}: ModalReservationDetailProps) {
  
  if (!isOpen) return null;

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    });
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Obtener badge de estado
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { class: string; label: string }> = {
      confirmed: { class: 'confirmed', label: 'Confirmed' },
      pending: { class: 'pending', label: 'Pending' },
      cancelled: { class: 'cancelled', label: 'Cancelled' },
      completed: { class: 'completed', label: 'Completed' },
    };
    const statusInfo = statusMap[status?.toLowerCase()] || { class: 'default', label: status || 'N/A' };
    return <span className={`wander-rd-status ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  return (
    <div 
      className="wander-rd-overlay" 
      onClick={onClose}
    >
      <div className="wander-rd-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-rd-header">
          <h2>Reservation Details</h2>
          <button className="wander-rd-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-rd-body">
          {isLoading ? (
            <div className="wander-rd-loading">
              <div className="wander-loading-spinner"></div>
              <p>Cargando detalles...</p>
            </div>
          ) : reservation ? (
            <>
              {/* Header del listing */}
              <div className="wander-rd-listing-header">
                <h3>{reservation.listing_name}</h3>
                <div className="wander-rd-listing-id">ID: #{reservation.listing_id}</div>
              </div>

              {/* Grid de información */}
              <div className="wander-rd-grid">
                {/* Confirmación */}
                <div className="wander-rd-item">
                  <div className="wander-rd-item-icon">
                    <FiTag size={18} />
                  </div>
                  <div className="wander-rd-item-content">
                    <span className="wander-rd-item-label">Confirmation Code</span>
                    <span className="wander-rd-item-value highlight">
                      {reservation.confirmation_code || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Estado */}
                <div className="wander-rd-item">
                  <div className="wander-rd-item-icon">
                    <FiClock size={18} />
                  </div>
                  <div className="wander-rd-item-content">
                    <span className="wander-rd-item-label">Status</span>
                    <span className="wander-rd-item-value">
                      {getStatusBadge(reservation.status)}
                    </span>
                  </div>
                </div>

                {/* Fechas */}
                <div className="wander-rd-item full">
                  <div className="wander-rd-item-icon">
                    <FiCalendar size={18} />
                  </div>
                  <div className="wander-rd-item-content">
                    <span className="wander-rd-item-label">Stay Dates</span>
                    <span className="wander-rd-item-value">
                      {formatDate(reservation.start_date)} — {formatDate(reservation.end_date)}
                    </span>
                    <span className="wander-rd-item-sub">
                      {reservation.nights} nights • Booked on {formatDate(reservation.booked)}
                    </span>
                  </div>
                </div>

                {/* Huésped */}
                <div className="wander-rd-item full">
                  <div className="wander-rd-item-icon">
                    <FiUser size={18} />
                  </div>
                  <div className="wander-rd-item-content">
                    <span className="wander-rd-item-label">Guest</span>
                    <span className="wander-rd-item-value">
                      {reservation.guest_name || 'N/A'}
                    </span>
                    <span className="wander-rd-item-sub">
                      {reservation.number_of_guest} guests • ID: #{reservation.guest_id}
                    </span>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="wander-rd-item full">
                  <div className="wander-rd-item-icon">
                    <FiPhone size={18} />
                  </div>
                  <div className="wander-rd-item-content">
                    <span className="wander-rd-item-label">Phone</span>
                    <span className="wander-rd-item-value">
                      {reservation.guest_phone && reservation.guest_phone !== '0' 
                        ? reservation.guest_phone 
                        : 'Not provided'}
                    </span>
                  </div>
                </div>

                {/* Earnings */}
                <div className="wander-rd-item full">
                  <div className="wander-rd-item-icon earnings">
                    <FiDollarSign size={18} />
                  </div>
                  <div className="wander-rd-item-content">
                    <span className="wander-rd-item-label">Earnings</span>
                    <span className="wander-rd-item-value earnings">
                      {formatCurrency(reservation.earnings)}
                    </span>
                  </div>
                </div>

                {/* Reservación Tipo y Plataforma */}
                <div className="wander-rd-item full">
                  <div className="wander-rd-item-icon">
                    <FiMapPin size={18} />
                  </div>
                  <div className="wander-rd-item-content">
                    <span className="wander-rd-item-label">Reservation Type</span>
                    <span className="wander-rd-item-value">
                      {reservation.reservation_type || 'N/A'}
                    </span>
                    <span className="wander-rd-item-sub">
                      Platform: {reservation.platform_reservation || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Observaciones */}
                {reservation.observations && (
                  <div className="wander-rd-item full">
                    <div className="wander-rd-item-icon">
                      <FiClock size={18} />
                    </div>
                    <div className="wander-rd-item-content">
                      <span className="wander-rd-item-label">Observations</span>
                      <span className="wander-rd-item-value">
                        {reservation.observations}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="wander-rd-error">
              <p>No se pudo cargar el detalle de la reservación</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wander-rd-footer">
          <button className="wander-rd-btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
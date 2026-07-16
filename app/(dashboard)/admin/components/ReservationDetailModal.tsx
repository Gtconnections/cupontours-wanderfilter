// components/ReservationDetailModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ReservationDetail {
  id: number;
  car_id: number;
  brand: string;
  model: string;
  driver: string;
  phone: string;
  check_in: string;
  check_out: string;
  earnings: number;
  extra_charges: number;
  total_earnings: number;
  miles_pre_trip: number;
  miles_post_trip: number;
  miles_drive: number;
  gas_level_pre_trip: string;
  gas_level_post_trip: string;
  observation: string | null;
}

interface ReservationDetailModalProps {
  isOpen: boolean;
  reservationId: number;
  carId: number;
  onClose: () => void;
  onDelete: () => void;
}

// Modal de confirmación para eliminar
const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="wander-modal-overlay" onClick={onClose} style={{
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
      <div className="wander-modal wander-modal-delete" onClick={(e) => e.stopPropagation()} style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '440px',
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
          }}>Eliminar Reservación</h2>
          <button className="wander-modal-close" onClick={onClose} style={{
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

        <div className="wander-modal-body" style={{ padding: '24px 28px' }}>
          <div className="wander-delete-confirm" style={{ textAlign: 'center', padding: '8px 0' }}>
            <span className="wander-delete-icon" style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>⚠️</span>
            <p style={{ fontSize: '15px', color: '#333333', margin: '8px 0' }}>
              ¿Estás seguro que deseas eliminar esta reservación?
            </p>
            <p className="wander-delete-warning" style={{ fontSize: '13px', color: '#717171', marginTop: '4px' }}>
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <div className="wander-modal-actions" style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          padding: '16px 28px 24px',
          borderTop: '1px solid #ebebeb',
        }}>
          <button
            type="button"
            onClick={onClose}
            className="wander-btn-cancel"
            disabled={isLoading}
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
            type="button"
            onClick={onConfirm}
            className="wander-btn-delete"
            disabled={isLoading}
            style={{
              padding: '10px 24px',
              background: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? (
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
                Eliminando...
              </>
            ) : (
              'Eliminar Reservación'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ReservationDetailModal({ 
  isOpen, 
  reservationId, 
  carId,
  onClose, 
  onDelete 
}: ReservationDetailModalProps) {
  const router = useRouter();
  const [data, setData] = useState<ReservationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchDetail = async () => {
    if (!isOpen || !reservationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
      
      let token: string | null = null;
      const cookieToken = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
      if (cookieToken) {
        token = cookieToken.split('=')[1];
      }
      if (!token) {
        token = localStorage.getItem('accessToken');
      }

      const response = await fetch(`${API_BASE_URL}/cars-reservation/${reservationId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo cargar el detalle`);
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error('Error al cargar detalle:', err);
      setError(err.message || 'Error al cargar los detalles de la reservación');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [isOpen, reservationId]);

  // 🔥 VERIFICAR SI LA RESERVACIÓN YA PASÓ
  const isReservationPast = () => {
    if (!data) return false;
    const checkOut = new Date(data.check_out);
    const now = new Date();
    return checkOut < now;
  };

  const handleEdit = () => {
    router.push(`/admin/cars/reservations/edit/${reservationId}`);
    onClose();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api').replace(/\/$/, "");
      
      let token: string | null = null;
      const cookieToken = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
      if (cookieToken) {
        token = cookieToken.split('=')[1];
      }
      if (!token) {
        token = localStorage.getItem('accessToken');
      }

      const response = await fetch(`${API_BASE_URL}/cars-reservation/${reservationId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo eliminar la reservación`);
      }

      setShowDeleteConfirm(false);
      onDelete();
      onClose();
    } catch (err: any) {
      console.error('Error al eliminar:', err);
      setError(err.message || 'Error al eliminar la reservación');
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  const isPast = isReservationPast();

  return (
    <>
      <div className="wander-modal-overlay" onClick={onClose} style={{
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
        zIndex: 9999,
        padding: '20px',
      }}>
        <div className="wander-modal wander-modal-detail" onClick={(e) => e.stopPropagation()} style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '700px',
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
            }}>Detalle de Reservación</h2>
            <button className="wander-modal-close" onClick={onClose} style={{
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

          <div className="wander-modal-body" style={{ padding: '24px 28px' }}>
            {isLoading && (
              <div className="wander-detail-loading" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                gap: '16px',
              }}>
                <div className="wander-loading-spinner" style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #f0f0f0',
                  borderTop: '3px solid #000000',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}></div>
                <p style={{ color: '#717171', fontSize: '14px' }}>Cargando detalles...</p>
              </div>
            )}

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

            {!isLoading && !error && data && (
              <>
                <div className="wander-detail-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Encabezado con ID y auto */}
                  <div className="wander-detail-header-card" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#fafafa',
                    padding: '16px 20px',
                    borderRadius: '10px',
                    border: '1px solid #ebebeb',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}>
                    <div className="wander-detail-id" style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span className="wander-detail-label" style={{ fontSize: '12px', color: '#717171' }}>Reservación #</span>
                      <span className="wander-detail-value" style={{ fontSize: '20px', fontWeight: 700, color: '#000000' }}>{data.id}</span>
                    </div>
                    <div className="wander-detail-car" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span className="wander-detail-label" style={{ fontSize: '11px', color: '#717171', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Auto</span>
                      <span className="wander-detail-value" style={{ fontSize: '16px', fontWeight: 600, color: '#000000' }}>{data.brand} {data.model}</span>
                      <span className="wander-detail-sub" style={{ fontSize: '12px', color: '#999999' }}>ID: {data.car_id}</span>
                    </div>
                  </div>

                  {/* Grid de información */}
                  <div className="wander-detail-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                  }}>
                    <div className="wander-detail-column" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="wander-detail-section-card" style={{
                        background: '#fafafa',
                        border: '1px solid #ebebeb',
                        borderRadius: '10px',
                        padding: '16px 20px',
                      }}>
                        <h4 style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: 700,
                          color: '#717171',
                          margin: '0 0 12px 0',
                          paddingBottom: '8px',
                          borderBottom: '1px solid #ebebeb',
                        }}>Conductor</h4>
                        <div className="wander-detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span className="wander-detail-label" style={{ fontSize: '13px', color: '#717171' }}>Nombre</span>
                          <span className="wander-detail-value" style={{ fontSize: '13px', fontWeight: 500, color: '#000000' }}>{data.driver}</span>
                        </div>
                        <div className="wander-detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span className="wander-detail-label" style={{ fontSize: '13px', color: '#717171' }}>Teléfono</span>
                          <span className="wander-detail-value" style={{ fontSize: '13px', fontWeight: 500, color: '#000000' }}>{data.phone}</span>
                        </div>
                      </div>

                      <div className="wander-detail-section-card" style={{
                        background: '#fafafa',
                        border: '1px solid #ebebeb',
                        borderRadius: '10px',
                        padding: '16px 20px',
                      }}>
                        <h4 style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: 700,
                          color: '#717171',
                          margin: '0 0 12px 0',
                          paddingBottom: '8px',
                          borderBottom: '1px solid #ebebeb',
                        }}>Fechas</h4>
                        <div className="wander-detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span className="wander-detail-label" style={{ fontSize: '13px', color: '#717171' }}>Check In</span>
                          <span className="wander-detail-value" style={{ fontSize: '13px', fontWeight: 500, color: '#000000' }}>{formatDate(data.check_in)}</span>
                        </div>
                        <div className="wander-detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span className="wander-detail-label" style={{ fontSize: '13px', color: '#717171' }}>Check Out</span>
                          <span className="wander-detail-value" style={{ fontSize: '13px', fontWeight: 500, color: '#000000' }}>{formatDate(data.check_out)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="wander-detail-column" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="wander-detail-section-card" style={{
                        background: '#fafafa',
                        border: '1px solid #ebebeb',
                        borderRadius: '10px',
                        padding: '16px 20px',
                      }}>
                        <h4 style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: 700,
                          color: '#717171',
                          margin: '0 0 12px 0',
                          paddingBottom: '8px',
                          borderBottom: '1px solid #ebebeb',
                        }}>Kilometraje</h4>
                        <div className="wander-detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span className="wander-detail-label" style={{ fontSize: '13px', color: '#717171' }}>Pre-Trip</span>
                          <span className="wander-detail-value" style={{ fontSize: '13px', fontWeight: 500, color: '#000000' }}>{data.miles_pre_trip} mi</span>
                        </div>
                        <div className="wander-detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span className="wander-detail-label" style={{ fontSize: '13px', color: '#717171' }}>Post-Trip</span>
                          <span className="wander-detail-value" style={{ fontSize: '13px', fontWeight: 500, color: '#000000' }}>{data.miles_post_trip} mi</span>
                        </div>
                        <div className="wander-detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span className="wander-detail-label" style={{ fontSize: '13px', color: '#717171' }}>Total Recorrido</span>
                          <span className="wander-detail-value" style={{ fontSize: '13px', fontWeight: 500, color: '#000000' }}>{data.miles_drive} mi</span>
                        </div>
                      </div>

                      <div className="wander-detail-section-card" style={{
                        background: '#fafafa',
                        border: '1px solid #ebebeb',
                        borderRadius: '10px',
                        padding: '16px 20px',
                      }}>
                        <h4 style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: 700,
                          color: '#717171',
                          margin: '0 0 12px 0',
                          paddingBottom: '8px',
                          borderBottom: '1px solid #ebebeb',
                        }}>Nivel de Gasolina</h4>
                        <div className="wander-detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span className="wander-detail-label" style={{ fontSize: '13px', color: '#717171' }}>Pre-Trip</span>
                          <span className="wander-detail-value" style={{ fontSize: '13px', fontWeight: 500, color: '#000000' }}>{data.gas_level_pre_trip}</span>
                        </div>
                        <div className="wander-detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span className="wander-detail-label" style={{ fontSize: '13px', color: '#717171' }}>Post-Trip</span>
                          <span className="wander-detail-value" style={{ fontSize: '13px', fontWeight: 500, color: '#000000' }}>{data.gas_level_post_trip}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección Financiera */}
                  <div className="wander-detail-financial" style={{ marginTop: '4px' }}>
                    <div className="wander-detail-section-card" style={{
                      background: '#fafafa',
                      border: '1px solid #ebebeb',
                      borderRadius: '10px',
                      padding: '16px 20px',
                    }}>
                      <h4 style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: 700,
                        color: '#717171',
                        margin: '0 0 12px 0',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #ebebeb',
                      }}>Financiero</h4>
                      <div className="wander-detail-financial-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '8px',
                      }}>
                        <div className="wander-detail-item" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          padding: '8px 4px',
                          background: '#ffffff',
                          borderRadius: '8px',
                        }}>
                          <span className="wander-detail-label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3px', color: '#999999' }}>Ganancias</span>
                          <span className="wander-detail-value" style={{ fontSize: '16px', fontWeight: 700, color: '#000000', marginTop: '2px' }}>{formatCurrency(data.earnings)}</span>
                        </div>
                        <div className="wander-detail-item" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          padding: '8px 4px',
                          background: '#ffffff',
                          borderRadius: '8px',
                        }}>
                          <span className="wander-detail-label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3px', color: '#999999' }}>Cargos Extra</span>
                          <span className="wander-detail-value" style={{ fontSize: '16px', fontWeight: 700, color: '#000000', marginTop: '2px' }}>{formatCurrency(data.extra_charges)}</span>
                        </div>
                        <div className="wander-detail-item wander-detail-total" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          padding: '8px 4px',
                          background: '#f0f0f0',
                          borderRadius: '8px',
                        }}>
                          <span className="wander-detail-label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3px', color: '#999999' }}>Ganancias Totales</span>
                          <span className="wander-detail-value" style={{ fontSize: '16px', fontWeight: 700, color: '#000000', marginTop: '2px' }}>{formatCurrency(data.total_earnings)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="wander-detail-section-card" style={{
                    background: '#fafafa',
                    border: '1px solid #ebebeb',
                    borderRadius: '10px',
                    padding: '16px 20px',
                  }}>
                    <h4 style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 700,
                      color: '#717171',
                      margin: '0 0 12px 0',
                      paddingBottom: '8px',
                      borderBottom: '1px solid #ebebeb',
                    }}>Observaciones</h4>
                    <div className="wander-detail-observation" style={{ padding: '4px 0' }}>
                      {data.observation ? (
                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#333333', margin: 0, whiteSpace: 'pre-wrap' }}>{data.observation}</p>
                      ) : (
                        <span className="wander-detail-empty" style={{ fontSize: '13px', color: '#999999', fontStyle: 'italic' }}>Sin observaciones</span>
                      )}
                    </div>
                  </div>

                  {/* 🔥 ACCIONES: EDIT y DELETE - SOLO SI NO HA PASADO LA FECHA */}
                  {!isPast && (
                    <div className="wander-detail-actions" style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'flex-end',
                      marginTop: '20px',
                      paddingTop: '16px',
                      borderTop: '1px solid #ebebeb',
                    }}>
                      <button
                        onClick={handleEdit}
                        className="wander-btn-edit"
                        style={{
                          padding: '8px 20px',
                          background: '#000000',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 500,
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="wander-btn-delete"
                        style={{
                          padding: '8px 20px',
                          background: '#dc2626',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 500,
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}

                  {/* 🔥 Mensaje si la reservación ya pasó */}
                  {isPast && (
                    <div className="wander-detail-past-message" style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: '20px',
                      paddingTop: '16px',
                      borderTop: '1px solid #ebebeb',
                    }}>
                      <span style={{
                        padding: '8px 16px',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}>
                        📅 Esta reservación ya ha finalizado
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="wander-modal-actions" style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            padding: '16px 28px 24px',
            borderTop: '1px solid #ebebeb',
          }}>
            <button
              type="button"
              onClick={onClose}
              className="wander-btn-cancel"
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
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Estilos de animación */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(30px) scale(0.96);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { 
  getCarById, 
  CarDetail, 
  refreshCarDetail,
  updateCar,
  uploadCarImages,
  deleteCar
} from '@/app/lib/api/carsAdmin';
import EditCarModal from '../../components/EditCarModal';
import AddCarImagesModal from '../../components/AddCarImagesModal';
import DeleteCarModal from '../../components/DeleteCarModal';
import './car-detail.css';

const LoadingSkeleton = () => (
  <div className="wander-car-detail-container">
    <div className="wander-car-detail-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando detalles del auto...</p>
    </div>
  </div>
);

export default function CarDetailPage() {
  const router = useRouter();
  const params = useParams();
  const carId = parseInt(params.id as string);
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [car, setCar] = useState<CarDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 🔥 ESTADOS PARA MODALES - Inicializados explícitamente
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🔥 FUNCIONES PARA ABRIR MODALES CON LOGS
  const openEditModal = () => {
    console.log('✏️ Abriendo modal de edición');
    setIsEditModalOpen(true);
  };

  const openImagesModal = () => {
    console.log('🖼️ Abriendo modal de imágenes');
    setIsImagesModalOpen(true);
  };

  const openDeleteModal = () => {
    console.log('🗑️ Abriendo modal de eliminación');
    setIsDeleteModalOpen(true);
  };

  const closeEditModal = () => {
    console.log('🔒 Cerrando modal de edición');
    setIsEditModalOpen(false);
  };

  const closeImagesModal = () => {
    console.log('🔒 Cerrando modal de imágenes');
    setIsImagesModalOpen(false);
  };

  const closeDeleteModal = () => {
    console.log('🔒 Cerrando modal de eliminación');
    setIsDeleteModalOpen(false);
  };

  const loadCarDetail = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getCarById(carId, forceRefresh);
      setCar(data);
      if (data.principal_image) {
        setSelectedImage(data.principal_image);
      }
      // Limpiar mensaje de éxito después de 3 segundos
      if (successMessage) {
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('❌ Error cargando auto:', err);
      setError(err.message || 'Error al cargar los detalles del auto');
    } finally {
      setIsLoading(false);
    }
  }, [carId, token, isAuthenticated, router, successMessage]);

  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }

    if (carId && !isNaN(carId)) {
      loadCarDetail();
    } else {
      setError('ID de auto inválido');
      setIsLoading(false);
    }
  }, [carId, isAuthenticated, isChecking, loadCarDetail, router, checkAuth]);

  const handleRefresh = async () => {
    await loadCarDetail(true);
  };

  // 🔥 MANEJAR ACTUALIZACIÓN DEL AUTO
  const handleUpdateCar = async (id: number, data: any) => {
    try {
      const { updateCar } = await import('@/app/lib/api/carsAdmin');
      await updateCar(id, data);
      await loadCarDetail(true);
      setSuccessMessage('✅ Auto actualizado exitosamente');
    } catch (err: any) {
      console.error('Error al actualizar:', err);
      throw err;
    }
  };

  // 🔥 MANEJAR SUBIDA DE IMÁGENES
  const handleUploadImages = async (id: number, files: File[]) => {
    try {
      const { uploadCarImages } = await import('@/app/lib/api/carsAdmin');
      await uploadCarImages(id, files);
      await loadCarDetail(true);
      setSuccessMessage(`✅ ${files.length} imagen(es) subidas exitosamente`);
    } catch (err: any) {
      console.error('Error al subir imágenes:', err);
      throw err;
    }
  };

  // 🔥 MANEJAR ELIMINACIÓN DEL AUTO
  const handleDeleteCar = async () => {
    setIsDeleting(true);
    try {
      const { deleteCar } = await import('@/app/lib/api/carsAdmin');
      await deleteCar(carId);
      router.push('/admin/cars/list');
    } catch (err: any) {
      console.error('Error al eliminar auto:', err);
      setError(err.message || 'Error al eliminar el auto');
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || amount === 0) return '$0.00';
    if (isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return '0';
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; bg: string }> = {
      'available': { label: 'AVAILABLE', color: '#166534', bg: '#dcfce7' },
      'business': { label: 'BUSINESS', color: '#1e40af', bg: '#dbeafe' },
      'rented': { label: 'RENTED', color: '#92400e', bg: '#fef3c7' },
      'maintenance': { label: 'MAINTENANCE', color: '#991b1b', bg: '#fee2e2' },
    };
    const s = statusMap[status?.toLowerCase()] || { label: status?.toUpperCase() || 'UNKNOWN', color: '#6b7280', bg: '#f3f4f6' };
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 14px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        backgroundColor: s.bg,
        color: s.color,
        textTransform: 'uppercase'
      }}>
        {s.label}
      </span>
    );
  };

  // 🔥 DEBUG: Mostrar estado de los modales
  console.log('🔍 Estado de modales:', {
    isEditModalOpen,
    isImagesModalOpen,
    isDeleteModalOpen,
    car: car?.car_id
  });

  if (isChecking || !isAuthVerified) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="wander-car-detail-container">
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar el auto</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="wander-car-detail-container">
        <div className="wander-error-state">
          <h3>⚠️ Auto no encontrado</h3>
          <p>No se encontró el auto con ID {carId}</p>
          <button onClick={() => router.push('/admin/cars/list')} className="wander-btn-primary">
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-car-detail-container">
      {/* Cabecera */}
      <header className="wander-car-detail-header">
        <div>
          <span className="wander-breadcrumb">Listings / Cars / Detail</span>
          <h2>
            ID # {car.car_id} - {car.brand} {car.model} {car.year}
          </h2>
          <p className="wander-car-detail-subtitle">
            {car.full_name}
          </p>
          <p className="wander-car-detail-email">{car.email}</p>
        </div>
        <div className="wander-car-detail-actions">
          <button 
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            🔄 Actualizar
          </button>
          <button 
            onClick={() => router.push('/admin/cars/list')}
            className="wander-btn-secondary"
          >
            ← Volver
          </button>
        </div>
      </header>

      {successMessage && (
        <div className="wander-success-message">
          {successMessage}
        </div>
      )}

      <div className="wander-car-detail-content">
        {/* Galería de imágenes */}
        {car.car_images && car.car_images.length > 0 && (
          <div className="wander-car-detail-gallery">
            <div className="wander-car-detail-main-image">
              <img src={selectedImage || car.principal_image || car.car_images[0]} alt={`${car.brand} ${car.model}`} />
            </div>
            {car.car_images.length > 1 && (
              <div className="wander-car-detail-thumbnails">
                {car.car_images.slice(0, 8).map((img, index) => (
                  <button
                    key={index}
                    className={`wander-thumbnail-btn ${selectedImage === img ? 'active' : ''}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt={`${car.brand} ${car.model} ${index + 1}`} />
                  </button>
                ))}
                {car.car_images.length > 8 && (
                  <span className="wander-thumbnail-more">+{car.car_images.length - 8} más</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* 🔥 ACCIONES DEL AUTO */}
        <div className="wander-car-actions-bar">
          <button 
            onClick={openImagesModal}
            className="wander-action-btn wander-action-add-images"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Add images
          </button>
          <button 
            onClick={openEditModal}
            className="wander-action-btn wander-action-edit"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
          <button 
            onClick={openDeleteModal}
            className="wander-action-btn wander-action-delete"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            Delete
          </button>
        </div>

        {/* Información del auto */}
        <section className="wander-car-detail-section">
          <h3>Car information</h3>
          <div className="wander-car-detail-grid">
            <div className="wander-detail-item">
              <span className="wander-detail-label">Id:</span>
              <span className="wander-detail-value">{car.car_id}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">External id:</span>
              <span className="wander-detail-value">{car.external_id}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Brand:</span>
              <span className="wander-detail-value">{car.brand}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Model:</span>
              <span className="wander-detail-value">{car.model}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Year:</span>
              <span className="wander-detail-value">{car.year}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Plate:</span>
              <span className="wander-detail-value">{car.plate}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Miles:</span>
              <span className="wander-detail-value">{formatNumber(car.miles)} mi</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Status:</span>
              <span className="wander-detail-value">
                {getStatusBadge(car.status)}
              </span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Rent price:</span>
              <span className="wander-detail-value">{formatCurrency(car.rent_price)} / day</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Booking price:</span>
              <span className="wander-detail-value">{formatCurrency(car.booking_price)}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Total deposits:</span>
              <span className="wander-detail-value">{formatNumber(car.total_deposits)}</span>
            </div>
          </div>
        </section>

        {/* Información del dueño */}
        <section className="wander-car-detail-section">
          <h3>Owner information</h3>
          <div className="wander-car-detail-grid">
            <div className="wander-detail-item">
              <span className="wander-detail-label">Owner id:</span>
              <span className="wander-detail-value">{car.owner_id}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Full name:</span>
              <span className="wander-detail-value">{car.full_name}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Phone number:</span>
              <span className="wander-detail-value">{car.phone_number}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Email:</span>
              <span className="wander-detail-value">{car.email}</span>
            </div>
          </div>
        </section>

        {/* Descripción */}
        {car.description && (
          <section className="wander-car-detail-section">
            <h3>Description</h3>
            <div className="wander-car-detail-description">
              <p>{car.description}</p>
            </div>
          </section>
        )}

        {/* Totales financieros */}
        <section className="wander-car-detail-section">
          <h3>TOTALLY INCOME</h3>
          <div className="wander-car-detail-metrics">
            {/* Annual */}
            <div className="wander-metric-group">
              <h4>Annual</h4>
              <div className="wander-metric-item">
                <span className="wander-metric-label">TOTAL INCOME</span>
                <span className="wander-metric-value">{formatCurrency(car.total_income_annual)}</span>
                <span className="wander-metric-change">{car.percentage_total_income_annual ?? 0}% Annual</span>
              </div>
              <div className="wander-metric-item">
                <span className="wander-metric-label">TOTAL EXPENSES</span>
                <span className="wander-metric-value">{formatCurrency(car.total_expenses_annual)}</span>
                <span className="wander-metric-change">{car.percentage_total_expenses_annual ?? 0}% Annual</span>
              </div>
              <div className="wander-metric-item">
                <span className="wander-metric-label">TOTAL PROFIT</span>
                <span className="wander-metric-value">{formatCurrency(car.total_profit_annual)}</span>
                <span className="wander-metric-change">{car.percentage_total_profit_annual ?? 0}% Annual</span>
              </div>
            </div>

            {/* Monthly */}
            <div className="wander-metric-group">
              <h4>Monthly</h4>
              <div className="wander-metric-item">
                <span className="wander-metric-label">TOTAL INCOME</span>
                <span className="wander-metric-value">{formatCurrency(car.earnings_month)}</span>
                <span className="wander-metric-change">{car.percentage_earnings_month ?? 0}% Monthly</span>
              </div>
              <div className="wander-metric-item">
                <span className="wander-metric-label">TOTAL EXPENSES</span>
                <span className="wander-metric-value">{formatCurrency(car.expenses_month)}</span>
                <span className="wander-metric-change">{car.percentage_expenses_month ?? 0}% Monthly</span>
              </div>
              <div className="wander-metric-item">
                <span className="wander-metric-label">TOTAL PROFIT</span>
                <span className="wander-metric-value">{formatCurrency(car.profit_last_month)}</span>
                <span className="wander-metric-change">{car.percentage_profit_last_month ?? 0}% Monthly</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 🔥 MODALES - Siempre renderizados pero controlados por isOpen */}
      <EditCarModal
        isOpen={isEditModalOpen}
        car={car}
        onClose={closeEditModal}
        onSave={handleUpdateCar}
      />

      <AddCarImagesModal
        isOpen={isImagesModalOpen}
        carId={car.car_id}
        onClose={closeImagesModal}
        onUpload={handleUploadImages}
      />

      <DeleteCarModal
        isOpen={isDeleteModalOpen}
        carId={car.car_id}
        carName={`${car.brand} ${car.model} ${car.year}`}
        onClose={closeDeleteModal}
        onDelete={handleDeleteCar}
        isDeleting={isDeleting}
      />
    </div>
  );
}
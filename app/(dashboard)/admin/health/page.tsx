// app/(dashboard)/admin/health/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getHealthServices, Health, createHealthService, deleteHealthService } from '@/app/lib/api/healthAdmin';
import {
  FiPlus,
  FiRefreshCw,
  FiEye,
  FiTrash2,
  FiDollarSign,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiTag,
  FiClock,
  FiHeart,
  FiActivity,
  FiBarChart2
} from 'react-icons/fi';
import { Modal } from '@/app/(dashboard)/admin/components/Modal';
import { CreateHealthForm } from '@/app/(dashboard)/admin/components/CreateHealthForm';
import { ConfirmDialog } from '@/app/(dashboard)/admin/components/ConfirmDialog';
import Toast from '@/app/(dashboard)/admin/components/Toast';
import './health.css';

const LoadingSkeleton = () => (
  <div className="wander-health-container">
    <div className="wander-health-header">
      <div>
        <span className="wander-breadcrumb">Services / Health</span>
        <h2>Loading health services...</h2>
      </div>
    </div>
    <div className="wander-health-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading health services...</p>
    </div>
  </div>
);

export default function HealthListPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [services, setServices] = useState<Health[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación frontend
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [totalPages, setTotalPages] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    id: number | null;
    name: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    id: null,
    name: '',
    isDeleting: false
  });

  const loadServices = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getHealthServices();
      console.log('📦 Datos de servicios de salud:', data);
      
      setServices(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
    } catch (err) {
      console.error('❌ Error cargando servicios de salud:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error loading health services');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, router, itemsPerPage]);

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

    loadServices();
  }, [isAuthenticated, isChecking, loadServices, router, checkAuth]);

  const handleRefresh = async () => {
    await loadServices(true);
  };

  // Paginación frontend
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return services.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num) || num === 0) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      'activo': { label: 'Active', color: '#16a34a' },
      'inactivo': { label: 'Inactive', color: '#dc2626' },
    };
    const s = statusMap[status?.toLowerCase()] || { label: status || 'N/A', color: '#6b7280' };
    return (
      <span style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        backgroundColor: `${s.color}15`,
        color: s.color,
      }}>
        {s.label}
      </span>
    );
  };

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes === 0) return '—';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      }
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  };

  // Create service handler
  const handleCreateService = async (data: { name: string }) => {
    setIsSubmitting(true);
    try {
      const response = await createHealthService(data);
      console.log('✅ Servicio de salud creado:', response);
      
      setToast({
        message: `Health service "${data.name}" created successfully!`,
        type: 'success'
      });
      
      setIsModalOpen(false);
      await loadServices(true);
    } catch (err) {
      console.error('❌ Error creando servicio de salud:', err);
      setToast({
        message: (err instanceof Error ? err.message : undefined) || 'Error creating health service',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete service handler
  const handleDeleteClick = (id: number, name: string) => {
    setConfirmDialog({
      isOpen: true,
      id,
      name,
      isDeleting: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.id) return;

    setConfirmDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      await deleteHealthService(confirmDialog.id);
      console.log('✅ Servicio de salud eliminado:', confirmDialog.id);
      
      setToast({
        message: `Health service "${confirmDialog.name}" deleted successfully!`,
        type: 'success'
      });
      
      setConfirmDialog({ isOpen: false, id: null, name: '', isDeleting: false });
      await loadServices(true);
    } catch (err) {
      console.error('❌ Error eliminando servicio de salud:', err);
      setToast({
        message: (err instanceof Error ? err.message : undefined) || 'Error deleting health service',
        type: 'error'
      });
      setConfirmDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseConfirmDialog = () => {
    if (confirmDialog.isDeleting) return;
    setConfirmDialog({ isOpen: false, id: null, name: '', isDeleting: false });
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  if (isChecking || !isAuthVerified) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="wander-health-container">
        <div className="wander-health-header">
          <div>
            <span className="wander-breadcrumb">Services / Health</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error loading health services</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="wander-btn-primary">
            <FiRefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const currentItems = getCurrentItems();

  return (
    <div className="wander-health-container">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Health Service"
        message={`Are you sure you want to delete "${confirmDialog.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isSubmitting={confirmDialog.isDeleting}
      />

      {/* Header */}
      <header className="wander-health-header">
        <div>
          <span className="wander-breadcrumb">SERVICES / HEALTH</span>
          <h2>Health</h2>
          <p className="wander-health-subtitle">
            {totalCount} {totalCount === 1 ? 'service' : 'services'} registered
          </p>
        </div>
        <div className="wander-health-actions">
          <button
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <Link
            href="/admin/accounting?servicio_tipo=health"
            className="wander-btn-secondary"
          >
            <FiBarChart2 size={16} />
            Transactions
          </Link>
          <button
            className="wander-btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <FiPlus size={16} />
            Create Service
          </button>
        </div>
      </header>

      {/* Grid */}
      <div className="wander-health-grid">
        {currentItems.length === 0 ? (
          <div className="wander-health-empty">
            <span className="wander-empty-icon">
              <FiHeart size={48} />
            </span>
            <p>No health services found</p>
            <span className="wander-empty-desc">No health services registered yet</span>
          </div>
        ) : (
          currentItems.map((service) => (
            <div key={service.id} className="wander-health-card">
              <div className="wander-health-image">
                {service.principal_image ? (
                  <img src={service.principal_image} alt={service.name} />
                ) : (
                  <div className="wander-health-image-placeholder">
                    <FiActivity size={48} />
                  </div>
                )}
                <div className="wander-health-status-badge">
                  {getStatusBadge(service.status)}
                </div>
              </div>
              
              <div className="wander-health-info">
                <h3 className="wander-health-title">{service.name}</h3>
                <p className="wander-health-meta">
                  <FiMapPin size={12} style={{ marginRight: '4px' }} />
                  {service.location}
                </p>
                
                <div className="wander-health-details">
                  <span>
                    <FiTag size={12} style={{ marginRight: '4px' }} />
                    {service.category}
                  </span>
                  <span>
                    <FiClock size={12} style={{ marginRight: '4px' }} />
                    {formatDuration(service.duration_minutes)}
                  </span>
                </div>

                <div className="wander-health-price">
                  <FiDollarSign size={16} />
                  {formatCurrency(service.price)}
                </div>

                {service.descripcion && (
                  <p className="wander-health-description">
                    {service.descripcion.length > 80 
                      ? `${service.descripcion.substring(0, 80)}...` 
                      : service.descripcion}
                  </p>
                )}
              </div>
              
              <div className="wander-health-actions">
                <Link 
                  href={`/admin/health/${service.id}`}
                  className="wander-health-action-btn details"
                >
                  <FiEye size={14} />
                  Details
                </Link>
                <button 
                  onClick={() => handleDeleteClick(service.id, service.name)}
                  className="wander-health-action-btn delete"
                >
                  <FiTrash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="wander-health-pagination">
          <div className="wander-pagination-info">
            Showing {((currentPage || 1) - 1) * itemsPerPage + 1} - 
            {Math.min((currentPage || 1) * itemsPerPage, totalCount)} of {totalCount} services
          </div>
          
          <div className="wander-pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="wander-pagination-btn"
            >
              <FiChevronLeft size={14} />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const current = currentPage || 1;
              let pageNum;
              
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (current <= 3) {
                pageNum = i + 1;
              } else if (current >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = current - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`wander-pagination-btn ${pageNum === current ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="wander-pagination-btn"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Creación */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Health Service"
        maxWidth="640px"
      >
        <CreateHealthForm
          onSubmit={handleCreateService}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
// app/(dashboard)/admin/transport/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getTransports, Transport, createTransport, deleteTransport } from '@/app/lib/api/transportAdmin';
import {
  FiPlus,
  FiRefreshCw,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiUsers,
  FiTag,
  FiTruck,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiGift,
  FiBarChart2
} from 'react-icons/fi';
import { Modal } from '@/app/(dashboard)/admin/components/Modal';
import { CreateTransportForm } from '@/app/(dashboard)/admin/components/CreateTransportForm';
import { ConfirmDialog } from '@/app/(dashboard)/admin/components/ConfirmDialog';
import Toast from '@/app/(dashboard)/admin/components/Toast';
import './transport.css';

const LoadingSkeleton = () => (
  <div className="wander-transport-container">
    <div className="wander-transport-header">
      <div>
        <span className="wander-breadcrumb">Services / Transport</span>
        <h2>Loading transports...</h2>
      </div>
    </div>
    <div className="wander-transport-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading transports...</p>
    </div>
  </div>
);

export default function TransportListPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [transports, setTransports] = useState<Transport[]>([]);
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

  const loadTransports = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getTransports();
      console.log('📦 Datos de transportes:', data);
      
      setTransports(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
    } catch (err) {
      console.error('❌ Error cargando transportes:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error loading transports');
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

    loadTransports();
  }, [isAuthenticated, isChecking, loadTransports, router, checkAuth]);

  const handleRefresh = async () => {
    await loadTransports(true);
  };

  // Paginación frontend
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return transports.slice(indexOfFirstItem, indexOfLastItem);
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
      'mantenimiento': { label: 'Maintenance', color: '#f59e0b' },
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

  // Create transport handler
  const handleCreateTransport = async (data: { name: string }) => {
    setIsSubmitting(true);
    try {
      const response = await createTransport(data);
      console.log('✅ Transporte creado:', response);
      
      setToast({
        message: `Transport "${data.name}" created successfully!`,
        type: 'success'
      });
      
      setIsModalOpen(false);
      await loadTransports(true);
    } catch (err) {
      console.error('❌ Error creando transporte:', err);
      setToast({
        message: (err instanceof Error ? err.message : undefined) || 'Error creating transport',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete transport handler
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
      await deleteTransport(confirmDialog.id);
      console.log('✅ Transporte eliminado:', confirmDialog.id);
      
      setToast({
        message: `Transport "${confirmDialog.name}" deleted successfully!`,
        type: 'success'
      });
      
      setConfirmDialog({ isOpen: false, id: null, name: '', isDeleting: false });
      await loadTransports(true);
    } catch (err) {
      console.error('❌ Error eliminando transporte:', err);
      setToast({
        message: (err instanceof Error ? err.message : undefined) || 'Error deleting transport',
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
      <div className="wander-transport-container">
        <div className="wander-transport-header">
          <div>
            <span className="wander-breadcrumb">Services / Transport</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error loading transports</h3>
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
    <div className="wander-transport-container">
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
        title="Delete Transport"
        message={`Are you sure you want to delete "${confirmDialog.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isSubmitting={confirmDialog.isDeleting}
      />

      {/* Header */}
      <header className="wander-transport-header">
        <div>
          <span className="wander-breadcrumb">SERVICES / TRANSPORT</span>
          <h2>Private Transport</h2>
          <p className="wander-transport-subtitle">
            {totalCount} {totalCount === 1 ? 'vehicle' : 'vehicles'} registered
          </p>
        </div>
        <div className="wander-transport-actions">
          <button
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <Link
            href="/admin/accounting?servicio_tipo=transporte_privado"
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
            Create Transport
          </button>
        </div>
      </header>

      {/* Grid */}
      <div className="wander-transport-grid">
        {currentItems.length === 0 ? (
          <div className="wander-transport-empty">
            <span className="wander-empty-icon">
              <FiTruck size={48} />
            </span>
            <p>No transports found</p>
            <span className="wander-empty-desc">No vehicles registered yet</span>
          </div>
        ) : (
          currentItems.map((vehicle) => (
            <div key={vehicle.id} className="wander-transport-card">
              <div className="wander-transport-image">
                {vehicle.principal_image ? (
                  <img src={vehicle.principal_image} alt={vehicle.name} />
                ) : (
                  <div className="wander-transport-image-placeholder">
                    <FiTruck size={48} />
                  </div>
                )}
                <div className="wander-transport-status-badge">
                  {getStatusBadge(vehicle.status)}
                </div>
              </div>
              
              <div className="wander-transport-info">
                <h3 className="wander-transport-title">{vehicle.name}</h3>
                <p className="wander-transport-meta">
                  <FiTag size={12} style={{ marginRight: '4px' }} />
                  {vehicle.brand} {vehicle.model}
                </p>
                
                <div className="wander-transport-details">
                  <span>
                    <FiUsers size={12} style={{ marginRight: '4px' }} />
                    {vehicle.capacity} passengers
                  </span>
                  <span>
                    <FiTag size={12} style={{ marginRight: '4px' }} />
                    {vehicle.category}
                  </span>
                  <span>
                    <FiMapPin size={12} style={{ marginRight: '4px' }} />
                    {vehicle.color}
                  </span>
                </div>

                <div className="wander-transport-price">
                  <FiDollarSign size={16} />
                  {formatCurrency(vehicle.price_hour)} / hour
                </div>

                {vehicle.kit && (
                  <div className="wander-transport-kit">
                    <FiGift size={12} />
                    {vehicle.kit}
                  </div>
                )}
              </div>
              
              <div className="wander-transport-actions">
                <Link 
                  href={`/admin/transport/${vehicle.id}`}
                  className="wander-transport-action-btn details"
                >
                  <FiEye size={14} />
                  Details
                </Link>
                <button 
                  onClick={() => handleDeleteClick(vehicle.id, vehicle.name)}
                  className="wander-transport-action-btn delete"
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
        <div className="wander-transport-pagination">
          <div className="wander-pagination-info">
            Showing {((currentPage || 1) - 1) * itemsPerPage + 1} - 
            {Math.min((currentPage || 1) * itemsPerPage, totalCount)} of {totalCount} vehicles
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
        title="Create New Transport"
        maxWidth="640px"
      >
        <CreateTransportForm
          onSubmit={handleCreateTransport}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
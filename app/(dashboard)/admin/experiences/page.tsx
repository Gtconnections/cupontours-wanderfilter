// app/(dashboard)/admin/experiences/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getExperiences, Experience, createExperience, deleteExperience } from '@/app/lib/api/experienceAdmin';
import {
  FiPlus,
  FiRefreshCw,
  FiEye,
  FiTrash2,
  FiDollarSign,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiCalendar,
  FiTag,
  FiHeart,
  FiCompass,
  FiBarChart2
} from 'react-icons/fi';
import { Modal } from '@/app/(dashboard)/admin/components/Modal';
import { CreateExperienceForm } from '@/app/(dashboard)/admin/components/CreateExperienceForm';
import { ConfirmDialog } from '@/app/(dashboard)/admin/components/ConfirmDialog';
import Toast from '@/app/(dashboard)/admin/components/Toast';
import './experiences.css';

const LoadingSkeleton = () => (
  <div className="wander-experience-container">
    <div className="wander-experience-header">
      <div>
        <span className="wander-breadcrumb">Services / Experiences</span>
        <h2>Loading experiences...</h2>
      </div>
    </div>
    <div className="wander-experience-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading experiences...</p>
    </div>
  </div>
);

export default function ExperienceListPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [experiences, setExperiences] = useState<Experience[]>([]);
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

  const loadExperiences = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getExperiences();
      console.log('📦 Datos de experiencias:', data);
      
      setExperiences(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
    } catch (err) {
      console.error('❌ Error cargando experiencias:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error loading experiences');
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

    loadExperiences();
  }, [isAuthenticated, isChecking, loadExperiences, router, checkAuth]);

  const handleRefresh = async () => {
    await loadExperiences(true);
  };

  // Paginación frontend
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return experiences.slice(indexOfFirstItem, indexOfLastItem);
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

  // Create experience handler
  const handleCreateExperience = async (data: { name: string }) => {
    setIsSubmitting(true);
    try {
      const response = await createExperience(data);
      console.log('✅ Experiencia creada:', response);
      
      setToast({
        message: `Experience "${data.name}" created successfully!`,
        type: 'success'
      });
      
      setIsModalOpen(false);
      await loadExperiences(true);
    } catch (err) {
      console.error('❌ Error creando experiencia:', err);
      setToast({
        message: (err instanceof Error ? err.message : undefined) || 'Error creating experience',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete experience handler
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
      await deleteExperience(confirmDialog.id);
      console.log('✅ Experiencia eliminada:', confirmDialog.id);
      
      setToast({
        message: `Experience "${confirmDialog.name}" deleted successfully!`,
        type: 'success'
      });
      
      setConfirmDialog({ isOpen: false, id: null, name: '', isDeleting: false });
      await loadExperiences(true);
    } catch (err) {
      console.error('❌ Error eliminando experiencia:', err);
      setToast({
        message: (err instanceof Error ? err.message : undefined) || 'Error deleting experience',
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
      <div className="wander-experience-container">
        <div className="wander-experience-header">
          <div>
            <span className="wander-breadcrumb">Services / Experiences</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error loading experiences</h3>
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
    <div className="wander-experience-container">
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
        title="Delete Experience"
        message={`Are you sure you want to delete "${confirmDialog.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isSubmitting={confirmDialog.isDeleting}
      />

      {/* Header */}
      <header className="wander-experience-header">
        <div>
          <span className="wander-breadcrumb">SERVICES / EXPERIENCES</span>
          <h2>Experiences</h2>
          <p className="wander-experience-subtitle">
            {totalCount} {totalCount === 1 ? 'experience' : 'experiences'} registered
          </p>
        </div>
        <div className="wander-experience-actions">
          <button
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <Link
            href="/admin/accounting?servicio_tipo=experiences"
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
            Create Experience
          </button>
        </div>
      </header>

      {/* Grid */}
      <div className="wander-experience-grid">
        {currentItems.length === 0 ? (
          <div className="wander-experience-empty">
            <span className="wander-empty-icon">
              <FiCompass size={48} />
            </span>
            <p>No experiences found</p>
            <span className="wander-empty-desc">No experiences registered yet</span>
          </div>
        ) : (
          currentItems.map((experience) => (
            <div key={experience.id} className="wander-experience-card">
              <div className="wander-experience-image">
                {experience.principal_image ? (
                  <img src={experience.principal_image} alt={experience.name} />
                ) : (
                  <div className="wander-experience-image-placeholder">
                    <FiCompass size={48} />
                  </div>
                )}
                <div className="wander-experience-status-badge">
                  {getStatusBadge(experience.status)}
                </div>
              </div>
              
              <div className="wander-experience-info">
                <h3 className="wander-experience-title">{experience.name}</h3>
                <p className="wander-experience-meta">
                  <FiMapPin size={12} style={{ marginRight: '4px' }} />
                  {experience.location}
                </p>
                
                <div className="wander-experience-details">
                  <span>
                    <FiTag size={12} style={{ marginRight: '4px' }} />
                    {experience.category}
                  </span>
                  <span>
                    <FiUsers size={12} style={{ marginRight: '4px' }} />
                    {experience.capacity_min} - {experience.capacity_max} people
                  </span>
                  <span>
                    <FiCalendar size={12} style={{ marginRight: '4px' }} />
                    {experience.duration_days} {experience.duration_days === 1 ? 'day' : 'days'}
                  </span>
                  {experience.pet_friendly && (
                    <span>
                      <FiHeart size={12} style={{ marginRight: '4px' }} />
                      Pet friendly
                    </span>
                  )}
                </div>

                <div className="wander-experience-price">
                  <FiDollarSign size={16} />
                  {formatCurrency(experience.price)}
                  {experience.price && ' / person'}
                </div>
              </div>
              
              <div className="wander-experience-actions">
                <Link 
                  href={`/admin/experiences/${experience.id}`}
                  className="wander-experience-action-btn details"
                >
                  <FiEye size={14} />
                  Details
                </Link>
                <button 
                  onClick={() => handleDeleteClick(experience.id, experience.name)}
                  className="wander-experience-action-btn delete"
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
        <div className="wander-experience-pagination">
          <div className="wander-pagination-info">
            Showing {((currentPage || 1) - 1) * itemsPerPage + 1} - 
            {Math.min((currentPage || 1) * itemsPerPage, totalCount)} of {totalCount} experiences
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
        title="Create New Experience"
        maxWidth="640px"
      >
        <CreateExperienceForm
          onSubmit={handleCreateExperience}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
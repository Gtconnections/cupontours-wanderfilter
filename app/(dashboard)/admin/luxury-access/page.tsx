// app/(dashboard)/admin/luxury-access/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import {
  getLuxuryAccessAdmin,
  createLuxuryAccess,
  updateLuxuryAccess,
  deleteLuxuryAccess,
  LuxuryAccess,
  LuxuryAccessData,
} from '@/app/lib/api/luxuryAccessAdmin';
import {
  FiPlus,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiKey,
  FiMail,
  FiPhone,
} from 'react-icons/fi';
import { Modal } from '@/app/(dashboard)/admin/components/Modal';
import { LuxuryAccessForm } from '@/app/(dashboard)/admin/components/LuxuryAccessForm';
import { ConfirmDialog } from '@/app/(dashboard)/admin/components/ConfirmDialog';
import Toast from '@/app/(dashboard)/admin/components/Toast';
import './luxury-access.css';

const LoadingSkeleton = () => (
  <div className="wander-wellness-container">
    <div className="wander-wellness-header">
      <div>
        <span className="wander-breadcrumb">Luxury Access</span>
        <h2>Loading access codes...</h2>
      </div>
    </div>
    <div className="wander-wellness-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading access codes...</p>
    </div>
  </div>
);

export default function LuxuryAccessListPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();

  const [items, setItems] = useState<LuxuryAccess[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [totalPages, setTotalPages] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<LuxuryAccess | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    id: number | null;
    name: string;
    isDeleting: boolean;
  }>({ isOpen: false, id: null, name: '', isDeleting: false });

  const loadItems = useCallback(async () => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getLuxuryAccessAdmin();
      setItems(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
    } catch (err) {
      console.error('❌ Error loading luxury access:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error loading access codes');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, router, itemsPerPage]);

  useEffect(() => {
    if (isChecking) return;

    const hasAuth = checkAuth();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthVerified(true);

    if (!hasAuth) {
      router.push('/login');
      return;
    }

    loadItems();
  }, [isAuthenticated, isChecking, loadItems, router, checkAuth]);

  const handleRefresh = async () => {
    await loadItems();
  };

  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: LuxuryAccess) => {
    setEditing(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (data: LuxuryAccessData) => {
    setIsSubmitting(true);
    try {
      if (editing) {
        await updateLuxuryAccess(editing.id, data);
        setToast({ message: `Access for "${data.name}" updated successfully!`, type: 'success' });
      } else {
        const result = await createLuxuryAccess(data);
        const emailFailed = typeof result?.message === 'string' && /no pudo enviarse|not be sent|failed/i.test(result.message);
        setToast({
          message: emailFailed
            ? `Access created, but the code email could not be sent to ${data.email}.`
            : `Access created — the code was emailed to ${data.email}.`,
          type: emailFailed ? 'error' : 'success',
        });
      }
      setIsModalOpen(false);
      setEditing(null);
      await loadItems();
    } catch (err) {
      console.error('❌ Error saving luxury access:', err);
      setToast({ message: (err instanceof Error ? err.message : undefined) || 'Error saving access code', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setConfirmDialog({ isOpen: true, id, name, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.id) return;

    setConfirmDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      await deleteLuxuryAccess(confirmDialog.id);
      setToast({ message: `Access for "${confirmDialog.name}" deleted successfully!`, type: 'success' });
      setConfirmDialog({ isOpen: false, id: null, name: '', isDeleting: false });
      await loadItems();
    } catch (err) {
      console.error('❌ Error deleting luxury access:', err);
      setToast({ message: (err instanceof Error ? err.message : undefined) || 'Error deleting access code', type: 'error' });
      setConfirmDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseConfirmDialog = () => {
    if (confirmDialog.isDeleting) return;
    setConfirmDialog({ isOpen: false, id: null, name: '', isDeleting: false });
  };

  const handleCloseToast = () => setToast(null);

  const getStatusBadge = (isActive: LuxuryAccess['is_active']) => {
    const active = Number(isActive) === 1;
    const color = active ? '#16a34a' : '#dc2626';
    return (
      <span style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        backgroundColor: `${color}15`,
        color,
      }}>
        {active ? 'Active' : 'Inactive'}
      </span>
    );
  };

  if (isChecking || !isAuthVerified) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="wander-wellness-container">
        <div className="wander-wellness-header">
          <div>
            <span className="wander-breadcrumb">Luxury Access</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error loading access codes</h3>
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
    <div className="wander-wellness-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Access Code"
        message={`Are you sure you want to delete the access for "${confirmDialog.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isSubmitting={confirmDialog.isDeleting}
      />

      <header className="wander-wellness-header">
        <div>
          <span className="wander-breadcrumb">LUXURY ACCESS</span>
          <h2>Luxury Access</h2>
          <p className="wander-wellness-subtitle">
            {totalCount} {totalCount === 1 ? 'access code' : 'access codes'} registered
          </p>
        </div>
        <div className="wander-wellness-actions">
          <button onClick={handleRefresh} className="wander-btn-secondary">
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <button className="wander-btn-primary" onClick={openCreate}>
            <FiPlus size={16} />
            Create Access
          </button>
        </div>
      </header>

      <div className="wander-wellness-grid">
        {currentItems.length === 0 ? (
          <div className="wander-wellness-empty">
            <span className="wander-empty-icon">
              <FiKey size={48} />
            </span>
            <p>No access codes found</p>
            <span className="wander-empty-desc">Create the first Luxury Access code</span>
          </div>
        ) : (
          currentItems.map((item) => (
            <div key={item.id} className="wander-wellness-card">
              <div className="wander-wellness-image wander-la-icon-area">
                <span className="wander-la-icon"><FiKey size={38} /></span>
                <div className="wander-wellness-status-badge">
                  {getStatusBadge(item.is_active)}
                </div>
              </div>

              <div className="wander-wellness-info">
                <h3 className="wander-wellness-title">{item.name}</h3>

                <div className="wander-la-field">
                  <FiMail size={13} />
                  <span>{item.email}</span>
                </div>
                {item.phone && (
                  <div className="wander-la-field">
                    <FiPhone size={13} />
                    <span>{item.phone}</span>
                  </div>
                )}

                <div className="wander-la-code" title="Access code">
                  <FiKey size={13} />
                  <code>{item.code}</code>
                </div>
              </div>

              <div className="wander-wellness-actions">
                <button onClick={() => openEdit(item)} className="wander-wellness-action-btn details">
                  <FiEdit2 size={14} />
                  Edit
                </button>
                <button onClick={() => handleDeleteClick(item.id, item.name)} className="wander-wellness-action-btn delete">
                  <FiTrash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="wander-wellness-pagination">
          <div className="wander-pagination-info">
            Showing {((currentPage || 1) - 1) * itemsPerPage + 1} -
            {Math.min((currentPage || 1) * itemsPerPage, totalCount)} of {totalCount} access codes
          </div>

          <div className="wander-pagination-controls">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="wander-pagination-btn">
              <FiChevronLeft size={14} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const current = currentPage || 1;
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (current <= 3) pageNum = i + 1;
              else if (current >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = current - 2 + i;

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

            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="wander-pagination-btn">
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Access Code' : 'Create New Access Code'}
        maxWidth="560px"
      >
        <LuxuryAccessForm
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isSubmitting={isSubmitting}
          initialData={editing}
        />
      </Modal>
    </div>
  );
}

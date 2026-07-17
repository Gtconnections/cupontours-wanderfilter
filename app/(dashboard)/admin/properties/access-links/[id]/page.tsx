// app/admin/properties/access-links/[id]/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getAccessLinks, AccessLink, getAccessLinkDetail, deleteAccessLink } from '@/app/lib/api/propertiesAdmin';
import ModalAccessLinkDetail from '../../../components/ModalAccessLinkDetail';
import ModalDeleteAccessLink from '../../../components/ModalDeleteAccessLink';
import ModalCreateAccessLink from '../../../components/ModalCreateAccessLink';
import { 
  FiArrowLeft, 
  FiPlus, 
  FiEye, 
  FiLink, 
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiTrash2
} from 'react-icons/fi';
import './access-links.css';

const LoadingSkeleton = () => (
  <div className="wander-access-links-container">
    <div className="wander-access-links-header">
      <div>
        <span className="wander-breadcrumb">Listings / Properties / Access Links</span>
        <h2>Loading access links...</h2>
      </div>
    </div>
    <div className="wander-access-links-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading access links...</p>
    </div>
  </div>
);

export default function AccessLinksPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = parseInt(params.id as string);
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [accessLinks, setAccessLinks] = useState<AccessLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [listingName, setListingName] = useState(`Property #${listingId}`);
  
  // Paginación frontend
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Modal de detalle
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAccessLink, setSelectedAccessLink] = useState<AccessLink | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accessLinkToDelete, setAccessLinkToDelete] = useState<AccessLink | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal de creación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadAccessLinks = useCallback(async () => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getAccessLinks({ listing_id: listingId });
      console.log('📦 Datos de access links:', result);
      
      const data = Array.isArray(result) ? result : result.results || [];
      setAccessLinks(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      
      if (data.length > 0) {
        setListingName(`Property #${listingId}`);
      }
      
    } catch (err) {
      console.error('❌ Error cargando access links:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error loading access links');
    } finally {
      setIsLoading(false);
    }
  }, [listingId, token, isAuthenticated, router]);

  // Ver detalles
  const handleViewDetails = async (id: number) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    setSelectedAccessLink(null);

    try {
      const detail = await getAccessLinkDetail(id);
      console.log('📦 Detalle de access link:', detail);
      setSelectedAccessLink(detail);
    } catch (err) {
      console.error('❌ Error cargando detalle:', err);
      setToastMessage(`❌ Error: ${(err instanceof Error ? err.message : undefined) || 'Failed to load details'}`);
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Eliminar
  const handleDeleteClick = (accessLink: AccessLink) => {
    setAccessLinkToDelete(accessLink);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accessLinkToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteAccessLink(accessLinkToDelete.listing_link_access_id);
      
      setToastMessage('🗑️ Access link deleted successfully!');
      setTimeout(() => setToastMessage(null), 3000);
      
      setIsDeleteModalOpen(false);
      setAccessLinkToDelete(null);
      loadAccessLinks();
      
    } catch (err) {
      console.error('❌ Error al eliminar:', err);
      setToastMessage(`❌ Error: ${(err instanceof Error ? err.message : undefined) || 'Failed to delete'}`);
      setTimeout(() => setToastMessage(null), 3000);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // 🔥 Manejador de éxito al crear
  const handleCreateSuccess = () => {
    setToastMessage('✅ Access link created successfully!');
    setTimeout(() => setToastMessage(null), 3000);
    loadAccessLinks();
  };

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

    if (listingId && !isNaN(listingId)) {
      loadAccessLinks();
    } else {
      setError('Invalid property ID');
      setIsLoading(false);
    }
  }, [isAuthenticated, isChecking, loadAccessLinks, router, checkAuth, listingId]);

  // Paginación frontend
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return accessLinks.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      <div className="wander-access-links-container">
        <div className="wander-access-links-header">
          <div>
            <span className="wander-breadcrumb">Listings / Properties / Access Links</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error loading access links</h3>
          <p>{error}</p>
          <button onClick={loadAccessLinks} className="wander-btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentItems = getCurrentItems();

  return (
    <div className="wander-access-links-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="wander-toast">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="wander-access-links-header">
        <div>
          <span className="wander-breadcrumb">LISTINGS / PROPERTIES / ACCESS LINKS</span>
          <h2>Access Links</h2>
          <p className="wander-access-links-subtitle">
            {listingName} • {accessLinks.length} link(s) registered
          </p>
        </div>
        <div className="wander-access-links-actions">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="wander-btn-primary"
          >
            <FiPlus size={16} />
            Create Access Link
          </button>
          <Link 
            href={`/admin/properties/${listingId}`}
            className="wander-btn-secondary"
          >
            <FiArrowLeft size={16} />
            Back to Property
          </Link>
        </div>
      </header>

      {/* Tabla */}
      <div className="wander-access-links-table-container">
        <table className="wander-access-links-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Link</th>
              <th>Description</th>
              <th>Attributes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="wander-access-links-empty">
                  No access links found
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr key={item.listing_link_access_id}>
                  <td className="wander-access-links-id">{item.listing_link_access_id}</td>
                  <td className="wander-access-links-name">{item.name}</td>
                  <td className="wander-access-links-link">
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="wander-access-links-link-url"
                    >
                      <FiLink size={14} />
                      {item.link}
                    </a>
                  </td>
                  <td className="wander-access-links-description">
                    {item.description || '—'}
                  </td>
                  <td className="wander-access-links-attributes">
                    {item.listing_link_attributes && item.listing_link_attributes.length > 0 ? (
                      <span className="wander-access-links-attributes-count">
                        {item.listing_link_attributes.length} attribute(s)
                      </span>
                    ) : (
                      <span className="wander-access-links-attributes-empty">—</span>
                    )}
                  </td>
                  <td>
                    <div className="wander-access-links-actions-group">
                      <button
                        className="wander-access-links-action-btn view"
                        onClick={() => handleViewDetails(item.listing_link_access_id)}
                        title="View details"
                      >
                        <FiEye size={15} />
                      </button>
                      <button
                        className="wander-access-links-action-btn delete"
                        onClick={() => handleDeleteClick(item)}
                        title="Delete"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="wander-access-links-pagination">
          <div className="wander-pagination-info">
            Showing {((currentPage - 1) * itemsPerPage) + 1} - 
            {Math.min(currentPage * itemsPerPage, accessLinks.length)} of {accessLinks.length} links
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
              const current = currentPage;
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

      {/* Modal Detail */}
      <ModalAccessLinkDetail
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAccessLink(null);
        }}
        accessLink={selectedAccessLink}
        isLoading={isLoadingDetail}
      />

      {/* Modal Delete Access Link */}
      <ModalDeleteAccessLink
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAccessLinkToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        accessLinkId={accessLinkToDelete?.listing_link_access_id || 0}
        accessLinkName={accessLinkToDelete?.name || ''}
        isLoading={isDeleting}
      />

      {/* Modal Create Access Link */}
      <ModalCreateAccessLink
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        listingId={listingId}
        listingName={listingName}
      />
    </div>
  );
}
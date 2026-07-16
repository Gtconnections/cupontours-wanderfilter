// app/admin/properties/agreements/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getAgreements, Agreement, AgreementsResponse, deleteAgreement } from '@/app/lib/api/propertiesAdmin';
import ModalDeleteAgreement from '../../components/ModalDeleteAgreement';
import ModalCreateAgreement from '../../components/ModalCreateAgreement';
import { 
  FiEye, 
  FiTrash2, 
  FiPlus,
  FiSearch,
  FiX
} from 'react-icons/fi';
import './agreements.css';

const LoadingSkeleton = () => (
  <div className="wander-agreements-container">
    <div className="wander-agreements-header">
      <h1>Agreements</h1>
    </div>
    <div className="wander-agreements-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando datos...</p>
    </div>
  </div>
);

export default function AgreementsPage() {
  const router = useRouter();
  
  const { token, isChecking, isAuthenticated, checkAuth, user, getUserId } = useAuth();
  
  const [data, setData] = useState<AgreementsResponse | null>(null);
  const [items, setItems] = useState<Agreement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Estado para el modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [agreementToDelete, setAgreementToDelete] = useState<Agreement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para el modal de creación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadAgreements = useCallback(async (page = 1, search = '') => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const filters: any = {
        page: page,
        page_size: 20,
      };
      
      if (search.trim()) {
        filters.search = search.trim();
      }

      const result = await getAgreements(filters);
      console.log('📦 Datos de Agreements:', result);
      setData(result);
      setItems(result.results || []);
      
      // Calcular total de páginas
      const total = result.count || 0;
      const pageSize = 20;
      setTotalPages(Math.ceil(total / pageSize));
      
    } catch (err: any) {
      console.error('❌ Error cargando Agreements:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, router]);

  // Verificar autenticación
  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }

    // Cargar datos iniciales
    loadAgreements(1, '');
  }, [isAuthenticated, isChecking, loadAgreements, router, checkAuth]);

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadAgreements(1, searchTerm);
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadAgreements(page, searchTerm);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🔥 Abrir modal de eliminación
  const handleDeleteClick = (agreement: Agreement) => {
    setAgreementToDelete(agreement);
    setIsDeleteModalOpen(true);
  };

  // 🔥 Ejecutar eliminación
  const handleConfirmDelete = async () => {
    if (!agreementToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteAgreement(agreementToDelete.id);
      
      setToastMessage('🗑️ Agreement deleted successfully!');
      setTimeout(() => setToastMessage(null), 3000);
      
      setIsDeleteModalOpen(false);
      setAgreementToDelete(null);
      loadAgreements(currentPage, searchTerm);
      
    } catch (err: any) {
      console.error('❌ Error al eliminar:', err);
      setToastMessage(`❌ Error: ${err.message || 'Failed to delete'}`);
      setTimeout(() => setToastMessage(null), 3000);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // 🔥 Manejador de éxito al crear agreement
  const handleCreateSuccess = () => {
    setToastMessage('✅ Agreement created successfully!');
    setTimeout(() => setToastMessage(null), 3000);
    loadAgreements(currentPage, searchTerm);
  };

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  // Formatear fecha completa
  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Verificar si está expirado
  const isExpired = (expirationDate: string) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    return expDate < today;
  };

  // 🔥 Ver documento
  const handleViewDocument = (agreement: Agreement) => {
    if (agreement.agreement) {
      window.open(agreement.agreement, '_blank');
    }
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
      <div className="wander-agreements-container">
        <div className="wander-agreements-header">
          <h1>Agreements</h1>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar los datos</h3>
          <p>{error}</p>
          <button onClick={() => loadAgreements(currentPage, searchTerm)} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-agreements-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="wander-toast">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="wander-agreements-header">
        <div className="wander-agreements-header-content">
          <h1>Agreements</h1>
          <button 
            className="wander-agreements-create-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FiPlus size={16} />
            Create Agreement
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="wander-agreements-filters">
        <form onSubmit={handleSearch} className="wander-agreements-search-form">
          <div className="wander-agreements-search-group">
            <label className="wander-agreements-search-label">Search by title</label>
            <input
              type="text"
              className="wander-agreements-search-input"
              placeholder="Search agreements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="wander-agreements-search-btn">
            <FiSearch size={16} />
            Search
          </button>
          {searchTerm && (
            <button 
              type="button" 
              className="wander-agreements-clear-btn"
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
                loadAgreements(1, '');
              }}
            >
              <FiX size={16} />
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Tabla */}
      <div className="wander-agreements-table-container">
        <table className="wander-agreements-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Created</th>
              <th>Expiration Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="wander-agreements-empty">
                  No agreements found
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const expired = isExpired(item.expiration_date);
                return (
                  <tr key={item.id}>
                    <td className="wander-agreements-id">{item.id}</td>
                    <td className="wander-agreements-title">{item.title}</td>
                    <td>{formatFullDate(item.created_at)}</td>
                    <td>{formatDate(item.expiration_date)}</td>
                    <td>
                      <span className={`wander-agreements-status ${expired ? 'expired' : 'active'}`}>
                        {expired ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="wander-agreements-actions">
                        {/* 🔥 Ver Documento */}
                        <button
                          className="wander-agreements-action-btn view"
                          onClick={() => handleViewDocument(item)}
                          title="View Document"
                          disabled={!item.agreement}
                        >
                          <FiEye size={16} />
                        </button>
                        {/* 🔥 Eliminar */}
                        <button
                          className="wander-agreements-action-btn delete"
                          onClick={() => handleDeleteClick(item)}
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="wander-agreements-pagination">
          <button
            className="wander-agreements-page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ❮ Previous
          </button>
          <span className="wander-agreements-page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="wander-agreements-page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next ❯
          </button>
        </div>
      )}

      {/* Total de registros */}
      {data && (
        <div className="wander-agreements-total">
          Total: {data.count} records
        </div>
      )}

      {/* Modal Delete Agreement */}
      <ModalDeleteAgreement
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAgreementToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        agreementTitle={agreementToDelete?.title || ''}
        isLoading={isDeleting}
      />

      {/* 🔥 Modal Create Agreement - con user_id correcto */}
      <ModalCreateAgreement
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        userId={getUserId() || 0} // 🔥 Usar getUserId() para obtener el user_id real
      />
    </div>
  );
}
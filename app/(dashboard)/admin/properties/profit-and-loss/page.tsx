// app/admin/properties/profit-and-loss/page.tsx

'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getProfitAndLoss, ProfitAndLossItem, ProfitAndLossResponse, ProfitAndLossFilters } from '@/app/lib/api/propertiesAdmin';
import ModalCreatePL from '../../components/ModalCreatePL';
import './profit-and-loss.css';

const LoadingSkeleton = () => (
  <div className="wander-pl-container">
    <div className="wander-pl-header">
      <h1>Profit and Loss</h1>
    </div>
    <div className="wander-pl-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando datos...</p>
    </div>
  </div>
);

function ProfitAndLossContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [data, setData] = useState<ProfitAndLossResponse | null>(null);
  const [items, setItems] = useState<ProfitAndLossItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Estado para el modal de creación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Filtros
  const [searchListing, setSearchListing] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const loadProfitAndLoss = useCallback(async (page = 1, listing = '', date = '') => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const filters: ProfitAndLossFilters = {
        page: page,
        page_size: 20,
      };

      if (listing.trim()) {
        filters.slug__icontains = listing.trim();
      }
      
      if (date.trim()) {
        filters.date__icontains = date.trim();
      }

      const result = await getProfitAndLoss(filters);
      console.log('📦 Datos de Profit and Loss:', result);
      setData(result);
      setItems(result.results.results || []);
      
      // Calcular total de páginas
      const total = result.count || 0;
      const pageSize = 20;
      setTotalPages(Math.ceil(total / pageSize));
      
    } catch (err) {
      console.error('❌ Error cargando Profit and Loss:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, router]);

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

    // Cargar datos iniciales
    loadProfitAndLoss(1, '', '');
  }, [isAuthenticated, isChecking, loadProfitAndLoss, router, checkAuth]);

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProfitAndLoss(1, searchListing, searchDate);
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadProfitAndLoss(page, searchListing, searchDate);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🔥 Manejar éxito al crear PL - Recargar la lista
  const handleCreateSuccess = () => {
    setToastMessage('✅ Profit and Loss created successfully!');
    setTimeout(() => setToastMessage(null), 3000);
    // Recargar la lista en la página actual
    loadProfitAndLoss(currentPage, searchListing, searchDate);
  };

  // Formatear moneda
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num) || num === 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
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
      <div className="wander-pl-container">
        <div className="wander-pl-header">
          <h1>Profit and Loss</h1>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar los datos</h3>
          <p>{error}</p>
          <button onClick={() => loadProfitAndLoss(currentPage, searchListing, searchDate)} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const totals = data?.results || { total_income: 0, total_expenses: 0, total_deposit: 0 };

  return (
    <div className="wander-pl-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="wander-toast">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="wander-pl-header">
        <div className="wander-pl-header-content">
          <h1>Profit and Loss</h1>
          <button 
            className="wander-pl-create-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Create PL
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="wander-pl-filters">
        <form onSubmit={handleSearch} className="wander-pl-search-form">
          <div className="wander-pl-search-group">
            <label className="wander-pl-search-label">Search by listing</label>
            <input
              type="text"
              className="wander-pl-search-input"
              placeholder="Search by listing..."
              value={searchListing}
              onChange={(e) => setSearchListing(e.target.value)}
            />
          </div>
          <div className="wander-pl-search-group">
            <label className="wander-pl-search-label">Search by date</label>
            <input
              type="date"
              className="wander-pl-search-input"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
          </div>
          <button type="submit" className="wander-pl-search-btn">
            Search
          </button>
          {(searchListing || searchDate) && (
            <button 
              type="button" 
              className="wander-pl-clear-btn"
              onClick={() => {
                setSearchListing('');
                setSearchDate('');
                setCurrentPage(1);
                loadProfitAndLoss(1, '', '');
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Tarjetas de resumen */}
      <div className="wander-pl-summary">
        <div className="wander-pl-summary-card">
          <span className="wander-pl-summary-label">Total Income</span>
          <span className="wander-pl-summary-value income">
            {formatCurrency(totals.total_income)}
          </span>
        </div>
        <div className="wander-pl-summary-card">
          <span className="wander-pl-summary-label">Total Expenses</span>
          <span className="wander-pl-summary-value expense">
            {formatCurrency(totals.total_expenses)}
          </span>
        </div>
        <div className="wander-pl-summary-card">
          <span className="wander-pl-summary-label">Total Deposits</span>
          <span className="wander-pl-summary-value deposit">
            {formatCurrency(totals.total_deposit)}
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="wander-pl-table-container">
        <table className="wander-pl-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>LISTING</th>
              <th>DATE</th>
              <th>INCOME</th>
              <th>EXPENSES</th>
              <th>PARTNER DEPOSIT</th>
              <th>DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="wander-pl-empty">
                  No results found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="wander-pl-id">{item.id}</td>
                  <td className="wander-pl-listing">
                    <div className="wander-pl-listing-info">
                      {item.listing?.photo && (
                        <img 
                          src={item.listing.photo} 
                          alt={item.listing.name}
                          className="wander-pl-listing-thumb"
                        />
                      )}
                      <span>{item.listing?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td>{formatDate(item.date)}</td>
                  <td className="wander-pl-income">
                    {formatCurrency(item.total_income)}
                  </td>
                  <td className="wander-pl-expense">
                    {formatCurrency(item.total_expenses)}
                  </td>
                  <td className="wander-pl-deposit">
                    {formatCurrency(item.deposit)}
                  </td>
                  <td>
                    <Link 
                      href={`/admin/properties/profit-and-loss/${item.id}`}
                      className="wander-pl-details-link"
                    >
                      See details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="wander-pl-pagination">
          <button
            className="wander-pl-page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ❮ Previous
          </button>
          <span className="wander-pl-page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="wander-pl-page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next ❯
          </button>
        </div>
      )}

      {/* Total de registros */}
      {data && (
        <div className="wander-pl-total">
          Total: {data.count} records
        </div>
      )}

      {/* Modal Create PL */}
      <ModalCreatePL
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

export default function ProfitAndLossPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ProfitAndLossContent />
    </Suspense>
  );
}
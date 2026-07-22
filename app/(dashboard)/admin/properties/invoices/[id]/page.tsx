// app/admin/properties/invoices/[id]/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getInvoicesByListing, Invoice, InvoicesResponse, InvoicesFilters } from '@/app/lib/api/propertiesAdmin';
import { 
  FiArrowLeft, 
  FiSearch, 
  FiX, 
  FiDollarSign, 
  FiFileText,
  FiTag,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiPlus
} from 'react-icons/fi';
import './invoices.css';

const LoadingSkeleton = () => (
  <div className="wander-invoices-container">
    <div className="wander-invoices-header">
      <div>
        <span className="wander-breadcrumb">Listings / Properties / Invoices</span>
        <h2>Loading invoices...</h2>
      </div>
    </div>
    <div className="wander-invoices-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading invoices...</p>
    </div>
  </div>
);

export default function InvoicesPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = parseInt(params.id as string);
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [monthExpenses, setMonthExpenses] = useState(0);
  const [monthIncomes, setMonthIncomes] = useState(0);
  const [listingName, setListingName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const loadInvoices = useCallback(async (page = 1, start = '', end = '') => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const filters: InvoicesFilters = {
        page: page,
      };

      if (start) {
        filters.initial_date = start;
      }
      if (end) {
        filters.final_date = end;
      }

      const result = await getInvoicesByListing(listingId, filters);
      
      setInvoices(result.results || []);
      setTotalExpenses(result.total_expenses || 0);
      setTotalIncomes(result.total_incomes || 0);
      setMonthExpenses(result.total_actual_month_expenses || 0);
      setMonthIncomes(result.total_actual_month_incomes || 0);
      
      if (result.results && result.results.length > 0) {
        setListingName(result.results[0].listing_name || `Listing #${listingId}`);
      } else {
        setListingName(`Listing #${listingId}`);
      }
      
      setTotalCount(result.count || 0);
      setTotalPages(Math.ceil((result.count || 0) / 20));
      
    } catch (err) {
      console.error('❌ Error cargando facturas:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar las facturas');
    } finally {
      setIsLoading(false);
    }
  }, [listingId, token, isAuthenticated, router]);

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
      loadInvoices(1, '', '');
    } else {
      setError('Invalid property ID');
      setIsLoading(false);
    }
  }, [isAuthenticated, isChecking, loadInvoices, router, checkAuth, listingId]);

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadInvoices(1, startDate, endDate);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    loadInvoices(1, '', '');
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadInvoices(page, startDate, endDate);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const getTypeBadge = (type: string) => {
    if (type === 'expenses') {
      return (
        <span className="wander-invoices-type expense">
          <FiDollarSign size={12} />
          Expense
        </span>
      );
    }
    return (
      <span className="wander-invoices-type income">
        <FiDollarSign size={12} />
        Income
      </span>
    );
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
      <div className="wander-invoices-container">
        <div className="wander-invoices-header">
          <div>
            <span className="wander-breadcrumb">Listings / Properties / Invoices</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error loading invoices</h3>
          <p>{error}</p>
          <button onClick={() => loadInvoices(currentPage, startDate, endDate)} className="wander-btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-invoices-container">
      {/* Header */}
      <header className="wander-invoices-header">
        <div>
          <span className="wander-breadcrumb">LISTINGS / PROPERTIES / INVOICES</span>
          <h2>{listingName}</h2>
          <p className="wander-invoices-subtitle">
            {totalCount} invoices registered
          </p>
        </div>
        <div className="wander-invoices-actions">
          <Link 
            href={`/admin/properties/invoices/create?listing_id=${listingId}`}
            className="wander-btn-primary"
          >
            <FiPlus size={16} />
            Create Invoice
          </Link>
          <Link 
            href={`/admin/properties/${listingId}`}
            className="wander-btn-secondary"
          >
            <FiArrowLeft size={16} />
            Back to Property
          </Link>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="wander-invoices-summary">
        <div className="wander-invoices-summary-card total">
          <div className="wander-invoices-summary-icon total">
            <FiDollarSign size={24} />
          </div>
          <div className="wander-invoices-summary-content">
            <span className="wander-invoices-summary-label">Total Expenses</span>
            <span className="wander-invoices-summary-value expense">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
        </div>
        <div className="wander-invoices-summary-card total">
          <div className="wander-invoices-summary-icon income">
            <FiDollarSign size={24} />
          </div>
          <div className="wander-invoices-summary-content">
            <span className="wander-invoices-summary-label">Total Incomes</span>
            <span className="wander-invoices-summary-value income">
              {formatCurrency(totalIncomes)}
            </span>
          </div>
        </div>
        <div className="wander-invoices-summary-card month">
          <div className="wander-invoices-summary-icon expense">
            <FiDollarSign size={24} />
          </div>
          <div className="wander-invoices-summary-content">
            <span className="wander-invoices-summary-label">This Month Expenses</span>
            <span className="wander-invoices-summary-value expense">
              {formatCurrency(monthExpenses)}
            </span>
          </div>
        </div>
        <div className="wander-invoices-summary-card month">
          <div className="wander-invoices-summary-icon income">
            <FiDollarSign size={24} />
          </div>
          <div className="wander-invoices-summary-content">
            <span className="wander-invoices-summary-label">This Month Incomes</span>
            <span className="wander-invoices-summary-value income">
              {formatCurrency(monthIncomes)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="wander-invoices-filters">
        <form onSubmit={handleSearch} className="wander-invoices-search-form">
          <div className="wander-invoices-filter-group">
            <label className="wander-invoices-filter-label">Filter by date</label>
            <div className="wander-invoices-date-range">
              <input
                type="date"
                className="wander-invoices-filter-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start date"
              />
              <span className="wander-invoices-date-separator">-</span>
              <input
                type="date"
                className="wander-invoices-filter-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End date"
              />
            </div>
          </div>
          <div className="wander-invoices-filter-actions">
            <button type="submit" className="wander-invoices-search-btn">
              <FiSearch size={16} />
              Search
            </button>
            {(startDate || endDate) && (
              <button 
                type="button" 
                className="wander-invoices-clear-btn"
                onClick={handleClearFilters}
              >
                <FiX size={16} />
                Clear filters
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Invoices Table */}
      <div className="wander-invoices-table-container">
        <table className="wander-invoices-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Title</th>
              <th>Type</th>
              <th>Price</th>
              <th>Partner Refund</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="wander-invoices-empty">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="wander-invoices-id">{invoice.id}</td>
                  <td>{formatDate(invoice.date)}</td>
                  <td className="wander-invoices-title">{invoice.title}</td>
                  <td>{getTypeBadge(invoice.invoice_type)}</td>
                  <td className={invoice.invoice_type === 'expenses' ? 'wander-invoices-amount expense' : 'wander-invoices-amount income'}>
                    {formatCurrency(parseFloat(invoice.price))}
                  </td>
                  <td>
                    <span className={invoice.partner_refund ? 'wander-invoices-refund yes' : 'wander-invoices-refund no'}>
                      {invoice.partner_refund ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <Link 
                      href={`/admin/properties/invoice-detail/${invoice.id}`}
                      className="wander-invoices-action-btn"
                      title="View invoice details"
                    >
                      <FiEye size={16} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 0 && (
        <div className="wander-invoices-pagination">
          <div className="wander-pagination-info">
            Showing {((currentPage || 1) - 1) * 20 + 1} - 
            {Math.min((currentPage || 1) * 20, totalCount)} of {totalCount} invoices
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
    </div>
  );
}
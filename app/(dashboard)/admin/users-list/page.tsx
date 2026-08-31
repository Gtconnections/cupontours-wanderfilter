'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import {
  getProfiles,
  UserProfile,
  refreshProfiles,
  updateUser,
  deleteUser,
  createUser,
  updateUserStatus,
  adminSetPassword,
  UpdateUserData,
  CreateUserData
} from '@/app/lib/api/profiles';
import EditUserModal from '../components/EditUserModal';
import DeleteUserModal from '../components/DeleteUserModal';
import CreateUserModal from '../components/CreateUserModal';
import AdminChangePasswordModal from '../components/AdminChangePasswordModal';
import {
  FiRefreshCw,
  FiPlus,
  FiX,
  FiAlertTriangle,
  FiUser,
  FiUserCheck,
  FiUserX,
  FiKey,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import './users-list.css';

// Componente de carga
const LoadingSkeleton = () => (
  <div className="wander-users-container">
    <div className="wander-users-header">
      <div>
        <span className="wander-breadcrumb">Dashboard / Users</span>
        <h2>Cargando usuarios...</h2>
      </div>
    </div>
    <div className="wander-users-table-container">
      <div className="wander-table-loading">
        <div className="wander-loading-spinner"></div>
        <p>Cargando lista de usuarios...</p>
      </div>
    </div>
  </div>
);

export default function UsersListPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Estados para DataTable
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 🔥 ESTADOS PARA MODALES
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Cargar datos
  const loadProfiles = useCallback(async (forceRefresh = false) => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getProfiles(forceRefresh);
      setAllProfiles(data);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar los usuarios');
      
      if ((err instanceof Error ? err.message : undefined)?.includes('sesión') || (err instanceof Error ? err.message : undefined)?.includes('autenticación')) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth, router]);

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

    loadProfiles();
  }, [isChecking, checkAuth, router]);

  // 🔥 MANEJAR ACTUALIZACIÓN DE USUARIO
  const handleUpdateUser = async (userId: number, userData: UpdateUserData) => {
    try {
      await updateUser(userId, userData);
      // Recargar la lista después de actualizar
      await loadProfiles(true);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  };

  // 🔥 MANEJAR ELIMINACIÓN DE USUARIO
  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId);
      // Recargar la lista después de eliminar
      await loadProfiles(true);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  };

  // 🔥 MANEJAR CREACIÓN DE USUARIO
  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      await createUser(userData);
      // Recargar la lista después de crear
      await loadProfiles(true);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  };

  // 🔥 ACTIVAR / DESACTIVAR USUARIO
  const handleToggleStatus = async (profile: UserProfile) => {
    const nextActive = !profile.user.is_active;
    setTogglingUserId(profile.user.id);
    try {
      await updateUserStatus(profile.user.id, nextActive);
      showToast(nextActive ? 'Usuario activado' : 'Usuario desactivado');
      await loadProfiles(true);
    } catch (err) {
      console.error('Error al cambiar el estado del usuario:', err);
      showToast((err instanceof Error ? err.message : undefined) || 'Error al cambiar el estado del usuario', 'error');
    } finally {
      setTogglingUserId(null);
    }
  };

  // 🔥 ABRIR MODAL DE EDICIÓN
  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // 🔥 ABRIR MODAL DE ELIMINACIÓN
  const openDeleteModal = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // 🔥 ABRIR MODAL DE CAMBIO DE CONTRASEÑA (admin)
  const openPasswordModal = (user: UserProfile) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  // 🔥 RESETEAR CONTRASEÑA (admin)
  const handleAdminSetPassword = async (newPassword: string) => {
    if (!selectedUser) return;
    await adminSetPassword(selectedUser.user.id, newPassword);
    showToast('Contraseña actualizada correctamente', 'success');
  };

  // 🔥 CERRAR MODALES
  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsPasswordModalOpen(false);
    setSelectedUser(null);
  };

  // Función para refrescar manualmente
  const handleRefresh = async () => {
    await loadProfiles(true);
  };

  // Filtrar datos
  const filteredProfiles = useMemo(() => {
    let result = allProfiles;

    if (positionFilter !== 'all') {
      result = result.filter(profile => 
        profile.position?.toLowerCase() === positionFilter.toLowerCase()
      );
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      result = result.filter(profile => {
        const fullName = `${profile.user.first_name} ${profile.user.last_name}`.toLowerCase();
        const username = profile.user.username?.toLowerCase() || '';
        const email = profile.user.email?.toLowerCase() || '';
        const phone = profile.phone || '';
        
        return fullName.includes(search) || 
               username.includes(search) || 
               email.includes(search) ||
               phone.includes(search);
      });
    }

    return result;
  }, [allProfiles, searchTerm, positionFilter]);

  // Paginación
  const totalItems = filteredProfiles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProfiles = filteredProfiles.slice(startIndex, endIndex);

  useEffect(() => {
    // Resets pagination when the search/filter criteria change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm, positionFilter, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Obtener iniciales del nombre
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Obtener color de posición
  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      'admin': '#dc2626',
      'owner': '#2563eb',
      'agent': '#c8a24b',
      'customer': '#16a34a',
      'user': '#6b7280',
      'seller': '#8b5cf6',
      'housekeeper': '#f59e0b',
      'front_desk': '#06b6d4',
      'portal': '#ec4899',
    };
    return colors[position?.toLowerCase()] || '#6b7280';
  };

  if (isChecking || !isAuthVerified) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="wander-users-container">
        <div className="wander-users-header">
          <div>
            <span className="wander-breadcrumb">Dashboard / Users</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3><FiAlertTriangle size={18} /> Error al cargar usuarios</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="wander-users-container">
      {toastMessage && (
        <div className={`wander-toast ${toastType === 'error' ? 'error' : ''}`}>
          {toastMessage}
        </div>
      )}

      {/* Cabecera */}
      <header className="wander-users-header">
        <div>
          <span className="wander-breadcrumb">Dashboard / Users</span>
          <h2>Lista de Usuarios</h2>
          <p className="wander-users-subtitle">
            {totalItems} {totalItems === 1 ? 'usuario' : 'usuarios'} registrados
          </p>
        </div>
        <div className="wander-users-actions">
          <button
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            <FiRefreshCw size={16} /> Actualizar
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="wander-btn-primary"
          >
            <FiPlus size={16} /> Crear Usuario
          </button>
        </div>
      </header>

      {/* Filtros y búsqueda */}
      <div className="wander-users-filters">
        <div className="wander-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, email, teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="wander-search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="wander-clear-search"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        <div className="wander-position-filters">
          <button
            className={`wander-filter-pill ${positionFilter === 'all' ? 'active' : ''}`}
            onClick={() => setPositionFilter('all')}
          >
            Todos
          </button>
          <button
            className={`wander-filter-pill ${positionFilter === 'admin' ? 'active' : ''}`}
            onClick={() => setPositionFilter('admin')}
          >
            Admin
          </button>
          <button
            className={`wander-filter-pill ${positionFilter === 'owner' ? 'active' : ''}`}
            onClick={() => setPositionFilter('owner')}
          >
            Owner
          </button>
          <button
            className={`wander-filter-pill ${positionFilter === 'customer' ? 'active' : ''}`}
            onClick={() => setPositionFilter('customer')}
          >
            Customer
          </button>
          <button
            className={`wander-filter-pill ${positionFilter === 'seller' ? 'active' : ''}`}
            onClick={() => setPositionFilter('seller')}
          >
            Seller
          </button>
          <button
            className={`wander-filter-pill ${positionFilter === 'housekeeper' ? 'active' : ''}`}
            onClick={() => setPositionFilter('housekeeper')}
          >
            Housekeeper
          </button>
        </div>

        <div className="wander-page-size">
          <label>Mostrar:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="wander-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="wander-users-table-container">
        <table className="wander-users-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}></th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Posición</th>
              <th>Teléfono</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th style={{ width: '170px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentProfiles.length === 0 ? (
              <tr>
                <td colSpan={8} className="wander-empty-cell">
                  <div className="wander-empty-state">
                    <span className="wander-empty-icon"><FiUser size={32} /></span>
                    <p>No se encontraron usuarios</p>
                    <span className="wander-empty-desc">
                      {searchTerm || positionFilter !== 'all' 
                        ? 'Prueba ajustando los filtros de búsqueda'
                        : 'No hay usuarios registrados aún'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              currentProfiles.map((profile) => (
                <tr key={profile.id} className="wander-user-row">
                  <td>
                    <div className="wander-user-avatar">
                      {profile.photo ? (
                        <img src={profile.photo} alt={profile.user.username} />
                      ) : (
                        <span className="wander-avatar-initials">
                          {getInitials(profile.user.first_name, profile.user.last_name)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="wander-user-name">
                      <span className="wander-name">
                        {profile.user.first_name} {profile.user.last_name}
                      </span>
                      <span className="wander-username">@{profile.user.username}</span>
                    </div>
                  </td>
                  <td>
                    <span className="wander-user-email">{profile.user.email}</span>
                  </td>
                  <td>
                    <span 
                      className="wander-user-position"
                      style={{ 
                        backgroundColor: `${getPositionColor(profile.position)}15`,
                        color: getPositionColor(profile.position)
                      }}
                    >
                      {profile.position}
                    </span>
                  </td>
                  <td>
                    <span className="wander-user-phone">{profile.phone || '—'}</span>
                  </td>
                  <td>
                    <span className="wander-user-location">
                      {profile.city && profile.state
                        ? `${profile.city}, ${profile.state}`
                        : profile.country || '—'
                      }
                    </span>
                  </td>
                  <td>
                    <span
                      className="wander-user-status"
                      style={{
                        backgroundColor: profile.user.is_active ? '#dcfce715' : '#f3f4f6',
                        color: profile.user.is_active ? '#166534' : '#6b7280'
                      }}
                    >
                      {profile.user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="wander-user-actions">
                      <button
                        onClick={() => handleToggleStatus(profile)}
                        className={`wander-action-btn ${profile.user.is_active ? 'wander-action-deactivate' : 'wander-action-activate'}`}
                        title={profile.user.is_active ? 'Desactivar usuario' : 'Activar usuario'}
                        disabled={togglingUserId === profile.user.id}
                      >
                        {profile.user.is_active ? <FiUserX size={16} /> : <FiUserCheck size={16} />}
                      </button>
                      <button
                        onClick={() => openEditModal(profile)}
                        className="wander-action-btn wander-action-edit"
                        title="Editar usuario"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => openPasswordModal(profile)}
                        className="wander-action-btn wander-action-edit"
                        title="Cambiar contraseña"
                      >
                        <FiKey size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(profile)}
                        className="wander-action-btn wander-action-delete"
                        title="Eliminar usuario"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
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
      {totalItems > 0 && (
        <div className="wander-users-pagination">
          <div className="wander-pagination-info">
            Mostrando {startIndex + 1} - {Math.min(endIndex, totalItems)} de {totalItems} usuarios
          </div>
          
          <div className="wander-pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="wander-pagination-btn"
            >
              <FiChevronLeft size={14} />
            </button>
            
            {(() => {
              const pages = [];
              const maxVisible = 5;
              
              if (totalPages <= maxVisible) {
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                if (currentPage <= 3) {
                  for (let i = 1; i <= maxVisible; i++) {
                    pages.push(i);
                  }
                } else if (currentPage >= totalPages - 2) {
                  for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pages.push(i);
                  }
                }
              }
              
              return pages.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`wander-pagination-btn ${page === currentPage ? 'active' : ''}`}
                >
                  {page}
                </button>
              ));
            })()}
            
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

      {/* 🔥 MODALES */}
      <EditUserModal
        isOpen={isEditModalOpen}
        user={selectedUser}
        onClose={closeModals}
        onSave={handleUpdateUser}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        user={selectedUser}
        onClose={closeModals}
        onDelete={handleDeleteUser}
      />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateUser}
      />

      <AdminChangePasswordModal
        isOpen={isPasswordModalOpen}
        user={selectedUser}
        onClose={closeModals}
        onSubmit={handleAdminSetPassword}
      />
    </div>
  );
}
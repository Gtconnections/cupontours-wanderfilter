'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { 
  getContacts, 
  getContactTypes, 
  createContact,
  updateContact,
  deleteContact,
  createContactType,
  Contact, 
  ContactType,
  ContactFormData
} from '@/app/lib/api/emergencyContacts';
import CreateContactModal from '../components/CreateContactModal';
import CreateContactTypeModal from '../components/CreateContactTypeModal';
import DeleteContactModal from '../components/DeleteContactModal';
import './emergency-contacts.css';

const LoadingSkeleton = () => (
  <div className="wander-contacts-container">
    <div className="wander-contacts-header">
      <div>
        <span className="wander-breadcrumb">Dashboard / Emergency Contacts</span>
        <h2>Cargando contactos...</h2>
      </div>
    </div>
    <div className="wander-contacts-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando lista de contactos...</p>
    </div>
  </div>
);

export default function EmergencyContactsPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para modales
  const [contactModalState, setContactModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    contact: Contact | null;
  }>({
    isOpen: false,
    mode: 'create',
    contact: null,
  });

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    contact: Contact | null;
  }>({
    isOpen: false,
    contact: null,
  });

  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      console.log('🔒 No autenticado, redirigiendo a login');
      router.push('/login');
      return;
    }
    
    loadData();
  }, [isChecking, checkAuth, router]);

  // Cargar datos
  const loadData = useCallback(async (forceRefresh = false) => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [contactsData, typesData] = await Promise.all([
        getContacts(forceRefresh),
        getContactTypes(forceRefresh)
      ]);
      setContacts(contactsData);
      setContactTypes(typesData);
    } catch (err: any) {
      console.error('❌ Error cargando datos:', err);
      setError(err.message || 'Error al cargar los contactos');
      
      if (err.message?.includes('sesión') || err.message?.includes('autenticación')) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth, router]);

  // 🔥 MANEJAR CREACIÓN DE CONTACTO
  const handleCreateContact = async (data: ContactFormData) => {
    try {
      await createContact(data);
      await loadData(true);
    } catch (err) {
      throw err;
    }
  };

  // 🔥 MANEJAR ACTUALIZACIÓN DE CONTACTO
  const handleUpdateContact = async (data: ContactFormData) => {
    if (!contactModalState.contact) return;
    try {
      await updateContact(contactModalState.contact.id, data);
      await loadData(true);
    } catch (err) {
      throw err;
    }
  };

  // 🔥 MANEJAR ELIMINACIÓN DE CONTACTO
  const handleDeleteContact = async (contactId: number) => {
    try {
      await deleteContact(contactId);
      await loadData(true);
      closeDeleteModal();
    } catch (err: any) {
      console.error('Error al eliminar contacto:', err);
      throw err;
    }
  };

  // 🔥 MANEJAR CREACIÓN DE TIPO DE CONTACTO
  const handleCreateContactType = async (data: { contact_type: string }) => {
    try {
      await createContactType(data);
      await loadData(true);
      setIsCreateTypeModalOpen(false);
    } catch (err) {
      throw err;
    }
  };

  // 🔥 ABRIR MODAL DE CREACIÓN DE CONTACTO
  const openCreateContactModal = () => {
    setContactModalState({
      isOpen: true,
      mode: 'create',
      contact: null,
    });
  };

  // 🔥 ABRIR MODAL DE EDICIÓN DE CONTACTO
  const openEditContactModal = (contact: Contact) => {
    setContactModalState({
      isOpen: true,
      mode: 'edit',
      contact: contact,
    });
  };

  // 🔥 CERRAR MODAL DE CONTACTO
  const closeContactModal = () => {
    setContactModalState({
      isOpen: false,
      mode: 'create',
      contact: null,
    });
  };

  // 🔥 ABRIR MODAL DE ELIMINACIÓN
  const openDeleteModal = (contact: Contact) => {
    setDeleteModalState({
      isOpen: true,
      contact: contact,
    });
  };

  // 🔥 CERRAR MODAL DE ELIMINACIÓN
  const closeDeleteModal = () => {
    setDeleteModalState({
      isOpen: false,
      contact: null,
    });
  };

  const handleRefresh = async () => {
    await loadData(true);
  };

  // Filtrar contactos por búsqueda
  const filteredContacts = searchTerm.trim()
    ? contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : contacts;

  if (isChecking || !isAuthVerified) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="wander-contacts-container">
        <div className="wander-contacts-header">
          <div>
            <span className="wander-breadcrumb">Dashboard / Emergency Contacts</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar contactos</h3>
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
    <div className="wander-contacts-container">
      <header className="wander-contacts-header">
        <div>
          <span className="wander-breadcrumb">Dashboard / Emergency Contacts</span>
          <h2>Emergency Contacts</h2>
          <p className="wander-contacts-subtitle">
            {contacts.length} contactos registrados
          </p>
        </div>
        <div className="wander-contacts-actions">
          <button 
            onClick={() => setIsCreateTypeModalOpen(true)}
            className="wander-btn-primary"
            style={{ backgroundColor: '#2563eb' }}
          >
            ➕ Add Type
          </button>
          <button 
            onClick={openCreateContactModal}
            className="wander-btn-primary"
          >
            ➕ Add Contact
          </button>
          <button 
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            🔄 Actualizar
          </button>
        </div>
      </header>

      <div className="wander-contacts-search">
        <div className="wander-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="wander-search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="wander-clear-search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="wander-contacts-table-container">
        <table className="wander-contacts-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Type</th>
              <th style={{ width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="wander-empty-cell">
                  <div className="wander-empty-state">
                    <span className="wander-empty-icon">📞</span>
                    <p>No se encontraron contactos</p>
                    <span className="wander-empty-desc">
                      {searchTerm ? 'Prueba con otro término de búsqueda' : 'Haz clic en "Add Contact" para crear uno'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => {
                // 🔥 FILTRAR TIPOS DE CONTACTO DUPLICADOS POR ID
                const uniqueContactTypes = contact.contact_type.filter(
                  (type, index, self) => 
                    index === self.findIndex((t) => t.id === type.id)
                );

                return (
                  <tr key={contact.id} className="wander-contact-row">
                    <td>
                      <span className="wander-contact-name">{contact.name}</span>
                    </td>
                    <td>
                      <span className="wander-contact-phone">{contact.phone}</span>
                    </td>
                    <td>
                      <span className="wander-contact-email">
                        {contact.email || '—'}
                      </span>
                    </td>
                    <td>
                      <div className="wander-contact-types">
                        {uniqueContactTypes.map((type) => (
                          <span key={type.id} className="wander-contact-type-badge">
                            {type.contact_type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="wander-contact-actions">
                        <button
                          onClick={() => openEditContactModal(contact)}
                          className="wander-action-btn wander-action-edit"
                          title="Editar"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(contact)}
                          className="wander-action-btn wander-action-delete"
                          title="Eliminar"
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODALES */}
      <CreateContactModal
        isOpen={contactModalState.isOpen}
        mode={contactModalState.mode}
        contact={contactModalState.contact}
        contactTypes={contactTypes}
        onClose={closeContactModal}
        onSave={contactModalState.mode === 'edit' ? handleUpdateContact : handleCreateContact}
      />

      <CreateContactTypeModal
        isOpen={isCreateTypeModalOpen}
        onClose={() => setIsCreateTypeModalOpen(false)}
        onCreate={handleCreateContactType}
      />

      <DeleteContactModal
        isOpen={deleteModalState.isOpen}
        contact={deleteModalState.contact}
        onClose={closeDeleteModal}
        onDelete={handleDeleteContact}
      />
    </div>
  );
}
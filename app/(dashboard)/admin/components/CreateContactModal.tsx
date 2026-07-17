// components/CreateContactModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ContactType, Contact, ContactFormData } from '@/app/lib/api/emergencyContacts';

interface CreateContactModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  contact: Contact | null;
  contactTypes: ContactType[];
  onClose: () => void;
  onSave: (data: ContactFormData) => Promise<void>;
}

export default function CreateContactModal({ 
  isOpen, 
  mode, 
  contact, 
  contactTypes, 
  onClose, 
  onSave 
}: CreateContactModalProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    contact_type_id: [], // 🔥 CAMBIADO: contact_type → contact_type_id
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && contact) {
      // Pre-fills the form from the record being edited when the modal opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: contact.name || '',
        phone: contact.phone || '',
        email: contact.email || '',
        contact_type_id: contact.contact_type.map(ct => ct.id), // 🔥 CAMBIADO
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        phone: '',
        email: '',
        contact_type_id: [], // 🔥 CAMBIADO
      });
    }
    setError(null);
  }, [contact, isOpen, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeToggle = (typeId: number) => {
    setFormData(prev => ({
      ...prev,
      contact_type_id: prev.contact_type_id.includes(typeId) // 🔥 CAMBIADO
        ? prev.contact_type_id.filter(id => id !== typeId)
        : [...prev.contact_type_id, typeId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.phone.trim()) {
      setError('El teléfono es requerido');
      return;
    }

    if (formData.contact_type_id.length === 0) { // 🔥 CAMBIADO
      setError('Debes seleccionar al menos un tipo de contacto');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Error al guardar:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al guardar el contacto');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalTitle = mode === 'edit' ? 'Edit Contact' : 'Create Contact';

  return (
    <div className="wander-modal-overlay" onClick={onClose}>
      <div className="wander-modal wander-modal-contact" onClick={(e) => e.stopPropagation()}>
        <div className="wander-modal-header">
          <h2>{modalTitle}</h2>
          <button className="wander-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="wander-modal-form">
          <p className="wander-modal-subtitle">
            Put the info about the contact
          </p>

          {error && (
            <div className="wander-modal-error">
              ⚠️ {error}
            </div>
          )}

          <div className="wander-form-group">
            <label htmlFor="name">Full name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="phone">Phone number</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              required
              disabled={isLoading}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              disabled={isLoading}
            />
          </div>

          <div className="wander-form-group">
            <label>Contact type</label>
            <div className="wander-contact-types-grid">
              {contactTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeToggle(type.id)}
                  className={`wander-type-chip ${formData.contact_type_id.includes(type.id) ? 'active' : ''}`} // 🔥 CAMBIADO
                  disabled={isLoading}
                >
                  {type.contact_type}
                </button>
              ))}
            </div>
          </div>

          <div className="wander-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="wander-btn-cancel"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="wander-btn-save"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="wander-spinner"></span>
                  {mode === 'edit' ? 'Guardando...' : 'Creando...'}
                </>
              ) : (
                mode === 'edit' ? 'Actualizar Contacto' : 'Crear Contacto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
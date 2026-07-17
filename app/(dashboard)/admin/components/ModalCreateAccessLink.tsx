// app/admin/properties/components/ModalCreateAccessLink.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiTag, FiLink, FiFileText } from 'react-icons/fi';
import { createAccessLink, getListingsNamesAndIds, ListingSimple } from '@/app/lib/api/propertiesAdmin';
import './ModalCreateAccessLink.css';

interface ModalCreateAccessLinkProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  listingId: number;
  listingName: string;
}

interface Attribute {
  name: string;
  content: string;
  description: string;
}

export default function ModalCreateAccessLink({
  isOpen,
  onClose,
  onSuccess,
  listingId,
  listingName,
}: ModalCreateAccessLinkProps) {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [attributes, setAttributes] = useState<Attribute[]>([
    { name: '', content: '', description: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resetear estado al abrir/cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      // Pre-fills the form from the record being edited when the modal opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName('');
      setLink('');
      setDescription('');
      setAttributes([{ name: '', content: '', description: '' }]);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const addAttribute = () => {
    setAttributes(prev => [...prev, { name: '', content: '', description: '' }]);
  };

  const removeAttribute = (index: number) => {
    if (attributes.length === 1) {
      setError('At least one attribute is required');
      return;
    }
    setAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: keyof Attribute, value: string) => {
    setAttributes(prev => {
      const newAttributes = [...prev];
      newAttributes[index] = { ...newAttributes[index], [field]: value };
      return newAttributes;
    });
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }
    if (!link.trim()) {
      setError('Please enter a link');
      return;
    }

    // Validar atributos
    for (let i = 0; i < attributes.length; i++) {
      if (!attributes[i].name.trim()) {
        setError(`Please enter a name for attribute ${i + 1}`);
        return;
      }
      if (!attributes[i].content.trim()) {
        setError(`Please enter content for attribute ${i + 1}`);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        link: link.trim(),
        listing_id: listingId.toString(),
        description: description.trim(),
        attributes: attributes.map(attr => ({
          name: attr.name.trim(),
          content: attr.content.trim(),
          description: attr.description.trim()
        }))
      };

      await createAccessLink(payload);
      
      onSuccess();
      onClose();

    } catch (err) {
      console.error('❌ Error al crear access link:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error creating access link');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wander-create-al-overlay" onClick={onClose}>
      <div className="wander-create-al-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-create-al-header">
          <h2>Create Access Link</h2>
          <button className="wander-create-al-close" onClick={onClose} disabled={isLoading}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-create-al-body">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            {/* Name */}
            <div className="wander-create-al-field">
              <label className="wander-create-al-label">
                <FiTag size={16} />
                Name
              </label>
              <input
                type="text"
                className="wander-create-al-input"
                placeholder="Enter name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Link */}
            <div className="wander-create-al-field">
              <label className="wander-create-al-label">
                <FiLink size={16} />
                Link
              </label>
              <input
                type="text"
                className="wander-create-al-input"
                placeholder="Enter link..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Listing - Bloqueado */}
            <div className="wander-create-al-field">
              <label className="wander-create-al-label">
                <FiTag size={16} />
                Listing
              </label>
              <div className="wander-create-al-listing-locked">
                {listingName} (ID: {listingId})
                <span className="wander-create-al-locked-badge">Locked</span>
              </div>
            </div>

            {/* Description */}
            <div className="wander-create-al-field">
              <label className="wander-create-al-label">
                <FiFileText size={16} />
                Description
              </label>
              <textarea
                className="wander-create-al-textarea"
                placeholder="Enter description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Attributes */}
            <div className="wander-create-al-section">
              <div className="wander-create-al-section-header">
                <h3>Attributes</h3>
              </div>

              {attributes.map((attr, index) => (
                <div key={index} className="wander-create-al-attribute">
                  <div className="wander-create-al-attribute-header">
                    <span className="wander-create-al-attribute-number">Attribute {index + 1}</span>
                    <button
                      type="button"
                      className="wander-create-al-attribute-remove"
                      onClick={() => removeAttribute(index)}
                      disabled={isLoading}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  <div className="wander-create-al-attribute-grid">
                    <div className="wander-create-al-attribute-field">
                      <label className="wander-create-al-attribute-label">Name</label>
                      <input
                        type="text"
                        className="wander-create-al-input"
                        placeholder="Attribute name..."
                        value={attr.name}
                        onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="wander-create-al-attribute-field">
                      <label className="wander-create-al-attribute-label">Content</label>
                      <input
                        type="text"
                        className="wander-create-al-input"
                        placeholder="Attribute content..."
                        value={attr.content}
                        onChange={(e) => updateAttribute(index, 'content', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="wander-create-al-attribute-field full">
                      <label className="wander-create-al-attribute-label">Description</label>
                      <input
                        type="text"
                        className="wander-create-al-input"
                        placeholder="Attribute description..."
                        value={attr.description}
                        onChange={(e) => updateAttribute(index, 'description', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="wander-create-al-add-attribute"
                onClick={addAttribute}
                disabled={isLoading}
              >
                <FiPlus size={16} />
                Add Attribute
              </button>
            </div>

            {error && (
              <div className="wander-create-al-error">
                <FiX size={16} />
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="wander-create-al-footer">
          <button 
            className="wander-create-al-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="wander-create-al-btn-submit" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
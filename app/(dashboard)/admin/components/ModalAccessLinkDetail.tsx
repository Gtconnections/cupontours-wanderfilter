// app/admin/properties/components/ModalAccessLinkDetail.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiLink, FiTag, FiFileText } from 'react-icons/fi';
import { AccessLink } from '@/app/lib/api/propertiesAdmin';
import './ModalAccessLinkDetail.css';

interface ModalAccessLinkDetailProps {
  isOpen: boolean;
  onClose: () => void;
  accessLink: AccessLink | null;
  isLoading: boolean;
}

export default function ModalAccessLinkDetail({
  isOpen,
  onClose,
  accessLink,
  isLoading,
}: ModalAccessLinkDetailProps) {
  
  if (!isOpen) return null;

  return (
    <div 
      className="wander-al-detail-overlay" 
      onClick={onClose}
    >
      <div className="wander-al-detail-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wander-al-detail-header">
          <h2>Access Link Details</h2>
          <button className="wander-al-detail-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="wander-al-detail-body">
          {isLoading ? (
            <div className="wander-al-detail-loading">
              <div className="wander-loading-spinner"></div>
              <p>Loading details...</p>
            </div>
          ) : accessLink ? (
            <>
              {/* Información principal */}
              <div className="wander-al-detail-section">
                <h3>Link Information</h3>
                <div className="wander-al-detail-grid">
                  <div className="wander-al-detail-item">
                    <span className="wander-al-detail-label">ID</span>
                    <span className="wander-al-detail-value">#{accessLink.listing_link_access_id}</span>
                  </div>
                  <div className="wander-al-detail-item">
                    <span className="wander-al-detail-label">Name</span>
                    <span className="wander-al-detail-value">{accessLink.name}</span>
                  </div>
                  <div className="wander-al-detail-item">
                    <span className="wander-al-detail-label">Listing ID</span>
                    <span className="wander-al-detail-value">#{accessLink.listing_id}</span>
                  </div>
                  <div className="wander-al-detail-item full">
                    <span className="wander-al-detail-label">Link</span>
                    <span className="wander-al-detail-value link">
                      <a 
                        href={accessLink.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <FiLink size={14} />
                        {accessLink.link}
                      </a>
                    </span>
                  </div>
                  {accessLink.description && (
                    <div className="wander-al-detail-item full">
                      <span className="wander-al-detail-label">Description</span>
                      <span className="wander-al-detail-value description">
                        {accessLink.description}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Atributos */}
              <div className="wander-al-detail-section">
                <h3>Attributes</h3>
                {accessLink.listing_link_attributes && accessLink.listing_link_attributes.length > 0 ? (
                  <div className="wander-al-detail-attributes">
                    <table className="wander-al-detail-attributes-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Content</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accessLink.listing_link_attributes.map((attr, index) => (
                          <tr key={index}>
                            <td className="wander-al-detail-attr-name">{attr.name}</td>
                            <td className="wander-al-detail-attr-content">{attr.content}</td>
                            <td className="wander-al-detail-attr-desc">{attr.description || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="wander-al-detail-no-attributes">
                    No attributes found
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="wander-al-detail-error">
              <p>Could not load access link details</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wander-al-detail-footer">
          <button className="wander-al-detail-btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// app/(dashboard)/admin/components/Modal.tsx

'use client';

import React, { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '600px'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="wander-modal-overlay">
      <div 
        ref={modalRef}
        className="wander-modal-container"
        style={{ maxWidth }}
      >
        <div className="wander-modal-header">
          <h3 className="wander-modal-title">{title}</h3>
          <button onClick={onClose} className="wander-modal-close-btn">
            <FiX size={20} />
          </button>
        </div>
        <div className="wander-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};
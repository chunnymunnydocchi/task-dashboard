//src/components/ConfirmDialog/ConfirmDialog.jsx
import React, { useEffect, useRef } from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning' | 'danger' | 'info'
  onConfirm,
  onCancel,
  onClose
}) => {
  const dialogRef = useRef(null);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel?.();
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel?.();
      onClose?.();
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'danger': return 'confirm-danger';
      case 'info': return 'confirm-info';
      default: return 'confirm-warning';
    }
  };

  return (
    <div className="confirm-overlay" onClick={handleBackdropClick}>
      <div className="confirm-dialog" ref={dialogRef}>
        <div className="confirm-header">
          <div className={`confirm-icon ${getTypeClass()}`}>
            {type === 'danger' && (
              <span className="material-icons">warning</span>
            )}
            {type === 'warning' && (
              <span className="material-icons">info</span>
            )}
            {type === 'info' && (
              <span className="material-icons">help</span>
            )}
          </div>
          <button className="confirm-close" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="confirm-body">
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-message">{message}</p>
        </div>

        <div className="confirm-footer">
          <button 
            className="confirm-btn cancel"
            onClick={() => {
              onCancel?.();
              onClose?.();
            }}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-btn confirm ${getTypeClass()}`}
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
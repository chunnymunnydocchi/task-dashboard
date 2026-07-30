// src/components/Calendar/SidePanel.jsx
import React, { useEffect, useRef } from 'react';
import './SidePanel.css';

const SidePanel = ({ 
  isOpen, 
  onClose, 
  date, 
  children,
  taskCount = 0,
  loading = false // ✅ ADDED
}) => {
  const panelRef = useRef(null);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Click outside to close - IGNORE UNDO TOAST CLICKS
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Check if click is on undo toast
      const target = e.target;
      const isUndoToast = target.closest('.undo-toast');
      
      // If clicking on undo toast, don't close the panel
      if (isUndoToast) {
        return;
      }

      // Otherwise, check if click is outside the panel
      if (panelRef.current && !panelRef.current.contains(target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      // Use mousedown instead of click for faster response
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (date) => {
    if (!date) return 'Select Date';
    const dateObj = date instanceof Date ? date : new Date(date + 'T00:00:00');
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className="side-panel-backdrop" onClick={onClose} />
      
      <div className={`side-panel ${isOpen ? 'open' : ''}`} ref={panelRef}>
        <div className="side-panel-header">
          <div className="header-content">
            <h2>{formatDate(date)}</h2>
            <span className="task-count-badge">
              {loading ? '...' : `${taskCount} tasks`}
            </span>
          </div>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        <div className="side-panel-content">
          {loading ? (
            <div className="loading-state">
              <span className="material-icons spinning">refresh</span>
              <span>Loading tasks...</span>
            </div>
          ) : (
            children || (
              <div className="empty-state">
                <p>No tasks for this day</p>
                <p className="empty-subtitle">Add a task using the quick input below</p>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default SidePanel;
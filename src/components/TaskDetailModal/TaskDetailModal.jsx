// src/components/TaskDetailModal/TaskDetailModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import './TaskDetailModal.css';

const TaskDetailModal = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const modalRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [hasPosition, setHasPosition] = useState(false);

  // Handle positioning
  useEffect(() => {
    if (!isOpen || !task) {
      setHasPosition(false);
      return;
    }

    // If there's an anchorRef, position near it
    if (task?.anchorRef?.current) {
      const rect = task.anchorRef.current.getBoundingClientRect();
      const modalWidth = 380;
      const modalHeight = Math.min(window.innerHeight - 40, 600);
      const padding = 16;
      
      let top = rect.top + window.scrollY;
      let left = rect.right + padding + window.scrollX;
      
      // Check if modal would go off screen on the right
      if (left + modalWidth > window.innerWidth - padding) {
        left = rect.left - modalWidth - padding + window.scrollX;
      }
      
      // Check if modal would go off screen on the left
      if (left < padding) {
        left = padding;
      }
      
      // Check if modal would go off screen on the bottom
      if (top + modalHeight > window.innerHeight - padding) {
        top = window.innerHeight - modalHeight - padding + window.scrollY;
      }
      
      // Check if modal would go off screen on the top
      if (top < padding + window.scrollY) {
        top = padding + window.scrollY;
      }
      
      setPosition({ top, left });
      setHasPosition(true);
    } else {
      // No anchorRef - center on desktop
      setHasPosition(false);
    }
  }, [isOpen, task]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
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
  }, [isOpen, onClose]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  if (!isOpen || !task) return null;

  const isMobile = window.innerWidth <= 768;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch {
      return dateStr;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-normal';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Normal Priority';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'priority_high';
      case 'medium': return 'circle';
      case 'low': return 'circle';
      default: return 'circle';
    }
  };

  const handleEditClick = () => {
    setShowMenu(false);
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // Determine if we should show centered (no anchor) or positioned
  const showCentered = !isMobile && !hasPosition;

  return (
    <div 
      className={`detail-modal-wrapper ${isMobile ? 'mobile' : ''} ${showCentered ? 'centered' : ''}`}
      style={!isMobile && hasPosition ? { top: position.top, left: position.left } : {}}
    >
      <div className="detail-modal-container" ref={modalRef}>
        {/* Header with Title, Menu, and Close */}
        <div className="detail-modal-header">
          <div className="detail-modal-title-group">
            <span className="detail-modal-icon material-icons">description</span>
            <h2 className="detail-modal-title">{task.title}</h2>
          </div>
          
          <div className="detail-modal-header-actions">
            <div className="detail-menu-wrapper" ref={menuRef}>
              <button 
                className="detail-menu-btn"
                onClick={toggleMenu}
                aria-label="Task options"
              >
                <span className="material-icons">more_vert</span>
              </button>
              
              {showMenu && (
                <div className="detail-menu-dropdown">
                  <button 
                    className="detail-menu-item edit"
                    onClick={handleEditClick}
                  >
                    <span className="material-icons">edit</span>
                    Edit Task
                  </button>
                  <button 
                    className="detail-menu-item delete"
                    onClick={handleDeleteClick}
                  >
                    <span className="material-icons">delete</span>
                    Delete Task
                  </button>
                </div>
              )}
            </div>

            <button 
              className="detail-modal-close"
              onClick={onClose}
              aria-label="Close task details"
            >
              <span className="material-icons">close</span>
            </button>
          </div>
        </div>

        <div className="detail-modal-divider" />

        <div className="detail-modal-meta">
          <div className="detail-meta-item">
            <span className={`detail-priority-dot ${getPriorityClass(task.priority)}`} />
            <span className={`detail-priority-text ${getPriorityClass(task.priority)}`}>
              <span className="material-icons detail-priority-icon">
                {getPriorityIcon(task.priority)}
              </span>
              {getPriorityLabel(task.priority)}
            </span>
          </div>
          <div className="detail-meta-item">
            <span className={`detail-status ${task.completed ? 'completed' : ''}`}>
              <span className="material-icons detail-status-icon">
                {task.completed ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              {task.completed ? 'Done' : 'Incomplete'}
            </span>
          </div>
        </div>

        <div className="detail-modal-datetime">
          <div className="detail-datetime-item">
            <span className="material-icons detail-datetime-icon">calendar_today</span>
            <span>{formatDate(task.date || task.createdAt)}</span>
          </div>
          {task.timeSchedule?.start && (
            <div className="detail-datetime-item">
              <span className="material-icons detail-datetime-icon">schedule</span>
              <span>
                {formatTime(task.timeSchedule.start)}
                {task.timeSchedule.end && ` - ${formatTime(task.timeSchedule.end)}`}
              </span>
            </div>
          )}
        </div>

        {task.description && (
          <>
            <div className="detail-modal-divider" />
            <div className="detail-modal-description">
              <div className="detail-description-header">
                <span className="material-icons detail-description-icon">description</span>
                <span className="detail-description-label">Description</span>
              </div>
              <p className="detail-description-text">{task.description}</p>
            </div>
          </>
        )}

        <div className="detail-modal-divider" />
        <div className="detail-modal-metadata">
          <div className="detail-metadata-item">
            <span className="material-icons detail-metadata-icon">create</span>
            <span>Created: {formatDateTime(task.createdAt)}</span>
          </div>
          {task.updatedAt && task.updatedAt !== task.createdAt && (
            <div className="detail-metadata-item">
              <span className="material-icons detail-metadata-icon">update</span>
              <span>Updated: {formatDateTime(task.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
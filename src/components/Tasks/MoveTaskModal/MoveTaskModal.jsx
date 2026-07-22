// src/components/Tasks/MoveTaskModal/MoveTaskModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import './MoveTaskModal.css';

const MoveTaskModal = ({
  isOpen,
  task,
  onSave,
  onCancel,
  onClose
}) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showEndTime, setShowEndTime] = useState(false);
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const modalRef = useRef(null);

  // Initialize time when task changes or modal opens
  useEffect(() => {
    if (isOpen && task) {
      // Set default start time to current time
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setStartTime(`${hours}:${minutes}`);
      
      // Reset end time
      setEndTime('');
      setShowEndTime(false);
      setErrors({});
    }
  }, [isOpen, task]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onCancel) {
      onCancel();
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (endTime && startTime && endTime <= startTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => {
        setErrors({});
      }, 5000);
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const timeData = {
      start: startTime,
      end: endTime || ''
    };
    
    if (onSave) {
      onSave(timeData);
    }
  };

  const formatDateDisplay = (date) => {
    if (!date) return '';
    return format(new Date(date), 'EEEE, MMMM d, yyyy');
  };

  const getTaskDate = () => {
    if (task?.date) {
      return task.date;
    }
    if (task?.createdAt) {
      return new Date(task.createdAt).toISOString().split('T')[0];
    }
    return format(new Date(), 'yyyy-MM-dd');
  };

  if (!isOpen || !task) return null;

  return (
    <div className="move-task-modal-overlay">
      <div className="move-task-modal-backdrop" onClick={handleClose} />
      <div className="move-task-modal" ref={modalRef}>
        {/* Header */}
        <div className="move-task-modal-header">
          <div className="move-task-modal-header-left">
            <span className="material-icons move-task-icon">schedule</span>
            <h2 className="move-task-modal-title">Move Task to Timeline</h2>
          </div>
          <button 
            className="move-task-modal-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="move-task-modal-body">
          {/* Task Info */}
          <div className="move-task-task-info">
            <span className="move-task-task-label">Task:</span>
            <span className="move-task-task-title">{task.title}</span>
          </div>

          {/* Divider */}
          <div className="move-task-divider" />

          {/* Start Time */}
          <div className="move-task-form-group">
            <label htmlFor="move-task-start-time" className="move-task-form-label">
              Start Time <span className="move-task-required">*</span>
            </label>
            <input
              id="move-task-start-time"
              type="time"
              className={`move-task-form-input ${errors.startTime ? 'error' : ''} ${shake ? 'shake' : ''}`}
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                if (errors.startTime) {
                  setErrors(prev => ({ ...prev, startTime: '' }));
                }
              }}
              step="60"
            />
            {errors.startTime && (
              <div className="move-task-form-error">{errors.startTime}</div>
            )}
          </div>

          {/* End Time */}
          {showEndTime ? (
            <div className="move-task-form-group">
              <div className="move-task-end-time-row">
                <label htmlFor="move-task-end-time" className="move-task-form-label">
                  End Time
                </label>
                <button
                  className="move-task-remove-time-btn"
                  onClick={() => {
                    setShowEndTime(false);
                    setEndTime('');
                    if (errors.endTime) {
                      setErrors(prev => ({ ...prev, endTime: '' }));
                    }
                  }}
                >
                  <span className="material-icons">close</span>
                  Remove
                </button>
              </div>
              <input
                id="move-task-end-time"
                type="time"
                className={`move-task-form-input ${errors.endTime ? 'error' : ''} ${shake ? 'shake' : ''}`}
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (errors.endTime) {
                    setErrors(prev => ({ ...prev, endTime: '' }));
                  }
                }}
                step="60"
              />
              {errors.endTime && (
                <div className="move-task-form-error">{errors.endTime}</div>
              )}
            </div>
          ) : (
            <button
              className="move-task-add-time-btn"
              onClick={() => setShowEndTime(true)}
            >
              <span className="material-icons">add</span>
              Add End Time
            </button>
          )}

          {/* Divider */}
          <div className="move-task-divider" />

          {/* Date (Locked) */}
          <div className="move-task-date-display">
            <span className="material-icons move-task-date-icon">calendar_today</span>
            <span className="move-task-date-text">
              {formatDateDisplay(getTaskDate())}
            </span>
            <span className="move-task-date-lock">
              <span className="material-icons" style={{ fontSize: '16px' }}>lock</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="move-task-modal-footer">
          <button 
            className="move-task-btn move-task-btn-cancel"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button 
            className="move-task-btn move-task-btn-save"
            onClick={handleSubmit}
          >
            <span className="material-icons">schedule</span>
            Move to Timeline
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveTaskModal;
// src/components/TaskForm/TaskForm.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import './TaskForm.css';

const TaskForm = ({ 
  mode,        // 'quick' | 'manual' | 'edit'
  initialData, // For edit mode
  selectedDate, // For quick mode (the date from calendar)
  onSave,
  onCancel,
  onClose      // For closing modal
}) => {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal',
    completed: false,
    timeSchedule: {
      start: '',
      end: ''
    },
    date: '' // Only used in manual mode
  });

  const [showEndTime, setShowEndTime] = useState(false);
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);

  // Initialize form based on mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'normal',
        completed: initialData.completed || false,
        timeSchedule: {
          start: initialData.timeSchedule?.start || '',
          end: initialData.timeSchedule?.end || ''
        },
        date: ''
      });
      if (initialData.timeSchedule?.end) {
        setShowEndTime(true);
      }
    } else if (mode === 'quick' && selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: format(selectedDate, 'yyyy-MM-dd')
      }));
    } else if (mode === 'manual') {
      setFormData(prev => ({
        ...prev,
        date: format(new Date(), 'yyyy-MM-dd')
      }));
    }
  }, [mode, initialData, selectedDate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTimeChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      timeSchedule: {
        ...prev.timeSchedule,
        [type]: value
      }
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required to save changes';
    }
    setErrors(newErrors);
    
    if (newErrors.title) {
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
    
    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      completed: formData.completed,
      timeSchedule: formData.timeSchedule.start ? {
        start: formData.timeSchedule.start,
        end: formData.timeSchedule.end || ''
      } : null
    };

    if (mode === 'manual') {
      taskData.date = formData.date;
    }

    onSave(taskData);
  };

  const getModalTitle = () => {
    if (mode === 'edit') return 'Edit Task';
    return 'Add Task Details';
  };

  const getSubmitButtonText = () => {
    if (mode === 'manual') return 'Add Task';
    return 'Save Changes';
  };

  const getCancelButtonText = () => {
    if (mode === 'quick') return 'Edit Later';
    return 'Cancel';
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMMM d, yyyy h:mm a');
  };

  const toggleCompleted = () => {
    setFormData(prev => ({
      ...prev,
      completed: !prev.completed
    }));
  };

  return (
    <div className="task-form-modal">
      <div className="task-form-backdrop" onClick={onClose} />
      <div className="task-form-container">
        <div className="task-form-header">
          <h2>{getModalTitle()}</h2>
        </div>

        <div className="task-form-body">
          {/* Task Title */}
          <div className="form-group">
            <label htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              type="text"
              className={`form-input ${errors.title ? 'error' : ''} ${shake ? 'shake' : ''}`}
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter task title..."
            />
            {errors.title && (
              <div className="form-error">{errors.title}</div>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="task-description">Description (optional)</label>
            <textarea
              id="task-description"
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add details about this task..."
              rows={3}
            />
          </div>

          {/* Date Picker - Only for manual mode */}
          {mode === 'manual' && (
            <div className="form-group">
              <label htmlFor="task-date">Choose a date</label>
              <input
                id="task-date"
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>
          )}

          {/* Time Schedule */}
          <div className="form-group">
            <label>Time Schedule</label>
            <div className="time-schedule-group">
              <div className="time-input-row">
                <span className="time-label">Start</span>
                <input
                  type="time"
                  className="form-input time-input"
                  value={formData.timeSchedule.start}
                  onChange={(e) => handleTimeChange('start', e.target.value)}
                />
              </div>
              
              {showEndTime ? (
                <div className="time-input-row">
                  <span className="time-label">End</span>
                  <input
                    type="time"
                    className="form-input time-input"
                    value={formData.timeSchedule.end}
                    onChange={(e) => handleTimeChange('end', e.target.value)}
                  />
                  <button 
                    className="remove-time-btn"
                    onClick={() => {
                      setShowEndTime(false);
                      handleTimeChange('end', '');
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button 
                  className="add-time-btn"
                  onClick={() => setShowEndTime(true)}
                >
                  + Add End Time
                </button>
              )}
            </div>
          </div>

          {/* Priority */}
          <div className="form-group">
            <label>Priority</label>
            <div className="priority-buttons">
              <button
                className={`priority-btn ${formData.priority === 'low' ? 'active low' : ''}`}
                onClick={() => handleChange('priority', 'low')}
              >
                Low
              </button>
              <button
                className={`priority-btn ${formData.priority === 'normal' ? 'active normal' : ''}`}
                onClick={() => handleChange('priority', 'normal')}
              >
                Normal
              </button>
              <button
                className={`priority-btn ${formData.priority === 'high' ? 'active high' : ''}`}
                onClick={() => handleChange('priority', 'high')}
              >
                High
              </button>
            </div>
          </div>

          {/* Task Status - NEW STYLE with circle toggle */}
          <div className="form-group">
            <label>Task Status</label>
            <div className="status-toggle-wrapper">
              <button 
                className={`status-toggle-btn ${formData.completed ? 'completed' : ''}`}
                onClick={toggleCompleted}
              >
                <span className="status-circle">
                  {formData.completed ? (
                    <span className="material-icons check-icon">check_circle</span>
                  ) : (
                    <span className="material-icons-outlined empty-icon">radio_button_unchecked</span>
                  )}
                </span>
                <span className="status-label">
                  {formData.completed ? 'Complete' : 'Incomplete'}
                </span>
              </button>
            </div>
          </div>

          {/* Created Date - Display only */}
          {mode === 'edit' && initialData?.createdAt && (
            <div className="form-group created-date">
              <label>Created</label>
              <span>{formatDateDisplay(initialData.createdAt)}</span>
            </div>
          )}
        </div>

        <div className="task-form-footer">
          <button className="btn-cancel" onClick={onCancel}>
            {getCancelButtonText()}
          </button>
          <button className="btn-save" onClick={handleSubmit}>
            {getSubmitButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
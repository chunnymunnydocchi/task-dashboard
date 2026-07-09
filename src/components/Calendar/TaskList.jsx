// src/components/Calendar/TaskList.jsx
import React, { useState, useMemo } from 'react';
import './TaskList.css';

const TaskList = ({ 
  tasks, 
  onToggleTask, 
  onDeleteTask, 
  onEditTask
  // REMOVED: deletedTaskId prop
}) => {
  const [menuOpen, setMenuOpen] = useState(null);
  
  // Filter & Sort states
  const [sortBy, setSortBy] = useState('recent');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // REMOVED: The filtering out of deleted task
  // Now we just use tasks directly since task disappears immediately
  const visibleTasks = tasks || [];

  // Calculate task stats from visible tasks
  const completedCount = visibleTasks.filter(task => task.completed).length;
  const totalCount = visibleTasks.length;
  const remainingTasks = totalCount - completedCount;

  // Filter and sort visible tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...visibleTasks];

    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter);
    }

    // Apply status filter
    if (statusFilter === 'open') {
      result = result.filter(task => !task.completed);
    } else if (statusFilter === 'done') {
      result = result.filter(task => task.completed);
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'old':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'a-z':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'z-a':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    return result;
  }, [visibleTasks, sortBy, priorityFilter, statusFilter]);

  if (!visibleTasks || visibleTasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p>No tasks for this day</p>
        <p className="empty-subtitle">Add a task using the input above</p>
      </div>
    );
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return 'priority-high';
      case 'low': return 'priority-low';
      default: return 'priority-normal';
    }
  };

  const handleToggle = (taskId) => {
    if (onToggleTask) {
      onToggleTask(taskId);
    }
  };

  const handleDelete = (taskId) => {
    if (onDeleteTask) {
      onDeleteTask(taskId);
    }
    setMenuOpen(null);
  };

  const handleEdit = (taskId) => {
    if (onEditTask) {
      onEditTask(taskId);
    }
    setMenuOpen(null);
  };

  const toggleMenu = (taskId) => {
    setMenuOpen(menuOpen === taskId ? null : taskId);
  };

  const getButtonClass = (current, value) => {
    return current === value ? 'filter-btn active' : 'filter-btn';
  };

  return (
    <div className="task-list">
      {/* Filter & Sort Controls */}
      <div className="task-filters">
        <div className="filter-group">
          <span className="filter-label">SORT</span>
          <div className="filter-buttons">
            <button 
              className={getButtonClass(sortBy, 'recent')}
              onClick={() => setSortBy('recent')}
            >
              Recent
            </button>
            <button 
              className={getButtonClass(sortBy, 'old')}
              onClick={() => setSortBy('old')}
            >
              Old
            </button>
            <button 
              className={getButtonClass(sortBy, 'a-z')}
              onClick={() => setSortBy('a-z')}
            >
              A-Z
            </button>
            <button 
              className={getButtonClass(sortBy, 'z-a')}
              onClick={() => setSortBy('z-a')}
            >
              Z-A
            </button>
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">PRIORITY</span>
          <div className="filter-buttons">
            <button 
              className={getButtonClass(priorityFilter, 'all')}
              onClick={() => setPriorityFilter('all')}
            >
              All
            </button>
            <button 
              className={getButtonClass(priorityFilter, 'high')}
              onClick={() => setPriorityFilter('high')}
            >
              High
            </button>
            <button 
              className={getButtonClass(priorityFilter, 'normal')}
              onClick={() => setPriorityFilter('normal')}
            >
              Normal
            </button>
            <button 
              className={getButtonClass(priorityFilter, 'low')}
              onClick={() => setPriorityFilter('low')}
            >
              Low
            </button>
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">STATUS</span>
          <div className="filter-buttons">
            <button 
              className={getButtonClass(statusFilter, 'all')}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button 
              className={getButtonClass(statusFilter, 'open')}
              onClick={() => setStatusFilter('open')}
            >
              Open
            </button>
            <button 
              className={getButtonClass(statusFilter, 'done')}
              onClick={() => setStatusFilter('done')}
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Task count header */}
      <div className="task-list-header">
        <span className="task-count">
          {totalCount} tasks ({remainingTasks} remaining)
        </span>
        {filteredAndSortedTasks.length !== totalCount && (
          <span className="filtered-count">
            Showing {filteredAndSortedTasks.length}
          </span>
        )}
      </div>

      {/* Task items */}
      <div className="task-items">
        {filteredAndSortedTasks.map((task) => {
          const key = task.id || `task-${Math.random()}`;
          
          return (
            <div 
              key={key}
              className={`task-item ${task.completed ? 'completed' : ''}`}
            >
              {/* Toggle circle */}
              <button 
                className="task-toggle"
                onClick={() => handleToggle(task.id)}
                aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {task.completed ? (
                  <span className="material-icons" style={{ color: '#7cb8a0', fontSize: '24px' }}>
                    check_circle
                  </span>
                ) : (
                  <span className="material-icons-outlined" style={{ color: '#d4cec4', fontSize: '24px' }}>
                    radio_button_unchecked
                  </span>
                )}
              </button>

              {/* Task content */}
              <div className="task-content">
                <div className="task-title-row">
                  <span className={`priority-dot ${getPriorityClass(task.priority || 'normal')}`} />
                  <span className="task-title">{task.title || task}</span>
                </div>
                
                {task.timeSchedule && task.timeSchedule.start && (
                  <div className="task-time">
                    <span className="material-icons" style={{ fontSize: '14px', marginRight: '4px' }}>
                      schedule
                    </span>
                    {formatTime(task.timeSchedule.start)}
                    {task.timeSchedule.end && ` - ${formatTime(task.timeSchedule.end)}`}
                  </div>
                )}
              </div>

              {/* Three-dot menu */}
              <div className="task-actions">
                <button 
                  className="task-menu-btn"
                  onClick={() => toggleMenu(task.id)}
                  aria-label="Task options"
                >
                  <span className="material-icons">more_vert</span>
                </button>
                
                {/* Dropdown menu */}
                {menuOpen === task.id && (
                  <div className="task-dropdown">
                    <button 
                      className="dropdown-item edit"
                      onClick={() => handleEdit(task.id)}
                    >
                      <span className="material-icons" style={{ fontSize: '18px' }}>edit</span>
                      Edit
                    </button>
                    <button 
                      className="dropdown-item delete"
                      onClick={() => handleDelete(task.id)}
                    >
                      <span className="material-icons" style={{ fontSize: '18px' }}>delete</span>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskList;
// src/components/Tasks/TaskBoard/TaskCard.jsx
import React from 'react';
import './TaskCard.css';

const TaskCard = ({
  task,
  onView,
  onEdit,
  onMove,
  onDelete
}) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="task-card">
      <div className="card-pin">
        <span className="pin-icon">📌</span>
      </div>

      <div className="card-content" onClick={() => onView(task)}>
        <h4 className="card-title">{task.title}</h4>
        {task.description && (
          <p className="card-description">{task.description}</p>
        )}
        <div className="card-meta">
          <span className="card-priority" style={{ color: getPriorityColor(task.priority) }}>
            {getPriorityLabel(task.priority)} {task.priority || 'Normal'}
          </span>
          <span className={`card-status ${task.completed ? 'done' : ''}`}>
            {task.completed ? '✅ Done' : '⏳ Pending'}
          </span>
        </div>
      </div>

      <div className="card-actions">
        <button 
          className="card-action-btn move"
          onClick={(e) => {
            e.stopPropagation();
            onMove(task);
          }}
        >
          <span className="material-icons">schedule</span>
          Set Time
        </button>
        <button 
          className="card-action-btn edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
        >
          <span className="material-icons">edit</span>
        </button>
        <button 
          className="card-action-btn delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        >
          <span className="material-icons">delete</span>
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
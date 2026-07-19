// src/components/Tasks/Timeline/TimelinePhase.jsx
import React, { useRef, useEffect, useState } from 'react';
import './TimelinePhase.css';

const TimelinePhase = ({
  phase,
  tasks,
  highlightedTaskId = null,
  onToggleCollapse,
  isCollapsed = false,
  onViewTask,
  onEditTask,
  onDeleteTask,
  registerTaskRef,
}) => {
  const phaseRef = useRef(null);
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const taskRefs = useRef({});

  useEffect(() => {
    if (highlightedTaskId && tasks.some(t => t.id === highlightedTaskId)) {
      setTimeout(() => {
        if (phaseRef.current) {
          phaseRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [highlightedTaskId, tasks]);

  // Register refs when they're created
  useEffect(() => {
    if (registerTaskRef) {
      Object.keys(taskRefs.current).forEach(taskId => {
        const ref = taskRefs.current[taskId];
        if (ref && ref.current) {
          registerTaskRef(taskId, ref);
        }
      });
    }
  }, [tasks, registerTaskRef]); // Re-run when tasks change

  const getPhaseColorClass = () => {
    switch (phase.id) {
      case 'midnight': return 'phase-midnight';
      case 'morning': return 'phase-morning';
      case 'afternoon': return 'phase-afternoon';
      case 'evening': return 'phase-evening';
      default: return '';
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

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-normal';
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

  const expandLabel = (label) => {
    return label.split('').join(' ');
  };

  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    if (onToggleCollapse) {
      onToggleCollapse(phase.id, newState);
    }
  };

  const handleTaskClick = (task, e) => {
    if (onViewTask) {
      const ref = taskRefs.current[task.id] || null;
      onViewTask(task, ref);
    }
  };

  return (
    <div 
      ref={phaseRef}
      className={`timeline-phase ${getPhaseColorClass()} ${tasks.length === 0 ? 'empty' : ''} ${collapsed ? 'collapsed' : ''}`}
    >
      <div 
        className="phase-header"
        onClick={toggleCollapse}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && toggleCollapse()}
        aria-expanded={!collapsed}
      >
        <div className="phase-info">
          <span className="phase-toggle">
            <span className="material-icons">
              {collapsed ? 'chevron_right' : 'expand_more'}
            </span>
          </span>
          <span className="phase-label">{expandLabel(phase.label)}</span>
          <span className="phase-range">{phase.range}</span>
          <span className="phase-count">({tasks.length})</span>
        </div>
      </div>

      <div className={`phase-tasks-wrapper ${collapsed ? 'collapsed' : ''}`}>
        <div className="phase-tasks">
          {tasks.length === 0 ? (
            <div className="phase-empty">
              <span className="material-icons">inbox</span>
              <span>No tasks</span>
            </div>
          ) : (
            tasks.map(task => {
              const isHighlighted = highlightedTaskId === task.id;
              
              // Create ref if it doesn't exist
              if (!taskRefs.current[task.id]) {
                taskRefs.current[task.id] = React.createRef();
              }
              
              return (
                <div 
                  key={task.id}
                  ref={taskRefs.current[task.id]}
                  className={`timeline-task-item ${isHighlighted ? 'highlighted' : ''}`}
                  onClick={(e) => handleTaskClick(task, e)}
                >
                  <div className="timeline-task-time">
                    <span className="material-icons">schedule</span>
                    <span>{formatTime(task.timeSchedule.start)}</span>
                    {task.timeSchedule.end && (
                      <>
                        <span className="time-separator">-</span>
                        <span>{formatTime(task.timeSchedule.end)}</span>
                      </>
                    )}
                  </div>

                  <div className="timeline-task-content">
                    <div className="timeline-task-main">
                      <span className="timeline-task-title">{task.title}</span>
                      <span className={`timeline-task-priority ${getPriorityClass(task.priority)}`}>
                        <span className="material-icons">{getPriorityIcon(task.priority)}</span>
                        {task.priority || 'Normal'}
                      </span>
                      <span className={`timeline-task-status ${task.completed ? 'completed' : ''}`}>
                        <span className="material-icons">
                          {task.completed ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        {task.completed ? 'Done' : 'Incomplete'}
                      </span>
                    </div>

                    {task.description && (
                      <div className="timeline-task-description">
                        <span className="material-icons">description</span>
                        <span>{task.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelinePhase;
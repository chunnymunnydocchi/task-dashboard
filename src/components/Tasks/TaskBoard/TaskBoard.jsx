// src/components/Tasks/TaskBoard/TaskBoard.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DropOverlay from '../DropOverlay/DropOverlay';
import './TaskBoard.css';

const DraggableTaskCard = ({
  task,
  isUnpinned,
  onPinClick,
  isMobile,
  isDragDisabled,
  onView,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isDragDisabled,
    data: {
      type: 'task-board-card',
      task: task,
      isUnpinned: isUnpinned,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'low': return 'priority-low';
      default: return 'priority-normal';
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.task-card-pin') ||
        e.target.closest('.task-board-action-btn')) {
      return;
    }
    if (onView) {
      onView(task);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(task.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-board-card ${isUnpinned ? 'unpinned' : ''} ${isDragging ? 'dragging' : ''} ${isMobile ? 'mobile-card' : ''}`}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
    >
      <div
        className={`task-card-pin ${isUnpinned ? 'unpinned-state' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onPinClick(task.id);
        }}
        role="button"
        tabIndex={0}
        aria-label={isUnpinned ? 'Pin task' : 'Unpin task'}
      >
        <span className="material-icons pin-icon">
          {isUnpinned ? 'close' : 'push_pin'}
        </span>
        {isUnpinned && <span className="pin-ripple" />}
      </div>
      <div className="task-card-content">
        <h4 className="task-card-title">{task.title}</h4>
        {task.description && (
          <p className="task-card-description">{task.description}</p>
        )}
        <div className="task-card-footer">
          <div className="task-card-left">
            <span className={`priority-dot ${getPriorityClass(task.priority || 'normal')}`} />
            <span className="task-card-priority-text">
              {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Normal'}
            </span>
          </div>
          <span className={`task-status ${task.completed ? 'completed' : ''}`}>
            <span className="material-icons status-icon">
              {task.completed ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            {task.completed ? 'Done' : 'Incomplete'}
          </span>
        </div>
      </div>

      {isUnpinned && !isMobile && (
        <div className="task-unpinned-badge">
          <span className="material-icons">drag_handle</span>
          <span>Drag to reorder or to Timeline</span>
        </div>
      )}

      <div className="task-board-actions">
        {onEdit && (
          <button className="task-board-action-btn edit-btn" onClick={handleEditClick}>
            <span className="material-icons">edit</span>
            <span className="action-btn-text">Edit</span>
          </button>
        )}
        {onDelete && (
          <button className="task-board-action-btn delete-btn" onClick={handleDeleteClick}>
            <span className="material-icons">delete</span>
            <span className="action-btn-text">Delete</span>
          </button>
        )}
      </div>
    </div>
  );
};

const TaskBoard = ({
  tasks = [],
  onViewTask,
  onEditTask,
  onDeleteTask,
  onReorder,
  showDropZone = false,
  isMobile = false,
}) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [showInfoTip, setShowInfoTip] = useState(false);
  const [unpinnedTasks, setUnpinnedTasks] = useState({});

  const incompleteTasks = tasks.filter(task => !task.completed);
  const taskCount = incompleteTasks.length;

  const toggleOverlay = () => {
    setIsOverlayOpen(!isOverlayOpen);
  };

  const closeOverlay = () => {
    setIsOverlayOpen(false);
  };

  const toggleInfoTip = () => {
    setShowInfoTip(!showInfoTip);
  };

  const handlePinClick = (taskId) => {
    setUnpinnedTasks(prev => {
      const newState = {
        ...prev,
        [taskId]: !prev[taskId]
      };
      return newState;
    });
  };

  const handleViewTask = (task) => {
    if (onViewTask) {
      onViewTask(task);
    }
  };

  const renderTaskList = (tasksList, isMobileView = false) => {
    if (tasksList.length === 0) {
      return (
        <div className="task-board-empty">
          <span className="material-icons">inbox</span>
          <span>No untimed tasks</span>
        </div>
      );
    }

    return (
      <SortableContext
        items={tasksList.map(t => t.id)}
        strategy={isMobileView ? verticalListSortingStrategy : horizontalListSortingStrategy}
      >
        <div className={`task-board-cards ${isMobileView ? 'vertical' : 'horizontal'}`}>
          {tasksList.map(task => {
            const isUnpinned = !!unpinnedTasks[task.id];
            const isDragDisabled = !isUnpinned;

            return (
              <DraggableTaskCard
                key={task.id}
                task={task}
                isUnpinned={isUnpinned}
                onPinClick={handlePinClick}
                isMobile={isMobileView}
                isDragDisabled={isDragDisabled}
                onView={() => handleViewTask(task)}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            );
          })}
        </div>
      </SortableContext>
    );
  };

  // Desktop view
  if (!isMobile) {
    return (
      <div className="task-board-desktop">
        <div className="task-board-header">
          <div className="task-board-header-left">
            <span className="task-board-icon material-icons">push_pin</span>
            <h3 className="task-board-title">
              Task Board ({tasks.length} {tasks.length === 1 ? 'task' : 'tasks'})
            </h3>
            <button
              className="task-board-info-btn"
              onClick={toggleInfoTip}
              aria-label="How to use Task Board"
            >
              <span className="material-icons">help_outline</span>
            </button>
          </div>
          {showInfoTip && (
            <div className="task-board-info-tip">
              <span className="material-icons">info</span>
              <span>Unpin a task, then drag it outside the Task Board to add it to the Timeline.</span>
            </div>
          )}
        </div>
        <div className="task-board-scroll">
          {renderTaskList(tasks, false)}
        </div>
      </div>
    );
  }

  // Mobile view
  return (
    <>
      <button
        className="floating-task-board-btn"
        onClick={toggleOverlay}
        aria-label="Open task board"
      >
        <span className="material-icons">push_pin</span>
        {taskCount > 0 && (
          <span className="floating-btn-badge">{taskCount}</span>
        )}
      </button>

      {isOverlayOpen && (
        <div className="task-board-backdrop" onClick={closeOverlay} />
      )}

      <div className={`task-board-overlay ${isOverlayOpen ? 'open' : ''}`}>
        {showDropZone && (
          <DropOverlay 
            isVisible={true}
            isOver={false}
            isMobile={true}
            position="taskboard"
          />
        )}

        <div className="task-board-overlay-header">
          <div className="overlay-drag-handle" />
          <div className="overlay-header-content">
            <div className="overlay-header-left">
              <span className="overlay-icon material-icons">push_pin</span>
              <span className="overlay-title">
                Task Board ({tasks.length} {tasks.length === 1 ? 'task' : 'tasks'})
              </span>
              <button
                className="task-board-info-btn mobile-info-btn"
                onClick={toggleInfoTip}
                aria-label="How to use Task Board"
              >
                <span className="material-icons">help_outline</span>
              </button>
            </div>
            <button
              className="overlay-close-btn"
              onClick={closeOverlay}
              aria-label="Close task board"
            >
              <span className="material-icons">close</span>
            </button>
          </div>
          {showInfoTip && (
            <div className="task-board-info-tip mobile-tip">
              <span className="material-icons">info</span>
              <span>Unpin a task, then drag it above to add it to the Timeline.</span>
            </div>
          )}
        </div>

        <div className="task-board-overlay-body">
          {renderTaskList(tasks, true)}
        </div>
      </div>
    </>
  );
};

export default TaskBoard;
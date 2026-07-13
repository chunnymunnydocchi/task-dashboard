// src/components/Tasks/TaskBoard/TaskBoard.jsx
import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './TaskBoard.css';

// Draggable Task Card Component
const DraggableTaskCard = ({ 
  task, 
  isUnpinned, 
  onPinClick, 
  isMobile,
  isDragDisabled 
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
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return 'priority-high';
      case 'low': return 'priority-low';
      default: return 'priority-normal';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-board-card ${isUnpinned ? 'unpinned' : ''} ${isDragging ? 'dragging' : ''} ${isMobile ? 'mobile-card' : ''}`}
      {...attributes}
      {...listeners}
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
        {isUnpinned && (
          <span className="pin-ripple" />
        )}
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
      {isUnpinned && (
        <div className="task-unpinned-badge">
          <span className="material-icons">swap_horiz</span>
          <span>Drag to reorder</span>
        </div>
      )}
    </div>
  );
};

// Main TaskBoard Component
const TaskBoard = ({ 
  tasks = [], 
  onViewTask, 
  onEditTask, 
  onMoveTask, 
  onDeleteTask,
  onTasksReorder 
}) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showInfoTip, setShowInfoTip] = useState(false);
  const [unpinnedTasks, setUnpinnedTasks] = useState({});
  const [localTasks, setLocalTasks] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // Load tasks from props and localStorage order
  useEffect(() => {
    const savedOrder = localStorage.getItem('taskBoardOrder');
    let orderedTasks = [...tasks];
    
    if (savedOrder && tasks.length > 0) {
      try {
        const order = JSON.parse(savedOrder);
        const currentIds = tasks.map(t => t.id);
        const isValid = order.every(id => currentIds.includes(id)) && 
                       order.length === currentIds.length;
        
        if (isValid) {
          orderedTasks = order.map(id => tasks.find(t => t.id === id)).filter(Boolean);
        }
      } catch (e) {
        console.warn('Failed to parse task order:', e);
      }
    }
    
    setLocalTasks(orderedTasks);
  }, [tasks]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const incompleteTasks = localTasks.filter(task => !task.completed);
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

  const saveOrderToStorage = (orderedTasks) => {
    const order = orderedTasks.map(t => t.id);
    localStorage.setItem('taskBoardOrder', JSON.stringify(order));
  };

  const handleDragStart = (event) => {
    const { active } = event;
    if (!unpinnedTasks[active.id]) {
      return;
    }
    setActiveId(active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!unpinnedTasks[active.id]) {
      return;
    }

    if (over && active.id !== over.id) {
      const oldIndex = localTasks.findIndex(task => task.id === active.id);
      const newIndex = localTasks.findIndex(task => task.id === over.id);
      
      const newTasks = arrayMove(localTasks, oldIndex, newIndex);
      setLocalTasks(newTasks);
      saveOrderToStorage(newTasks);
      
      if (onTasksReorder) {
        onTasksReorder(newTasks);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
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
                />
              );
            })}
          </div>
        </SortableContext>
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.4',
                },
              },
            }),
          }}
        >
          {activeId ? (
            <div className="task-board-card dragging-overlay">
              <div className="task-card-content">
                <h4 className="task-card-title">
                  {localTasks.find(t => t.id === activeId)?.title}
                </h4>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
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
              Task Board ({localTasks.length} {localTasks.length === 1 ? 'task' : 'tasks'})
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
              <span>Click the pin to unpin a task, then drag to reorder. Click the close icon to pin it back.</span>
            </div>
          )}
        </div>
        <div className="task-board-scroll">
          {renderTaskList(localTasks, false)}
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
        <div 
          className="task-board-backdrop"
          onClick={closeOverlay}
        />
      )}

      <div className={`task-board-overlay ${isOverlayOpen ? 'open' : ''}`}>
        <div className="task-board-overlay-header">
          <div className="overlay-drag-handle" />
          <div className="overlay-header-content">
            <div className="overlay-header-left">
              <span className="overlay-icon material-icons">push_pin</span>
              <span className="overlay-title">
                Task Board ({localTasks.length} {localTasks.length === 1 ? 'task' : 'tasks'})
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
              <span>Tap pin to unpin, then drag to reorder. Tap close to pin back.</span>
            </div>
          )}
        </div>

        <div className="task-board-overlay-body">
          {renderTaskList(localTasks, true)}
        </div>
      </div>
    </>
  );
};

export default TaskBoard;
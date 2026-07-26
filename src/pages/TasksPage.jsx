// src/pages/TasksPage.jsx - Full file with fixed move to timeline

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
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
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useTasksContext } from '../contexts/TasksContext';
import { useToast } from '../contexts/ToastContext';
import DateNavigator from '../components/Tasks/DateNavigator';
import Timeline from '../components/Tasks/Timeline/Timeline';
import TaskBoard from '../components/Tasks/TaskBoard/TaskBoard';
import TaskDetailModal from '../components/TaskDetailModal/TaskDetailModal';
import TaskForm from '../components/TaskForm/TaskForm';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';
import MoveTaskModal from '../components/Tasks/MoveTaskModal/MoveTaskModal';
import DropOverlay from '../components/Tasks/DropOverlay/DropOverlay';
import './TasksPage.css';

const TasksPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    tasks,
    getTasksForDate,
    addTask,
    updateTask,
    removeTaskById,
    restoreDeletedTask,
  } = useTasksContext();

  const [selectedDate, setSelectedDate] = useState(() => {
    const params = new URLSearchParams(location.search);
    const dateParam = params.get('date');
    if (dateParam) {
      const date = new Date(dateParam);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return new Date();
  });

  const [highlightedTaskId, setHighlightedTaskId] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showDropZone, setShowDropZone] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [orderedUntimedTasks, setOrderedUntimedTasks] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormMode, setAddFormMode] = useState('quick');
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [taskToMove, setTaskToMove] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const taskRefs = useRef({});
  const viewMoreTaskIdRef = useRef(null);
  const isViewMoreOpenRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const prevUntimedTasksRef = useRef([]);

  const tasksForDate = getTasksForDate(selectedDate);
  const timedTasks = tasksForDate.filter(t => t.timeSchedule?.start);
  const untimedTasks = tasksForDate.filter(t => !t.timeSchedule?.start);

  // Load saved order from localStorage - ONLY on initial load or when untimedTasks changes
  useEffect(() => {
    if (untimedTasks.length === 0) {
      if (orderedUntimedTasks.length > 0) {
        setOrderedUntimedTasks([]);
      }
      prevUntimedTasksRef.current = [];
      return;
    }

    const currentIds = untimedTasks.map(t => t.id).sort().join(',');
    const prevIds = prevUntimedTasksRef.current.map(t => t.id).sort().join(',');

    if (currentIds === prevIds && !isInitialLoadRef.current) {
      return;
    }

    prevUntimedTasksRef.current = [...untimedTasks];
    isInitialLoadRef.current = false;

    const savedOrder = localStorage.getItem('taskBoardOrder');
    let orderedTasks = [...untimedTasks];

    if (savedOrder && untimedTasks.length > 0) {
      try {
        const order = JSON.parse(savedOrder);
        const currentIds = untimedTasks.map(t => t.id);
        const isValid = order.every(id => currentIds.includes(id)) &&
                       order.length === currentIds.length;

        if (isValid) {
          orderedTasks = order.map(id => untimedTasks.find(t => t.id === id)).filter(Boolean);
        }
      } catch (e) {
        console.warn('Failed to parse task order:', e);
      }
    }

    const currentOrderedIds = orderedUntimedTasks.map(t => t.id).sort().join(',');
    const newOrderedIds = orderedTasks.map(t => t.id).sort().join(',');

    if (currentOrderedIds !== newOrderedIds) {
      setOrderedUntimedTasks(orderedTasks);
    }
  }, [untimedTasks, orderedUntimedTasks]);

  // Detect mobile
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

  useEffect(() => {
    const state = location.state;
    if (state?.mode === 'manual') {
      setEditingTask(null);
      setAddFormMode('manual');
      setShowAddForm(true);
      setHasUnsavedChanges(false);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const taskId = params.get('taskId');

    if (!taskId) {
      if (isViewMoreOpenRef.current) {
        setShowDetailModal(false);
        setSelectedTask(null);
        setHighlightedTaskId(null);
        isViewMoreOpenRef.current = false;
      }
      viewMoreTaskIdRef.current = null;
      return;
    }

    if (viewMoreTaskIdRef.current === taskId && isViewMoreOpenRef.current) {
      return;
    }

    const currentTasks = getTasksForDate(selectedDate);
    const task = currentTasks.find(t => t.id === taskId);

    if (task) {
      viewMoreTaskIdRef.current = taskId;
      isViewMoreOpenRef.current = true;
      setHighlightedTaskId(taskId);

      const ref = taskRefs.current[taskId] || null;
      setSelectedTask({ ...task, anchorRef: ref });
      setShowDetailModal(true);

      if (!ref) {
        setTimeout(() => {
          const foundRef = taskRefs.current[taskId];
          if (foundRef && foundRef.current) {
            setSelectedTask(prev => ({
              ...prev,
              anchorRef: foundRef
            }));
          }
        }, 100);
      }
    } else {
      console.warn('Task not found for View More:', taskId);
      const newParams = new URLSearchParams(location.search);
      newParams.delete('taskId');
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
    }
  }, [location.search, selectedDate, getTasksForDate, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setShowScrollTop(scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.add('tasks-page-active');
    }
    return () => {
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.classList.remove('tasks-page-active');
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const registerTaskRef = useCallback((taskId, ref) => {
    if (taskId && ref) {
      taskRefs.current[taskId] = ref;
    }
  }, []);

  const handleViewTask = useCallback((task, elementRef) => {
    viewMoreTaskIdRef.current = null;
    isViewMoreOpenRef.current = false;

    const params = new URLSearchParams(location.search);
    if (params.has('taskId')) {
      params.delete('taskId');
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }

    if (task.id && elementRef) {
      taskRefs.current[task.id] = elementRef;
    }

    setSelectedTask({ ...task, anchorRef: elementRef });
    setShowDetailModal(true);
  }, [location, navigate]);

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setShowEditForm(true);
    setShowDetailModal(false);
    setHasUnsavedChanges(false);

    viewMoreTaskIdRef.current = null;
    isViewMoreOpenRef.current = false;
    const params = new URLSearchParams(location.search);
    if (params.has('taskId')) {
      params.delete('taskId');
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  }, [location, navigate]);

  const handleMoveTask = useCallback((task) => {
    setTaskToMove(task);
    setShowMoveModal(true);
  }, []);

  // ============ FIXED: handleSaveMove ============
  const handleSaveMove = useCallback((timeData) => {
    if (!taskToMove) {
      showToast('No task selected to move.', 'error', { duration: 3000 });
      return;
    }

    // Get the date from the task or use the selected date
    const taskDate = taskToMove.date || format(selectedDate, 'yyyy-MM-dd');
    const dateObj = new Date(taskDate);
    
    // Make a copy of the task and add timeSchedule
    const updatedTask = {
      ...taskToMove,
      timeSchedule: {
        start: timeData.start,
        end: timeData.end || ''
      }
    };

    // Log for debugging
    console.log('Moving task:', {
      taskId: taskToMove.id,
      taskTitle: taskToMove.title,
      dateKey: taskDate,
      updatedTask: updatedTask
    });

    // Update the task in the context
    const success = updateTask(dateObj, taskToMove.id, updatedTask);

    if (success) {
      showToast(`Task moved to timeline: "${taskToMove.title}"`, 'success', { duration: 3000 });
      setShowMoveModal(false);
      setTaskToMove(null);
      setShowDropZone(false);
      setActiveId(null);
      
      // Clear localStorage order since task was removed
      localStorage.removeItem('taskBoardOrder');
    } else {
      console.error('Failed to move task:', {
        taskId: taskToMove.id,
        dateKey: taskDate,
        task: taskToMove
      });
      showToast('Failed to move task. Please try again.', 'error', { duration: 5000 });
    }
  }, [taskToMove, updateTask, showToast, selectedDate]);

  const handleCloseMove = useCallback(() => {
    setShowMoveModal(false);
    setTaskToMove(null);
    setShowDropZone(false);
    setActiveId(null);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setShowDetailModal(false);
    setSelectedTask(null);
    setHighlightedTaskId(null);

    viewMoreTaskIdRef.current = null;
    isViewMoreOpenRef.current = false;
    const params = new URLSearchParams(location.search);
    if (params.has('taskId')) {
      params.delete('taskId');
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  }, [location, navigate]);

  const handleDeleteTask = useCallback((taskId) => {
    const task = tasksForDate.find(t => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setShowConfirmDialog(true);
    }
  }, [tasksForDate]);

  const handleConfirmDelete = useCallback(() => {
    if (taskToDelete) {
      const taskId = taskToDelete.id;
      const dateKey = taskToDelete.date || new Date(taskToDelete.createdAt).toISOString().split('T')[0];

      const taskData = { ...taskToDelete };

      removeTaskById(selectedDate, taskId);

      setShowConfirmDialog(false);
      setTaskToDelete(null);
      setSelectedTask(null);
      setShowDetailModal(false);

      viewMoreTaskIdRef.current = null;
      isViewMoreOpenRef.current = false;
      const params = new URLSearchParams(location.search);
      if (params.has('taskId')) {
        params.delete('taskId');
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
      }

      showToast(
        `Task Removed: "${taskData.title}"`,
        'undo',
        {
          duration: 10000,
          onUndo: () => {
            restoreDeletedTask(dateKey, taskData);
          }
        }
      );
    }
  }, [taskToDelete, selectedDate, removeTaskById, showToast, restoreDeletedTask, location, navigate]);

  const handleCancelDelete = useCallback(() => {
    setShowConfirmDialog(false);
    setTaskToDelete(null);
  }, []);

  const handleAddTask = useCallback(() => {
    setEditingTask(null);
    setAddFormMode('quick');
    setShowAddForm(true);
    setHasUnsavedChanges(false);
  }, []);

  const handleSaveAddTask = useCallback((taskData) => {
    const dateToUse = addFormMode === 'manual' && taskData.date
      ? new Date(taskData.date)
      : selectedDate;

    const { date, ...taskDataWithoutDate } = taskData;

    const success = addTask(dateToUse, taskDataWithoutDate);
    if (success) {
      showToast(`Task Added: "${taskData.title}"`, 'success', { duration: 3000 });
      setShowAddForm(false);
      setEditingTask(null);
      setHasUnsavedChanges(false);
      setAddFormMode('quick');
    }
  }, [selectedDate, addTask, showToast, addFormMode]);

  const handleSaveEditTask = useCallback((taskData) => {
    if (editingTask) {
      const dateKey = editingTask.date || new Date(editingTask.createdAt).toISOString().split('T')[0];
      const success = updateTask(new Date(dateKey), editingTask.id, taskData);

      if (success) {
        showToast(`Task Updated: "${taskData.title}"`, 'success', { duration: 3000 });
        setShowEditForm(false);
        setEditingTask(null);
        setHasUnsavedChanges(false);

        const refreshedTask = getTasksForDate(selectedDate).find(t => t.id === editingTask.id);
        if (refreshedTask) {
          setSelectedTask(refreshedTask);
        }
      } else {
        showToast('Failed to update task. Please try again.', 'error', { duration: 5000 });
      }
    }
  }, [editingTask, selectedDate, updateTask, getTasksForDate, showToast]);

  const handleDiscard = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowDiscardConfirm(true);
    } else {
      setShowAddForm(false);
      setShowEditForm(false);
      setEditingTask(null);
      setHasUnsavedChanges(false);
      setAddFormMode('quick');
    }
  }, [hasUnsavedChanges]);

  const confirmDiscard = useCallback(() => {
    setShowDiscardConfirm(false);
    setHasUnsavedChanges(false);
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingTask(null);
    setAddFormMode('quick');
  }, []);

  const cancelDiscard = useCallback(() => {
    setShowDiscardConfirm(false);
  }, []);

  const handleFormChange = useCallback((hasChanges) => {
    setHasUnsavedChanges(hasChanges);
  }, []);

  const closeForm = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowDiscardConfirm(true);
    } else {
      setShowAddForm(false);
      setShowEditForm(false);
      setEditingTask(null);
      setHasUnsavedChanges(false);
      setAddFormMode('quick');
    }
  }, [hasUnsavedChanges]);

  // ============ DRAG HANDLERS ============
  
  const handleDragStart = (event) => {
    const { active } = event;
    const task = orderedUntimedTasks.find(t => t.id === active.id);
    
    if (task) {
      setActiveId(active.id);
      setShowDropZone(true);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    const draggedTask = orderedUntimedTasks.find(t => t.id === active.id);
    
    if (!draggedTask) {
      setActiveId(null);
      setShowDropZone(false);
      return;
    }

    // Case 1: Dropped on the timeline drop zone -> Move to timeline
    if (over?.data?.current?.type === 'timeline') {
      setTaskToMove(draggedTask);
      setShowMoveModal(true);
      setActiveId(null);
      setShowDropZone(false);
      return;
    }

    // Case 2: Dropped on another task card -> Reorder
    if (over && over.id !== active.id) {
      const overData = over.data?.current;
      if (overData?.type === 'task-board-card') {
        const oldIndex = orderedUntimedTasks.findIndex(t => t.id === active.id);
        const newIndex = orderedUntimedTasks.findIndex(t => t.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedTasks = arrayMove(orderedUntimedTasks, oldIndex, newIndex);
          setOrderedUntimedTasks(reorderedTasks);
          
          const order = reorderedTasks.map(t => t.id);
          localStorage.setItem('taskBoardOrder', JSON.stringify(order));
        }
      }
    }

    setActiveId(null);
    setShowDropZone(false);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setShowDropZone(false);
  };

  const activeTask = orderedUntimedTasks.find(t => t.id === activeId);

  return (
    <div className="task-dashboard">
      <DateNavigator
        date={selectedDate}
        onDateChange={setSelectedDate}
        tasksData={tasks}
        showAddButton={true}
        onAddTask={handleAddTask}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="task-dashboard-content">
          <div className="timeline-wrapper">
            <DropOverlay 
              isVisible={showDropZone}
              isOver={false}
              isMobile={false}
              position="timeline"
            />
            <Timeline
              tasks={timedTasks}
              highlightedTaskId={highlightedTaskId}
              onViewTask={handleViewTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              registerTaskRef={registerTaskRef}
            />
          </div>

          <TaskBoard
            tasks={orderedUntimedTasks}
            onViewTask={handleViewTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            showDropZone={showDropZone}
            isMobile={isMobile}
          />
        </div>

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
          {activeTask ? (
            <div className="task-board-card dragging-overlay">
              <div className="task-card-content">
                <h4 className="task-card-title">{activeTask.title}</h4>
                <div className="task-drag-overlay-hint">
                  <span className="material-icons">drag_handle</span>
                  <span>Drop on the timeline to add time</span>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showScrollTop && (
        <button className="scroll-to-top-btn" onClick={scrollToTop}>
          <span className="material-icons">arrow_upward</span>
        </button>
      )}

      {(showAddForm || showEditForm) && (
        <div className="task-form-overlay">
          <div className="task-form-backdrop" onClick={closeForm} />
          <div className="task-form-wrapper">
            {showAddForm && (
              <TaskForm
                mode={addFormMode}
                selectedDate={selectedDate}
                onSave={handleSaveAddTask}
                onCancel={handleDiscard}
                onClose={closeForm}
                onFormChange={handleFormChange}
              />
            )}
            {showEditForm && editingTask && (
              <TaskForm
                mode="edit"
                initialData={editingTask}
                onSave={handleSaveEditTask}
                onCancel={handleDiscard}
                onClose={closeForm}
                onFormChange={handleFormChange}
              />
            )}
          </div>
        </div>
      )}

      <TaskDetailModal
        task={selectedTask}
        isOpen={showDetailModal}
        onClose={handleCloseDetail}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />

      <MoveTaskModal
        isOpen={showMoveModal}
        task={taskToMove}
        onSave={handleSaveMove}
        onClose={handleCloseMove}
      />

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action can be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        onClose={handleCancelDelete}
      />

      <ConfirmDialog
        isOpen={showDiscardConfirm}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to discard them? This action cannot be undone."
        confirmText="Discard"
        cancelText="Keep Editing"
        type="danger"
        onConfirm={confirmDiscard}
        onCancel={cancelDiscard}
        onClose={cancelDiscard}
      />
    </div>
  );
};

export default TasksPage;
// src/pages/TasksPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTasksContext } from '../contexts/TasksContext';
import { useToast } from '../contexts/ToastContext';
import DateNavigator from '../components/Tasks/DateNavigator';
import Timeline from '../components/Tasks/Timeline/Timeline';
import TaskBoard from '../components/Tasks/TaskBoard/TaskBoard';
import TaskDetailModal from '../components/TaskDetailModal/TaskDetailModal';
import TaskForm from '../components/TaskForm/TaskForm';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';
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

  // Date state
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
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  
  // Detail Modal states
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Delete states
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Store refs for tasks
  const taskRefs = useRef({});
  const viewMoreTaskIdRef = useRef(null);
  const isViewMoreOpenRef = useRef(false);

  // Get tasks for current date
  const tasksForDate = getTasksForDate(selectedDate);
  const timedTasks = tasksForDate.filter(t => t.timeSchedule?.start);
  const untimedTasks = tasksForDate.filter(t => !t.timeSchedule?.start);

  // ============ VIEW MORE FROM CALENDAR ============
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const taskId = params.get('taskId');

    if (!taskId) {
      // If modal is open from View More and taskId is removed, close it
      if (isViewMoreOpenRef.current) {
        setShowDetailModal(false);
        setSelectedTask(null);
        setHighlightedTaskId(null);
        isViewMoreOpenRef.current = false;
      }
      viewMoreTaskIdRef.current = null;
      return;
    }

    // Skip if already processing this task
    if (viewMoreTaskIdRef.current === taskId && isViewMoreOpenRef.current) {
      return;
    }

    const currentTasks = getTasksForDate(selectedDate);
    const task = currentTasks.find(t => t.id === taskId);

    if (task) {
      viewMoreTaskIdRef.current = taskId;
      isViewMoreOpenRef.current = true;
      setHighlightedTaskId(taskId);
      
      // Try to get the ref
      const ref = taskRefs.current[taskId] || null;
      
      // Open modal
      setSelectedTask({ ...task, anchorRef: ref });
      setShowDetailModal(true);
      
      // If ref wasn't available, try to find it after render
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
      // Task not found - clear URL
      console.warn('Task not found for View More:', taskId);
      const newParams = new URLSearchParams(location.search);
      newParams.delete('taskId');
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
    }
  }, [location.search, selectedDate, getTasksForDate, navigate]);

  // ============ SCROLL TO TOP ============
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setShowScrollTop(scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ============ REMOVE PADDING ============
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

  // ============ BEFOREUNLOAD PROTECTION ============
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

  // ============ HANDLERS ============

  // Register task refs from Timeline
  const registerTaskRef = useCallback((taskId, ref) => {
    if (taskId && ref) {
      taskRefs.current[taskId] = ref;
    }
  }, []);

  // View Task - Opens Detail Modal
  const handleViewTask = useCallback((task, elementRef) => {
    // Clear View More state
    viewMoreTaskIdRef.current = null;
    isViewMoreOpenRef.current = false;
    
    const params = new URLSearchParams(location.search);
    if (params.has('taskId')) {
      params.delete('taskId');
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
    
    // Store the ref
    if (task.id && elementRef) {
      taskRefs.current[task.id] = elementRef;
    }
    
    setSelectedTask({ ...task, anchorRef: elementRef });
    setShowDetailModal(true);
  }, [location, navigate]);

  // Edit Task
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

  // Close Detail Modal
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

  // Delete Task
  const handleDeleteTask = useCallback((taskId) => {
    const task = tasksForDate.find(t => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setShowConfirmDialog(true);
    }
  }, [tasksForDate]);

  // Confirm Delete
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

  // ============ ADD TASK ============
  const handleAddTask = useCallback(() => {
    setEditingTask(null);
    setShowAddForm(true);
    setHasUnsavedChanges(false);
  }, []);

  const handleSaveAddTask = useCallback((taskData) => {
    const dateToUse = taskData.date 
      ? new Date(taskData.date) 
      : selectedDate;
    
    const { date, ...taskDataWithoutDate } = taskData;
    
    const success = addTask(dateToUse, taskDataWithoutDate);
    if (success) {
      showToast(`Task Added: "${taskData.title}"`, 'success', { duration: 3000 });
      setShowAddForm(false);
      setEditingTask(null);
      setHasUnsavedChanges(false);
    }
  }, [selectedDate, addTask, showToast]);

  // ============ EDIT TASK ============
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

  // ============ DISCARD CHANGES ============
  const handleDiscard = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowDiscardConfirm(true);
    } else {
      setShowAddForm(false);
      setShowEditForm(false);
      setEditingTask(null);
      setHasUnsavedChanges(false);
    }
  }, [hasUnsavedChanges]);

  const confirmDiscard = useCallback(() => {
    setShowDiscardConfirm(false);
    setHasUnsavedChanges(false);
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingTask(null);
  }, []);

  const cancelDiscard = useCallback(() => {
    setShowDiscardConfirm(false);
  }, []);

  const handleFormChange = useCallback((hasChanges) => {
    setHasUnsavedChanges(hasChanges);
  }, []);

  // ============ RENDER ============

  if (showAddForm) {
    return (
      <div className="tasks-page">
        <div className="tasks-page-header">
          <h2>Add Task</h2>
          <button 
            className="tasks-page-back"
            onClick={handleDiscard}
          >
            ← Back
          </button>
        </div>
        <TaskForm
          mode="manual"
          selectedDate={selectedDate}
          onSave={handleSaveAddTask}
          onCancel={handleDiscard}
          onFormChange={handleFormChange}
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
  }

  if (showEditForm && editingTask) {
    return (
      <div className="tasks-page">
        <div className="tasks-page-header">
          <h2>Edit Task</h2>
          <button 
            className="tasks-page-back"
            onClick={handleDiscard}
          >
            ← Back
          </button>
        </div>
        <TaskForm
          mode="edit"
          initialData={editingTask}
          onSave={handleSaveEditTask}
          onCancel={handleDiscard}
          onFormChange={handleFormChange}
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
  }

  // ============ MAIN TASKS PAGE VIEW ============
  return (
    <div className="task-dashboard">
      <DateNavigator
        date={selectedDate}
        onDateChange={setSelectedDate}
        tasksData={tasks}
        showAddButton={true}
        onAddTask={handleAddTask}
      />

      <Timeline
        tasks={timedTasks}
        highlightedTaskId={highlightedTaskId}
        onViewTask={handleViewTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        registerTaskRef={registerTaskRef}
      />

      <TaskBoard
        tasks={untimedTasks}
        onViewTask={handleViewTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />

      {showScrollTop && (
        <button
          className="scroll-to-top-btn"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <span className="material-icons">arrow_upward</span>
        </button>
      )}

      <TaskDetailModal
        task={selectedTask}
        isOpen={showDetailModal}
        onClose={handleCloseDetail}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
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
    </div>
  );
};

export default TasksPage;
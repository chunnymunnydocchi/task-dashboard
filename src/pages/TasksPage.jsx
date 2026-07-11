// src/pages/TasksPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // CHANGED: Added useNavigate
import { useTasksContext } from '../contexts/TasksContext';
import { useToast } from '../contexts/ToastContext';
import TaskForm from '../components/TaskForm/TaskForm';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog'; // NEW
import './TasksPage.css';

const TasksPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // NEW
  const { showToast } = useToast();

  const {
    tasks,
    getTasksForDate,
    addTask,
    updateTask,
    removeTaskById,
    undoLastDeletion,
    lastDeletedTask,
    restoreDeletedTask,
  } = useTasksContext();

  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // NEW: State for edit mode
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Check if we're in edit mode or manual add mode from navigation state
  const { mode, taskId, date, taskData } = location.state || {};

  useEffect(() => {
    if (date) {
      setSelectedDate(date);
    }
    
    // If mode is 'manual', open the add form
    if (mode === 'manual') {
      setShowAddForm(true);
    }
  }, [mode, date]);

  // NEW: Beforeunload event for page refresh/close protection
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (mode === 'edit' && hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    if (mode === 'edit') {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [mode, hasUnsavedChanges]);

  // Handle adding a new task (manual add)
  const handleAddTask = (taskData) => {
    // ✅ FIX: Use the date from the form data directly!
    // The form already includes the date in taskData
    const dateToUse = taskData.date 
      ? new Date(taskData.date) 
      : new Date();
    
    // ✅ Remove the date from taskData before passing to addTask
    // because addTask expects task data without the date field
    const { date, ...taskDataWithoutDate } = taskData;
    
    const success = addTask(dateToUse, taskDataWithoutDate);
    if (success) {
      showToast(`Task Added: "${taskData.title}"`, 'success', { duration: 3000 });
      setShowAddForm(false);
      setSelectedDate(null);
    }
  };

  // Handle editing a task - UPDATED: Implement save logic
  const handleEditTask = (taskData) => {
    // Get the taskId and date from location state
    const { mode: editMode, taskId: editTaskId, date: editDate } = location.state || {};
    
    if (editMode === 'edit' && editTaskId && editDate) {
      console.log('Saving edited task:', { editTaskId, editDate, taskData });
      
      // Update the task using the updateTask function from context
      const success = updateTask(editDate, editTaskId, taskData);
      
      if (success) {
        showToast(`Task Updated: "${taskData.title}"`, 'success', { duration: 3000 });
        // Navigate back to Calendar
        navigate('/');
      } else {
        showToast('Failed to update task. Please try again.', 'error', { duration: 5000 });
      }
    } else {
      console.error('Missing required data for edit:', { editMode, editTaskId, editDate });
      showToast('Error: Unable to save changes. Missing task data.', 'error', { duration: 5000 });
    }
  };

  // NEW: Handle discard with confirmation
  const handleDiscard = () => {
    if (hasUnsavedChanges) {
      // Show confirmation dialog
      setShowDiscardConfirm(true);
    } else {
      // No changes, navigate back immediately
      navigate('/');
    }
  };

  // NEW: Confirm discard
  const confirmDiscard = () => {
    setShowDiscardConfirm(false);
    setHasUnsavedChanges(false);
    navigate('/');
  };

  // NEW: Cancel discard
  const cancelDiscard = () => {
    setShowDiscardConfirm(false);
  };

  // NEW: Handle unsaved changes from TaskForm
  const handleFormChange = (hasChanges) => {
    setHasUnsavedChanges(hasChanges);
  };

  // If in edit mode, render edit form
  if (mode === 'edit' && taskId && date) {
    // Get task data - use passed taskData or fetch from context
    let taskDataToEdit = taskData;
    
    // If taskData wasn't passed in state (e.g., refresh), try to fetch it
    if (!taskDataToEdit) {
      const tasksForDate = getTasksForDate(date);
      taskDataToEdit = tasksForDate.find(t => t.id === taskId);
    }
    
    if (!taskDataToEdit) {
      // Task not found - show error and navigate back
      showToast('Task not found. Please refresh the page.', 'error', { 
        duration: 5000
      });
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
      return null;
    }

    return (
      <div className="tasks-page">
        <div className="tasks-page-header">
          <h2>Edit Task</h2>
          <button 
            className="tasks-page-back"
            onClick={handleDiscard} // CHANGED: Use handleDiscard instead of direct back
          >
            ← Back
          </button>
        </div>
        <TaskForm
          mode="edit"
          initialData={taskDataToEdit}
          onSave={handleEditTask}
          onCancel={handleDiscard} // CHANGED: Use handleDiscard
          onFormChange={handleFormChange} // NEW: Track unsaved changes
        />
        
        {/* NEW: Discard Confirmation Dialog */}
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

  // Default view - tasks list
  return (
    <div className="tasks-page">
      <div className="tasks-page-header">
        <h2>All Tasks</h2>
      </div>

      {showAddForm ? (
        <TaskForm
          mode="manual"
          selectedDate={selectedDate}
          onSave={handleAddTask}
          onCancel={() => {
            setShowAddForm(false);
            setSelectedDate(null);
          }}
        />
      ) : (
        <div className="tasks-page-content">
          <p>Select a date to view tasks</p>
          {/* We'll add task list here in Phase 2 */}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
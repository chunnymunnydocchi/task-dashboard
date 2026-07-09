// src/pages/TasksPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTasksContext } from '../contexts/TasksContext';
import { useToast } from '../contexts/ToastContext';
import TaskForm from '../components/TaskForm/TaskForm';
import './TasksPage.css';

const TasksPage = () => {
  const location = useLocation();
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

  // Check if we're in edit mode or manual add mode from navigation state
  const { mode, taskId, date } = location.state || {};

  useEffect(() => {
    if (date) {
      setSelectedDate(date);
    }
    
    // If mode is 'manual', open the add form
    if (mode === 'manual') {
      setShowAddForm(true);
    }
  }, [mode, date]);

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

  // Handle editing a task
  const handleEditTask = (taskData) => {
    // We'll implement this in Phase 2
    console.log('Edit task:', taskData);
  };

  // If in edit mode, render edit form
  if (mode === 'edit' && taskId && date) {
    const tasksForDate = getTasksForDate(date);
    const taskData = tasksForDate.find(t => t.id === taskId);
    
    if (!taskData) {
      return <div>Task not found</div>;
    }

    return (
      <div className="tasks-page">
        <div className="tasks-page-header">
          <h2>Edit Task</h2>
          <button 
            className="tasks-page-back"
            onClick={() => window.history.back()}
          >
            ← Back
          </button>
        </div>
        <TaskForm
          mode="edit"
          initialData={taskData}
          onSave={(updatedData) => {
            // We'll implement this in Phase 2
            console.log('Save edit:', updatedData);
          }}
          onCancel={() => window.history.back()}
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
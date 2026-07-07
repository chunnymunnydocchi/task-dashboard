// src/pages/TasksPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import TaskForm from '../components/TaskForm/TaskForm';
import './TasksPage.css';

function TasksPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addTask } = useTasks();
  
  // Get mode from navigation state
  const mode = location.state?.mode || 'list'; // 'manual' | 'edit' | 'list'
  const taskId = location.state?.taskId || null;
  const date = location.state?.date || null;

  // For edit mode, we'll fetch task data later
  const [initialData, setInitialData] = useState(null);

  // For now, just handle manual mode
  const handleSave = (taskData) => {
    // For manual mode, taskData includes the date field
    const dateObj = new Date(taskData.date);
    const success = addTask(dateObj, taskData);
    
    if (success) {
      // Navigate back to calendar or tasks list
      navigate('/');
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  // If mode is manual, show the form
  if (mode === 'manual') {
    return (
      <div className="tasks-page">
        <TaskForm
          mode="manual"
          onSave={handleSave}
          onCancel={handleCancel}
          onClose={handleCancel}
        />
      </div>
    );
  }

  // Default: show task list (placeholder for now)
  return (
    <div className="tasks-page">
      <div className="page-container">
        <h1>📋 All Tasks</h1>
        <p>Task management coming soon!</p>
      </div>
    </div>
  );
}

export default TasksPage;
// src/pages/TasksPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import TaskForm from '../components/TaskForm/TaskForm';
import SuccessToast from '../components/Calendar/SuccessToast';
import './TasksPage.css';

function TasksPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addTask } = useTasks();
  
  // Add toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successToastMessage, setSuccessToastMessage] = useState('');
  
  // Get mode from navigation state
  const mode = location.state?.mode || 'list';
  const taskId = location.state?.taskId || null;
  const date = location.state?.date || null;

  const [initialData, setInitialData] = useState(null);

  // Handle save with toast
  const handleSave = (taskData) => {
    const dateObj = new Date(taskData.date);
    const success = addTask(dateObj, taskData);
    
    if (success) {
      // Show success toast
      setSuccessToastMessage(`Task Added: "${taskData.title}"`);
      setShowSuccessToast(true);
      
      // Navigate back after a brief delay
      setTimeout(() => {
        navigate('/');
      }, 1000);
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
        
        {/* Success Toast */}
        {showSuccessToast && (
          <SuccessToast
            message={successToastMessage}
            onDismiss={() => setShowSuccessToast(false)}
            duration={3000}
          />
        )}
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
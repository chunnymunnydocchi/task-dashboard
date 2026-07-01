import { useState, useEffect } from 'react';
import {
  getTasks,
  saveTasks,
  formatDateKey
} from '../services/taskService';

export const useTasks = () => {
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const loadedTasks = getTasks();
    setTasks(loadedTasks);
    setLoading(false);
  }, []);

  // Check if a date has tasks - SIMPLIFIED VERSION
  const hasTasks = (date) => {
    const dateKey = formatDateKey(date);
    // Always check the latest tasks state
    return tasks[dateKey] && tasks[dateKey].length > 0;
  };

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    const dateKey = formatDateKey(date);
    return tasks[dateKey] || [];
  };

  // Add a task
  const addTask = (date, taskText) => {
    if (!taskText.trim()) return false;
    
    const dateKey = formatDateKey(date);
    const updatedTasks = { ...tasks };
    
    if (!updatedTasks[dateKey]) {
      updatedTasks[dateKey] = [];
    }
    
    updatedTasks[dateKey].push(taskText.trim());
    setTasks(updatedTasks);
    return saveTasks(updatedTasks);
  };

  // Remove a task
  const removeTask = (date, taskIndex) => {
    const dateKey = formatDateKey(date);
    const updatedTasks = { ...tasks };
    
    if (updatedTasks[dateKey]) {
      updatedTasks[dateKey].splice(taskIndex, 1);
      
      if (updatedTasks[dateKey].length === 0) {
        delete updatedTasks[dateKey];
      }
      
      setTasks(updatedTasks);
      return saveTasks(updatedTasks);
    }
    return false;
  };

  return {
    tasks,
    loading,
    getTasksForDate,
    addTask,
    removeTask,
    hasTasks,
  };
};
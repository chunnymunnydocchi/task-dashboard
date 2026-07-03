import { useState, useEffect } from 'react';
import {
  getTasks,
  saveTasks,
  formatDateKey
} from '../services/taskService';

export const useTasks = () => {
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Track the last deleted task for undo
  const [lastDeletedTask, setLastDeletedTask] = useState(null);
  const [lastDeletedDateKey, setLastDeletedDateKey] = useState(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const loadedTasks = getTasks();
    setTasks(loadedTasks);
    setLoading(false);
  }, []);

  // Get task count for a date (returns number of tasks)
  const getTaskCount = (date) => {
    const dateKey = formatDateKey(date);
    const dateTasks = tasks[dateKey] || [];
    return dateTasks.length;
  };

  // Check if a date has tasks (returns boolean)
  const hasTasks = (date) => {
    return getTaskCount(date) > 0;
  };

  // Get completed count for a date
  const getCompletedCount = (date) => {
    const dateKey = formatDateKey(date);
    const dateTasks = tasks[dateKey] || [];
    return dateTasks.filter(task => task.completed).length;
  };

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    const dateKey = formatDateKey(date);
    return tasks[dateKey] || [];
  };

  // Add a task (now handles full task objects)
  const addTask = (date, taskData) => {
    if (!date) return false;
    
    // If taskData is a string, convert to full task object
    let task;
    if (typeof taskData === 'string') {
      task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        title: taskData.trim(),
        description: '',
        priority: 'normal',
        completed: false,
        timeSchedule: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else {
      // It's already a task object
      task = {
        ...taskData,
        id: taskData.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        updatedAt: new Date().toISOString()
      };
    }

    if (!task.title || !task.title.trim()) return false;

    const dateKey = formatDateKey(date);
    const updatedTasks = { ...tasks };

    if (!updatedTasks[dateKey]) {
      updatedTasks[dateKey] = [];
    }

    updatedTasks[dateKey].push(task);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    return true;
  };

  // Remove a task by ID - with undo tracking
  const removeTaskById = (date, taskId) => {
    const dateKey = formatDateKey(date);
    const updatedTasks = { ...tasks };

    if (updatedTasks[dateKey]) {
      // Find the task to delete
      const taskIndex = updatedTasks[dateKey].findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        // Store the deleted task for undo
        const deletedTask = updatedTasks[dateKey][taskIndex];
        setLastDeletedTask(deletedTask);
        setLastDeletedDateKey(dateKey);

        // Remove the task
        updatedTasks[dateKey].splice(taskIndex, 1);

        if (updatedTasks[dateKey].length === 0) {
          delete updatedTasks[dateKey];
        }

        setTasks(updatedTasks);
        saveTasks(updatedTasks);
        return true;
      }
    }
    return false;
  };

  // Undo last deletion
  const undoLastDeletion = () => {
    if (!lastDeletedTask || !lastDeletedDateKey) return false;

    const updatedTasks = { ...tasks };
    if (!updatedTasks[lastDeletedDateKey]) {
      updatedTasks[lastDeletedDateKey] = [];
    }
    updatedTasks[lastDeletedDateKey].push(lastDeletedTask);
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    
    // Clear the deleted task
    setLastDeletedTask(null);
    setLastDeletedDateKey(null);
    return true;
  };

  // Clear deleted task (called when undo is dismissed or times out)
  const clearDeletedTask = () => {
    setLastDeletedTask(null);
    setLastDeletedDateKey(null);
  };

  // Remove a task by index (for backward compatibility)
  const removeTask = (date, taskIndex) => {
    const dateKey = formatDateKey(date);
    const updatedTasks = { ...tasks };

    if (updatedTasks[dateKey]) {
      updatedTasks[dateKey].splice(taskIndex, 1);

      if (updatedTasks[dateKey].length === 0) {
        delete updatedTasks[dateKey];
      }

      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      return true;
    }
    return false;
  };

  // Toggle task completion
  const toggleTask = (date, taskId) => {
    const dateKey = formatDateKey(date);
    const updatedTasks = { ...tasks };

    if (updatedTasks[dateKey]) {
      const taskIndex = updatedTasks[dateKey].findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        updatedTasks[dateKey][taskIndex].completed = !updatedTasks[dateKey][taskIndex].completed;
        updatedTasks[dateKey][taskIndex].updatedAt = new Date().toISOString();
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
        return true;
      }
    }
    return false;
  };

  return {
    tasks,
    loading,
    getTasksForDate,
    getTaskCount,
    getCompletedCount,
    addTask,
    removeTask,
    removeTaskById,
    toggleTask,
    hasTasks,
    undoLastDeletion,
    clearDeletedTask,
    lastDeletedTask,
  };
};
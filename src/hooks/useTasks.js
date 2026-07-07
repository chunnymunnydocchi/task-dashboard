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
      task = {
        ...taskData,
        id: taskData.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        updatedAt: new Date().toISOString()
      };
    }

    if (!task.title || !task.title.trim()) return false;

    const dateKey = formatDateKey(date);
    const updatedTasks = { ...tasks };

    const existingTasks = updatedTasks[dateKey] || [];
    updatedTasks[dateKey] = [...existingTasks, task];

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    return true;
  };

  // Update a task by ID
  const updateTask = (date, taskId, updates) => {
    const dateKey = formatDateKey(date);
    const updatedTasks = { ...tasks };

    if (updatedTasks[dateKey]) {
      const taskIndex = updatedTasks[dateKey].findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        // Create updated task with new data
        const updatedTask = {
          ...updatedTasks[dateKey][taskIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };

        // Create new array with the updated task
        updatedTasks[dateKey] = [
          ...updatedTasks[dateKey].slice(0, taskIndex),
          updatedTask,
          ...updatedTasks[dateKey].slice(taskIndex + 1)
        ];

        setTasks(updatedTasks);
        saveTasks(updatedTasks);
        return true;
      }
    }
    return false;
  };

  // Remove a task by ID - with undo tracking
  const removeTaskById = (date, taskId) => {
    const dateKey = formatDateKey(date);
    const updatedTasks = { ...tasks };

    if (updatedTasks[dateKey]) {
      const taskIndex = updatedTasks[dateKey].findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        const deletedTask = updatedTasks[dateKey][taskIndex];
        setLastDeletedTask(deletedTask);
        setLastDeletedDateKey(dateKey);

        // 🔥 FIX: Create a new array without the task
        updatedTasks[dateKey] = updatedTasks[dateKey].filter(task => task.id !== taskId);

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

    // 🔥 FIX: Create a new array
    const existingTasks = updatedTasks[lastDeletedDateKey] || [];
    updatedTasks[lastDeletedDateKey] = [...existingTasks, lastDeletedTask];

    setTasks(updatedTasks);
    saveTasks(updatedTasks);

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
        // 🔥 FIX: Create a new array with the updated task
        const task = updatedTasks[dateKey][taskIndex];
        const updatedTask = {
          ...task,
          completed: !task.completed,
          updatedAt: new Date().toISOString()
        };

        updatedTasks[dateKey] = [
          ...updatedTasks[dateKey].slice(0, taskIndex),
          updatedTask,
          ...updatedTasks[dateKey].slice(taskIndex + 1)
        ];

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
    updateTask,
    removeTask,
    removeTaskById,
    toggleTask,
    hasTasks,
    undoLastDeletion,
    clearDeletedTask,
    lastDeletedTask,
  };
};
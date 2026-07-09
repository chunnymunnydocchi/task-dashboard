// src/contexts/TasksContext.jsx
import React, { createContext, useContext } from 'react';
import { useTasks } from '../hooks/useTasks';

// Create the context
const TasksContext = createContext();

// Provider component - wraps your app
export const TasksProvider = ({ children }) => {
  // useTasks now runs ONCE and is shared with everyone!
  const tasksData = useTasks();
  
  return (
    <TasksContext.Provider value={tasksData}>
      {children}
    </TasksContext.Provider>
  );
};

// Custom hook to use the context
export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};
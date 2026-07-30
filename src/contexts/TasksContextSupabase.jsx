// src/contexts/TasksContextSupabase.jsx
import React, { createContext, useContext } from 'react';
import { useTasksSupabase } from '../hooks/useTasksSupabase';

const TasksContext = createContext(null);

export const TasksProvider = ({ children }) => {
  const tasksHook = useTasksSupabase();

  return (
    <TasksContext.Provider value={tasksHook}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};
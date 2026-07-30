// src/App.js - CLEAN VERSION
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import CalendarPage from './pages/CalendarPage';
import TasksPage from './pages/TasksPage';
import { ToastProvider } from './contexts/ToastContext';
import { TasksProvider } from './contexts/TasksContextSupabase';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <BrowserRouter basename="/task-dashboard">
      <ToastProvider>
        <TasksProvider>
          <div className="app">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={closeSidebar}
              onToggle={toggleSidebar}
            />
            <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
              <Routes>
                <Route path="/" element={<CalendarPage />} />
                <Route path="/tasks" element={<TasksPage />} />
              </Routes>
            </div>
          </div>
        </TasksProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
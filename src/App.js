// src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import CalendarPage from './pages/CalendarPage';
import TasksPage from './pages/TasksPage';
import { ToastProvider } from './contexts/ToastContext';
import { TasksProvider } from './contexts/TasksContext'; // 👈 ADD THIS
import './App.css';

function App() {
  return (
    <BrowserRouter basename="/task-dashboard">
      <ToastProvider>
        <TasksProvider>
          <div className="app">
            <Sidebar />
            <div className="main-content">
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
// src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import CalendarPage from './pages/CalendarPage';
import TasksPage from './pages/TasksPage';
import TodayPage from './pages/TodayPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/today" element={<TodayPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
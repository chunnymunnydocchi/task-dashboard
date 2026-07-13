// src/pages/TasksPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTasksContext } from '../contexts/TasksContext';
import { useToast } from '../contexts/ToastContext';
import DateNavigator from '../components/Tasks/DateNavigator';
import Timeline from '../components/Tasks/Timeline/Timeline';
import TaskBoard from '../components/Tasks/TaskBoard/TaskBoard';
import './TasksPage.css';

const TasksPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    tasks,
    getTasksForDate,
    addTask,
    updateTask,
    removeTaskById,
    restoreDeletedTask,
  } = useTasksContext();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [highlightedTaskId, setHighlightedTaskId] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setShowScrollTop(scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const taskId = params.get('taskId');
    const dateParam = params.get('date');

    if (dateParam) {
      const date = new Date(dateParam);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    }

    if (taskId) {
      setHighlightedTaskId(taskId);
    }
  }, [location.search]);

  // Remove padding from main content when on TasksPage
  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.add('tasks-page-active');
    }
    return () => {
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.classList.remove('tasks-page-active');
      }
    };
  }, []);

  const tasksForDate = getTasksForDate(selectedDate);
  const timedTasks = tasksForDate.filter(t => t.timeSchedule?.start);
  const untimedTasks = tasksForDate.filter(t => !t.timeSchedule?.start);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="task-dashboard">
      <DateNavigator
        date={selectedDate}
        onDateChange={setSelectedDate}
        tasksData={tasks}
        showAddButton={false}
      />

      <Timeline
        tasks={timedTasks}
        highlightedTaskId={highlightedTaskId}
      />

      <TaskBoard
        tasks={untimedTasks}
      />
      {showScrollTop && (
        <button
          className="scroll-to-top-btn"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <span className="material-icons">arrow_upward</span>
        </button>
      )}
    </div>
  );
};

export default TasksPage;
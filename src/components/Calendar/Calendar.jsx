// src/components/Calendar/Calendar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalendar } from '../../hooks/useCalendar';
import { useTasksContext } from '../../contexts/TasksContextSupabase';
import { useToast } from '../../contexts/ToastContext';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import MonthPicker from './MonthPicker';
import SidePanel from './SidePanel';
import TaskList from './TaskList';
import TaskForm from '../TaskForm/TaskForm';
import './Calendar.css';

const Calendar = () => {
  const calendar = useCalendar();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    tasks,
    hasTasks,
    getTaskCount,
    getCompletedCount,
    getTasksForDate,
    addTask,
    updateTask,
    toggleTask,
    removeTaskById,
    undoLastDeletion,
    clearDeletedTask,
    lastDeletedTask,
    restoreDeletedTask,
    loadTasksForDate, // ✅ ADDED
    loading,          // ✅ ADDED
  } = useTasksContext();

  // Quick add state
  const [quickAddText, setQuickAddText] = useState('');
  const [quickAddError, setQuickAddError] = useState('');

  // Quick Add Modal state
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddTaskId, setQuickAddTaskId] = useState(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  // Function to convert Date object to 'YYYY-MM-DD' string
  const getDateKey = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [animationDirection, setAnimationDirection] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // ✅ NEW: Load tasks when selected date changes
  useEffect(() => {
    const loadTasks = async () => {
      if (selectedDate) {
        setIsLoadingTasks(true);
        try {
          await loadTasksForDate(selectedDate);
        } catch (error) {
          console.error('Error loading tasks for date:', error);
          showToast('Failed to load tasks', 'error', { duration: 3000 });
        } finally {
          setIsLoadingTasks(false);
        }
      }
    };
    loadTasks();
  }, [selectedDate, loadTasksForDate, showToast]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsPanelOpen(true);
  };

  // Get tasks for the selected date
  const selectedDateKey = getDateKey(selectedDate);
  const tasksForSelectedDate = React.useMemo(() => {
    if (!selectedDateKey) return [];
    return tasks[selectedDateKey] || [];
  }, [selectedDateKey, tasks]);

  const remainingTasks = tasksForSelectedDate.filter(task => !task.completed).length;

  // Handle Quick Add
  const handleQuickAdd = () => {
    if (!quickAddText.trim()) {
      setQuickAddError('Please enter a task title');
      setTimeout(() => setQuickAddError(''), 5000);
      return;
    }

    if (!selectedDate) {
      setQuickAddError('Please select a date first');
      setTimeout(() => setQuickAddError(''), 5000);
      return;
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const taskTitle = quickAddText.trim();

    const taskData = {
      id: taskId,
      title: taskTitle,
      description: '',
      priority: 'normal',
      completed: false,
      timeSchedule: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const success = addTask(selectedDate, taskData);

    if (success) {
      setQuickAddTitle(taskTitle);
      setQuickAddTaskId(taskId);
      setQuickAddText('');
      setQuickAddError('');

      showToast(`Task Added: "${taskTitle}"`, 'success', { duration: 3000 });

      setTimeout(() => {
        setShowQuickAddModal(true);
      }, 500);
    }
  };

  // Handle Quick Add Save
  const handleQuickAddSave = (taskData) => {
    if (quickAddTaskId && selectedDate) {
      updateTask(selectedDate, quickAddTaskId, taskData);
      setShowQuickAddModal(false);
      setQuickAddTaskId(null);

      showToast(`Task Updated: "${taskData.title}"`, 'success', { duration: 3000 });
    }
  };

  // Handle Quick Add Modal Close
  const handleQuickAddClose = () => {
    setShowQuickAddModal(false);
    setQuickAddTaskId(null);
    showToast('Task saved! You can edit it later', 'success', { duration: 3000 });
  };

  // Handle toggle task
  const handleToggleTask = (taskId) => {
    if (selectedDate) {
      toggleTask(selectedDate, taskId);
    }
  };

  const handleViewMore = (task) => {
    // Navigate to TasksPage with task and date
    const dateKey = selectedDateKey;
    navigate(`/tasks?date=${dateKey}&taskId=${task.id}`);
  };

  const handleDeleteTask = (taskId) => {
    if (!selectedDate || !selectedDateKey) return;

    const taskToDelete = tasks[selectedDateKey]?.find(t => t.id === taskId);
    if (!taskToDelete) return;

    const taskData = { ...taskToDelete };
    const dateKey = selectedDateKey;

    const success = removeTaskById(selectedDate, taskId);

    if (success) {
      showToast(
        `Task Removed: "${taskData.title}"`,
        'undo',
        {
          duration: 10000,
          onUndo: () => {
            restoreDeletedTask(dateKey, taskData);
          }
        }
      );
    }
  };

  // Handle edit task - UPDATED: Navigate to TasksPage with edit state
  const handleEditTask = (taskId) => {
    console.log('Edit task:', taskId);

    // Find the task in the current selected date's tasks
    const task = tasksForSelectedDate.find(t => t.id === taskId);

    if (task) {
      console.log('Task found:', task);
      // Navigate to TasksPage with edit mode state
      navigate('/tasks', {
        state: {
          mode: 'edit',
          taskId: task.id,
          date: selectedDate,
          taskData: task
        }
      });
    } else {
      // Task not found - show error toast
      console.error('Task not found:', taskId);
      showToast('Task not found. Please refresh the page.', 'error', {
        duration: 5000
      });
    }
  };

  const handlePrevMonth = () => {
    setAnimationDirection('slide-right');
    calendar.prevMonth();
    setTimeout(() => setAnimationDirection(''), 300);
  };

  const handleNextMonth = () => {
    setAnimationDirection('slide-left');
    calendar.nextMonth();
    setTimeout(() => setAnimationDirection(''), 300);
  };

  const handleGoToToday = () => {
    setAnimationDirection('slide-left');
    calendar.goToToday();
    setTimeout(() => setAnimationDirection(''), 300);
  };

  // Panel close - NO LONGER clears toasts
  const handlePanelClose = () => {
    setIsPanelOpen(false);
    // Toast persists
  };

  return (
    <>
      <div className="calendar-container">
        <CalendarHeader
          currentMonth={calendar.currentMonth}
          currentYear={calendar.currentYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleGoToToday}
          onOpenMonthPicker={calendar.openMonthPicker}
        />

        <div className={`calendar-grid-wrapper ${animationDirection}`}>
          <CalendarGrid
            days={calendar.calendarDays}
            selectedDate={calendar.selectedDate}
            isSelectedDate={calendar.isSelectedDate}
            isCurrentMonth={calendar.isCurrentMonth}
            isToday={calendar.isToday}
            onSelectDate={calendar.setSelectedDate}
            onDateClick={handleDateClick}
            getTaskCount={getTaskCount}
            getCompletedCount={getCompletedCount}
            hasTasks={hasTasks}
          />

          <SidePanel
            isOpen={isPanelOpen}
            onClose={handlePanelClose}
            date={selectedDate}
            taskCount={remainingTasks}
            loading={isLoadingTasks} // ✅ PASS LOADING STATE
          >
            <div className="quick-add-container">
              <div className={`quick-add-wrapper ${quickAddError ? 'shake' : ''}`}>
                <input
                  type="text"
                  className="quick-add-input"
                  placeholder="Add a task..."
                  value={quickAddText}
                  onChange={(e) => setQuickAddText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleQuickAdd();
                    }
                  }}
                />
                <button
                  className="quick-add-btn"
                  onClick={handleQuickAdd}
                >
                  <span className="material-icons">add</span>
                </button>
              </div>
              {quickAddError && (
                <div className="quick-add-error">{quickAddError}</div>
              )}
            </div>

            {isLoadingTasks ? (
              <div className="task-list-loading">
                <span className="material-icons spinning">refresh</span>
                <span>Loading tasks...</span>
              </div>
            ) : (
              <TaskList
                tasks={tasksForSelectedDate}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
                onViewMore={handleViewMore}
              />
            )}
          </SidePanel>
        </div>

        {calendar.showMonthPicker && (
          <MonthPicker
            currentMonth={calendar.currentMonth}
            currentYear={parseInt(calendar.currentYear)}
            onConfirm={(month, year) => {
              calendar.setMonthAndYear(month, year);
            }}
            onCancel={calendar.closeMonthPicker}
          />
        )}
      </div>

      {showQuickAddModal && (
        <div className="quick-add-modal-overlay">
          <TaskForm
            mode="quick"
            selectedDate={selectedDate}
            initialData={{
              title: quickAddTitle,
              description: '',
              priority: 'normal',
              completed: false,
              timeSchedule: { start: '', end: '' }
            }}
            onSave={handleQuickAddSave}
            onCancel={handleQuickAddClose}
            onClose={handleQuickAddClose}
          />
        </div>
      )}
    </>
  );
};

export default Calendar;
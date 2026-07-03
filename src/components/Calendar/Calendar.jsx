import React, { useState } from 'react';
import { useCalendar } from '../../hooks/useCalendar';
import { useTasks } from '../../hooks/useTasks';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import MonthPicker from './MonthPicker';
import SidePanel from './SidePanel';
import TaskList from './TaskList';
import UndoToast from './UndoToast';
import './Calendar.css';

const Calendar = () => {
  const calendar = useCalendar();

  const {
    tasks,
    hasTasks,
    getTaskCount,
    getCompletedCount,
    getTasksForDate,
    addTask,
    toggleTask,
    removeTaskById,
    undoLastDeletion,
    clearDeletedTask,
    lastDeletedTask
  } = useTasks();

  // Quick add state
  const [quickAddText, setQuickAddText] = useState('');
  const [quickAddError, setQuickAddError] = useState('');

  // Track if undo toast should be shown
  const [showUndoToast, setShowUndoToast] = useState(false);

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

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsPanelOpen(true);
  };

  // Get tasks for the selected date
  const selectedDateKey = getDateKey(selectedDate);
  const tasksForSelectedDate = selectedDateKey ? getTasksForDate(selectedDateKey) : [];

  const remainingTasks = tasksForSelectedDate.filter(task => !task.completed).length;
  const completedTasks = tasksForSelectedDate.filter(task => task.completed).length;

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

    const success = addTask(selectedDate, quickAddText.trim());

    if (success) {
      setQuickAddText('');
      setQuickAddError('');
    } else {
      setQuickAddError('Failed to add task');
      setTimeout(() => setQuickAddError(''), 5000);
    }
  };

  // Handle toggle task
  const handleToggleTask = (taskId) => {
    if (selectedDate) {
      toggleTask(selectedDate, taskId);
    }
  };

  // Handle delete task - show undo toast
  const handleDeleteTask = (taskId) => {
    if (selectedDate) {
      const success = removeTaskById(selectedDate, taskId);
      if (success) {
        // Show undo toast
        setShowUndoToast(true);
      }
    }
  };

  // Handle undo
  const handleUndo = () => {
    undoLastDeletion();
    setShowUndoToast(false);
  };

  // Handle undo dismiss (timeout or close)
  const handleUndoDismiss = () => {
    setShowUndoToast(false);
    clearDeletedTask();
  };

  // Handle edit task
  const handleEditTask = (taskId) => {
    console.log('Edit task:', taskId);
    // We'll implement this later
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

  // Handle panel close - clear undo
  const handlePanelClose = () => {
    setIsPanelOpen(false);
    if (showUndoToast) {
      setShowUndoToast(false);
      clearDeletedTask();
    }
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
            taskCount={remainingTasks} // show remaining tasks count
          >
            {/* Quick Add Input */}
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

            {/* Task List */}
            <TaskList
              tasks={tasksForSelectedDate}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
              deletedTaskId={showUndoToast && lastDeletedTask ? lastDeletedTask.id : null} 
            />
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

      {/* Undo Toast - Rendered outside SidePanel */}
      {showUndoToast && lastDeletedTask && (
        <UndoToast
          message={`Task Removed: "${lastDeletedTask.title}"`}
          onUndo={handleUndo}
          onDismiss={handleUndoDismiss}
          duration={10000}
        />
      )}
    </>
  );
};

export default Calendar;
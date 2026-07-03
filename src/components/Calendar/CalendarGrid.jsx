import React from 'react';

const CalendarGrid = ({
  days,
  selectedDate,
  isSelectedDate,
  isCurrentMonth,
  isToday,
  onSelectDate,
  onDateClick,
  getTaskCount,
  getCompletedCount,
  hasTasks
}) => {
  // Days of the week headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayClick = (date) => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  // Helper to get task count safely
  const safeGetTaskCount = (date) => {
    if (typeof getTaskCount === 'function') {
      return getTaskCount(date);
    }
    return 0;
  };

  // Helper to get completed count safely
  const safeGetCompletedCount = (date) => {
    if (typeof getCompletedCount === 'function') {
      return getCompletedCount(date);
    }
    return 0;
  };

  return (
    <div className="calendar-grid">
      {/* Weekday headers */}
      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days grid */}
      <div className="calendar-days">
        {days.map((day, index) => {
          // If day is null (empty slot), render empty div
          if (!day) {
            return <div key={index} className="calendar-day empty"></div>;
          }

          // Build class names based on state
          let dayClasses = 'calendar-day';
          if (isSelectedDate(day)) dayClasses += ' selected';
          if (isToday(day)) dayClasses += ' today';
          if (!isCurrentMonth(day)) dayClasses += ' other-month';

          // Get task counts for this date
          const totalTasks = safeGetTaskCount(day);
          const completedCount = safeGetCompletedCount(day);
          const remainingTasks = totalTasks - completedCount; // ← Calculate remaining
          const hasTasks = totalTasks > 0;

          return (
            <div
              key={index}
              className={dayClasses}
              onClick={() => {
                onSelectDate(day);
                handleDayClick(day);
              }}
            >
              <span className="day-number">{day.getDate()}</span>
              
              {/* Task indicator - show remaining tasks and completed tasks */}
              {hasTasks && (
                <div className="task-indicator">
                  {/* Show remaining tasks count (incomplete) */}
                  <span className="task-count-badge">
                    {remainingTasks}
                  </span>
                  {/* Show completed tasks count if any */}
                  {completedCount > 0 && (
                    <span className="task-completed-badge">
                      ✓{completedCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
import React from 'react';

const CalendarGrid = ({ 
  days, 
  selectedDate, 
  isSelectedDate, 
  isCurrentMonth, 
  isToday, 
  onSelectDate,
  hasTasks
}) => {
  // Days of the week headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // SAFETY: Ensure hasTasks is a function
  const safeHasTasks = (date) => {
    if (typeof hasTasks === 'function') {
      return hasTasks(date);
    }
    return false; // Return false if hasTasks is not a function
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
          
          // Check if this date has tasks - using safe function
          const hasTask = safeHasTasks(day);

          return (
            <div 
              key={index}
              className={dayClasses}
              onClick={() => onSelectDate(day)}
            >
              <span className="day-number">{day.getDate()}</span>
              {/* Task indicator dot */}
              {hasTask && <span className="task-dot"></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
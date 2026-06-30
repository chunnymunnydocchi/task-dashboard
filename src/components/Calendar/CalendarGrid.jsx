import React from 'react';

const CalendarGrid = ({ 
  days, 
  selectedDate, 
  isSelectedDate, 
  isCurrentMonth, 
  isToday, 
  onSelectDate 
}) => {
  // Days of the week headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

          return (
            <div 
              key={index}
              className={dayClasses}
              onClick={() => onSelectDate(day)}
            >
              <span className="day-number">{day.getDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
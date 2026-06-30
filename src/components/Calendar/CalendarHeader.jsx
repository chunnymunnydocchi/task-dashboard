import React from 'react';

const CalendarHeader = ({ 
  currentMonth, 
  currentYear, 
  onPrevMonth, 
  onNextMonth, 
  onToday,
  onOpenMonthPicker 
}) => {
  return (
    <div className="calendar-header">
      {/* Today Button - BOOKMARK STYLE (absolute positioned) */}
      <button onClick={onToday} className="today-btn-bookmark">
        <span className="material-icons">today</span>
      </button>

      <div className="calendar-nav-left">
        <button onClick={onPrevMonth} className="nav-btn">
          <span className="material-icons">chevron_left</span>
        </button>
      </div>
      
      <div className="calendar-title" onClick={onOpenMonthPicker}>
        <h2>{currentMonth} {currentYear}</h2>
        <span className="material-icons dropdown-icon">expand_more</span>
      </div>
      
      <div className="calendar-nav-right">
        <button onClick={onNextMonth} className="nav-btn">
          <span className="material-icons">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
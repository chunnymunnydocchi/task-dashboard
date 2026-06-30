import React, { useState } from 'react';
import { useCalendar } from '../../hooks/useCalendar';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import './Calendar.css';

const Calendar = () => {
  const calendar = useCalendar();
  
  // Track animation direction for smooth transitions
  const [animationDirection, setAnimationDirection] = useState('');

  // Wrap navigation functions to add animation
  const handlePrevMonth = () => {
    setAnimationDirection('slide-right');
    calendar.prevMonth();
    // Reset animation after it completes
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

  return (
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
        />
      </div>
    </div>
  );
};

export default Calendar;
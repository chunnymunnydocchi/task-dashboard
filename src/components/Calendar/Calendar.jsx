import React, { useState } from 'react';
import { useCalendar } from '../../hooks/useCalendar';
import { useTasks } from '../../hooks/useTasks';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import MonthPicker from './MonthPicker';
import './Calendar.css';

const Calendar = () => {
  const calendar = useCalendar();
  const { hasTasks } = useTasks(); // ← DESTRUCTURE this way!
  
  // Track animation direction for smooth transitions
  const [animationDirection, setAnimationDirection] = useState('');

  // Wrap navigation functions to add animation
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
          hasTasks={hasTasks} // ← Pass the function
        />
      </div>

      {/* Month Picker - MODAL OVERLAY */}
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
  );
};

export default Calendar;
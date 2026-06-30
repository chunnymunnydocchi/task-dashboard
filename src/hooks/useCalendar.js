import { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  getDay,
  isSameMonth,
  isSameDay
} from 'date-fns';

export const useCalendar = (initialDate = new Date()) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const currentMonth = format(currentDate, 'MMMM');
  const currentYear = format(currentDate, 'yyyy');

  const generateCalendarDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    const startDayOfWeek = getDay(start);
    const emptyDays = Array(startDayOfWeek).fill(null);
    return [...emptyDays, ...days];
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const openMonthPicker = () => setShowMonthPicker(true);
  const closeMonthPicker = () => setShowMonthPicker(false);

  const isSelectedDate = (date) => {
    if (!date || !selectedDate) return false;
    return isSameDay(date, selectedDate);
  };

  const isCurrentMonth = (date) => {
    if (!date) return false;
    return isSameMonth(date, currentDate);
  };

  const isToday = (date) => {
    if (!date) return false;
    return isSameDay(date, new Date());
  };

  return {
    currentDate,
    selectedDate,
    currentMonth,
    currentYear,
    calendarDays: generateCalendarDays(),
    showMonthPicker,
    nextMonth,
    prevMonth,
    goToToday,
    openMonthPicker,
    closeMonthPicker,
    setSelectedDate,
    isSelectedDate,
    isCurrentMonth,
    isToday
  };
};
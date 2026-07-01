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

  // Add after the closeMonthPicker function
  const setMonthAndYear = (month, year) => {
    // Find the month index (0-11)
    const monthIndex = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ].indexOf(month);

    if (monthIndex === -1) return; // Invalid month

    // Create new date with selected month and year
    const newDate = new Date(year, monthIndex, 1);
    setCurrentDate(newDate);
    closeMonthPicker();
  };

  // Also add month names array for the picker
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
    monthNames,
    setMonthAndYear,
    setSelectedDate,
    isSelectedDate,
    isCurrentMonth,
    isToday
  };
};
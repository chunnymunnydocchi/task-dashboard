// src/components/Tasks/DatePicker.jsx
import React, { useState } from 'react';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    isToday, 
    getDay, 
    isSameDay,
    addMonths,
    subMonths,
} from 'date-fns';
import MonthPicker from '../Calendar/MonthPicker';
import './DatePicker.css';

const DatePicker = ({
    selectedDate,
    onDateSelect,
    onCancel,
    tasksData = {}
}) => {
    const [viewDate, setViewDate] = useState(selectedDate || new Date());
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getDaysInMonth = () => {
        const date = new Date(year, month, 1);
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        const days = eachDayOfInterval({ start, end });
        
        const firstDayOfMonth = getDay(start);
        const emptySlots = Array(firstDayOfMonth).fill(null);
        
        return [...emptySlots, ...days];
    };

    const days = getDaysInMonth();

    // ✅ FIXED: Now sync - uses tasksData directly
    const hasTasksOnDay = (day) => {
        if (!day) return false;
        const dateKey = format(day, 'yyyy-MM-dd');
        return tasksData[dateKey] && tasksData[dateKey].length > 0;
    };

    const getTaskCountForDay = (day) => {
        if (!day) return 0;
        const dateKey = format(day, 'yyyy-MM-dd');
        return tasksData[dateKey] ? tasksData[dateKey].length : 0;
    };

    const handleDateSelect = (day) => {
        if (!day) return;
        onDateSelect(day);
    };

    const goToPrevMonth = () => {
        setViewDate(subMonths(viewDate, 1));
    };

    const goToNextMonth = () => {
        setViewDate(addMonths(viewDate, 1));
    };

    const goToToday = () => {
        const today = new Date();
        setViewDate(today);
        onDateSelect(today);
    };

    const handleMonthPickerConfirm = (monthName, year) => {
        const monthIndex = monthNames.indexOf(monthName);
        const newDate = new Date(year, monthIndex, 1);
        setViewDate(newDate);
        setShowMonthPicker(false);
    };

    return (
        <>
            <div className="date-picker-overlay" onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onCancel();
                }
            }}>
                <div className="date-picker-modal">
                    <div className="date-picker-header">
                        <button 
                            className="picker-nav-btn"
                            onClick={goToPrevMonth}
                        >
                            <span className="material-icons">chevron_left</span>
                        </button>
                        
                        <div 
                            className="picker-month-year"
                            onClick={() => setShowMonthPicker(true)}
                            role="button"
                            tabIndex="0"
                        >
                            <span className="picker-month">{monthNames[month]}</span>
                            <span className="picker-year">{year}</span>
                            <span className="picker-dropdown-icon material-icons">
                                expand_more
                            </span>
                        </div>
                        
                        <button 
                            className="picker-nav-btn"
                            onClick={goToNextMonth}
                        >
                            <span className="material-icons">chevron_right</span>
                        </button>
                    </div>

                    <button 
                        className="picker-today-btn"
                        onClick={goToToday}
                    >
                        <span className="material-icons">today</span>
                        Today
                    </button>

                    <div className="date-picker-grid">
                        {weekDays.map((day) => (
                            <div key={day} className="picker-weekday">
                                {day}
                            </div>
                        ))}

                        {days.map((day, index) => {
                            if (!day) {
                                return <div key={`empty-${index}`} className="picker-day empty" />;
                            }

                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const hasTasks = hasTasksOnDay(day);
                            const taskCount = getTaskCountForDay(day);
                            const isCurrentDay = isToday(day);

                            return (
                                <div
                                    key={day.toString()}
                                    className={`picker-day 
                                        ${isSelected ? 'selected' : ''} 
                                        ${hasTasks ? 'has-tasks' : ''} 
                                        ${isCurrentDay ? 'today' : ''}`
                                    }
                                    onClick={() => handleDateSelect(day)}
                                >
                                    <span className="day-number">{format(day, 'd')}</span>
                                    {hasTasks && (
                                        <span className="task-badge">{taskCount}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="date-picker-legend">
                        <span className="legend-item">
                            <span className="legend-dot"></span>
                            Has tasks
                        </span>
                        <span className="legend-item">
                            <span className="legend-today"></span>
                            Today
                        </span>
                    </div>

                    <div className="date-picker-actions">
                        <button className="picker-btn cancel" onClick={onCancel}>
                            Cancel
                        </button>
                        <button className="picker-btn confirm" onClick={onCancel}>
                            Done
                        </button>
                    </div>
                </div>
            </div>

            {showMonthPicker && (
                <MonthPicker
                    currentMonth={month}
                    currentYear={year}
                    onConfirm={handleMonthPickerConfirm}
                    onCancel={() => setShowMonthPicker(false)}
                    mode="date-picker"
                />
            )}
        </>
    );
};

export default DatePicker;
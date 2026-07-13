// src/components/Tasks/DateNavigator.jsx
import React, { useState } from 'react';
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from 'date-fns';
import DatePicker from './DatePicker';
import './DateNavigator.css';

const DateNavigator = ({
    date,
    onDateChange,
    tasksData = {},
    showAddButton = true
}) => {
    const [showPicker, setShowPicker] = useState(false);

    const getDateDisplay = () => {
        if (isToday(date)) {
            return `Today, ${format(date, 'MMMM d, yyyy')}`;
        } else if (isTomorrow(date)) {
            return `Tomorrow, ${format(date, 'MMMM d, yyyy')}`;
        } else if (isYesterday(date)) {
            return `Yesterday, ${format(date, 'MMMM d, yyyy')}`;
        }
        return format(date, 'MMMM d, yyyy');
    };

    const handleDateSelect = (selectedDate) => {
        onDateChange(selectedDate);
        setShowPicker(false);
    };

    return (
        <>
            <div className="date-navigator">
                <button 
                    className="nav-btn prev-btn"
                    onClick={() => onDateChange(subDays(date, 1))}
                    aria-label="Previous day"
                >
                    <span className="material-icons">chevron_left</span>
                </button>

                <div 
                    className="date-display"
                    onClick={() => setShowPicker(true)}
                >
                    <span className="date-label">{getDateDisplay()}</span>
                    <span className="date-icon material-icons">
                        expand_more
                    </span>
                </div>

                <button 
                    className="nav-btn next-btn"
                    onClick={() => onDateChange(addDays(date, 1))}
                    aria-label="Next day"
                >
                    <span className="material-icons">chevron_right</span>
                </button>
            </div>

            {showPicker && (
                <DatePicker
                    selectedDate={date}
                    onDateSelect={handleDateSelect}
                    onCancel={() => setShowPicker(false)}
                    tasksData={tasksData}
                />
            )}
        </>
    );
};

export default DateNavigator;
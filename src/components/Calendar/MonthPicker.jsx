// src/components/Calendar/MonthPicker.jsx
import React, { useState, useRef, useEffect } from 'react';
import './MonthPicker.css';

const MonthPicker = ({
    currentMonth,  // This is the month NAME (string) from Calendar
    currentYear,   // This is the year (number)
    onConfirm,
    onCancel,
    mode = 'month-year'
}) => {
    // Get month index from the month name
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // If currentMonth is a string (from Calendar), find its index
    // If it's a number (from DatePicker), use it directly
    const getMonthIndex = (month) => {
        if (typeof month === 'string') {
            return monthNames.indexOf(month);
        }
        return typeof month === 'number' ? month : 0;
    };

    const [selectedMonthIndex, setSelectedMonthIndex] = useState(getMonthIndex(currentMonth));
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const monthContainerRef = useRef(null);
    const yearContainerRef = useRef(null);

    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    useEffect(() => {
        setTimeout(() => {
            if (monthContainerRef.current) {
                const monthItem = monthContainerRef.current.children[selectedMonthIndex];
                if (monthItem) {
                    monthItem.scrollIntoView({ block: 'center', behavior: 'auto' });
                }
            }

            if (yearContainerRef.current) {
                const yearIndex = years.indexOf(selectedYear);
                const yearItem = yearContainerRef.current.children[yearIndex];
                if (yearItem) {
                    yearItem.scrollIntoView({ block: 'center', behavior: 'auto' });
                }
            }
        }, 50);
    }, [selectedMonthIndex, selectedYear]);

    const handleMonthSelect = (index) => {
        setSelectedMonthIndex(index);
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
    };

    const handleConfirm = () => {
        // ALWAYS pass back the month NAME and year NUMBER
        const monthName = monthNames[selectedMonthIndex];
        onConfirm(monthName, selectedYear);
    };

    const handleKeyDown = (e, type) => {
        if (type === 'month') {
            if (e.key === 'ArrowDown' && selectedMonthIndex < monthNames.length - 1) {
                e.preventDefault();
                const newIndex = selectedMonthIndex + 1;
                setSelectedMonthIndex(newIndex);
                scrollToItem(monthContainerRef, newIndex);
            } else if (e.key === 'ArrowUp' && selectedMonthIndex > 0) {
                e.preventDefault();
                const newIndex = selectedMonthIndex - 1;
                setSelectedMonthIndex(newIndex);
                scrollToItem(monthContainerRef, newIndex);
            }
        } else if (type === 'year') {
            const currentIndex = years.indexOf(selectedYear);
            if (e.key === 'ArrowDown' && currentIndex < years.length - 1) {
                e.preventDefault();
                const newIndex = currentIndex + 1;
                setSelectedYear(years[newIndex]);
                scrollToItem(yearContainerRef, newIndex);
            } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                e.preventDefault();
                const newIndex = currentIndex - 1;
                setSelectedYear(years[newIndex]);
                scrollToItem(yearContainerRef, newIndex);
            }
        }
    };

    const scrollToItem = (containerRef, index) => {
        if (containerRef.current) {
            const item = containerRef.current.children[index];
            if (item) {
                item.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
        }
    };

    return (
        <div className={`month-picker-overlay ${mode === 'date-picker' ? 'date-picker-mode' : ''}`} 
             onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onCancel();
                }
            }}>
            <div className="month-picker-modal">
                <h3 className="picker-title">Select Month &amp; Year</h3>

                <div className="picker-content">
                    <div className="picker-column">
                        <div 
                            className="picker-list" 
                            ref={monthContainerRef}
                            onKeyDown={(e) => handleKeyDown(e, 'month')}
                            tabIndex="0"
                            role="listbox"
                            aria-label="Months"
                        >
                            {monthNames.map((month, index) => (
                                <div
                                    key={month}
                                    className={`picker-item ${selectedMonthIndex === index ? 'selected' : ''}`}
                                    onClick={() => handleMonthSelect(index)}
                                    role="option"
                                    aria-selected={selectedMonthIndex === index}
                                >
                                    {month}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="picker-column">
                        <div 
                            className="picker-list" 
                            ref={yearContainerRef}
                            onKeyDown={(e) => handleKeyDown(e, 'year')}
                            tabIndex="0"
                            role="listbox"
                            aria-label="Years"
                        >
                            {years.map((year) => (
                                <div
                                    key={year}
                                    className={`picker-item ${selectedYear === year ? 'selected' : ''}`}
                                    onClick={() => handleYearSelect(year)}
                                    role="option"
                                    aria-selected={selectedYear === year}
                                >
                                    {year}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="picker-actions">
                    <button className="picker-btn cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="picker-btn confirm" onClick={handleConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MonthPicker;
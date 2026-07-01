import React, { useState, useRef, useEffect } from 'react';
import './MonthPicker.css';

const MonthPicker = ({
    currentMonth,
    currentYear,
    onConfirm,
    onCancel
}) => {
    // State for selected month and year
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // Refs for scroll containers
    const monthContainerRef = useRef(null);
    const yearContainerRef = useRef(null);

    // Month names
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Years range (current year - 5 to +5)
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    // Scroll to selected item when picker opens
    useEffect(() => {
        // Small delay to ensure DOM is rendered
        setTimeout(() => {
            // Scroll to selected month
            if (monthContainerRef.current) {
                const monthIndex = months.indexOf(selectedMonth);
                const monthItem = monthContainerRef.current.children[monthIndex];
                if (monthItem) {
                    monthItem.scrollIntoView({ block: 'center', behavior: 'auto' });
                }
            }

            // Scroll to selected year
            if (yearContainerRef.current) {
                const yearIndex = years.indexOf(selectedYear);
                const yearItem = yearContainerRef.current.children[yearIndex];
                if (yearItem) {
                    yearItem.scrollIntoView({ block: 'center', behavior: 'auto' });
                }
            }
        }, 50);
    }, [months, selectedMonth, selectedYear, years]);

    const handleMonthSelect = (month) => {
        setSelectedMonth(month);
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
    };

    const handleConfirm = () => {
        onConfirm(selectedMonth, selectedYear);
    };

    // Keyboard arrow support with smooth scrolling
    const handleKeyDown = (e, type) => {
        if (type === 'month') {
            const currentIndex = months.indexOf(selectedMonth);
            if (e.key === 'ArrowDown' && currentIndex < months.length - 1) {
                e.preventDefault();
                const newIndex = currentIndex + 1;
                setSelectedMonth(months[newIndex]);
                scrollToItem(monthContainerRef, newIndex);
            } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                e.preventDefault();
                const newIndex = currentIndex - 1;
                setSelectedMonth(months[newIndex]);
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
        <div className="month-picker-overlay" onClick={(e) => {
            // Close when clicking outside the modal
            if (e.target === e.currentTarget) {
                onCancel();
            }
        }}>
            <div className="month-picker-modal">
                <h3 className="picker-title">Select Month &amp; Year</h3>

                <div className="picker-content">
                    {/* Months List */}
                    <div className="picker-column">
                        <div 
                            className="picker-list" 
                            ref={monthContainerRef}
                            onKeyDown={(e) => handleKeyDown(e, 'month')}
                            tabIndex="0"
                            role="listbox"
                            aria-label="Months"
                        >
                            {months.map((month) => (
                                <div
                                    key={month}
                                    className={`picker-item ${selectedMonth === month ? 'selected' : ''}`}
                                    onClick={() => handleMonthSelect(month)}
                                    role="option"
                                    aria-selected={selectedMonth === month}
                                >
                                    {month}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Years List */}
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
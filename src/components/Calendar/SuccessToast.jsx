// src/components/Calendar/SuccessToast.jsx
import React, { useEffect, useState } from 'react';
import './SuccessToast.css';

const SuccessToast = ({ 
  message, 
  onDismiss, 
  duration = 3000 
}) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!message) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [message, duration, onDismiss]);

  const handleDismiss = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleContainerClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  if (!message || !isVisible) return null;

  return (
    <div 
      className="success-toast" 
      onClick={handleContainerClick}
      onMouseDown={handleContainerClick}
      onTouchStart={handleContainerClick}
    >
      <div className="success-toast-content">
        <div className="success-toast-message">
          <span className="material-icons" style={{ fontSize: '20px', marginRight: '8px' }}>
            check_circle
          </span>
          <span>{message}</span>
        </div>
        <div className="success-toast-actions">
          <button 
            className="success-toast-close-btn" 
            onClick={handleDismiss}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
      </div>
      <div 
        className="success-toast-progress" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default SuccessToast;
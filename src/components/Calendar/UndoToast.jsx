import React, { useEffect, useState } from 'react';
import './UndoToast.css';

const UndoToast = ({ 
  message, 
  onUndo, 
  onDismiss, 
  duration = 10000 
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

  const handleUndo = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsVisible(false);
    setTimeout(() => {
      onUndo();
      onDismiss();
    }, 300);
  };

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
      className="undo-toast" 
      onClick={handleContainerClick}
      onMouseDown={handleContainerClick}
      onTouchStart={handleContainerClick}
    >
      <div className="undo-toast-content">
        <div className="undo-toast-message">
          <span className="material-icons" style={{ fontSize: '20px', marginRight: '8px' }}>
            delete_outline
          </span>
          <span>{message}</span>
        </div>
        <div className="undo-toast-actions">
          <button 
            className="undo-toast-undo-btn" 
            onClick={handleUndo}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            Undo
          </button>
          <button 
            className="undo-toast-close-btn" 
            onClick={handleDismiss}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
      </div>
      <div 
        className="undo-toast-progress" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default UndoToast;
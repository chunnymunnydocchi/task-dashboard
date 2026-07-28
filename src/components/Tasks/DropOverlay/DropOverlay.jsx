// src/components/Tasks/DropOverlay/DropOverlay.jsx

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import './DropOverlay.css';

const DropOverlay = ({ 
  isVisible, 
  isOver,
  isMobile = false,
  position = 'timeline' // 'timeline' or 'taskboard'
}) => {
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: 'timeline-drop-zone',
    data: {
      type: 'timeline',
      accepts: ['task-board-card']
    }
  });

  if (!isVisible) return null;

  const overlayClass = `drop-overlay ${(isOver || isDroppableOver) ? 'drag-over' : ''} ${isMobile ? 'mobile' : ''} ${position === 'taskboard' ? 'taskboard-position' : ''} ${isVisible ? 'visible' : ''}`;

  return (
    <div 
      ref={setNodeRef}
      className={overlayClass}
    >
      <div className="drop-overlay-content">
        <span className="material-icons drop-overlay-icon">⬆</span>
        <div className="drop-overlay-text">
          <span className="drop-overlay-title">Drag Here to Move to Timeline</span>
          <span className="drop-overlay-subtitle">Release to set a time for this task</span>
        </div>
      </div>
      {/* Arrow indicator pointing down to the cards */}
      <div className="drop-arrow-indicator" />
    </div>
  );
};

export default DropOverlay;
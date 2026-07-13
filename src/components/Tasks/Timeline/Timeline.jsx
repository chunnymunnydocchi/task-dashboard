// src/components/Tasks/Timeline/Timeline.jsx
import React, { useMemo, useState } from 'react';
import TimelinePhase from './TimelinePhase';
import './Timeline.css';

const PHASES = [
  { id: 'midnight', label: 'Midnight', icon: '🌙', range: '12AM - 6AM', start: 0, end: 6 },
  { id: 'morning', label: 'Morning', icon: '🌅', range: '6AM - 12PM', start: 6, end: 12 },
  { id: 'afternoon', label: 'Afternoon', icon: '🌞', range: '12PM - 6PM', start: 12, end: 18 },
  { id: 'evening', label: 'Evening', icon: '🌙', range: '6PM - 12AM', start: 18, end: 24 },
];

const Timeline = ({
  tasks = [],
  onViewTask,
  onEditTask,
  onDeleteTask,
  highlightedTaskId = null
}) => {
  const [collapsedPhases, setCollapsedPhases] = useState({});

  // Group tasks by phase
  const groupedTasks = useMemo(() => {
    const groups = PHASES.map(phase => ({
      ...phase,
      tasks: []
    }));

    const timedTasks = tasks.filter(task => task.timeSchedule?.start);

    timedTasks.forEach(task => {
      const hour = parseInt(task.timeSchedule.start.split(':')[0]);
      const phase = PHASES.find(p => hour >= p.start && hour < p.end);
      if (phase) {
        const group = groups.find(g => g.id === phase.id);
        if (group) {
          group.tasks.push(task);
        }
      }
    });

    // Sort tasks by start time within each phase
    groups.forEach(group => {
      group.tasks.sort((a, b) => {
        return a.timeSchedule.start.localeCompare(b.timeSchedule.start);
      });
    });

    return groups;
  }, [tasks]);

  const totalTimedTasks = tasks.filter(t => t.timeSchedule?.start).length;

  const handleToggleCollapse = (phaseId, isCollapsed) => {
    setCollapsedPhases(prev => ({
      ...prev,
      [phaseId]: isCollapsed
    }));
  };

  if (totalTimedTasks === 0) {
    return (
      <div className="timeline-container">
        <div className="timeline-empty">
          <span className="material-icons">event_note</span>
          <span>No timed tasks for this day</span>
          <span className="empty-hint">Add a task with a time to see it here</span>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <div className="timeline-phases">
        {groupedTasks.map(phase => (
          <TimelinePhase
            key={phase.id}
            phase={phase}
            tasks={phase.tasks}
            onViewTask={onViewTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            highlightedTaskId={highlightedTaskId}
            isCollapsed={collapsedPhases[phase.id] || false}
            onToggleCollapse={handleToggleCollapse}
          />
        ))}
      </div>
    </div>
  );
};

export default Timeline;
// Abstract storage service for tasks
// Currently uses localStorage, but can be swapped for API calls later

const TASKS_KEY = 'task_calendar_tasks';

// Get all tasks from storage
export const getTasks = () => {
  try {
    const tasks = localStorage.getItem(TASKS_KEY);
    return tasks ? JSON.parse(tasks) : {};
  } catch (error) {
    console.error('Error loading tasks:', error);
    return {};
  }
};

// Save all tasks to storage
export const saveTasks = (tasks) => {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('Error saving tasks:', error);
    return false;
  }
};

// Get tasks for a specific date
export const getTasksForDate = (date) => {
  const allTasks = getTasks();
  const dateKey = formatDateKey(date);
  return allTasks[dateKey] || [];
};

// Add a task to a specific date
export const addTask = (date, taskText) => {
  const allTasks = getTasks();
  const dateKey = formatDateKey(date);
  
  if (!allTasks[dateKey]) {
    allTasks[dateKey] = [];
  }
  
  allTasks[dateKey].push(taskText);
  return saveTasks(allTasks);
};

// Remove a task from a specific date
export const removeTask = (date, taskIndex) => {
  const allTasks = getTasks();
  const dateKey = formatDateKey(date);
  
  if (allTasks[dateKey]) {
    allTasks[dateKey].splice(taskIndex, 1);
    // If no tasks left for this date, remove the key
    if (allTasks[dateKey].length === 0) {
      delete allTasks[dateKey];
    }
    return saveTasks(allTasks);
  }
  return false;
};

// Update a task
export const updateTask = (date, taskIndex, newText) => {
  const allTasks = getTasks();
  const dateKey = formatDateKey(date);
  
  if (allTasks[dateKey] && allTasks[dateKey][taskIndex]) {
    allTasks[dateKey][taskIndex] = newText;
    return saveTasks(allTasks);
  }
  return false;
};

// Format date to string key (YYYY-MM-DD)
export const formatDateKey = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Check if a date has tasks
export const hasTasks = (date) => {
  const tasks = getTasksForDate(date);
  return tasks.length > 0;
};

// Get all dates that have tasks
export const getDatesWithTasks = () => {
  const allTasks = getTasks();
  return Object.keys(allTasks);
};
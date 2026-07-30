// src/hooks/useTasksSupabase.js
import { useState, useEffect, useCallback } from 'react';
import * as taskService from '../services/taskServiceSupabase';

export const useTasksSupabase = () => {
    const [tasks, setTasks] = useState({});
    const [loading, setLoading] = useState(true);
    const [allDatesLoaded, setAllDatesLoaded] = useState(false);

    // Track deleted tasks for undo
    const [lastDeletedTask, setLastDeletedTask] = useState(null);
    const [lastDeletedDateKey, setLastDeletedDateKey] = useState(null);

    // Helper: Format date
    const formatDateKey = useCallback((date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    // Get tasks for a specific date (returns cached data immediately)
    const getTasksForDate = useCallback((date) => {
        const dateKey = formatDateKey(date);
        return tasks[dateKey] || [];
    }, [tasks, formatDateKey]);

    // Load tasks from database (called by components when needed)
    const loadTasksForDate = useCallback(async (date) => {
        const dateKey = formatDateKey(date);
        const tasksData = await taskService.getTasksForDate(date);
        setTasks(prev => ({ ...prev, [dateKey]: tasksData }));
        return tasksData;
    }, [formatDateKey]);

    // ✅ NEW: Load all dates with tasks (for DatePicker indicators)
    const loadAllDatesWithTasks = useCallback(async () => {
        try {
            const datesWithTasks = await taskService.getDatesWithTasks();
            
            const loadPromises = datesWithTasks.map(async (dateKey) => {
                const dateObj = new Date(dateKey + 'T00:00:00');
                const tasksData = await taskService.getTasksForDate(dateObj);
                return { dateKey, tasks: tasksData };
            });
            
            const results = await Promise.all(loadPromises);
            
            setTasks(prev => {
                const newState = { ...prev };
                results.forEach(({ dateKey, tasks: tasksData }) => {
                    newState[dateKey] = tasksData;
                });
                return newState;
            });
            
            setAllDatesLoaded(true);
            console.log('✅ Loaded all dates with tasks:', datesWithTasks);
            return datesWithTasks;
        } catch (error) {
            console.error('❌ Failed to load all dates with tasks:', error);
            return [];
        }
    }, []);

    // ✅ FIXED: Get task count - SYNC (uses cached data)
    const getTaskCount = useCallback((date) => {
        const dateKey = formatDateKey(date);
        const dateTasks = tasks[dateKey] || [];
        return dateTasks.length;
    }, [tasks, formatDateKey]);

    // ✅ FIXED: Get completed count - SYNC (uses cached data)
    const getCompletedCount = useCallback((date) => {
        const dateKey = formatDateKey(date);
        const dateTasks = tasks[dateKey] || [];
        return dateTasks.filter(task => task.completed).length;
    }, [tasks, formatDateKey]);

    // ✅ FIXED: Check if date has tasks - SYNC (uses cached data)
    const hasTasks = useCallback((date) => {
        const dateKey = formatDateKey(date);
        const dateTasks = tasks[dateKey] || [];
        return dateTasks.length > 0;
    }, [tasks, formatDateKey]);

    // Add a task
    const addTask = useCallback(async (date, taskData) => {
        const newTask = await taskService.addTask(date, taskData);
        if (newTask) {
            const dateKey = formatDateKey(date);
            const currentTasks = tasks[dateKey] || [];
            setTasks(prev => ({
                ...prev,
                [dateKey]: [...currentTasks, newTask]
            }));
            return true;
        }
        return false;
    }, [tasks, formatDateKey]);

    // Update a task
    const updateTask = useCallback(async (date, taskId, updates) => {
        const updatedTask = await taskService.updateTask(date, taskId, updates);
        if (updatedTask) {
            const dateKey = formatDateKey(date);
            const currentTasks = tasks[dateKey] || [];
            const updatedTasks = currentTasks.map(t =>
                t.id === taskId ? updatedTask : t
            );
            setTasks(prev => ({
                ...prev,
                [dateKey]: updatedTasks
            }));
            return true;
        }
        return false;
    }, [tasks, formatDateKey]);

    // Toggle task completion
    const toggleTask = useCallback(async (date, taskId) => {
        const dateKey = formatDateKey(date);
        const currentTasks = tasks[dateKey] || [];
        const task = currentTasks.find(t => t.id === taskId);

        if (task) {
            const updatedTask = await taskService.toggleTask(taskId, task.completed);
            if (updatedTask) {
                const updatedTasks = currentTasks.map(t =>
                    t.id === taskId ? updatedTask : t
                );
                setTasks(prev => ({
                    ...prev,
                    [dateKey]: updatedTasks
                }));
                return true;
            }
        }
        return false;
    }, [tasks, formatDateKey]);

    // Delete a task with undo tracking
    const removeTaskById = useCallback(async (date, taskId) => {
        const dateKey = formatDateKey(date);
        const currentTasks = tasks[dateKey] || [];
        const taskToDelete = currentTasks.find(t => t.id === taskId);

        if (taskToDelete) {
            const deletedTask = { ...taskToDelete };
            const deletedDateKey = dateKey;

            const success = await taskService.deleteTask(taskId);
            if (success) {
                const updatedTasks = currentTasks.filter(t => t.id !== taskId);
                setTasks(prev => ({
                    ...prev,
                    [dateKey]: updatedTasks
                }));

                setLastDeletedTask(deletedTask);
                setLastDeletedDateKey(deletedDateKey);

                return true;
            }
        }
        return false;
    }, [tasks, formatDateKey]);

    // Restore deleted task
    const restoreDeletedTask = useCallback(async (dateKey, taskData) => {
        if (!taskData || !dateKey) {
            console.log('❌ No task to restore - missing data');
            return false;
        }

        console.log('🔄 Attempting to restore task:', taskData.title);

        try {
            const dateObj = new Date(dateKey + 'T00:00:00');
            
            const restoredTask = await taskService.addTask(dateObj, taskData);

            if (restoredTask) {
                console.log('✅ Task restored in Supabase:', restoredTask);

                setTasks(prev => {
                    const currentTasks = prev[dateKey] || [];
                    const taskExists = currentTasks.some(t => t.id === restoredTask.id);
                    if (taskExists) {
                        return {
                            ...prev,
                            [dateKey]: currentTasks.map(t => 
                                t.id === restoredTask.id ? restoredTask : t
                            )
                        };
                    }
                    return {
                        ...prev,
                        [dateKey]: [...currentTasks, restoredTask]
                    };
                });

                setLastDeletedTask(null);
                setLastDeletedDateKey(null);

                console.log('🎉 Task restored successfully');
                return true;
            } else {
                console.log('❌ Failed to restore task - addTask returned false');
                return false;
            }
        } catch (error) {
            console.error('❌ Failed to restore task:', error);
            return false;
        }
    }, []);

    // Clear deleted task data
    const clearDeletedTask = useCallback(() => {
        console.log('Clearing deleted task data');
        setLastDeletedTask(null);
        setLastDeletedDateKey(null);
    }, []);

    // Undo last deletion
    const undoLastDeletion = useCallback(async () => {
        const taskToRestore = lastDeletedTask;
        const dateKeyToRestore = lastDeletedDateKey;

        if (!taskToRestore || !dateKeyToRestore) {
            console.log('No task to undo');
            return false;
        }

        return await restoreDeletedTask(dateKeyToRestore, taskToRestore);
    }, [lastDeletedTask, lastDeletedDateKey, restoreDeletedTask]);

    // Load initial data - load ALL dates with tasks
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await loadAllDatesWithTasks();
            setLoading(false);
        };
        loadInitialData();
    }, [loadAllDatesWithTasks]);

    return {
        tasks,
        loading,
        allDatesLoaded,
        getTasksForDate,
        loadTasksForDate,
        loadAllDatesWithTasks,
        getTaskCount,      
        getCompletedCount,   
        hasTasks,           
        addTask,
        updateTask,
        toggleTask,
        removeTaskById,
        restoreDeletedTask,
        clearDeletedTask,
        undoLastDeletion,
        lastDeletedTask,
        lastDeletedDateKey,
    };
};
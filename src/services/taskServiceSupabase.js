// src/services/taskServiceSupabase.js
import { supabase } from './supabaseClient';

// Helper: Format date to YYYY-MM-DD
const formatDateKey = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Generate a unique ID for tasks
const generateTaskId = () => {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Convert database task to app task format
const convertToAppTask = (dbTask) => {
    if (!dbTask) return null;
    return {
        id: dbTask.id,
        title: dbTask.title,
        description: dbTask.description || '',
        date: dbTask.date,
        timeSchedule: dbTask.start_time ? {
            start: dbTask.start_time,
            end: dbTask.end_time || ''
        } : null,
        priority: dbTask.priority || 'normal',
        completed: dbTask.completed || false,
        createdAt: dbTask.created_at,
        updatedAt: dbTask.updated_at
    };
};

// ADD a new task - FIXED: Include generated ID
export const addTask = async (date, taskData) => {
    try {
        const dateKey = formatDateKey(date);

        // Generate a unique ID for the task
        const taskId = taskData.id || generateTaskId();

        const taskToAdd = {
            id: taskId,  // ✅ ADD THIS - include the ID
            title: taskData.title,
            description: taskData.description || '',
            priority: taskData.priority || 'normal',
            completed: taskData.completed || false,
            start_time: taskData.timeSchedule?.start || null,
            end_time: taskData.timeSchedule?.end || null,
            date: dateKey,
        };

        console.log('📦 Adding task to Supabase:', taskToAdd);

        const { data, error } = await supabase
            .from('tasks')
            .insert([taskToAdd])
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase insert error:', error);
            return null;
        }

        console.log('✅ Task added to Supabase:', data);

        return convertToAppTask(data);
    } catch (error) {
        console.error('❌ Error adding task:', error);
        return null;
    }
};

// UPDATE a task
export const updateTask = async (date, taskId, updates) => {
    const dateKey = formatDateKey(date);

    const updateData = {
        title: updates.title,
        description: updates.description || '',
        date: dateKey,
        start_time: updates.timeSchedule?.start || null,
        end_time: updates.timeSchedule?.end || null,
        priority: updates.priority || 'normal',
        completed: updates.completed || false,
        updated_at: new Date().toISOString()
    };

    console.log('📦 Updating task in Supabase:', updateData);

    const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select();

    if (error) {
        console.error('Error updating task:', error);
        return null;
    }

    return data[0] ? convertToAppTask(data[0]) : null;
};

// TOGGLE task completion
export const toggleTask = async (taskId, currentStatus) => {
    const { data, error } = await supabase
        .from('tasks')
        .update({
            completed: !currentStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select();

    if (error) {
        console.error('Error toggling task:', error);
        return null;
    }

    return data[0] ? convertToAppTask(data[0]) : null;
};

// DELETE a task
export const deleteTask = async (taskId) => {
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

    if (error) {
        console.error('Error deleting task:', error);
        return false;
    }

    return true;
};

// GET all tasks for a specific date
export const getTasksForDate = async (date) => {
    const dateKey = formatDateKey(date);

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('date', dateKey)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }

    return data.map(convertToAppTask);
};

// GET task count for a date
export const getTaskCount = async (date) => {
    const dateKey = formatDateKey(date);

    const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('date', dateKey);

    if (error) {
        console.error('Error getting task count:', error);
        return 0;
    }

    return count || 0;
};

// GET completed count for a date
export const getCompletedCount = async (date) => {
    const dateKey = formatDateKey(date);

    const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('date', dateKey)
        .eq('completed', true);

    if (error) {
        console.error('Error getting completed count:', error);
        return 0;
    }

    return count || 0;
};

// CHECK if date has tasks
export const hasTasks = async (date) => {
    const count = await getTaskCount(date);
    return count > 0;
};

// GET all dates that have tasks
export const getDatesWithTasks = async () => {
    const { data, error } = await supabase
        .from('tasks')
        .select('date')
        .order('date');

    if (error) {
        console.error('Error getting dates with tasks:', error);
        return [];
    }

    const uniqueDates = [...new Set(data.map(item => item.date))];
    return uniqueDates;
};
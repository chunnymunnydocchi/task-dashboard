// src/contexts/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import SuccessToast from '../components/Calendar/SuccessToast';
import UndoToast from '../components/Calendar/UndoToast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const hideToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', options = {}) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const { duration = type === 'undo' ? 10000 : 3000, onUndo = null } = options;

    // Create toast object
    const toast = {
      id,
      message,
      type,
      duration,
      onUndo, // Only used for undo type
      createdAt: Date.now()
    };

    // Update toasts - replace existing toast of same type
    setToasts(prev => {
      // Remove all toasts of the same type
      const filtered = prev.filter(t => t.type !== type);
      // Add new toast
      return [...filtered, toast];
    });

    // Auto-dismiss for success toasts only
    // Undo toasts require user action or timeout
    if (type !== 'undo') {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }

    return id;
  }, [hideToast]);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    showToast,
    hideToast,
    clearToasts,
    toasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toasts are rendered here - NO CONTAINER DIV WITH POSITIONING */}
      {/* Each toast component positions itself */}
      {toasts.map(toast => {
        if (toast.type === 'undo') {
          return (
            <UndoToast
              key={toast.id}
              message={toast.message}
              onUndo={() => {
                if (toast.onUndo) {
                  toast.onUndo();
                }
                hideToast(toast.id);
              }}
              onDismiss={() => hideToast(toast.id)}
              duration={toast.duration}
            />
          );
        }
        return (
          <SuccessToast
            key={toast.id}
            message={toast.message}
            onDismiss={() => hideToast(toast.id)}
            duration={toast.duration}
          />
        );
      })}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
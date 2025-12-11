/**
 * @file contexts/NotificationContext.tsx
 * @fileoverview Global notification context for consistent CRUD notifications.
 * 
 * This context provides a centralized way to show notifications across the application
 * with a consistent look and behavior.
 */

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import NotificationModal from '@/components/ui/NotificationModal';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  isOpen: boolean;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: NotificationType, duration = 4000) => {
    setNotification({ isOpen: true, message, type });
    
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  const showSuccess = (message: string, duration = 4000) => {
    showNotification(message, 'success', duration);
  };

  const showError = (message: string, duration = 4000) => {
    showNotification(message, 'error', duration);
  };

  const showInfo = (message: string, duration = 4000) => {
    showNotification(message, 'info', duration);
  };

  const showWarning = (message: string, duration = 4000) => {
    showNotification(message, 'warning', duration);
  };

  return (
    <NotificationContext.Provider
      value={{ showNotification, showSuccess, showError, showInfo, showWarning }}
    >
      {children}
      
      {/* Global Notification Modal */}
      {notification && (
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={() => setNotification(null)}
          message={notification.message}
          type={notification.type}
          duration={4000}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
import { useState, useCallback } from 'react';
import { NotificationData, NotificationType } from '../components/NotificationPopup';

let notificationId = 0;

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      duration?: number;
      autoClose?: boolean;
    }
  ) => {
    const id = `notification-${++notificationId}`;
    const notification: NotificationData = {
      id,
      type,
      title,
      message,
      duration: options?.duration || 3000,
      autoClose: options?.autoClose !== false,
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message: string, options?: { duration?: number; autoClose?: boolean }) => {
    return showNotification('success', title, message, options);
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, options?: { duration?: number; autoClose?: boolean }) => {
    return showNotification('error', title, message, options);
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, options?: { duration?: number; autoClose?: boolean }) => {
    return showNotification('warning', title, message, options);
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, options?: { duration?: number; autoClose?: boolean }) => {
    return showNotification('info', title, message, options);
  }, [showNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
  };
};

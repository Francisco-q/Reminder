import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services';
import type { UserNotification } from '../types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getUserNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const updatedNotification = await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? updatedNotification : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      return updatedNotification;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al marcar como leída';
      setError(errorMessage);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al marcar todas como leídas';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
      // Si la notificación no estaba leída, reducir el contador
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar notificación';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated]);

  // Actualizar notificaciones cada 30 segundos si hay usuario autenticado
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      notificationService.getUnreadCount()
        .then(count => setUnreadCount(count))
        .catch(console.error);
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError: () => setError(null),
  };
};

export const useUnreadNotifications = () => {
  const [unreadNotifications, setUnreadNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchUnreadNotifications = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getUnreadNotifications();
      setUnreadNotifications(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar notificaciones no leídas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
  }, [isAuthenticated]);

  return {
    unreadNotifications,
    loading,
    error,
    refetch: fetchUnreadNotifications,
    clearError: () => setError(null),
  };
};

export const useNotificationPermissions = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    try {
      setLoading(true);
      const granted = await notificationService.requestNotificationPermission();
      setPermission(granted);
      return granted === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return {
    permission,
    loading,
    requestPermission,
    checkPermission,
    isSupported: 'Notification' in window,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
  };
};

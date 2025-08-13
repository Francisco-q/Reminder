import type {
  NotificationPreferences,
  NotificationTemplate,
  PaginatedResponse,
  UserNotification
} from '../types';
import { apiService } from './apiService';

export class NotificationService {
  // Notificaciones del usuario
  async getUserNotifications(): Promise<UserNotification[]> {
    const response = await apiService.get<PaginatedResponse<UserNotification>>('/notifications/');
    return response.results;
  }

  async getUnreadNotifications(): Promise<UserNotification[]> {
    const response = await apiService.get<PaginatedResponse<UserNotification>>('/notifications/?is_read=false');
    return response.results;
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<{ count: number }>('/notifications/unread_count/');
    return response.count;
  }

  // Marcar notificaciones como leídas
  async markAsRead(notificationId: string): Promise<UserNotification> {
    return apiService.post<UserNotification>(`/notifications/${notificationId}/mark_read/`);
  }

  async markAllAsRead(): Promise<void> {
    await apiService.post('/notifications/mark_all_read/');
  }

  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    await apiService.post('/notifications/mark_multiple_read/', {
      notification_ids: notificationIds
    });
  }

  // Eliminar notificaciones
  async deleteNotification(notificationId: string): Promise<void> {
    await apiService.delete(`/notifications/${notificationId}/`);
  }

  async deleteAllRead(): Promise<void> {
    await apiService.delete('/notifications/delete_read/');
  }

  // Configuración de notificaciones
  async getNotificationSettings(): Promise<NotificationPreferences> {
    return apiService.get<NotificationPreferences>('/notifications/settings/');
  }

  async updateNotificationSettings(settings: NotificationPreferences): Promise<NotificationPreferences> {
    return apiService.put<NotificationPreferences>('/notifications/settings/', settings);
  }

  // Plantillas de notificaciones
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    const response = await apiService.get<PaginatedResponse<NotificationTemplate>>('/notifications/templates/');
    return response.results;
  }

  // Crear notificación personalizada
  async createNotification(notificationData: {
    title: string;
    message: string;
    notification_type: string;
    scheduled_time?: string;
    data?: Record<string, any>;
  }): Promise<UserNotification> {
    return apiService.post<UserNotification>('/notifications/create/', notificationData);
  }

  // Programar recordatorio de medicamento
  async scheduleReminderNotification(data: {
    medication_id: string;
    scheduled_time: string;
    custom_message?: string;
  }): Promise<UserNotification> {
    return apiService.post<UserNotification>('/notifications/schedule_reminder/', data);
  }

  // Notificaciones push
  async registerPushToken(token: string, deviceType: 'web' | 'android' | 'ios'): Promise<void> {
    await apiService.post('/notifications/register_push_token/', {
      token,
      device_type: deviceType
    });
  }

  async unregisterPushToken(): Promise<void> {
    await apiService.post('/notifications/unregister_push_token/');
  }

  // Utilidades para notificaciones web
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Este navegador no soporta notificaciones');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  showLocalNotification(title: string, options?: NotificationOptions): Notification | null {
    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
    return null;
  }

  // Programar notificación local
  scheduleLocalNotification(title: string, message: string, scheduledTime: Date): void {
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(() => {
        this.showLocalNotification(title, {
          body: message,
          tag: `medication-reminder-${Date.now()}`,
          requireInteraction: true
        });
      }, delay);
    }
  }

  // Filtrar notificaciones
  filterNotificationsByType(notifications: UserNotification[], type: string): UserNotification[] {
    return notifications.filter(n => n.notification_type === type);
  }

  sortNotificationsByDate(notifications: UserNotification[], ascending = false): UserNotification[] {
    return notifications.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return ascending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
  }

  // Formatear notificaciones para mostrar
  formatNotificationTime(notification: UserNotification): string {
    const date = new Date(notification.created_at);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `hace ${diffMins} minutos`;
    } else if (diffHours < 24) {
      return `hace ${diffHours} horas`;
    } else if (diffDays < 7) {
      return `hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES');
    }
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'medication_reminder': '💊',
      'stock_alert': '⚠️',
      'general': '📢',
      'system': '⚙️'
    };
    return icons[type] || '📢';
  }

  getNotificationColor(type: string): string {
    const colors: Record<string, string> = {
      'medication_reminder': 'text-blue-600',
      'stock_alert': 'text-yellow-600',
      'general': 'text-green-600',
      'system': 'text-gray-600'
    };
    return colors[type] || 'text-gray-600';
  }
}

export const notificationService = new NotificationService();

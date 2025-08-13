import { PermissionsAndroid, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import { Medication } from '../types/index';

export class NotificationService {
    static initialize(): void {
        PushNotification.configure({
            onRegister: (token: any) => {
                console.log('TOKEN:', token);
            },
            onNotification: (notification: any) => {
                console.log('NOTIFICATION:', notification);
            },
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            popInitialNotification: true,
            requestPermissions: Platform.OS === 'ios',
        });

        // Crear canal de notificación para Android
        PushNotification.createChannel(
            {
                channelId: 'medication-reminders',
                channelName: 'Recordatorios de Medicamentos',
                channelDescription: 'Notificaciones para recordar tomar medicamentos',
                playSound: true,
                soundName: 'default',
                importance: 4,
                vibrate: true,
            },
            (created: any) => console.log(`Canal creado: ${created}`)
        );
    }

    static async requestPermissions(): Promise<boolean> {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    }

    static scheduleNotification(medication: Medication, time: string): void {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const scheduledDate = new Date();
        scheduledDate.setHours(hours, minutes, 0, 0);

        // Si la hora ya pasó hoy, programar para mañana
        if (scheduledDate <= now) {
            scheduledDate.setDate(scheduledDate.getDate() + 1);
        }

        PushNotification.localNotificationSchedule({
            id: `${medication.id}-${time}`,
            channelId: 'medication-reminders',
            title: '💊 Hora de tu medicamento',
            message: `${medication.name} - ${medication.dosage}`,
            date: scheduledDate,
            repeatType: 'day',
            actions: ['Tomado', 'Posponer'],
            smallIcon: 'ic_notification',
            largeIcon: 'ic_launcher',
            color: '#007AFF',
            vibrate: true,
            vibration: 300,
            playSound: true,
            soundName: 'default',
        });
    }

    static cancelNotification(medicationId: string, time: string): void {
        PushNotification.cancelLocalNotifications({
            id: `${medicationId}-${time}`,
        });
    }

    static cancelAllNotificationsForMedication(medicationId: string): void {
        // Esta es una implementación simplificada
        // En una app real, necesitarías trackear todos los IDs de notificación
        PushNotification.cancelAllLocalNotifications();
    }

    static scheduleAllNotifications(medications: Medication[]): void {
        // Cancelar todas las notificaciones existentes
        PushNotification.cancelAllLocalNotifications();

        // Programar nuevas notificaciones
        medications.forEach(medication => {
            medication.times.forEach(time => {
                this.scheduleNotification(medication, time);
            });
        });
    }

    static showInstantNotification(title: string, message: string): void {
        PushNotification.localNotification({
            channelId: 'medication-reminders',
            title,
            message,
            playSound: true,
            soundName: 'default',
        });
    }
}

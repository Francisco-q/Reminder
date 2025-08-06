// Archivo de tipos para react-native-push-notification
declare module 'react-native-push-notification' {
  interface PushNotificationOptions {
    onRegister?: (token: any) => void;
    onNotification?: (notification: any) => void;
    permissions?: {
      alert?: boolean;
      badge?: boolean;
      sound?: boolean;
    };
    popInitialNotification?: boolean;
    requestPermissions?: boolean;
  }

  interface ChannelObject {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    playSound?: boolean;
    soundName?: string;
    importance?: number;
    vibrate?: boolean;
  }

  interface NotificationObject {
    id?: string;
    channelId?: string;
    title?: string;
    message?: string;
    date?: Date;
    repeatType?: string;
    actions?: string[];
    smallIcon?: string;
    largeIcon?: string;
    color?: string;
    vibrate?: boolean;
    vibration?: number;
    playSound?: boolean;
    soundName?: string;
  }

  class PushNotification {
    static configure(options: PushNotificationOptions): void;
    static createChannel(channel: ChannelObject, callback?: (created: boolean) => void): void;
    static localNotification(notification: NotificationObject): void;
    static localNotificationSchedule(notification: NotificationObject): void;
    static cancelLocalNotifications(options: { id: string }): void;
    static cancelAllLocalNotifications(): void;
  }

  export default PushNotification;
}

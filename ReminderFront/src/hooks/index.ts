// Hook principal para exportar todos los hooks
export { useMedications, useMedication, useLowStockMedications } from './useMedications';
export { 
  useTodaySchedules, 
  useUpcomingSchedules, 
  useTodayProgress, 
  useWeekProgress,
  useSchedulesByDate 
} from './useSchedules';
export { 
  useNotifications, 
  useUnreadNotifications, 
  useNotificationPermissions 
} from './useNotifications';

// Re-exportar hooks del contexto de autenticación
export { useAuth, useIsAuthenticated, useCurrentUser } from '../context/AuthContext';

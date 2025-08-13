// Hook principal para exportar todos los hooks
export { useLowStockMedications, useMedication, useMedications } from './useMedications';
export {
  useNotificationPermissions, useNotifications,
  useUnreadNotifications
} from './useNotifications';
export {
  useSchedulesByDate, useTodayProgress, useTodaySchedules,
  useUpcomingSchedules, useWeekProgress
} from './useSchedules';

// Re-exportar hooks del contexto de autenticación
export { useAuth, useCurrentUser, useIsAuthenticated } from '../context/AuthContext';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { scheduleService } from '../services';
import type { DailySchedule } from '../types';

export const useTodaySchedules = () => {
  const [schedules, setSchedules] = useState<DailySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchTodaySchedules = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const data = await scheduleService.getTodaySchedules();
      setSchedules(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar horarios de hoy');
    } finally {
      setLoading(false);
    }
  };

  const markAsTaken = async (scheduleId: string, notes?: string) => {
    try {
      const updatedSchedule = await scheduleService.markAsTaken(scheduleId, notes);
      setSchedules(prev =>
        prev.map(schedule =>
          schedule.id === scheduleId ? updatedSchedule : schedule
        )
      );
      return updatedSchedule;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al marcar como tomado';
      setError(errorMessage);
      throw err;
    }
  };

  const markAsSkipped = async (scheduleId: string, reason?: string) => {
    try {
      const updatedSchedule = await scheduleService.markAsSkipped(scheduleId, reason);
      setSchedules(prev =>
        prev.map(schedule =>
          schedule.id === scheduleId ? updatedSchedule : schedule
        )
      );
      return updatedSchedule;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al marcar como omitido';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchTodaySchedules();
  }, [isAuthenticated]);

  // Calcular estadísticas localmente
  const stats = {
    total: schedules.length,
    completed: schedules.filter(s => s.taken).length,
    pending: schedules.filter(s => !s.taken && new Date(s.scheduled_time) > new Date()).length,
    overdue: schedules.filter(s => !s.taken && new Date(s.scheduled_time) <= new Date()).length,
    adherence: schedules.length > 0 ? Math.round((schedules.filter(s => s.taken).length / schedules.length) * 100) : 0,
  };

  return {
    schedules,
    stats,
    loading,
    error,
    refetch: fetchTodaySchedules,
    markAsTaken,
    markAsSkipped,
    clearError: () => setError(null),
  };
};

export const useUpcomingSchedules = (hours = 24) => {
  const [schedules, setSchedules] = useState<DailySchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchUpcomingSchedules = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const data = await scheduleService.getUpcomingSchedules(hours);
      setSchedules(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar próximos horarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingSchedules();
  }, [isAuthenticated, hours]);

  return {
    schedules,
    loading,
    error,
    refetch: fetchUpcomingSchedules,
    clearError: () => setError(null),
  };
};

export const useTodayProgress = () => {
  const [progress, setProgress] = useState<{
    total_scheduled: number;
    total_taken: number;
    total_missed: number;
    adherence_percentage: number;
    next_dose?: DailySchedule;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchTodayProgress = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const data = await scheduleService.getTodayProgress();
      setProgress(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar progreso de hoy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayProgress();
  }, [isAuthenticated]);

  return {
    progress,
    loading,
    error,
    refetch: fetchTodayProgress,
    clearError: () => setError(null),
  };
};

export const useWeekProgress = () => {
  const [weekProgress, setWeekProgress] = useState<{
    dates: string[];
    adherence_data: number[];
    total_scheduled: number;
    total_taken: number;
    average_adherence: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchWeekProgress = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const data = await scheduleService.getWeekProgress();
      setWeekProgress(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar progreso semanal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekProgress();
  }, [isAuthenticated]);

  return {
    weekProgress,
    loading,
    error,
    refetch: fetchWeekProgress,
    clearError: () => setError(null),
  };
};

export const useSchedulesByDate = (date: string) => {
  const [schedules, setSchedules] = useState<DailySchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !date) return;

    const fetchSchedulesByDate = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await scheduleService.getSchedulesByDate(date);
        setSchedules(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar horarios por fecha');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedulesByDate();
  }, [isAuthenticated, date]);

  return {
    schedules,
    loading,
    error,
    clearError: () => setError(null),
  };
};

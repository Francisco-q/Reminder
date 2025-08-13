// Formatear fechas
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return dateObj.toLocaleDateString('es-ES', { ...defaultOptions, ...options });
};

export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'hace un momento';
  if (diffMin < 60) return `hace ${diffMin} minuto${diffMin === 1 ? '' : 's'}`;
  if (diffHour < 24) return `hace ${diffHour} hora${diffHour === 1 ? '' : 's'}`;
  if (diffDay < 7) return `hace ${diffDay} día${diffDay === 1 ? '' : 's'}`;
  if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `hace ${weeks} semana${weeks === 1 ? '' : 's'}`;
  }
  if (diffDay < 365) {
    const months = Math.floor(diffDay / 30);
    return `hace ${months} mes${months === 1 ? '' : 'es'}`;
  }
  const years = Math.floor(diffDay / 365);
  return `hace ${years} año${years === 1 ? '' : 's'}`;
};

export const isToday = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

export const isTomorrow = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateObj.toDateString() === tomorrow.toDateString();
};

export const isYesterday = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateObj.toDateString() === yesterday.toDateString();
};

export const getDateDisplayText = (date: string | Date): string => {
  if (isToday(date)) return 'Hoy';
  if (isTomorrow(date)) return 'Mañana';
  if (isYesterday(date)) return 'Ayer';
  return formatDate(date, { weekday: 'long', month: 'short', day: 'numeric' });
};

export const formatTimeUntil = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();

  if (diffMs <= 0) return 'Ya es hora';

  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 60) return `en ${diffMin} min`;
  if (diffHour < 24) return `en ${diffHour}h ${diffMin % 60}m`;
  return `en ${diffDay} día${diffDay === 1 ? '' : 's'}`;
};

// Obtener fecha de hoy en formato YYYY-MM-DD
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Obtener fecha en formato YYYY-MM-DD
export const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Parsear fecha desde string YYYY-MM-DD
export const parseDate = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00');
};

// Obtener rango de fechas para la semana actual
export const getCurrentWeekRange = (): { start: string; end: string } => {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: getDateString(monday),
    end: getDateString(sunday),
  };
};

// Obtener rango de fechas para el mes actual
export const getCurrentMonthRange = (): { start: string; end: string } => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    start: getDateString(firstDay),
    end: getDateString(lastDay),
  };
};

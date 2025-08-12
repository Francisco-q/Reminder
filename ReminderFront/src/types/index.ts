// Tipos de autenticación
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user: User;
  message: string;
}

// Tipos de usuario
export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  timezone: string;
  language: string;
  device_token?: string;
  device_type?: 'android' | 'ios' | 'web';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user: string;
  medical_info?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  reminder_advance_time: number; // en minutos
}

// Tipos de medicamentos
export interface Medication {
  id: string;
  user: string;
  name: string;
  active_ingredient?: string;
  presentation?: string;
  concentration?: string;
  unit: string;
  dosage: string;
  frequency: 'once_daily' | 'twice_daily' | 'three_times' | 'four_times' | 'as_needed' | 'custom';
  times: string[]; // Array de horarios "HH:MM"
  notes?: string;
  color: string;
  medication_type: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'cream' | 'other';
  condition?: string;
  prescriber?: string;
  start_date: string;
  end_date?: string;
  current_stock: number | null;
  stock_alert_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicationHistory {
  id: string;
  medication: string;
  action: 'created' | 'updated' | 'deleted' | 'stock_updated';
  changes: Record<string, any>;
  timestamp: string;
}

// Tipos de horarios
export interface DailySchedule {
  id: string;
  user: string;
  medication: Medication;
  scheduled_time: string; // ISO datetime
  date: string; // YYYY-MM-DD
  taken: boolean;
  taken_at?: string; // ISO datetime
  notes?: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicationDose {
  id: string;
  user: string;
  medication: Medication;
  scheduled_time: string;
  actual_time?: string;
  taken: boolean;
  dose_amount: number;
  notes?: string;
  created_at: string;
}

// Tipos de notificaciones
export interface UserNotification {
  id: string;
  user: string;
  title: string;
  message: string;
  notification_type: 'medication_reminder' | 'stock_alert' | 'general' | 'system';
  scheduled_time?: string;
  sent_at?: string;
  read_at?: string;
  is_read: boolean;
  data?: Record<string, any>;
  created_at: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title_template: string;
  message_template: string;
  notification_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos de analytics
export interface AdherenceStats {
  period: string;
  total_scheduled: number;
  total_taken: number;
  adherence_percentage: number;
  missed_doses: number;
  medications_data: {
    medication_id: string;
    medication_name: string;
    scheduled: number;
    taken: number;
    percentage: number;
  }[];
}

export interface ProgressStats {
  current_streak: number;
  best_streak: number;
  total_doses_taken: number;
  total_medications: number;
  this_week: {
    scheduled: number;
    taken: number;
    percentage: number;
  };
  this_month: {
    scheduled: number;
    taken: number;
    percentage: number;
  };
}

// Tipos de monitoreo
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  components: {
    database: 'up' | 'down';
    api: 'up' | 'down';
    cache?: 'up' | 'down';
    notifications?: 'up' | 'down';
  };
  metrics: {
    users_count: number;
    medications_count: number;
    schedules_today: number;
    response_time_ms: number;
  };
  timestamp: string;
}

export interface FeatureSyncStatus {
  feature_name: string;
  frontend_status: 'implemented' | 'partial' | 'missing';
  backend_status: 'implemented' | 'partial' | 'missing';
  sync_status: 'synced' | 'out_of_sync' | 'unknown';
  last_checked: string;
  issues: string[];
}

// Tipos de API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Tipos de formularios
export interface MedicationFormData {
  name: string;
  active_ingredient?: string;
  presentation?: string;
  concentration?: string;
  unit: string;
  dosage: string;
  frequency: string;
  times: string[];
  notes?: string;
  color: string;
  medication_type: string;
  condition?: string;
  prescriber?: string;
  start_date: string;
  end_date?: string;
  current_stock: number | null;
  stock_alert_threshold: number;
  is_active?: boolean;
}

export interface UserProfileFormData {
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  medical_info?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notification_preferences: NotificationPreferences;
}

// Tipos de estado global
export interface AppState {
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    tokens: AuthTokens | null;
    loading: boolean;
  };
  medications: {
    items: Medication[];
    loading: boolean;
    error: string | null;
  };
  schedules: {
    todaySchedules: DailySchedule[];
    upcomingSchedules: DailySchedule[];
    loading: boolean;
    error: string | null;
  };
  notifications: {
    items: UserNotification[];
    unreadCount: number;
    loading: boolean;
  };
}

// Tipos de colores para medicamentos
export const MEDICATION_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#84cc16', // lime
] as const;

export type MedicationColor = typeof MEDICATION_COLORS[number];

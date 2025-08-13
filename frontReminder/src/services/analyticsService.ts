import type {
  AdherenceStats,
  FeatureSyncStatus,
  ProgressStats,
  SystemHealth
} from '../types';
import { apiService } from './apiService';

export class AnalyticsService {
  // Estadísticas de adherencia
  async getAdherenceStats(period = '30'): Promise<AdherenceStats> {
    return apiService.get<AdherenceStats>(`/analytics/adherence/?period=${period}`);
  }

  async getAdherenceByMedication(medicationId: string, period = '30'): Promise<AdherenceStats> {
    return apiService.get<AdherenceStats>(`/analytics/adherence/?medication_id=${medicationId}&period=${period}`);
  }

  // Estadísticas de progreso
  async getProgressStats(): Promise<ProgressStats> {
    return apiService.get<ProgressStats>('/analytics/progress/');
  }

  async getDetailedProgress(startDate: string, endDate: string): Promise<{
    daily_stats: { date: string; scheduled: number; taken: number; percentage: number }[];
    medication_breakdown: { medication_name: string; total_scheduled: number; total_taken: number; percentage: number }[];
    overall_stats: { total_scheduled: number; total_taken: number; average_adherence: number };
  }> {
    return apiService.get(`/analytics/detailed_progress/?start_date=${startDate}&end_date=${endDate}`);
  }

  // Estadísticas generales
  async getGeneralStats(): Promise<{
    total_medications: number;
    active_medications: number;
    total_doses_today: number;
    completed_doses_today: number;
    current_streak: number;
    best_streak: number;
    adherence_this_week: number;
    adherence_this_month: number;
  }> {
    return apiService.get('/analytics/stats/');
  }

  // Tendencias
  async getAdherenceTrends(days = 30): Promise<{
    dates: string[];
    adherence_percentages: number[];
    trend_direction: 'up' | 'down' | 'stable';
    trend_percentage: number;
  }> {
    return apiService.get(`/analytics/trends/?days=${days}`);
  }

  // Análisis de patrones
  async getMedicationPatterns(medicationId: string): Promise<{
    best_times: string[];
    worst_times: string[];
    day_patterns: Record<string, number>;
    recommendations: string[];
  }> {
    return apiService.get(`/analytics/patterns/?medication_id=${medicationId}`);
  }

  // Reportes
  async generateAdherenceReport(startDate: string, endDate: string, format: 'json' | 'pdf' = 'json'): Promise<any> {
    return apiService.get(`/analytics/reports/adherence/?start_date=${startDate}&end_date=${endDate}&format=${format}`);
  }

  async generateMedicationReport(medicationId: string, period = '30'): Promise<{
    medication_info: any;
    adherence_data: any;
    missed_doses: any;
    stock_history: any;
    recommendations: string[];
  }> {
    return apiService.get(`/analytics/reports/medication/?medication_id=${medicationId}&period=${period}`);
  }

  // Comparaciones
  async compareMonths(month1: string, month2: string): Promise<{
    month1_stats: { month: string; adherence: number; total_doses: number; taken_doses: number };
    month2_stats: { month: string; adherence: number; total_doses: number; taken_doses: number };
    improvement: number;
    best_medications: string[];
    areas_for_improvement: string[];
  }> {
    return apiService.get(`/analytics/compare/?month1=${month1}&month2=${month2}`);
  }

  // Insights y recomendaciones
  async getPersonalInsights(): Promise<{
    insights: {
      type: 'success' | 'warning' | 'info';
      title: string;
      description: string;
      action?: string;
    }[];
    recommendations: {
      category: 'timing' | 'frequency' | 'reminders' | 'general';
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
    }[];
  }> {
    return apiService.get('/analytics/insights/');
  }

  // Utilidades para cálculos locales
  calculateAdherence(scheduled: number, taken: number): number {
    if (scheduled === 0) return 0;
    return Math.round((taken / scheduled) * 100);
  }

  calculateStreak(schedules: any[]): number {
    // Implementar lógica para calcular racha actual
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      const daySchedules = schedules.filter(s => {
        const scheduleDate = new Date(s.date);
        return scheduleDate.toDateString() === checkDate.toDateString();
      });

      if (daySchedules.length === 0) continue;

      const dayAdherence = this.calculateAdherence(
        daySchedules.length,
        daySchedules.filter(s => s.taken).length
      );

      if (dayAdherence >= 80) { // 80% como umbral para "buen día"
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  formatAdherenceColor(percentage: number): string {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }

  getAdherenceLabel(percentage: number): string {
    if (percentage >= 95) return 'Excelente';
    if (percentage >= 85) return 'Muy Bueno';
    if (percentage >= 70) return 'Bueno';
    if (percentage >= 50) return 'Regular';
    return 'Necesita Mejora';
  }

  // Formatear datos para gráficos
  formatChartData(data: any[], xKey: string, yKey: string) {
    return data.map(item => ({
      x: item[xKey],
      y: item[yKey]
    }));
  }

  generateAdherenceChartData(stats: AdherenceStats) {
    return stats.medications_data.map(med => ({
      name: med.medication_name,
      adherence: med.percentage,
      scheduled: med.scheduled,
      taken: med.taken
    }));
  }
}

// Servicio de Monitoreo
export class MonitoringService {
  // Salud del sistema
  async getSystemHealth(): Promise<SystemHealth> {
    return apiService.get<SystemHealth>('/monitoring/health/');
  }

  // Sincronización de características
  async syncFeatures(): Promise<FeatureSyncStatus[]> {
    return apiService.post<FeatureSyncStatus[]>('/monitoring/sync-features/');
  }

  async getFeatureSyncStatus(): Promise<FeatureSyncStatus[]> {
    return apiService.get<FeatureSyncStatus[]>('/monitoring/features/');
  }

  // Dashboard de monitoreo
  async getMonitoringDashboard(): Promise<{
    system_health: SystemHealth;
    feature_sync: FeatureSyncStatus[];
    api_tests: any[];
    recent_alerts: any[];
  }> {
    return apiService.get('/monitoring/dashboard/');
  }

  // Ejecutar tests de API
  async runApiTests(): Promise<{
    total_tests: number;
    passed: number;
    failed: number;
    results: any[];
  }> {
    return apiService.post('/monitoring/run-tests/');
  }

  // Exportar reportes
  async exportReport(format: 'json' | 'csv' | 'pdf' = 'json'): Promise<any> {
    return apiService.get(`/monitoring/export/?format=${format}`);
  }

  // Utilidades
  getHealthColor(status: string): string {
    const colors: Record<string, string> = {
      'healthy': 'text-green-600',
      'warning': 'text-yellow-600',
      'critical': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  }

  getHealthBadgeColor(status: string): string {
    const colors: Record<string, string> = {
      'healthy': 'bg-green-100 text-green-800',
      'warning': 'bg-yellow-100 text-yellow-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}

export const analyticsService = new AnalyticsService();
export const monitoringService = new MonitoringService();

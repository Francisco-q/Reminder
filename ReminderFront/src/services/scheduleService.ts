import type { 
  DailySchedule, 
  MedicationDose,
  PaginatedResponse 
} from '../types';
import { apiService } from './apiService';

export class ScheduleService {
  // Horarios diarios
  async getTodaySchedules(): Promise<DailySchedule[]> {
    const response = await apiService.get<PaginatedResponse<DailySchedule>>('/schedules/today/');
    return response.results;
  }

  async getSchedulesByDate(date: string): Promise<DailySchedule[]> {
    const response = await apiService.get<PaginatedResponse<DailySchedule>>(`/schedules/?date=${date}`);
    return response.results;
  }

  async getUpcomingSchedules(hours = 24): Promise<DailySchedule[]> {
    const response = await apiService.get<PaginatedResponse<DailySchedule>>(`/schedules/upcoming/?hours=${hours}`);
    return response.results;
  }

  // Marcar como tomado
  async markAsTaken(scheduleId: string, notes?: string): Promise<DailySchedule> {
    return apiService.post<DailySchedule>('/schedules/mark_taken/', {
      schedule_id: scheduleId,
      notes
    });
  }

  async markAsSkipped(scheduleId: string, reason?: string): Promise<DailySchedule> {
    return apiService.post<DailySchedule>('/schedules/mark_skipped/', {
      schedule_id: scheduleId,
      reason
    });
  }

  // Progreso diario
  async getTodayProgress(): Promise<{
    total_scheduled: number;
    total_taken: number;
    total_missed: number;
    adherence_percentage: number;
    next_dose?: DailySchedule;
  }> {
    return apiService.get('/schedules/progress/');
  }

  async getWeekProgress(): Promise<{
    dates: string[];
    adherence_data: number[];
    total_scheduled: number;
    total_taken: number;
    average_adherence: number;
  }> {
    return apiService.get('/schedules/week_progress/');
  }

  // Dosis de medicamentos
  async getMedicationDoses(medicationId: string, startDate?: string, endDate?: string): Promise<MedicationDose[]> {
    let url = `/schedules/doses/?medication_id=${medicationId}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;

    const response = await apiService.get<PaginatedResponse<MedicationDose>>(url);
    return response.results;
  }

  async createMedicationDose(doseData: {
    medication_id: string;
    scheduled_time: string;
    dose_amount: number;
    notes?: string;
  }): Promise<MedicationDose> {
    return apiService.post<MedicationDose>('/schedules/doses/', doseData);
  }

  // Horarios perdidos
  async getMissedSchedules(days = 7): Promise<DailySchedule[]> {
    const response = await apiService.get<PaginatedResponse<DailySchedule>>(`/schedules/missed/?days=${days}`);
    return response.results;
  }

  // Programar horarios futuros
  async generateSchedules(medicationId: string, startDate: string, endDate?: string): Promise<DailySchedule[]> {
    const response = await apiService.post<{ schedules: DailySchedule[] }>('/schedules/generate/', {
      medication_id: medicationId,
      start_date: startDate,
      end_date: endDate
    });
    return response.schedules;
  }

  // Actualizar horario
  async updateSchedule(scheduleId: string, updates: {
    scheduled_time?: string;
    notes?: string;
  }): Promise<DailySchedule> {
    return apiService.patch<DailySchedule>(`/schedules/${scheduleId}/`, updates);
  }

  // Eliminar horario
  async deleteSchedule(scheduleId: string): Promise<void> {
    await apiService.delete(`/schedules/${scheduleId}/`);
  }

  // Utilidades
  getNextSchedule(schedules: DailySchedule[]): DailySchedule | null {
    const now = new Date();
    const upcoming = schedules
      .filter(schedule => !schedule.taken && new Date(schedule.scheduled_time) > now)
      .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());

    return upcoming.length > 0 ? upcoming[0] : null;
  }

  getOverdueSchedules(schedules: DailySchedule[]): DailySchedule[] {
    const now = new Date();
    return schedules.filter(schedule => 
      !schedule.taken && 
      new Date(schedule.scheduled_time) < now
    );
  }

  getTodayAdherence(schedules: DailySchedule[]): number {
    if (schedules.length === 0) return 0;

    const taken = schedules.filter(s => s.taken).length;
    return Math.round((taken / schedules.length) * 100);
  }

  groupSchedulesByMedication(schedules: DailySchedule[]): Record<string, DailySchedule[]> {
    return schedules.reduce((groups, schedule) => {
      const medicationId = schedule.medication.id;
      if (!groups[medicationId]) {
        groups[medicationId] = [];
      }
      groups[medicationId].push(schedule);
      return groups;
    }, {} as Record<string, DailySchedule[]>);
  }

  // Formatear tiempo para mostrar
  formatTimeForDisplay(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

export const scheduleService = new ScheduleService();

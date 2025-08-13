import type {
  Medication,
  MedicationFormData,
  MedicationHistory,
  PaginatedResponse
} from '../types';
import { apiService } from './apiService';

export class MedicationService {
  // CRUD de medicamentos
  async getMedications(): Promise<Medication[]> {
    const response = await apiService.get<PaginatedResponse<Medication>>('/medications/');
    return response.results;
  }

  async getMedicationById(id: string): Promise<Medication> {
    return apiService.get<Medication>(`/medications/${id}/`);
  }

  async createMedication(medicationData: MedicationFormData): Promise<Medication> {
    return apiService.post<Medication>('/medications/', medicationData);
  }

  async updateMedication(id: string, medicationData: Partial<MedicationFormData>): Promise<Medication> {
    return apiService.put<Medication>(`/medications/${id}/`, medicationData);
  }

  async deleteMedication(id: string): Promise<void> {
    await apiService.delete(`/medications/${id}/`);
  }

  // Gestión de stock
  async updateStock(id: string, newStock: number, notes?: string): Promise<Medication> {
    return apiService.post<Medication>(`/medications/${id}/update_stock/`, {
      current_stock: newStock,
      notes
    });
  }

  // Historial de medicamentos
  async getMedicationHistory(medicationId: string): Promise<MedicationHistory[]> {
    const response = await apiService.get<PaginatedResponse<MedicationHistory>>(`/medications/${medicationId}/history/`);
    return response.results;
  }

  // Medicamentos activos
  async getActiveMedications(): Promise<Medication[]> {
    const response = await apiService.get<PaginatedResponse<Medication>>('/medications/?is_active=true');
    return response.results;
  }

  // Medicamentos con stock bajo
  async getLowStockMedications(): Promise<Medication[]> {
    const response = await apiService.get<PaginatedResponse<Medication>>('/medications/low_stock/');
    return response.results;
  }

  // Búsqueda y filtros
  async searchMedications(query: string): Promise<Medication[]> {
    const response = await apiService.get<PaginatedResponse<Medication>>(`/medications/?search=${encodeURIComponent(query)}`);
    return response.results;
  }

  async getMedicationsByType(type: string): Promise<Medication[]> {
    const response = await apiService.get<PaginatedResponse<Medication>>(`/medications/?medication_type=${type}`);
    return response.results;
  }

  async getMedicationsByCondition(condition: string): Promise<Medication[]> {
    const response = await apiService.get<PaginatedResponse<Medication>>(`/medications/?condition=${encodeURIComponent(condition)}`);
    return response.results;
  }

  // Utilidades
  validateMedicationData(data: MedicationFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('El nombre del medicamento es requerido');
    }

    if (!data.unit?.trim()) {
      errors.push('La unidad es requerida');
    }

    if (!data.dosage?.trim()) {
      errors.push('La dosis es requerida');
    }

    if (!data.frequency) {
      errors.push('La frecuencia es requerida');
    }

    if (!data.times || data.times.length === 0) {
      errors.push('Debe especificar al menos un horario');
    }

    if (!data.color) {
      errors.push('El color es requerido');
    }

    if (data.current_stock !== null && data.current_stock < 0) {
      errors.push('El stock no puede ser negativo');
    }

    if (data.stock_alert_threshold < 0) {
      errors.push('El umbral de alerta no puede ser negativo');
    }

    if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
      errors.push('La fecha de fin no puede ser anterior a la fecha de inicio');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Formatear datos para el formulario
  formatMedicationForForm(medication: Medication): MedicationFormData {
    return {
      name: medication.name,
      dosage: medication.dosage,
      unit: medication.unit,
      frequency: medication.frequency,
      times: medication.times,
      notes: medication.notes || '',
      color: medication.color,
      medication_type: medication.medication_type,
      condition: medication.condition || '',
      prescriber: medication.prescriber || '',
      start_date: medication.start_date,
      end_date: medication.end_date || '',
      current_stock: medication.current_stock,
      stock_alert_threshold: medication.stock_alert_threshold,
    };
  }
}

export const medicationService = new MedicationService();

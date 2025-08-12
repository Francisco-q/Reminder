import type { MEDICATION_COLORS } from '../types';

// Utilitarios para medicamentos

// Generar un color aleatorio para medicamentos
export const getRandomMedicationColor = (): string => {
  const colors: typeof MEDICATION_COLORS[number][] = [
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
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

// Convertir color hex a rgba
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Determinar si un color es oscuro o claro para el contraste del texto
export const isColorDark = (hex: string): boolean => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return false;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  // Fórmula para calcular luminancia
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

// Obtener color de texto apropiado para el fondo
export const getTextColor = (backgroundColor: string): string => {
  return isColorDark(backgroundColor) ? '#ffffff' : '#000000';
};

// Formatear frecuencia para mostrar
export const formatFrequency = (frequency: string): string => {
  const frequencyMap: Record<string, string> = {
    'once_daily': 'Una vez al día',
    'twice_daily': 'Dos veces al día',
    'three_times': 'Tres veces al día',
    'four_times': 'Cuatro veces al día',
    'as_needed': 'Según sea necesario',
    'custom': 'Personalizado',
  };
  
  return frequencyMap[frequency] || frequency;
};

// Formatear tipo de medicamento
export const formatMedicationType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'tablet': 'Tableta',
    'capsule': 'Cápsula',
    'liquid': 'Líquido',
    'injection': 'Inyección',
    'cream': 'Crema',
    'other': 'Otro',
  };
  
  return typeMap[type] || type;
};

// Obtener emoji para tipo de medicamento
export const getMedicationTypeEmoji = (type: string): string => {
  const emojiMap: Record<string, string> = {
    'tablet': '💊',
    'capsule': '💊',
    'liquid': '🧴',
    'injection': '💉',
    'cream': '🧴',
    'other': '💊',
  };
  
  return emojiMap[type] || '💊';
};

// Calcular días restantes de stock
export const calculateDaysLeft = (currentStock: number, dailyUsage: number): number => {
  if (dailyUsage <= 0) return 0;
  return Math.floor(currentStock / dailyUsage);
};

// Formatear stock restante con colores
export const getStockStatus = (current: number, threshold: number): {
  status: 'ok' | 'warning' | 'critical';
  color: string;
  message: string;
} => {
  if (current <= 0) {
    return {
      status: 'critical',
      color: 'text-red-600',
      message: 'Sin stock',
    };
  }
  
  if (current <= threshold) {
    return {
      status: 'warning',
      color: 'text-yellow-600',
      message: 'Stock bajo',
    };
  }
  
  return {
    status: 'ok',
    color: 'text-green-600',
    message: 'Stock suficiente',
  };
};

// Generar horarios sugeridos basados en frecuencia
export const generateDefaultTimes = (frequency: string): string[] => {
  switch (frequency) {
    case 'once_daily':
      return ['08:00'];
    case 'twice_daily':
      return ['08:00', '20:00'];
    case 'three_times':
      return ['08:00', '14:00', '20:00'];
    case 'four_times':
      return ['08:00', '12:00', '16:00', '20:00'];
    default:
      return ['08:00'];
  }
};

// Ordenar medicamentos
export const sortMedications = (medications: any[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
  return medications.sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'created_at':
        valueA = new Date(a.created_at);
        valueB = new Date(b.created_at);
        break;
      case 'current_stock':
        valueA = a.current_stock;
        valueB = b.current_stock;
        break;
      case 'frequency':
        valueA = a.frequency;
        valueB = b.frequency;
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

// Filtrar medicamentos
export const filterMedications = (medications: any[], filters: {
  search?: string;
  type?: string;
  condition?: string;
  isActive?: boolean;
  lowStock?: boolean;
}) => {
  return medications.filter(medication => {
    // Filtro de búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesName = medication.name.toLowerCase().includes(searchTerm);
      const matchesNotes = medication.notes?.toLowerCase().includes(searchTerm);
      const matchesCondition = medication.condition?.toLowerCase().includes(searchTerm);
      
      if (!matchesName && !matchesNotes && !matchesCondition) {
        return false;
      }
    }
    
    // Filtro por tipo
    if (filters.type && medication.medication_type !== filters.type) {
      return false;
    }
    
    // Filtro por condición
    if (filters.condition && medication.condition !== filters.condition) {
      return false;
    }
    
    // Filtro por estado activo
    if (filters.isActive !== undefined && medication.is_active !== filters.isActive) {
      return false;
    }
    
    // Filtro por stock bajo
    if (filters.lowStock && medication.current_stock > medication.stock_alert_threshold) {
      return false;
    }
    
    return true;
  });
};

// Agrupar medicamentos por criterio
export const groupMedications = (medications: any[], groupBy: string) => {
  return medications.reduce((groups, medication) => {
    let key;
    
    switch (groupBy) {
      case 'type':
        key = formatMedicationType(medication.medication_type);
        break;
      case 'condition':
        key = medication.condition || 'Sin condición especificada';
        break;
      case 'frequency':
        key = formatFrequency(medication.frequency);
        break;
      case 'prescriber':
        key = medication.prescriber || 'Sin médico especificado';
        break;
      default:
        key = 'Otros';
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key].push(medication);
    return groups;
  }, {} as Record<string, any[]>);
};

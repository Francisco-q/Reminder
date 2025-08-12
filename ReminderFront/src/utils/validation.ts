// Validaciones para formularios

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Validación de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validación de teléfono
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,15}$/;
  return phoneRegex.test(phone);
};

// Validación de contraseña
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validación de formulario de login
export const validateLoginForm = (data: { email: string; password: string }): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!data.email) {
    errors.email = 'El email es requerido';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'El email no es válido';
  }
  
  if (!data.password) {
    errors.password = 'La contraseña es requerida';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validación de formulario de registro
export const validateRegisterForm = (data: {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!data.email) {
    errors.email = 'El email es requerido';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'El email no es válido';
  }
  
  if (!data.password) {
    errors.password = 'La contraseña es requerida';
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }
  }
  
  if (!data.password_confirm) {
    errors.password_confirm = 'La confirmación de contraseña es requerida';
  } else if (data.password !== data.password_confirm) {
    errors.password_confirm = 'Las contraseñas no coinciden';
  }
  
  if (data.first_name && data.first_name.length < 2) {
    errors.first_name = 'El nombre debe tener al menos 2 caracteres';
  }
  
  if (data.last_name && data.last_name.length < 2) {
    errors.last_name = 'El apellido debe tener al menos 2 caracteres';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validación de formulario de medicamento
export const validateMedicationForm = (data: {
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  current_stock: number;
  stock_alert_threshold: number;
  start_date: string;
  end_date?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!data.name?.trim()) {
    errors.name = 'El nombre del medicamento es requerido';
  } else if (data.name.length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }
  
  if (!data.dosage?.trim()) {
    errors.dosage = 'La dosis es requerida';
  }
  
  if (!data.frequency) {
    errors.frequency = 'La frecuencia es requerida';
  }
  
  if (!data.times || data.times.length === 0) {
    errors.times = 'Debe especificar al menos un horario';
  } else {
    // Validar formato de horarios
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    for (const time of data.times) {
      if (!timeRegex.test(time)) {
        errors.times = 'Los horarios deben tener formato HH:MM válido';
        break;
      }
    }
  }
  
  if (data.current_stock < 0) {
    errors.current_stock = 'El stock no puede ser negativo';
  }
  
  if (data.stock_alert_threshold < 0) {
    errors.stock_alert_threshold = 'El umbral de alerta no puede ser negativo';
  }
  
  if (!data.start_date) {
    errors.start_date = 'La fecha de inicio es requerida';
  }
  
  if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
    errors.end_date = 'La fecha de fin no puede ser anterior a la fecha de inicio';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validación de perfil de usuario
export const validateUserProfile = (data: {
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  emergency_contact_phone?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!data.first_name?.trim()) {
    errors.first_name = 'El nombre es requerido';
  } else if (data.first_name.length < 2) {
    errors.first_name = 'El nombre debe tener al menos 2 caracteres';
  }
  
  if (!data.last_name?.trim()) {
    errors.last_name = 'El apellido es requerido';
  } else if (data.last_name.length < 2) {
    errors.last_name = 'El apellido debe tener al menos 2 caracteres';
  }
  
  if (data.phone_number && !isValidPhone(data.phone_number)) {
    errors.phone_number = 'El número de teléfono no es válido';
  }
  
  if (data.emergency_contact_phone && !isValidPhone(data.emergency_contact_phone)) {
    errors.emergency_contact_phone = 'El teléfono de emergencia no es válido';
  }
  
  if (data.date_of_birth) {
    const birthDate = new Date(data.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 0 || age > 150) {
      errors.date_of_birth = 'La fecha de nacimiento no es válida';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Limpiar y formatear datos de entrada
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

export const formatPhoneNumber = (phone: string): string => {
  // Remover todos los caracteres no numéricos excepto +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Si empieza con +, mantenerlo
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  return cleaned;
};

// Validar horarios
export const validateTimeFormat = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const formatTimeInput = (time: string): string => {
  // Asegurar formato HH:MM
  if (time.length === 5 && validateTimeFormat(time)) {
    return time;
  }
  
  // Si solo tiene horas, agregar :00
  if (/^\d{1,2}$/.test(time)) {
    const hour = parseInt(time, 10);
    if (hour >= 0 && hour <= 23) {
      return `${hour.toString().padStart(2, '0')}:00`;
    }
  }
  
  return time;
};

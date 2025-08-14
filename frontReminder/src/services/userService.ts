import type {
    PaginatedResponse,
    User,
    UserProfile,
    UserProfileFormData
} from '../types';
import { apiService } from './apiService';

export class UserService {
    // Obtener lista de usuarios (admin)
    async getUsers(): Promise<User[]> {
        const response = await apiService.get<PaginatedResponse<User>>('/users/');
        return response.results;
    }

    // Obtener perfil del usuario actual
    async getCurrentUserProfile(): Promise<UserProfile> {
        return apiService.get<UserProfile>('/users/profile/');
    }

    // Actualizar perfil del usuario actual
    async updateProfile(profileData: Partial<UserProfileFormData>): Promise<UserProfile> {
        return apiService.put<UserProfile>('/users/profile/', profileData);
    }

    // Obtener usuario por ID
    async getUserById(id: string): Promise<User> {
        return apiService.get<User>(`/users/${id}/`);
    }

    // Cambiar estado de usuario (activar/desactivar)
    async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
        return apiService.patch<User>(`/users/${userId}/`, { is_active: isActive });
    }

    // Obtener estadísticas de usuarios
    async getUserStats(): Promise<{
        total_users: number;
        active_users: number;
        inactive_users: number;
        new_users_this_month: number;
    }> {
        return apiService.get<{
            total_users: number;
            active_users: number;
            inactive_users: number;
            new_users_this_month: number;
        }>('/users/stats/');
    }

    // Cambiar contraseña
    async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
        return apiService.post<{ message: string }>('/users/change-password/', {
            current_password: currentPassword,
            new_password: newPassword,
        });
    }

    // Solicitar restablecimiento de contraseña
    async requestPasswordReset(email: string): Promise<{ message: string }> {
        return apiService.post<{ message: string }>('/users/password-reset/', {
            email
        });
    }

    // Confirmar restablecimiento de contraseña
    async confirmPasswordReset(token: string, newPassword: string): Promise<{ message: string }> {
        return apiService.post<{ message: string }>('/users/password-reset/confirm/', {
            token,
            new_password: newPassword
        });
    }

    // Eliminar cuenta de usuario
    async deleteAccount(password: string): Promise<{ message: string }> {
        return apiService.delete('/users/profile/', {
            data: { password }
        });
    }

    // Subir avatar
    async uploadAvatar(file: File): Promise<UserProfile> {
        const formData = new FormData();
        formData.append('avatar', file);

        return apiService.post<UserProfile>('/users/avatar/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    // Buscar usuarios
    async searchUsers(query: string): Promise<User[]> {
        const response = await apiService.get<PaginatedResponse<User>>(`/users/?search=${encodeURIComponent(query)}`);
        return response.results;
    }

    // Validar datos de perfil
    validateProfileData(data: UserProfileFormData): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.first_name?.trim()) {
            errors.push('El nombre es requerido');
        }

        if (!data.last_name?.trim()) {
            errors.push('El apellido es requerido');
        }

        if (data.phone_number && !/^\+?[\d\s-()]+$/.test(data.phone_number)) {
            errors.push('El formato del teléfono no es válido');
        }

        if (data.date_of_birth) {
            const birthDate = new Date(data.date_of_birth);
            const today = new Date();
            if (birthDate > today) {
                errors.push('La fecha de nacimiento no puede ser futura');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Formatear usuario para mostrar
    formatUserDisplay(user: User): string {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        return fullName || user.username || user.email;
    }

    // Obtener iniciales del usuario
    getUserInitials(user: User): string {
        if (user.first_name && user.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }
        if (user.first_name) {
            return user.first_name[0].toUpperCase();
        }
        return user.username[0]?.toUpperCase() || user.email[0]?.toUpperCase() || '?';
    }

    // Verificar si es un usuario completo
    isProfileComplete(user: User): boolean {
        return !!(
            user.first_name &&
            user.last_name &&
            user.email &&
            user.phone_number
        );
    }
}

export const userService = new UserService();

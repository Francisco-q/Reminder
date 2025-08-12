import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  UserProfile, 
  UserProfileFormData 
} from '../types';
import { apiService } from './apiService';

export class AuthService {
  // Autenticación
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.publicRequest<AuthResponse>('POST', '/auth/login/', credentials);
    
    // Guardar tokens después del login exitoso
    if (response.tokens) {
      apiService.setAuthTokens(response.tokens);
    }
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.publicRequest<AuthResponse>('POST', '/auth/register/', userData);
    
    // Guardar tokens después del registro exitoso
    if (response.tokens) {
      apiService.setAuthTokens(response.tokens);
    }
    
    return response;
  }

  async loginWithGoogle(googleToken: string): Promise<AuthResponse> {
    const response = await apiService.publicRequest<AuthResponse>('POST', '/auth/google/', {
      token: googleToken
    });
    
    // Guardar tokens después del login exitoso con Google
    if (response.tokens) {
      apiService.setAuthTokens(response.tokens);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout/');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Limpiar tokens localmente siempre
      apiService.clearAuthTokens();
    }
  }

  async refreshToken(): Promise<void> {
    // La renovación de token se maneja automáticamente en el interceptor
    // Este método puede ser usado para forzar una renovación si es necesario
    const tokens = apiService.getAuthTokens();
    if (tokens?.refresh) {
      const response = await apiService.publicRequest<{ access: string; refresh: string }>('POST', '/auth/token/refresh/', {
        refresh: tokens.refresh
      });
      apiService.setAuthTokens(response);
    }
  }

  async verifyToken(): Promise<boolean> {
    try {
      await apiService.get('/auth/verify/');
      return true;
    } catch {
      return false;
    }
  }

  // Usuario actual
  async getCurrentUser(): Promise<User> {
    return apiService.get<User>('/users/me/');
  }

  async updateCurrentUser(userData: Partial<User>): Promise<User> {
    return apiService.put<User>('/users/update_me/', userData);
  }

  async changePassword(data: { old_password: string; new_password: string; new_password_confirm: string }): Promise<void> {
    await apiService.post('/users/change_password/', data);
  }

  // Perfil de usuario
  async getUserProfile(): Promise<UserProfile> {
    return apiService.get<UserProfile>('/users/profile/');
  }

  async updateUserProfile(profileData: UserProfileFormData): Promise<UserProfile> {
    return apiService.put<UserProfile>('/users/update_profile/', profileData);
  }

  // Utilidades
  isAuthenticated(): boolean {
    return apiService.isAuthenticated();
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setStoredUser(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  clearStoredUser(): void {
    localStorage.removeItem('current_user');
  }
}

export const authService = new AuthService();

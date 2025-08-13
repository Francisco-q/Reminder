import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import type { AuthTokens } from '../types';

class ApiService {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor para agregar token de autenticación
    this.instance.interceptors.request.use(
      (config) => {
        const tokens = this.getStoredTokens();
        if (tokens?.access) {
          config.headers.Authorization = `Bearer ${tokens.access}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor para manejar errores y renovar tokens
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const tokens = this.getStoredTokens();
            if (tokens?.refresh) {
              const newTokens = await this.refreshToken(tokens.refresh);
              this.setStoredTokens(newTokens);

              // Retry la petición original con el nuevo token
              originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            // Si falla la renovación, limpiar tokens y redirigir al login
            this.clearStoredTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Gestión de tokens
  private getStoredTokens(): AuthTokens | null {
    const tokensStr = localStorage.getItem('auth_tokens');
    return tokensStr ? JSON.parse(tokensStr) : null;
  }

  private setStoredTokens(tokens: AuthTokens): void {
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  }

  private clearStoredTokens(): void {
    localStorage.removeItem('auth_tokens');
  }

  // Renovar token de acceso
  private async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await axios.post(`${this.baseURL}/auth/token/refresh/`, {
      refresh: refreshToken
    });
    return response.data;
  }

  // Métodos HTTP genéricos
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.delete(url, config);
    return response.data;
  }

  // Métodos de utilidad
  setAuthTokens(tokens: AuthTokens): void {
    this.setStoredTokens(tokens);
  }

  clearAuthTokens(): void {
    this.clearStoredTokens();
  }

  getAuthTokens(): AuthTokens | null {
    return this.getStoredTokens();
  }

  isAuthenticated(): boolean {
    const tokens = this.getStoredTokens();
    if (!tokens?.access) return false;

    try {
      const decoded: any = jwtDecode(tokens.access);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Método para hacer peticiones sin autenticación
  async publicRequest<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data?: any): Promise<T> {
    const response = await axios({
      method,
      url: `${this.baseURL}${url}`,
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }
}

// Crear instancia singleton
export const apiService = new ApiService();

// Export default también para facilitar imports
export default apiService;

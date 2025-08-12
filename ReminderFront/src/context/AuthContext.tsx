import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthTokens } from '../types';
import { authService } from '../services';

// Tipos del contexto
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm?: string;
    first_name?: string;
    last_name?: string;
  }) => Promise<void>;
  loginWithGoogle: (googleToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

// Estado inicial
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  tokens: null,
  loading: true,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        tokens: action.payload.tokens,
        loading: false,
        error: null,
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        tokens: null,
        loading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        tokens: null,
        loading: false,
        error: null,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider del contexto
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticación al iniciar la aplicación
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (authService.isAuthenticated()) {
        const user = await authService.getCurrentUser();
        const tokens = authService.getStoredUser() ? {
          access: '', // Los tokens reales se manejan internamente
          refresh: ''
        } : null;
        
        if (tokens) {
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { user, tokens } 
          });
          authService.setStoredUser(user);
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (username: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.login({ username, password });
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: response.user, 
          tokens: response.tokens 
        }
      });
      
      authService.setStoredUser(response.user);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al iniciar sesión';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm?: string;
    first_name?: string;
    last_name?: string;
  }) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.register(userData);
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: response.user, 
          tokens: response.tokens 
        }
      });
      
      authService.setStoredUser(response.user);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al registrar usuario';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const loginWithGoogle = async (googleToken: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.loginWithGoogle(googleToken);
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: response.user, 
          tokens: response.tokens 
        }
      });
      
      authService.setStoredUser(response.user);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al autenticarse con Google';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
      authService.clearStoredUser();
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authService.updateCurrentUser(userData);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      authService.setStoredUser(updatedUser);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          'Error al actualizar usuario';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      dispatch({ type: 'UPDATE_USER', payload: user });
      authService.setStoredUser(user);
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      // No mostrar error al usuario para esta operación
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook para verificar si el usuario está autenticado
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

// Hook para obtener el usuario actual
export const useCurrentUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

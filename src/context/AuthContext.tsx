import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { BiometricService } from '../services/biometricService';
import { HostelStatusService } from '../services/hostelStatusService';
import { NotificationService } from '../services/notificationService';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasQuickAuth: () => boolean;
  clearQuickAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      HostelStatusService.stopMonitoring();
    };
  }, []);

  useEffect(() => {
    const initAuth = () => {
      const token = authService.getStoredToken() || localStorage.getItem('token');
      const user = authService.getStoredUser() || JSON.parse(localStorage.getItem('user') || 'null');

      if (token && user) {
        // Always restore session for persistent login
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        // Start hostel status monitoring
        HostelStatusService.startMonitoring(user);
        // Initialize push notifications
        NotificationService.initializeMobile(user);
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, []);

  // Activity tracking disabled for persistent login
  // useEffect(() => {
  //   const handleActivity = () => {
  //     if (state.isAuthenticated) {
  //       authService.extendSession();
  //     }
  //   };

  //   const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  //   events.forEach(event => {
  //     document.addEventListener(event, handleActivity, true);
  //   });

  //   return () => {
  //     events.forEach(event => {
  //       document.removeEventListener(event, handleActivity, true);
  //     });
  //   };
  // }, [state.isAuthenticated]);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const { token, user } = await authService.login(email, password);
      authService.storeAuth(token, user);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      // Start hostel status monitoring
      HostelStatusService.startMonitoring(user);
      // Initialize push notifications
      NotificationService.initializeMobile(user);
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };



  const logout = () => {
    HostelStatusService.stopMonitoring();
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const hasQuickAuth = () => {
    return BiometricService.isPINSet() || BiometricService.isBiometricEnabled();
  };

  const clearQuickAuth = () => {
    BiometricService.clearBiometric();
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        hasQuickAuth,
        clearQuickAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
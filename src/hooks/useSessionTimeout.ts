import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const IDLE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
const MAX_SESSION_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours

export const useSessionTimeout = () => {
  const { logout, isAuthenticated } = useAuth();
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxSessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number>(Date.now());

  const handleLogout = useCallback(() => {
    logout();
    alert('Session expired. Please login again.');
  }, [logout]);

  const resetIdleTimer = useCallback(() => {
    if (!isAuthenticated) return;

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      handleLogout();
    }, IDLE_TIMEOUT);
  }, [isAuthenticated, handleLogout]);

  const startMaxSessionTimer = useCallback(() => {
    if (!isAuthenticated) return;

    sessionStartRef.current = Date.now();
    
    if (maxSessionTimerRef.current) {
      clearTimeout(maxSessionTimerRef.current);
    }

    maxSessionTimerRef.current = setTimeout(() => {
      handleLogout();
    }, MAX_SESSION_TIMEOUT);
  }, [isAuthenticated, handleLogout]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (maxSessionTimerRef.current) clearTimeout(maxSessionTimerRef.current);
      return;
    }

    // Start timers
    resetIdleTimer();
    startMaxSessionTimer();

    // Activity events to reset idle timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (maxSessionTimerRef.current) clearTimeout(maxSessionTimerRef.current);
    };
  }, [isAuthenticated, resetIdleTimer, startMaxSessionTimer]);

  return null;
};
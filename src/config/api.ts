// Centralized API configuration
const getApiUrl = () => {
  // For mobile devices, use production API
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://api-production-79b8.up.railway.app/api';
  }
  return process.env.REACT_APP_API_BASE_URL || 'https://api-production-79b8.up.railway.app/api';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:5000',
  FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000'
};
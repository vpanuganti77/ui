// Centralized API configuration loaded from config.json
let config: any = null;

const loadConfig = async () => {
  if (!config) {
    try {
      const response = await fetch('/config.json');
      config = await response.json();
    } catch (error) {
      console.warn('Failed to load config.json, using defaults');
      config = {
        API_BASE_URL: 'https://api-production-79b8.up.railway.app/api',
        WS_URL: 'wss://api-production-79b8.up.railway.app',
        FRONTEND_URL: 'http://localhost:3000'
      };
    }
  }
  return config;
};

// Initialize config synchronously for immediate use
const getConfig = () => {
  if (!config) {
    // Fallback defaults if config not loaded yet
    return {
      API_BASE_URL: 'https://api-production-79b8.up.railway.app/api',
      WS_URL: 'wss://api-production-79b8.up.railway.app',
      FRONTEND_URL: 'http://localhost:3000'
    };
  }
  return config;
};

// Load config on module import
loadConfig();

export const API_CONFIG = {
  get BASE_URL() { return getConfig().API_BASE_URL; },
  get WS_URL() { return getConfig().WS_URL; },
  get FRONTEND_URL() { return getConfig().FRONTEND_URL; },
  loadConfig
};
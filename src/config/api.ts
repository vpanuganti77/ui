// Centralized API configuration loaded from config.json
let config: any = null;

// Load config synchronously at startup - this will block until config is loaded
const loadConfigSync = async () => {
  try {
    const response = await fetch('/config.json');
    if (!response.ok) {
      throw new Error(`Failed to load config.json: ${response.status}`);
    }
    config = await response.json();
    console.log('Config loaded from config.json:', config);
  } catch (error) {
    console.error('Failed to load config.json:', error);
    throw error;
  }
};

export const API_CONFIG = {
  get BASE_URL() { 
    if (!config) {
      throw new Error('Config not loaded yet. Make sure to await loadConfig() first.');
    }
    return config.API_BASE_URL; 
  },
  
  get WS_URL() { 
    if (!config) {
      throw new Error('Config not loaded yet. Make sure to await loadConfig() first.');
    }
    return config.WS_URL; 
  },
  
  get FRONTEND_URL() { 
    if (!config) {
      throw new Error('Config not loaded yet. Make sure to await loadConfig() first.');
    }
    return config.FRONTEND_URL; 
  },

  // Check if config is loaded
  isLoaded: () => !!config,
  
  // Load config manually
  loadConfig: loadConfigSync
};
// Feature flags configuration
export const FEATURE_FLAGS = {
  // Biometric and PIN authentication
  QUICK_AUTH_ENABLED: false,
  BIOMETRIC_LOGIN: false,
  PIN_LOGIN: false,
  
  // Session management
  SESSION_TIMEOUT_ENABLED: false,
  IDLE_TIMEOUT_ENABLED: false,
  PERSISTENT_LOGIN: true,
  
  // Other features
  PWA_ENABLED: true,
  NOTIFICATIONS_ENABLED: true
};

// Session configuration
export const SESSION_CONFIG = {
  // Disable all timeouts for persistent login
  IDLE_TIMEOUT: 0, // 0 = disabled
  MAX_SESSION_TIME: 0, // 0 = unlimited
  EXTEND_ON_ACTIVITY: false, // Not needed when timeouts are disabled
  AUTO_LOGOUT: false
};
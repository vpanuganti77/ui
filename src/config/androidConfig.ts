import { Capacitor } from '@capacitor/core';

interface ApiConfig {
  PRIMARY_API: string;
  FALLBACK_APIS: string[];
  REQUEST_CONFIG: RequestInit;
}

// Android-specific configuration
export const getApiConfig = (): ApiConfig => {
  if (Capacitor.isNativePlatform()) {
    // For Android, try different approaches
    return {
      // Primary API (Railway)
      PRIMARY_API: 'https://hostelmanagementbackend-production.up.railway.app/api',
      
      // Fallback APIs (if Railway doesn't work)
      FALLBACK_APIS: [
        'https://hostelmanagementbackend-production.up.railway.app/api'
      ],
      
      // Request configuration for Android
      REQUEST_CONFIG: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'PGFlow-Android-App'
        },
        mode: 'cors',
        credentials: 'omit'
      }
    };
  }
  
  // Web configuration
  return {
    PRIMARY_API: 'https://hostelmanagementbackend-production.up.railway.app/api',
    FALLBACK_APIS: ['https://hostelmanagementbackend-production.up.railway.app/api'],
    REQUEST_CONFIG: {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  };
};

// Test API connectivity with fallbacks
export const testApiConnectivity = async (): Promise<string> => {
  const config = getApiConfig();
  
  for (const apiUrl of [config.PRIMARY_API, ...config.FALLBACK_APIS]) {
    try {
      console.log(`Testing API: ${apiUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        ...config.REQUEST_CONFIG,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.status < 500) {
        console.log(`API ${apiUrl} is reachable: ${response.status}`);
        return apiUrl;
      }
    } catch (error) {
      console.error(`API ${apiUrl} failed:`, error);
    }
  }
  
  throw new Error('All API endpoints are unreachable');
};

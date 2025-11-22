import { CapacitorHttp, Capacitor } from '@capacitor/core';

export class CapacitorHttpService {
  static async request(url: string, options: any = {}) {
    if (Capacitor.isNativePlatform()) {
      try {
        // Use Capacitor HTTP for native platforms (bypasses WebView restrictions)
        const response = await CapacitorHttp.request({
          url,
          method: options.method || 'GET',
          headers: options.headers || {},
          data: options.body ? JSON.parse(options.body) : undefined
        });
        
        return {
          ok: response.status >= 200 && response.status < 300,
          status: response.status,
          statusText: response.status.toString(),
          json: async () => response.data,
          text: async () => JSON.stringify(response.data)
        };
      } catch (error) {
        console.log('CapacitorHttp failed, falling back to fetch:', error);
        // Fallback to regular fetch if CapacitorHttp fails
        return fetch(url, options);
      }
    } else {
      // Use regular fetch for web
      return fetch(url, options);
    }
  }
  
  static async get(url: string, headers: any = {}) {
    return this.request(url, { method: 'GET', headers });
  }
  
  static async post(url: string, body: any, headers: any = {}) {
    return this.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body)
    });
  }
}
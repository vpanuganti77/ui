import { CapacitorHttpService } from '../../../services/capacitorHttpService';
import { Capacitor } from '@capacitor/core';
import { API_CONFIG } from '../../../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

class ApiService {
  private getHeaders() {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  async get(endpoint: string) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders();
    
    if (Capacitor.isNativePlatform()) {
      return CapacitorHttpService.get(url, headers);
    } else {
      return fetch(url, { method: 'GET', headers });
    }
  }

  async post(endpoint: string, data: any) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders();
    
    if (Capacitor.isNativePlatform()) {
      return CapacitorHttpService.post(url, data, headers);
    } else {
      return fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
    }
  }

  async put(endpoint: string, data: any) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders();
    
    if (Capacitor.isNativePlatform()) {
      return CapacitorHttpService.request(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });
    } else {
      return fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });
    }
  }

  async delete(endpoint: string) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders();
    
    if (Capacitor.isNativePlatform()) {
      return CapacitorHttpService.request(url, {
        method: 'DELETE',
        headers
      });
    } else {
      return fetch(url, { method: 'DELETE', headers });
    }
  }
}

const api = new ApiService();
export default api;

interface NotificationData {
  type: string;
  title: string;
  message: string;
  priority: string;
  createdAt: string;
}

class SocketService {
  private ws: WebSocket | null = null;
  private notificationCallback: ((notification: NotificationData) => void) | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;

  async connect(userData: any) {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      const config = await fetch('/config.json').then(r => r.json()).catch(() => ({ REACT_APP_WS_URL: 'ws://https://api-production-79b8.up.railway.app' }));
      this.ws = new WebSocket(config.REACT_APP_WS_URL || 'ws://https://api-production-79b8.up.railway.app');
      
      this.ws.onopen = () => {
        console.log('Connected to WebSocket server');
        console.log('Joining with user data:', userData);
        this.ws?.send(JSON.stringify({ type: 'join', data: userData }));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          if (data.type === 'notification' && this.notificationCallback) {
            this.notificationCallback(data.payload);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected from server');
        this.scheduleReconnect(userData);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket connection error:', error);
      };
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  }

  private scheduleReconnect(userData: any) {
    if (this.reconnectInterval) return;
    
    this.reconnectInterval = setTimeout(() => {
      this.reconnectInterval = null;
      this.connect(userData);
    }, 3000);
  }

  disconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  onNotification(callback: (notification: NotificationData) => void) {
    this.notificationCallback = callback;
  }
}

export const socketService = new SocketService();
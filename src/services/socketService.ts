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
      const config = await fetch('/config.json').then(r => r.json()).catch(() => ({ WS_URL: 'ws://localhost:5000' }));
      this.ws = new WebSocket(config.WS_URL || 'ws://localhost:5000');
      
      this.ws.onopen = () => {
        console.log('Connected to WebSocket server');
        console.log('Joining with user data:', userData);
        // Use setTimeout to ensure WebSocket is fully ready
        setTimeout(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'join', data: userData }));
          }
        }, 100);
      };

      this.ws.onmessage = (event) => {
        try {
          console.log('Raw WebSocket message:', event.data);
          const data = JSON.parse(event.data);
          console.log('Parsed WebSocket message:', data);
          
          if (data.type === 'notification') {
            console.log('Notification received, callback exists:', !!this.notificationCallback);
            
            // Force immediate UI refresh for hostel status changes
            if (data.payload.type === 'hostel_status_change') {
              console.log('HOSTEL STATUS CHANGE - Showing confirmation dialog');
              
              // Show browser notification
              if (Notification.permission === 'granted') {
                new Notification(data.payload.title, {
                  body: data.payload.message,
                  icon: '/favicon.ico'
                });
              }
              
              // Show beautiful dialog (skip NotificationContext to prevent double reload)
              this.showHostelStatusDialog(data.payload);
              return; // Don't call notification callback for hostel status changes
            }
            
            if (this.notificationCallback) {
              console.log('Calling notification callback with:', data.payload);
              this.notificationCallback(data.payload);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
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

  private showHostelStatusDialog(payload: any) {
    // Create dialog container
    const dialogContainer = document.createElement('div');
    dialogContainer.id = 'hostel-status-dialog';
    document.body.appendChild(dialogContainer);

    // Import React and render dialog
    import('react').then(React => {
      import('react-dom/client').then(ReactDOM => {
        import('../components/HostelStatusDialog').then(({ default: HostelStatusDialog }) => {
          const root = ReactDOM.createRoot(dialogContainer);
          
          const isActivated = payload.title.includes('Activated');
          const message = isActivated 
            ? 'Your hostel has been activated! You now have full access to all features.'
            : 'Your hostel has been deactivated! Please contact support for assistance.';
          
          root.render(
            React.createElement(HostelStatusDialog, {
              open: true,
              title: payload.title,
              message: message,
              isActivated: isActivated,
              onConfirm: () => {
                window.location.reload();
              }
            })
          );
        });
      });
    });
  }
}

export const socketService = new SocketService();
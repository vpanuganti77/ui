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
      const config = await fetch('/config.json').then(r => r.json()).catch(() => ({ WS_URL: 'wss://api-production-79b8.up.railway.app' }));
      this.ws = new WebSocket(config.WS_URL);
      
      this.ws.onopen = () => {
        console.log('✅ Connected to WebSocket server');
        console.log('👤 Joining with user data:', userData);
        // Ensure userData has all required fields
        const joinData = {
          ...userData,
          hostelId: userData.hostelId || null,
          role: userData.role,
          email: userData.email,
          name: userData.name
        };
        console.log('📤 Sending join data:', joinData);
        
        // Use setTimeout to ensure WebSocket is fully ready
        setTimeout(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'join', data: joinData }));
            console.log('📤 Join message sent to server');
          }
        }, 100);
      };

      this.ws.onmessage = (event) => {
        try {
          console.log('📨 Raw WebSocket message:', event.data);
          const data = JSON.parse(event.data);
          console.log('📋 Parsed WebSocket message:', data);
          
          if (data.type === 'notification') {
            console.log('🔔 Notification received:', data.payload.type, data.payload.title);
            console.log('📞 Callback exists:', !!this.notificationCallback);
            
            // Always process notifications through NotificationContext first
            if (this.notificationCallback) {
              console.log('✅ Calling notification callback with:', data.payload);
              this.notificationCallback(data.payload);
            } else {
              console.warn('❌ No notification callback registered!');
            }
            
            // FCM handles notifications - no need for local notifications
            console.log('📱 Notification received via WebSocket - FCM will handle display');
            
            // Handle special UI for hostel status changes
            if (data.payload.type === 'hostel_status_change') {
              console.log('🏨 HOSTEL STATUS CHANGE - Showing confirmation dialog');
              this.showHostelStatusDialog(data.payload);
            }
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('❌ WebSocket disconnected from server. Code:', event.code, 'Reason:', event.reason);
        this.scheduleReconnect(userData);
      };

      this.ws.onerror = (error) => {
        console.error('🚨 WebSocket connection error:', error);
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
    console.log('📞 Registering notification callback');
    this.notificationCallback = callback;
  }

  // Test method to send a test notification
  sendTestNotification() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('🧪 Sending test notification via WebSocket');
      const testMessage = {
        type: 'test-notification',
        payload: {
          type: 'test',
          title: 'Test Notification',
          message: 'This is a test notification to verify the connection',
          priority: 'medium',
          createdAt: new Date().toISOString()
        }
      };
      
      // Simulate receiving a notification
      if (this.notificationCallback) {
        this.notificationCallback(testMessage.payload);
      }
    } else {
      console.warn('❌ WebSocket not connected, cannot send test notification');
    }
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

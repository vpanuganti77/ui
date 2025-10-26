// Dashboard refresh utility for handling push notifications
export const refreshDashboard = () => {
  // Trigger a custom event to refresh all dashboard components
  window.dispatchEvent(new CustomEvent('dashboardRefresh'));
  
  // Also trigger data refresh event for ListPage components
  window.dispatchEvent(new CustomEvent('refreshData'));
  
  // Force reload user data from localStorage
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      window.dispatchEvent(new CustomEvent('userDataUpdate', { detail: user }));
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
};

// Listen for push notification clicks and refresh dashboard
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'notification-click') {
      refreshDashboard();
    }
  });
}
import { debounce } from './debounce';

// Debounced notification refresh to prevent excessive calls
const debouncedRefresh = debounce(() => {
  localStorage.setItem('triggerNotificationRefresh', Date.now().toString());
  window.dispatchEvent(new CustomEvent('notificationRefresh'));
}, 1000);

// Utility to trigger immediate notification refresh
export const triggerNotificationRefresh = () => {
  debouncedRefresh();
};

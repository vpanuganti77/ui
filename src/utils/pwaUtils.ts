// PWA utility functions

export const isPWAInstalled = (): boolean => {
  // Check if app is running in standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone ||
                      document.referrer.includes('android-app://');
  
  // Check if PWA was previously installed
  const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
  
  return isStandalone || wasInstalled;
};

export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const shouldShowInstallPrompt = (): boolean => {
  const hasShownPrompt = localStorage.getItem('pwa-install-prompt-shown') === 'true';
  const isInstalled = isPWAInstalled();
  const isMobile = isMobileDevice();
  
  return isMobile && !isInstalled && !hasShownPrompt;
};

export const redirectToPWA = (): boolean => {
  if (isPWAInstalled() && !window.matchMedia('(display-mode: standalone)').matches) {
    // Return true to indicate PWA redirect should be shown
    return true;
  }
  return false;
};

export const checkPWARedirect = (): boolean => {
  // Only check on mobile devices
  if (!isMobileDevice()) return false;
  
  // Don't redirect if already in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) return false;
  
  // Check if PWA is installed and should show redirect
  return redirectToPWA();
};
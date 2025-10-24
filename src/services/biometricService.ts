// Biometric authentication service
export class BiometricService {
  private static readonly STORAGE_KEY = 'biometric_enabled';
  private static readonly PIN_KEY = 'user_pin';
  private static readonly CREDENTIALS_KEY = 'biometric_credentials';

  // Check if biometric authentication is available
  static async isAvailable(): Promise<boolean> {
    if (!window.navigator.credentials) return false;
    
    try {
      // Check for WebAuthn support
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch {
      return false;
    }
  }

  // Check if device supports biometric authentication
  static isBiometricSupported(): boolean {
    return 'credentials' in navigator && 'create' in navigator.credentials;
  }

  // Register biometric authentication
  static async registerBiometric(userId: string): Promise<boolean> {
    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "Hostel Management" },
          user: {
            id: new TextEncoder().encode(userId),
            name: userId,
            displayName: userId
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      });

      if (credential) {
        localStorage.setItem(this.STORAGE_KEY, 'true');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Authenticate using biometrics
  static async authenticateBiometric(): Promise<{ success: boolean; credentials?: { email: string; password: string } }> {
    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          userVerification: "required"
        }
      });
      
      if (credential) {
        const encryptedCredentials = localStorage.getItem('biometric_credentials');
        if (encryptedCredentials) {
          const credentials = JSON.parse(atob(encryptedCredentials));
          return { success: true, credentials };
        }
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  }

  // Set PIN for quick authentication
  static setPIN(pin: string, credentials: { email: string; password: string }): void {
    const hashedPin = btoa(pin);
    const encryptedCredentials = btoa(JSON.stringify(credentials));
    localStorage.setItem(this.PIN_KEY, hashedPin);
    localStorage.setItem(this.CREDENTIALS_KEY, encryptedCredentials);
    // Also store for biometric placeholder
    localStorage.setItem('biometric_credentials', encryptedCredentials);
  }

  // Verify PIN and get credentials
  static verifyPIN(pin: string): { email: string; password: string } | null {
    try {
      const storedPin = localStorage.getItem(this.PIN_KEY);
      const hashedPin = btoa(pin);
      
      console.log('PIN Verification:', {
        enteredPin: pin,
        hashedPin,
        storedPin,
        match: storedPin === hashedPin
      });
      
      if (storedPin === hashedPin) {
        const encryptedCredentials = localStorage.getItem(this.CREDENTIALS_KEY);
        if (encryptedCredentials) {
          const credentials = JSON.parse(atob(encryptedCredentials));
          console.log('Retrieved credentials:', credentials);
          return credentials;
        }
      }
      return null;
    } catch (error) {
      console.error('PIN verification error:', error);
      return null;
    }
  }

  // Check if biometric is enabled
  static isBiometricEnabled(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  // Check if PIN is set
  static isPINSet(): boolean {
    return !!localStorage.getItem(this.PIN_KEY);
  }

  // Debug function to check stored data
  static getStoredData(): any {
    return {
      pinSet: !!localStorage.getItem(this.PIN_KEY),
      biometricEnabled: localStorage.getItem(this.STORAGE_KEY) === 'true',
      storedPin: localStorage.getItem(this.PIN_KEY),
      hasCredentials: !!localStorage.getItem(this.CREDENTIALS_KEY)
    };
  }

  // Clear biometric data
  static clearBiometric(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.PIN_KEY);
    localStorage.removeItem(this.CREDENTIALS_KEY);
  }
}
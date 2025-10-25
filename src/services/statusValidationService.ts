import { API_CONFIG } from '../config/api';

export interface ValidationResult {
  isValid: boolean;
  reason?: 'user_deleted' | 'hostel_deleted' | 'hostel_inactive' | 'user_inactive' | 'hostel_pending';
  message?: string;
}

export const validateUserStatus = async (): Promise<ValidationResult> => {
  // Disable status validation - let existing components handle restrictions
  // - PendingApprovalWrapper handles pending_approval users
  // - Layout component handles deactivated hostel restrictions
  // - Login handles truly deleted users
  return { isValid: true };
};
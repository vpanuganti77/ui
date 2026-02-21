import { userService } from './service';

export const userValidation = {
  async validateUniqueFields(formData: any): Promise<string | null> {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentHostelId = currentUser.hostelId;
    
    // Validate phone format (10 digits)
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      return 'Phone number must be exactly 10 digits';
    }
    
    const users = await userService.getAll();
    
    // Check name uniqueness
    const existingName = users.find(user => 
      user.name?.toLowerCase() === formData.name?.toLowerCase() &&
      user.id !== formData.id &&
      (formData.role === 'master_admin' || user.hostelId === currentHostelId)
    );
    if (existingName) {
      return 'User name already exists';
    }
    
    // Check phone uniqueness
    const existingPhone = users.find(user => 
      user.phone === formData.phone &&
      user.id !== formData.id &&
      (formData.role === 'master_admin' || user.hostelId === currentHostelId)
    );
    if (existingPhone) {
      return 'Phone number already exists';
    }
    
    return null;
  }
};

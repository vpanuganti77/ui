import { useState, useEffect } from 'react';
import { getAll } from '../shared/services/storage/fileDataService';

interface ValidationState {
  status: 'checking' | 'available' | 'taken' | null;
  message: string;
}

interface FormatValidation {
  isValid: boolean;
  message: string;
}

export const useFormValidation = () => {
  const [nameValidation, setNameValidation] = useState<ValidationState>({status: null, message: ''});
  const [phoneValidation, setPhoneValidation] = useState<ValidationState>({status: null, message: ''});
  const [phoneFormatValidation, setPhoneFormatValidation] = useState<FormatValidation>({isValid: true, message: ''});
  const [usersCache, setUsersCache] = useState<any[]>([]);
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0);

  const validatePhoneFormat = (phone: string) => {
    if (!phone.trim()) {
      setPhoneFormatValidation({isValid: true, message: ''});
      return;
    }
    
    if (!/^\d{10}$/.test(phone)) {
      setPhoneFormatValidation({isValid: false, message: 'Phone number must be exactly 10 digits'});
    } else {
      setPhoneFormatValidation({isValid: true, message: ''});
    }
  };

  const validateNameUniqueness = async (name: string, role: string, editingItem?: any) => {
    if (!name.trim() || editingItem) {
      setNameValidation({status: null, message: ''});
      return;
    }
    
    setNameValidation({status: 'checking', message: 'Checking availability...'});
    try {
      // Use cache if it's less than 30 seconds old
      let users = usersCache;
      const now = Date.now();
      if (!users.length || now - cacheTimestamp > 30000) {
        users = await getAll('users');
        setUsersCache(users);
        setCacheTimestamp(now);
      }
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const currentHostelId = userData.hostelId;
      
      const existing = users.find((user: any) => 
        user.name?.toLowerCase() === name.toLowerCase() &&
        (role === 'master_admin' || user.hostelId === currentHostelId)
      );
      
      if (existing) {
        setNameValidation({status: 'taken', message: 'Name already exists'});
      } else {
        setNameValidation({status: 'available', message: 'Name available'});
      }
    } catch (error) {
      setNameValidation({status: null, message: ''});
    }
  };

  const validatePhoneUniqueness = async (phone: string, role: string, editingItem?: any) => {
    if (!phone.trim() || editingItem || !phoneFormatValidation.isValid) {
      setPhoneValidation({status: null, message: ''});
      return;
    }
    
    setPhoneValidation({status: 'checking', message: 'Checking availability...'});
    try {
      // Use cache if it's less than 30 seconds old
      let users = usersCache;
      const now = Date.now();
      if (!users.length || now - cacheTimestamp > 30000) {
        users = await getAll('users');
        setUsersCache(users);
        setCacheTimestamp(now);
      }
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const currentHostelId = userData.hostelId;
      
      const existing = users.find((user: any) => 
        user.phone === phone &&
        (role === 'master_admin' || user.hostelId === currentHostelId)
      );
      
      if (existing) {
        setPhoneValidation({status: 'taken', message: 'Phone already exists'});
      } else {
        setPhoneValidation({status: 'available', message: 'Phone available'});
      }
    } catch (error) {
      setPhoneValidation({status: null, message: ''});
    }
  };

  const resetValidations = () => {
    setNameValidation({status: null, message: ''});
    setPhoneValidation({status: null, message: ''});
    setPhoneFormatValidation({isValid: true, message: ''});
    // Clear cache when resetting
    setUsersCache([]);
    setCacheTimestamp(0);
  };

  return {
    nameValidation,
    phoneValidation,
    phoneFormatValidation,
    validatePhoneFormat,
    validateNameUniqueness,
    validatePhoneUniqueness,
    resetValidations
  };
};

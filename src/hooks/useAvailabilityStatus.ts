import { useState, useCallback } from 'react';

export const useAvailabilityStatus = () => {
  const [availabilityStatus, setAvailabilityStatus] = useState<Record<string, boolean>>({});

  const updateAvailability = useCallback((fieldName: string, isAvailable: boolean) => {
    setAvailabilityStatus(prev => ({
      ...prev,
      [fieldName]: isAvailable
    }));
  }, []);

  const resetAvailability = useCallback(() => {
    setAvailabilityStatus({});
  }, []);

  const isAllAvailable = useCallback((fieldNames: string[]) => {
    return fieldNames.every(fieldName => availabilityStatus[fieldName] !== false);
  }, [availabilityStatus]);

  return {
    availabilityStatus,
    updateAvailability,
    resetAvailability,
    isAllAvailable
  };
};

export default useAvailabilityStatus;
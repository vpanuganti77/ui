import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, Tooltip } from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import { availabilityService, AvailabilityResult } from '../../shared/services/availabilityService';

// Global cache to persist across component unmounts
const availabilityCache = new Map<string, AvailabilityResult>();

interface AvailabilityIndicatorProps {
  value: string;
  type: 'name' | 'email' | 'phone';
  excludeId?: string;
  onAvailabilityChange?: (isAvailable: boolean) => void;
}

const AvailabilityIndicator: React.FC<AvailabilityIndicatorProps> = ({
  value,
  type,
  excludeId,
  onAvailabilityChange
}) => {
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!value || value.trim().length === 0) {
        setAvailability(null);
        onAvailabilityChange?.(true);
        return;
      }

      const cacheKey = `${type}-${value.trim()}-${excludeId || ''}`;
      
      // Check cache first and set immediately if found
      if (availabilityCache.has(cacheKey)) {
        const cachedResult = availabilityCache.get(cacheKey)!;
        setAvailability(cachedResult);
        onAvailabilityChange?.(cachedResult.isAvailable);
        return;
      }

      // Only show checking state if not initialized with cache
      if (!hasInitialized.current) {
        setIsChecking(true);
        hasInitialized.current = true;
      }

      try {
        let result: AvailabilityResult;
        
        switch (type) {
          case 'name':
            result = await availabilityService.checkNameAvailability(value, excludeId);
            break;
          case 'email':
            result = await availabilityService.checkEmailAvailability(value, excludeId);
            break;
          case 'phone':
            result = await availabilityService.checkPhoneAvailability(value, excludeId);
            break;
          default:
            result = { isAvailable: true, message: '', type: 'success' };
        }
        
        setAvailability(result);
        onAvailabilityChange?.(result.isAvailable);
        
        // Cache the result
        availabilityCache.set(cacheKey, result);
      } catch (error) {
        setAvailability({
          isAvailable: false,
          message: 'Error checking availability',
          type: 'error'
        });
        onAvailabilityChange?.(false);
      } finally {
        setIsChecking(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 300);
    return () => clearTimeout(timeoutId);
  }, [value, type, excludeId, onAvailabilityChange]);

  if (!value || value.trim().length === 0) {
    return null;
  }

  if (isChecking) {
    return (
      <Tooltip title="Checking availability..." arrow>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
          <CircularProgress size={16} />
        </Box>
      </Tooltip>
    );
  }

  if (!availability) {
    return null;
  }

  const getIcon = () => {
    if (availability.type === 'success') {
      return <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />;
    }
    return <Error sx={{ fontSize: 16, color: 'error.main' }} />;
  };

  return (
    <Tooltip title={availability.message} arrow>
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
        {getIcon()}
      </Box>
    </Tooltip>
  );
};

export default AvailabilityIndicator;
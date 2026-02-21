import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PendingApprovalDashboard from './PendingApprovalDashboard';
import { API_CONFIG } from '../config/api';
import { authService } from '../features/auth/services/authService';

interface PendingApprovalWrapperProps {
  children: React.ReactNode;
}

const PendingApprovalWrapper: React.FC<PendingApprovalWrapperProps> = ({ children }) => {
  const { user } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user || user.role === 'master_admin' || user.role === 'tenant') {
        setIsLoading(false);
        return;
      }

      try {
        const usersResponse = await fetch(`${API_CONFIG.BASE_URL}/users`);
        if (usersResponse.ok) {
          const users = await usersResponse.json();
          const currentUser = users.find((u: any) => u.id === user.id);
          
          if (currentUser) {
            console.log('Found user in backend:', currentUser);
            console.log('Backend user status:', currentUser.status);
            console.log('Local user status:', user.status);
            console.log('Is status pending_approval?', currentUser.status === 'pending_approval');
            
            // If backend status is active but local is pending, force update immediately
            if (currentUser.status === 'active' && user.status === 'pending_approval') {
              console.log('FORCING STATUS UPDATE: Backend active, local pending');
              const updatedUser = { ...user, status: 'active', isActive: true };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              window.location.reload();
              return;
            }
            
            // Show pending only if user has pending_approval status
            const shouldShowPending = currentUser.status === 'pending_approval';
            console.log('Setting isPending to:', shouldShowPending);
            setIsPending(shouldShowPending);
            
            // Update local storage if status changed
            if (user.status !== currentUser.status) {
              const updatedUser = { ...user, status: currentUser.status, isActive: currentUser.status === 'active' };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              console.log('Updated local user status from', user.status, 'to:', currentUser.status);
              window.location.reload();
            }
          } else {
            // User doesn't exist in backend, check local status
            console.log('User not found in backend, local status:', user.status);
            const shouldShowPending = user.status === 'pending_approval';
            console.log('Setting isPending to (from local):', shouldShowPending);
            setIsPending(shouldShowPending);
          }
        } else {
          setIsPending(false);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setIsPending(false);
      }
      
      setIsLoading(false);
    };

    checkUserStatus();
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isPending) {
    return <PendingApprovalDashboard />;
  }

  return <>{children}</>;
};

export default PendingApprovalWrapper;

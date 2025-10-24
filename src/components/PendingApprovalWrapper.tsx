import React from 'react';
import { useAuth } from '../context/AuthContext';
import PendingApprovalDashboard from './PendingApprovalDashboard';

interface PendingApprovalWrapperProps {
  children: React.ReactNode;
}

const PendingApprovalWrapper: React.FC<PendingApprovalWrapperProps> = ({ children }) => {
  const { user } = useAuth();

  // If user is pending approval, show pending dashboard instead of any content
  if (user?.status === 'pending_approval') {
    return <PendingApprovalDashboard />;
  }

  return <>{children}</>;
};

export default PendingApprovalWrapper;
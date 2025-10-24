import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationService } from './services/notificationService';
import ProtectedRoute from './components/ProtectedRoute';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import Layout from './components/Layout';
import FirstLoginDialog from './components/FirstLoginDialog';
import QuickAuthSetupPrompt from './components/QuickAuthSetupPrompt';
import Login from './pages/Auth/Login';

import Dashboard from './pages/Admin/Dashboard';
import Tenants from './pages/Admin/Tenants';
import Rooms from './pages/Admin/Rooms';
import Payments from './pages/Admin/Payments';
import Complaints from './pages/Admin/Complaints';
import MyRoom from './pages/Customer/MyRoom';
import MyPayments from './pages/Customer/MyPayments';
import MyComplaints from './pages/Customer/MyComplaints';
import TenantDashboard from './pages/Customer/Dashboard';
import TenantDetails from './pages/Admin/TenantDetails';
import PaymentDetails from './pages/Admin/PaymentDetails';
import RoomDetails from './pages/Admin/RoomDetails';
import UserManagement from './pages/Admin/UserManagement';
import Reports from './pages/Admin/Reports';
import Expenses from './pages/Admin/Expenses';
import Staff from './pages/Admin/Staff';
import Profile from './pages/Admin/Profile';
import TenantProfile from './pages/Customer/Profile';
import MasterAdminProfile from './pages/MasterAdmin/Profile';
import Notices from './pages/Admin/Notices';
import CustomerNotices from './pages/Customer/Notices';
import HostelManagement from './pages/MasterAdmin/HostelManagement';
import HostelRequests from './pages/MasterAdmin/HostelRequests';
import MasterAdminDashboard from './pages/MasterAdmin/Dashboard';
import DataManagement from './pages/MasterAdmin/DataManagement';
import RoleTestPanel from './components/RoleTestPanel';
import HomePage from './pages/Landing/HomePage';
import PendingApprovalWrapper from './components/PendingApprovalWrapper';



const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          {/* Session timeout disabled for persistent login */}
          {/* <SessionTimeoutWrapper /> */}
          <FirstLoginWrapper />

          <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            <Route path="/test-roles" element={<RoleTestPanel />} />
            
            {/* Protected Master Admin Routes */}
            <Route
              path="/master-admin/*"
              element={
                <ProtectedRoute requiredRole="master_admin">
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<MasterAdminDashboard />} />
                      <Route path="hostels" element={<HostelManagement />} />
                      <Route path="requests" element={<HostelRequests />} />
                      <Route path="data" element={<DataManagement />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="profile" element={<MasterAdminProfile />} />
                      <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Protected Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <PendingApprovalWrapper>
                      <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="tenants" element={<Tenants />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="tenants/:id" element={<TenantDetails />} />
                        <Route path="payments/:id" element={<PaymentDetails />} />
                        <Route path="rooms/:id" element={<RoomDetails />} />
                        <Route path="rooms" element={<Rooms />} />
                        <Route path="payments" element={<Payments />} />
                        <Route path="complaints" element={<Complaints />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="expenses" element={<Expenses />} />
                        <Route path="staff" element={<Staff />} />
                        <Route path="notices" element={<Notices />} />
                        <Route path="profile" element={<Profile />} />
                      </Routes>
                    </PendingApprovalWrapper>
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Protected Receptionist Routes */}
            <Route
              path="/receptionist/*"
              element={
                <ProtectedRoute requiredRole="receptionist">
                  <Layout>
                    <PendingApprovalWrapper>
                      <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="tenants" element={<Tenants />} />
                        <Route path="rooms" element={<Rooms />} />
                        <Route path="payments" element={<Payments />} />
                        <Route path="complaints" element={<Complaints />} />
                      </Routes>
                    </PendingApprovalWrapper>
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Protected Tenant Routes */}
            <Route
              path="/tenant/*"
              element={
                <ProtectedRoute requiredRole="tenant">
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<TenantDashboard />} />
                      <Route path="room" element={<MyRoom />} />
                      <Route path="payments" element={<MyPayments />} />
                      <Route path="complaints" element={<MyComplaints />} />
                      <Route path="notices" element={<CustomerNotices />} />
                      <Route path="profile" element={<TenantProfile />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Default Redirects */}
            <Route path="/" element={<AuthRedirect />} />
            <Route path="/home" element={<AuthRedirect />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const SessionTimeoutWrapper: React.FC = () => {
  useSessionTimeout();
  return null;
};

const AuthRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on user role
    const dashboardPath = {
      'master_admin': '/master-admin/dashboard',
      'admin': '/admin/dashboard',
      'receptionist': '/admin/dashboard',
      'tenant': '/tenant/dashboard'
    }[user.role] || '/login';
    
    return <Navigate to={dashboardPath} replace />;
  }

  // Show home page for non-authenticated users
  return <HomePage />;
};

const FirstLoginWrapper: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [showFirstLogin, setShowFirstLogin] = useState(false);
  const [showQuickAuthPrompt, setShowQuickAuthPrompt] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('FirstLoginWrapper - User data:', user);
      console.log('FirstLoginWrapper - firstLogin flag:', user.firstLogin);
      if (user.firstLogin) {
        setShowFirstLogin(true);
      } else {
        // Show quick auth setup prompt after normal login
        setShowQuickAuthPrompt(true);
      }
    }
  }, [isAuthenticated, user]);

  const handleFirstLoginComplete = () => {
    setShowFirstLogin(false);
    // Show quick auth setup after first login is complete
    setShowQuickAuthPrompt(true);
  };

  // Initialize mobile notifications
  useEffect(() => {
    if (isAuthenticated && user) {
      NotificationService.initializeMobile(user);
    }
  }, [isAuthenticated, user]);

  const handleQuickAuthComplete = () => {
    setShowQuickAuthPrompt(false);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <FirstLoginDialog
        open={showFirstLogin}
        user={user}
        onComplete={handleFirstLoginComplete}
      />
      {/* Temporarily disabled due to caching issues */}
      {false && (
        <QuickAuthSetupPrompt
          user={user}
          onComplete={handleQuickAuthComplete}
        />
      )}
    </>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  TextField,
  Snackbar,
} from '@mui/material';
import { Fab, Menu, MenuItem } from '@mui/material';
import {
  People,
  Hotel,
  AttachMoney,
  ReportProblem,
  PersonAdd,
  Bed,
  ExitToApp,
  Schedule,
  CheckCircle,
  Warning,
  TrendingUp,
  TrendingDown,
  Notifications,
  Add,
  Receipt,
  Assignment,
  CalendarToday,
  Phone,
  Email,
  Close,
  Build,
  ContactMail,
  Send,
  Announcement,
} from '@mui/icons-material';


import { adminService } from '../../services/adminService';
import { DashboardStats } from '../../types';
import { useNavigate } from 'react-router-dom';
import { create, getAll } from '../../services/fileDataService';
import TenantDialog from '../../components/tenant/TenantDialog';
import { tenantFields } from '../../components/common/FormConfigs';

import TrialStatus from '../../components/TrialStatus';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    totalTenants: 0,
    totalIncome: 0,
    totalDues: 0,
    openComplaints: 0,
    occupancyRate: 0,
    totalExpenses: 0
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Get user from localStorage to get hostelId
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.hostelId) {
          console.warn('No hostelId found for user');
          return;
        }
        
        console.log('Fetching data for hostelId:', user.hostelId);

        // Fetch real data from database
        const [hostels, rooms, tenants, payments, complaints, expenses] = await Promise.all([
          adminService.getAll('hostels'),
          adminService.getAll('rooms'),
          adminService.getAll('tenants'), 
          adminService.getAll('payments'),
          adminService.getAll('complaints'),
          adminService.getAll('expenses')
        ]);

        // Get hostel info
        const currentHostel = hostels.find((h: any) => h.id === user.hostelId);
        setHostelInfo(currentHostel);

        // Filter data by hostelId
        const hostelRooms = rooms.filter((r: any) => r.hostelId === user.hostelId);
        const hostelTenants = tenants.filter((t: any) => t.hostelId === user.hostelId);
        const hostelPayments = payments.filter((p: any) => p.hostelId === user.hostelId);
        const hostelComplaints = complaints.filter((c: any) => c.hostelId === user.hostelId);
        const hostelExpenses = expenses.filter((e: any) => e.hostelId === user.hostelId);

        // Set real room data
        const availableRoomsList = hostelRooms.filter((r: any) => r.status === 'available');
        setAvailableRooms(availableRoomsList);

        // Set real tenant data (recent joinings)
        const recentTenants = hostelTenants
          .filter((t: any) => {
            const joinDate = new Date(t.createdAt || t.joiningDate);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return joinDate >= weekAgo;
          })
          .slice(0, 5);
        setNewJoinings(recentTenants);

        // Calculate stats first
        const totalRooms = hostelRooms.length;
        const occupiedRooms = hostelRooms.filter((r: any) => r.status === 'occupied').length;
        const totalTenants = hostelTenants.length;
        const openComplaintsCount = hostelComplaints.filter((c: any) => c.status === 'open').length;
        
        // Set alerts based on real data
        const alertsList = [];
        const overduePayments = hostelPayments.filter((p: any) => p.status === 'overdue').length;
        
        if (overduePayments > 0) {
          alertsList.push({ type: 'overdue', message: `Rent overdue: ${overduePayments} tenants`, count: overduePayments, color: 'error' });
        }
        if (openComplaintsCount > 0) {
          alertsList.push({ type: 'maintenance', message: 'Maintenance requests pending', count: openComplaintsCount, color: 'warning' });
        }
        
        setAlerts(alertsList);
        const totalExpenses = hostelExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
        
        // Calculate income and dues from payments
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const monthlyPayments = hostelPayments.filter((p: any) => 
          p.month === currentMonth && p.year === currentYear
        );
        const totalIncome = monthlyPayments.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        const totalDues = monthlyPayments.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

        setStats({
          totalRooms,
          occupiedRooms,
          vacantRooms: totalRooms - occupiedRooms,
          totalTenants,
          totalIncome,
          totalDues,
          openComplaints: openComplaintsCount,
          occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
          totalExpenses
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };
    fetchDashboardStats();
  }, []);

  const [newJoinings, setNewJoinings] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [upcomingVacancies, setUpcomingVacancies] = useState<any[]>([]);
  const [hostelInfo, setHostelInfo] = useState<any>(null);

  const [alerts, setAlerts] = useState<any[]>([]);

  const [alertDetails, setAlertDetails] = useState<any>({ overdue: [], maintenance: [], applications: [] });

  useEffect(() => {
    const loadAlertDetails = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const [tenants, payments, complaints] = await Promise.all([
          getAll('tenants'),
          getAll('payments'),
          getAll('complaints')
        ]);

        // Filter by hostel
        const hostelTenants = tenants.filter((t: any) => t.hostelId === user.hostelId);
        const hostelPayments = payments.filter((p: any) => p.hostelId === user.hostelId);
        const hostelComplaints = complaints.filter((c: any) => c.hostelId === user.hostelId);

        // Get overdue payments
        const overduePayments = hostelPayments.filter((p: any) => p.status === 'overdue').map((p: any) => {
          const tenant = hostelTenants.find((t: any) => t.id === p.tenantId);
          return {
            name: tenant?.name || 'Unknown',
            room: tenant?.room || 'N/A',
            amount: p.amount || 0,
            daysOverdue: Math.ceil((new Date().getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
            phone: tenant?.phone || 'N/A'
          };
        });

        // Get maintenance requests
        const maintenanceRequests = hostelComplaints.filter((c: any) => c.status === 'open').map((c: any) => ({
          title: c.title,
          room: c.room,
          tenant: c.tenantName,
          priority: c.priority,
          date: c.createdAt
        }));

        setAlertDetails({
          overdue: overduePayments,
          maintenance: maintenanceRequests,
          applications: [] // No applications data in current schema
        });
      } catch (error) {
        console.error('Error loading alert details:', error);
      }
    };

    loadAlertDetails();
  }, []);

  const handleAlertClick = (alertType: string) => {
    setSelectedAlert(alertType);
    setAlertDialogOpen(true);
  };

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<string>('');
  const [fabMenuAnchor, setFabMenuAnchor] = useState<null | HTMLElement>(null);
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [noticeDialogOpen, setNoticeDialogOpen] = useState(false);
  const [noticeFormData, setNoticeFormData] = useState({
    title: '',
    message: '',
    priority: 'normal' as 'low' | 'normal' | 'high'
  });
  const [noticeError, setNoticeError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });



  const statCards = [
    {
      title: 'Total Rooms',
      value: stats?.totalRooms || 0,
      icon: <Hotel />,
      color: '#1976d2',
    },
    {
      title: 'Occupied Rooms',
      value: stats?.occupiedRooms || 0,
      icon: <Hotel />,
      color: '#388e3c',
    },
    {
      title: 'Total Tenants',
      value: stats?.totalTenants || 0,
      icon: <People />,
      color: '#f57c00',
    },
    {
      title: 'Monthly Income',
      value: `₹${(stats?.totalIncome || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      icon: <AttachMoney />,
      color: '#388e3c',
    },
    {
      title: 'Pending Dues',
      value: `₹${(stats?.totalDues || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      icon: <AttachMoney />,
      color: '#d32f2f',
    },
    {
      title: 'Occupancy Rate',
      value: `${stats?.occupancyRate || 0}%`,
      icon: <TrendingUp />,
      color: '#9c27b0',
    },
  ];

  // const roomOccupancyData = [
  //   { name: 'Occupied', value: stats?.occupiedRooms || 0, color: '#388e3c' },
  //   { name: 'Vacant', value: stats?.vacantRooms || 0, color: '#1976d2' },
  // ];

  return (
    <Box>
      <TrialStatus />
      
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={3} gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {hostelInfo?.name || 'Dashboard Overview'}
          </Typography>
          {hostelInfo && (
            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
              <Chip 
                label={hostelInfo.planType === 'free_trial' ? 'Free Trial' : (hostelInfo.planType || '').toUpperCase()}
                color={hostelInfo.planType === 'free_trial' ? 'info' : 'primary'}
                size="small"
              />
              {hostelInfo.trialExpiryDate && (
                <Chip 
                  label={`Expires: ${new Date(hostelInfo.trialExpiryDate).toLocaleDateString()}`}
                  color={(() => {
                    const today = new Date();
                    const expiry = new Date(hostelInfo.trialExpiryDate);
                    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return daysLeft <= 0 ? 'error' : daysLeft <= 7 ? 'warning' : 'success';
                  })()} 
                  size="small"
                  variant="outlined"
                />
              )}
              <Chip 
                label={`Status: ${hostelInfo.status}`}
                color={hostelInfo.status === 'active' ? 'success' : 'error'}
                size="small"
                variant="outlined"
              />
            </Box>
          )}
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<Email />}
            onClick={() => setNoticeDialogOpen(true)}
          >
            Send Notice
          </Button>
        </Box>
      </Box>

      {/* Alerts Bar */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box display="flex" gap={2} flexWrap="wrap">
            {alerts.map((alert, index) => (
              <Card 
                key={index} 
                elevation={2} 
                sx={{ 
                  flex: '1 1 250px', 
                  borderLeft: `4px solid`, 
                  borderLeftColor: `${alert.color}.main`,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={() => handleAlertClick(alert.type)}
              >
                <CardContent sx={{ py: 1.5 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Notifications color={alert.color as any} fontSize="small" />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {alert.message}
                      </Typography>
                    </Box>
                    <Chip label={alert.count} color={alert.color as any} size="small" />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}



      {/* Quick View Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
        {/* New Joinings */}
        <Card elevation={2} sx={{ height: 240 }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <PersonAdd color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                New Joinings (This Week)
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {newJoinings.length > 0 ? newJoinings.map((tenant, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: index < newJoinings.length - 1 ? '1px solid #eee' : 'none' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{tenant.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Room {tenant.roomNumber || 'N/A'} • {new Date(tenant.createdAt || tenant.joiningDate).toLocaleDateString()}</Typography>
                  </Box>
                  <Box sx={{ color: tenant.status === 'active' ? 'success.main' : 'warning.main' }}>
                    {tenant.status === 'active' ? <CheckCircle fontSize="small" /> : <Schedule fontSize="small" />}
                  </Box>
                </Box>
              )) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No new joinings this week
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Available Rooms */}
        <Card elevation={2} sx={{ height: 240 }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Bed color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                Available Rooms ({availableRooms.length})
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {availableRooms.length > 0 ? availableRooms.map((room, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: index < availableRooms.length - 1 ? '1px solid #eee' : 'none' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{room.roomNumber} - {room.type}</Typography>
                    <Typography variant="caption" color="text.secondary">Floor {room.floor || 'N/A'} • {room.capacity} bed(s)</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                    ₹{(room.rent || 0).toLocaleString('en-IN')}
                  </Typography>
                </Box>
              )) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No rooms available. <Button size="small" onClick={() => navigate('/admin/rooms')}>Add Rooms</Button>
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Upcoming Vacancies */}
        <Card elevation={2} sx={{ height: 240 }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <ExitToApp color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                Upcoming Vacancies
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {upcomingVacancies.map((tenant, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: index < upcomingVacancies.length - 1 ? '1px solid #eee' : 'none' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{tenant.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Room {tenant.room} • {new Date(tenant.vacateDate).toLocaleDateString()}</Typography>
                  </Box>
                  <Box sx={{ color: tenant.noticeGiven ? 'success.main' : 'warning.main' }}>
                    {tenant.noticeGiven ? <CheckCircle fontSize="small" /> : <Warning fontSize="small" />}
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Bottom Detailed Stats */}
      <Box sx={{ mb: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        <Card elevation={2} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Total Rooms
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats?.totalRooms || 0}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                    +5.2% from last month
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ color: '#1976d2', bgcolor: '#1976d220', p: 1.5, borderRadius: 2 }}>
                <Hotel />
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card elevation={2} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Occupied Rooms
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats?.occupiedRooms || 0}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                    +5.2% from last month
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ color: '#388e3c', bgcolor: '#388e3c20', p: 1.5, borderRadius: 2 }}>
                <Hotel />
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card elevation={2} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Total Tenants
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats?.totalTenants || 0}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                    +5.2% from last month
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ color: '#f57c00', bgcolor: '#f57c0020', p: 1.5, borderRadius: 2 }}>
                <People />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Monthly Income
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                  ₹{(stats?.totalIncome || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                    +5.2% from last month
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ color: '#388e3c', bgcolor: '#388e3c20', p: 1.5, borderRadius: 2 }}>
                <AttachMoney />
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card elevation={2} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Pending Dues
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                  ₹{(stats?.totalDues || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                    +5.2% from last month
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ color: '#d32f2f', bgcolor: '#d32f2f20', p: 1.5, borderRadius: 2 }}>
                <AttachMoney />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Occupancy Rate
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats?.occupancyRate || 0}%
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                    +5.2% from last month
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ color: '#9c27b0', bgcolor: '#9c27b020', p: 1.5, borderRadius: 2 }}>
                <TrendingUp />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Monthly Expenses
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                  ₹{(stats?.totalExpenses || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TrendingDown fontSize="small" color="error" />
                  <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                    Track daily expenses
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ color: '#ff9800', bgcolor: '#ff980020', p: 1.5, borderRadius: 2 }}>
                <AttachMoney />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>





      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
        onClick={(e) => setFabMenuAnchor(e.currentTarget)}
      >
        <Add />
      </Fab>

      {/* Quick Actions Menu */}
      <Menu
        anchorEl={fabMenuAnchor}
        open={Boolean(fabMenuAnchor)}
        onClose={() => setFabMenuAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { setFabMenuAnchor(null); setTenantDialogOpen(true); }}>
          <ListItemIcon><PersonAdd /></ListItemIcon>
          <ListItemText>Add New Tenant</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setFabMenuAnchor(null); navigate('/admin/payments'); }}>
          <ListItemIcon><Receipt /></ListItemIcon>
          <ListItemText>Generate Bills</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setFabMenuAnchor(null); navigate('/admin/reports'); }}>
          <ListItemIcon><Assignment /></ListItemIcon>
          <ListItemText>View Reports</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setFabMenuAnchor(null); navigate('/admin/complaints'); }}>
          <ListItemIcon><CalendarToday /></ListItemIcon>
          <ListItemText>Schedule Maintenance</ListItemText>
        </MenuItem>
      </Menu>

      {/* Alert Details Dialog */}
      <Dialog open={alertDialogOpen} onClose={() => setAlertDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {selectedAlert === 'overdue' && 'Rent Overdue Tenants'}
              {selectedAlert === 'maintenance' && 'Pending Maintenance Requests'}
              {selectedAlert === 'applications' && 'New Applications'}
            </Typography>
            <IconButton onClick={() => setAlertDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedAlert && alertDetails[selectedAlert as keyof typeof alertDetails]?.map((item: any, index: number) => (
              <ListItem key={index} divider={index < alertDetails[selectedAlert as keyof typeof alertDetails].length - 1}>
                <ListItemIcon>
                  {selectedAlert === 'overdue' && <AttachMoney color="error" />}
                  {selectedAlert === 'maintenance' && <Build color="warning" />}
                  {selectedAlert === 'applications' && <ContactMail color="info" />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    selectedAlert === 'overdue' ? `${item.name} - Room ${item.room}` :
                    selectedAlert === 'maintenance' ? `${item.title} - Room ${item.room}` :
                    `${item.name} - ${item.preferredRoom} Room`
                  }
                  secondary={
                    selectedAlert === 'overdue' ? `₹${item.amount.toLocaleString('en-IN')} overdue for ${item.daysOverdue} days | ${item.phone}` :
                    selectedAlert === 'maintenance' ? `Tenant: ${item.tenant} | Priority: ${item.priority} | Date: ${new Date(item.date).toLocaleDateString()}` :
                    `${item.email} | ${item.phone} | Applied: ${new Date(item.date).toLocaleDateString()}`
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Tenant Dialog */}
      <TenantDialog
        open={tenantDialogOpen}
        onClose={() => setTenantDialogOpen(false)}
        onSubmit={async (formData: any) => {
          try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await create('tenants', {
              ...formData,
              hostelId: user.hostelId,
              status: 'active',
              createdAt: new Date().toISOString(),
              lastModifiedBy: user.name,
              lastModifiedDate: new Date().toISOString()
            });
            setTenantDialogOpen(false);
            setSnackbar({ open: true, message: 'Tenant added successfully!', severity: 'success' });
            // Refresh dashboard data
            window.location.reload();
          } catch (error: any) {
            setSnackbar({ open: true, message: error.message || 'Failed to add tenant', severity: 'error' });
          }
        }}
      />

      {/* Send Notice Dialog */}
      <Dialog open={noticeDialogOpen} onClose={() => setNoticeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Announcement color="primary" />
          Send New Notice
        </DialogTitle>
        <DialogContent>
          {noticeError && <Alert severity="error" sx={{ mb: 2 }}>{noticeError}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Notice Title"
              value={noticeFormData.title}
              onChange={(e) => setNoticeFormData({ ...noticeFormData, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Message"
              value={noticeFormData.message}
              onChange={(e) => setNoticeFormData({ ...noticeFormData, message: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
            <TextField
              select
              label="Priority"
              value={noticeFormData.priority}
              onChange={(e) => setNoticeFormData({ ...noticeFormData, priority: e.target.value as any })}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoticeDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<Send />} 
            onClick={async () => {
              setNoticeError('');
              
              // Validate form
              if (!noticeFormData.title.trim()) {
                setNoticeError('Notice title is required');
                return;
              }
              if (!noticeFormData.message.trim()) {
                setNoticeError('Message is required');
                return;
              }
              
              try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                await create('notices', {
                  ...noticeFormData,
                  hostelId: user.hostelId,
                  createdBy: user.name,
                  createdAt: new Date().toISOString(),
                  status: 'active'
                });
                setNoticeDialogOpen(false);
                setNoticeFormData({ title: '', message: '', priority: 'normal' });
                setSnackbar({ open: true, message: 'Notice sent successfully!', severity: 'success' });
              } catch (error: any) {
                setNoticeError(error.message || 'Failed to send notice');
              }
            }}
          >
            Send Notice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
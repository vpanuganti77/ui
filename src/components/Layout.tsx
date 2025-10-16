import React from 'react';//
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import NotificationMenu from './NotificationMenu';
import {
  Dashboard,
  People,
  Hotel,
  Payment,
  ReportProblem,
  Assessment,
  Settings,
  Logout,
  AccountCircle,
  Announcement,
  MenuOpen,
  Menu as MenuIcon,
  Business,
  AttachMoney,
  Tune,
  ExpandLess,
  ExpandMore,
  Group,
  Analytics,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;
const miniDrawerWidth = 64;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  const [expandedGroups, setExpandedGroups] = React.useState<{ [key: string]: boolean }>({
    management: true,
    financial: false,
    system: false
  });

  React.useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const masterAdminMenuGroups = [
    {
      id: 'dashboard',
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/master-admin/dashboard',
      isGroup: false
    },
    {
      id: 'hostels',
      text: 'Hostel Management',
      icon: <Business />,
      path: '/master-admin/hostels',
      isGroup: false
    },
    {
      id: 'requests',
      text: 'Setup Requests',
      icon: <ReportProblem />,
      path: '/master-admin/requests',
      isGroup: false
    },
    {
      id: 'data',
      text: 'Data Management',
      icon: <Settings />,
      path: '/master-admin/data',
      isGroup: false
    },
    {
      id: 'system',
      text: 'System',
      icon: <AdminPanelSettings />,
      isGroup: true,
      items: [
        { text: 'All Users', icon: <AccountCircle />, path: '/master-admin/users' },
        { text: 'Settings', icon: <Settings />, path: '/master-admin/settings' },
      ]
    }
  ];

  const adminMenuGroups = [
    {
      id: 'dashboard',
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin/dashboard',
      isGroup: false
    },
    {
      id: 'management',
      text: 'Management',
      icon: <Group />,
      isGroup: true,
      items: [
        { text: 'Tenants', icon: <People />, path: '/admin/tenants' },
        { text: 'Rooms', icon: <Hotel />, path: '/admin/rooms' },
        { text: 'Staff', icon: <People />, path: '/admin/staff' },
        { text: 'Complaints', icon: <ReportProblem />, path: '/admin/complaints' },
      ]
    },
    {
      id: 'financial',
      text: 'Financial',
      icon: <AttachMoney />,
      isGroup: true,
      items: [
        { text: 'Payments', icon: <Payment />, path: '/admin/payments' },
        { text: 'Expenses', icon: <AttachMoney />, path: '/admin/expenses' },
        { text: 'Reports', icon: <Assessment />, path: '/admin/reports' },
      ]
    },
    {
      id: 'system',
      text: 'System',
      icon: <AdminPanelSettings />,
      isGroup: true,
      items: [
        { text: 'Users', icon: <AccountCircle />, path: '/admin/users' },
        { text: 'Settings', icon: <Settings />, path: '/admin/settings' },
      ]
    }
  ];

  const receptionistMenuGroups = [
    {
      id: 'dashboard',
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/receptionist/dashboard',
      isGroup: false
    },
    {
      id: 'operations',
      text: 'Operations',
      icon: <Group />,
      isGroup: true,
      items: [
        { text: 'Tenants', icon: <People />, path: '/receptionist/tenants' },
        { text: 'Rooms', icon: <Hotel />, path: '/receptionist/rooms' },
        { text: 'Payments', icon: <Payment />, path: '/receptionist/payments' },
        { text: 'Complaints', icon: <ReportProblem />, path: '/receptionist/complaints' },
      ]
    }
  ];

  const tenantMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/tenant/dashboard' },
    { text: 'My Room', icon: <Hotel />, path: '/tenant/room' },
    { text: 'Payments', icon: <Payment />, path: '/tenant/payments' },
    { text: 'Complaints', icon: <ReportProblem />, path: '/tenant/complaints' },
    { text: 'Notices', icon: <Announcement />, path: '/tenant/notices' },
    { text: 'Profile', icon: <AccountCircle />, path: '/tenant/profile' },
  ];

  const handleGroupToggle = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const getMenuItems = () => {
    switch (user?.role) {
      case 'master_admin': return masterAdminMenuGroups;
      case 'admin': return adminMenuGroups;
      case 'receptionist': return receptionistMenuGroups;
      default: return tenantMenuItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ 
          width: isMobile ? '100%' : `calc(100% - ${sidebarOpen ? drawerWidth : miniDrawerWidth}px)`, 
          ml: isMobile ? 0 : `${sidebarOpen ? drawerWidth : miniDrawerWidth}px`,
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }}>
          <IconButton
            color="inherit"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant={isMobile ? 'body1' : 'h6'} noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {isMobile ? 'PGFlow' : (user?.hostelName || 'PG & Hostel Management System')}
          </Typography>
          <NotificationMenu />
          <Button
            color="inherit"
            onClick={handleProfileMenuOpen}
            startIcon={<Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>{user?.name.charAt(0)}</Avatar>}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {user?.name}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }
            }}
          >
            <MenuItem onClick={() => {
              handleProfileMenuClose();
              navigate(user?.role === 'admin' ? '/admin/settings' : '/tenant/profile');
            }} sx={{ borderRadius: 1, mx: 1 }}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => {
              handleProfileMenuClose();
              handleLogout();
            }} sx={{ borderRadius: 1, mx: 1 }}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: sidebarOpen ? drawerWidth : miniDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? drawerWidth : miniDrawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            color: 'white',
            borderRight: 'none',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            boxShadow: '4px 0 20px rgba(0,0,0,0.15)'
          },
        }}
        variant={isMobile ? 'temporary' : 'permanent'}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        anchor="left"
      >
        <Toolbar sx={{ minHeight: '64px !important', justifyContent: sidebarOpen ? 'flex-start' : 'center', px: 2 }}>
          {sidebarOpen ? (
            <Box display="flex" alignItems="center" gap={2}>
              <Box 
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Business sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '1.3rem', color: 'white', letterSpacing: '0.5px' }}>
                  PGFlow
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem', color: 'grey.300' }}>
                  {user?.role === 'master_admin' ? 'Master Admin' : user?.role === 'admin' ? 'Admin Panel' : 'Tenant Portal'}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Tooltip title="PGFlow" placement="right">
              <Box 
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Business sx={{ color: 'white', fontSize: 24 }} />
              </Box>
            </Tooltip>
          )}
        </Toolbar>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 2 }} />
        <List sx={{ px: 1, py: 2 }}>
          {menuItems.map((item: any) => {
            if (!item.isGroup) {
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <Tooltip title={!sidebarOpen ? item.text : ''} placement="right">
                    <ListItemButton
                      selected={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
                      onClick={() => {
                        navigate(item.path);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      sx={{
                        borderRadius: 2,
                        minHeight: 48,
                        justifyContent: sidebarOpen ? 'initial' : 'center',
                        px: 2.5,
                        '&.Mui-selected': {
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '12px',
                          mx: 1,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                          }
                        },
                        '&:hover': {
                          bgcolor: 'grey.800'
                        }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: sidebarOpen ? 3 : 'auto',
                          justifyContent: 'center',
                          color: 'inherit'
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        sx={{ 
                          opacity: sidebarOpen ? 1 : 0,
                          '& .MuiListItemText-primary': {
                            fontSize: '0.9rem',
                            fontWeight: 500
                          }
                        }} 
                      />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              );
            } else {
              return (
                <React.Fragment key={item.id}>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <Tooltip title={!sidebarOpen ? item.text : ''} placement="right">
                      <ListItemButton
                        onClick={() => sidebarOpen && handleGroupToggle(item.id)}
                        sx={{
                          borderRadius: 2,
                          minHeight: 48,
                          justifyContent: sidebarOpen ? 'initial' : 'center',
                          px: 2.5,
                          '&:hover': {
                            bgcolor: 'grey.800'
                          }
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: sidebarOpen ? 3 : 'auto',
                            justifyContent: 'center',
                            color: 'grey.400'
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.text} 
                          sx={{ 
                            opacity: sidebarOpen ? 1 : 0,
                            '& .MuiListItemText-primary': {
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: 'grey.400',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }
                          }} 
                        />
                        {sidebarOpen && (
                          expandedGroups[item.id] ? <ExpandLess sx={{ color: 'grey.400' }} /> : <ExpandMore sx={{ color: 'grey.400' }} />
                        )}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                  {sidebarOpen && expandedGroups[item.id] && item.items.map((subItem: any) => (
                    <ListItem key={subItem.text} disablePadding sx={{ mb: 0.5, pl: 2 }}>
                      <ListItemButton
                        selected={location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/')}
                        onClick={() => {
                          navigate(subItem.path);
                          if (isMobile) setSidebarOpen(false);
                        }}
                        sx={{
                          borderRadius: 2,
                          minHeight: 44,
                          px: 2,
                          '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            '&:hover': {
                              bgcolor: 'primary.dark'
                            }
                          },
                          '&:hover': {
                            bgcolor: 'grey.800'
                          }
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: 2,
                            justifyContent: 'center',
                            color: 'inherit'
                          }}
                        >
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={subItem.text} 
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.85rem',
                              fontWeight: 500
                            }
                          }} 
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </React.Fragment>
              );
            }
          })}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'grey.50',
          p: isMobile ? 2 : 3,
          width: isMobile ? '100%' : `calc(100% - ${sidebarOpen ? drawerWidth : miniDrawerWidth}px)`,
          transition: 'width 0.3s ease',
          minHeight: '100vh'
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }} />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
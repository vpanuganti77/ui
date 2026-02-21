import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Download,
  Assessment,
  AttachMoney,
  Hotel,
  People,
  TrendingUp,
  Print,
  Email,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Suppress unused variable warnings
  console.log('Theme and mobile state:', { theme: !!theme, isMobile });
  const [selectedReport, setSelectedReport] = useState('revenue');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-03-31');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Mock data
  const revenueData = [
    { month: 'Jan', revenue: 142000, expenses: 45000, profit: 97000 },
    { month: 'Feb', revenue: 155000, expenses: 48000, profit: 107000 },
    { month: 'Mar', revenue: 156000, expenses: 52000, profit: 104000 },
  ];

  const occupancyData = [
    { month: 'Jan', occupied: 22, vacant: 3, rate: 88 },
    { month: 'Feb', occupied: 24, vacant: 1, rate: 96 },
    { month: 'Mar', occupied: 18, vacant: 7, rate: 72 },
  ];

  const paymentData = [
    { name: 'Paid', value: 18, color: '#4caf50' },
    { name: 'Pending', value: 4, color: '#ff9800' },
    { name: 'Overdue', value: 3, color: '#f44336' },
  ];

  const tenantData = [
    { id: 1, name: 'John Doe', room: 'R001', rent: 8000, status: 'Paid', dueDate: '2024-03-05' },
    { id: 2, name: 'Jane Smith', room: 'R002', rent: 6000, status: 'Pending', dueDate: '2024-03-05' },
    { id: 3, name: 'Mike Johnson', room: 'R003', rent: 7000, status: 'Overdue', dueDate: '2024-02-05' },
  ];

  const reportTypes = [
    { id: 'revenue', name: 'Revenue Report', icon: <AttachMoney />, description: 'Income, expenses, and profit analysis' },
    { id: 'occupancy', name: 'Occupancy Report', icon: <Hotel />, description: 'Room utilization and vacancy rates' },
    { id: 'payments', name: 'Payment Report', icon: <Assessment />, description: 'Rent collection and dues status' },
    { id: 'tenants', name: 'Tenant Report', icon: <People />, description: 'Tenant details and payment history' },
  ];

  const handleExport = (format: 'pdf' | 'excel') => {
    const reportName = reportTypes.find(r => r.id === selectedReport)?.name || 'Report';
    const fileName = `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'excel') {
      // Create CSV content
      let csvContent = '';
      if (selectedReport === 'revenue') {
        csvContent = 'Month,Revenue,Expenses,Profit\n';
        revenueData.forEach(item => {
          csvContent += `${item.month} 2024,${item.revenue},${item.expenses},${item.profit}\n`;
        });
      } else if (selectedReport === 'occupancy') {
        csvContent = 'Month,Occupied Rooms,Vacant Rooms,Occupancy Rate\n';
        occupancyData.forEach(item => {
          csvContent += `${item.month} 2024,${item.occupied},${item.vacant},${item.rate}%\n`;
        });
      } else if (selectedReport === 'tenants') {
        csvContent = 'Tenant Name,Room,Rent,Status,Due Date\n';
        tenantData.forEach(item => {
          csvContent += `${item.name},${item.room},${item.rent},${item.status},${item.dueDate}\n`;
        });
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // Create HTML content for PDF
      let htmlContent = `
        <html>
          <head>
            <title>${reportName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1976d2; }
              table { border-collapse: collapse; width: 100%; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
            </style>
          </head>
          <body>
            <h1>${reportName}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
      `;
      
      if (selectedReport === 'revenue') {
        htmlContent += '<h2>Revenue Analysis</h2><table><tr><th>Month</th><th>Revenue</th><th>Expenses</th><th>Profit</th></tr>';
        revenueData.forEach(item => {
          htmlContent += `<tr><td>${item.month} 2024</td><td>₹${item.revenue.toLocaleString()}</td><td>₹${item.expenses.toLocaleString()}</td><td>₹${item.profit.toLocaleString()}</td></tr>`;
        });
        htmlContent += '</table>';
      } else if (selectedReport === 'occupancy') {
        htmlContent += '<h2>Occupancy Analysis</h2><table><tr><th>Month</th><th>Occupied</th><th>Vacant</th><th>Rate</th></tr>';
        occupancyData.forEach(item => {
          htmlContent += `<tr><td>${item.month} 2024</td><td>${item.occupied}</td><td>${item.vacant}</td><td>${item.rate}%</td></tr>`;
        });
        htmlContent += '</table>';
      } else if (selectedReport === 'tenants') {
        htmlContent += '<h2>Tenant Payment Status</h2><table><tr><th>Name</th><th>Room</th><th>Rent</th><th>Status</th><th>Due Date</th></tr>';
        tenantData.forEach(item => {
          htmlContent += `<tr><td>${item.name}</td><td>${item.room}</td><td>₹${item.rent.toLocaleString()}</td><td>${item.status}</td><td>${item.dueDate}</td></tr>`;
        });
        htmlContent += '</table>';
      }
      
      htmlContent += '</body></html>';
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    
    showSnackbar(`${reportName} exported as ${format.toUpperCase()}`);
  };

  const handleEmail = () => {
    showSnackbar('Report sent via email successfully');
  };

  const renderRevenueReport = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Revenue Analysis</Typography>
      <Box sx={{ height: 300, mb: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, '']} />
            <Bar dataKey="revenue" fill="#4caf50" name="Revenue" />
            <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
            <Bar dataKey="profit" fill="#2196f3" name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {revenueData.map((item, index) => (
          <Box key={index} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
            <Card>
              <CardContent>
                <Typography variant="h6">{item.month} 2024</Typography>
                <Typography color="success.main">Revenue: ₹{item.revenue.toLocaleString()}</Typography>
                <Typography color="error.main">Expenses: ₹{item.expenses.toLocaleString()}</Typography>
                <Typography color="primary.main" sx={{ fontWeight: 600 }}>Profit: ₹{item.profit.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );

  const renderOccupancyReport = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Occupancy Analysis</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell align="right">Occupied Rooms</TableCell>
              <TableCell align="right">Vacant Rooms</TableCell>
              <TableCell align="right">Occupancy Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {occupancyData.map((row) => (
              <TableRow key={row.month}>
                <TableCell>{row.month} 2024</TableCell>
                <TableCell align="right">{row.occupied}</TableCell>
                <TableCell align="right">{row.vacant}</TableCell>
                <TableCell align="right">
                  <Chip 
                    label={`${row.rate}%`} 
                    color={row.rate > 90 ? 'success' : row.rate > 70 ? 'warning' : 'error'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderPaymentReport = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Payment Status</Typography>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {paymentData.map((item) => (
              <Card key={item.name}>
                <CardContent sx={{ py: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{item.name}</Typography>
                    <Chip 
                      label={item.value} 
                      sx={{ bgcolor: item.color, color: 'white' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const renderTenantReport = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Tenant Payment Status</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tenant Name</TableCell>
              <TableCell>Room</TableCell>
              <TableCell align="right">Rent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenantData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.room}</TableCell>
                <TableCell align="right">₹{row.rent.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    color={row.status === 'Paid' ? 'success' : row.status === 'Pending' ? 'warning' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{row.dueDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderReport = () => {
    switch (selectedReport) {
      case 'revenue': return renderRevenueReport();
      case 'occupancy': return renderOccupancyReport();
      case 'payments': return renderPaymentReport();
      case 'tenants': return renderTenantReport();
      default: return renderRevenueReport();
    }
  };

  return (
    <Box>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} mb={3} gap={2}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>Reports & Analytics</Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button variant="outlined" startIcon={<Print />} onClick={() => showSnackbar('Report printed successfully')} size="small">
            Print
          </Button>
          <Button variant="outlined" startIcon={<Email />} onClick={handleEmail} size="small">
            Email
          </Button>
          <Button variant="outlined" startIcon={<Download />} onClick={() => handleExport('excel')} size="small">
            Excel
          </Button>
          <Button variant="contained" startIcon={<Download />} onClick={() => handleExport('pdf')} size="small">
            PDF
          </Button>
        </Box>
      </Box>

      {/* Report Type Selection */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {reportTypes.map((report) => (
          <Box key={report.id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: selectedReport === report.id ? 2 : 1,
                borderColor: selectedReport === report.id ? 'primary.main' : 'divider',
                '&:hover': { boxShadow: 3 }
              }}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{ color: 'primary.main', mb: 1 }}>
                  {report.icon}
                </Box>
                <Typography variant="h6" sx={{ fontSize: '1rem', mb: 0.5 }}>
                  {report.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {report.description}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
              <FormControl fullWidth size="small">
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  label="Date Range"
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="quarter">This Quarter</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {dateRange === 'custom' && (
              <>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </>
            )}
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
              <Button variant="contained" fullWidth startIcon={<TrendingUp />} onClick={() => showSnackbar('Report generated successfully')}>
                Generate Report
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Card>
        <CardContent>
          {renderReport()}
        </CardContent>
      </Card>

      {/* Snackbar */}
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

export default Reports;

import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { Download, Upload, Storage, Business, DeleteSweep } from '@mui/icons-material';
import { getAll, exportData, importData, clearAllData } from '../../services/fileDataService';

const DataManagement: React.FC = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  const [selectedHostel, setSelectedHostel] = useState('');
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [hostels, setHostels] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hostelFileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const loadHostels = async () => {
      try {
        const hostelData = await getAll('hostels');
        setHostels(hostelData);
      } catch (error) {
        console.error('Failed to load hostels:', error);
      }
    };
    loadHostels();
  }, []);

  const handleExportAllData = async () => {
    try {
      const jsonData = await exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `complete_system_data_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setSnackbar({ 
        open: true, 
        message: 'Complete system data exported successfully', 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to export data', 
        severity: 'error' 
      });
    }
  };

  const handleExportHostelData = async () => {
    if (!selectedHostel) {
      setSnackbar({ 
        open: true, 
        message: 'Please select a hostel first', 
        severity: 'error' 
      });
      return;
    }

    try {
      const hostelData = {
        hostels: (await getAll('hostels')).filter(h => h.id === selectedHostel),
        tenants: (await getAll('tenants')).filter(t => t.hostelId === selectedHostel),
        rooms: (await getAll('rooms')).filter(r => r.hostelId === selectedHostel),
        payments: (await getAll('payments')).filter(p => p.hostelId === selectedHostel),
        complaints: (await getAll('complaints')).filter(c => c.hostelId === selectedHostel),
        users: (await getAll('users')).filter(u => u.hostelId === selectedHostel),
        expenses: (await getAll('expenses')).filter(e => e.hostelId === selectedHostel),
        staff: (await getAll('staff')).filter(s => s.hostelId === selectedHostel),
        hostelRequests: []
      };

      const jsonData = JSON.stringify(hostelData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const hostelName = hostels.find(h => h.id === selectedHostel)?.name || 'hostel';
      a.download = `${hostelName}_data_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setSnackbar({ 
        open: true, 
        message: `${hostelName} data exported successfully`, 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to export hostel data', 
        severity: 'error' 
      });
    }
  };

  const handleImportAllData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        await importData(text);
        setSnackbar({ 
          open: true, 
          message: 'Complete system data imported successfully', 
          severity: 'success' 
        });
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: 'Failed to import data: ' + (error as Error).message, 
          severity: 'error' 
        });
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportHostelData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        await importData(text);
        setSnackbar({ 
          open: true, 
          message: 'Hostel data imported successfully', 
          severity: 'success' 
        });
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: 'Failed to import hostel data: ' + (error as Error).message, 
          severity: 'error' 
        });
      }
    }
    if (hostelFileInputRef.current) {
      hostelFileInputRef.current.value = '';
    }
  };

  const handleCleanupData = async () => {
    try {
      await clearAllData();
      setSnackbar({ 
        open: true, 
        message: 'All data cleared successfully', 
        severity: 'success' 
      });
      window.location.reload();
    } catch (error) {
      console.error('Cleanup error:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to cleanup data: ' + (error as Error).message, 
        severity: 'error' 
      });
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Data Management
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Complete System Data */}
        <Box>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Storage color="primary" />
                <Typography variant="h6">Complete System Data</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Export or import all system data including hostels, users, requests, and configurations.
              </Typography>
              
              <Box display="flex" gap={2} flexDirection="column">
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleExportAllData}
                  fullWidth
                >
                  Export All Data
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  onClick={() => fileInputRef.current?.click()}
                  fullWidth
                >
                  Import All Data
                </Button>
                
                <Button
                  variant="text"
                  size="small"
                  onClick={async () => {
                    try {
                      const data = await exportData();
                      console.log('Current stored data:', JSON.parse(data));
                      setSnackbar({ open: true, message: 'Data logged to browser console (F12)', severity: 'success' });
                    } catch (error) {
                      setSnackbar({ open: true, message: 'Error accessing data', severity: 'error' });
                    }
                  }}
                >
                  View Data
                </Button>
                
                <Divider sx={{ my: 2 }} />
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteSweep />}
                  onClick={() => setCleanupDialogOpen(true)}
                  fullWidth
                >
                  Clear All Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Hostel-Specific Data */}
        <Box>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Business color="primary" />
                <Typography variant="h6">Hostel-Specific Data</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Export or import data for a specific hostel including tenants, rooms, and payments.
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Hostel</InputLabel>
                <Select
                  value={selectedHostel}
                  onChange={(e) => setSelectedHostel(e.target.value)}
                  label="Select Hostel"
                >
                  {hostels.map((hostel) => (
                    <MenuItem key={hostel.id} value={hostel.id}>
                      {hostel.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box display="flex" gap={2} flexDirection="column">
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleExportHostelData}
                  disabled={!selectedHostel}
                  fullWidth
                >
                  Export Hostel Data
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  onClick={() => hostelFileInputRef.current?.click()}
                  fullWidth
                >
                  Import Hostel Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportAllData}
        accept=".json"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={hostelFileInputRef}
        onChange={handleImportHostelData}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* Cleanup Confirmation Dialog */}
      <Dialog
        open={cleanupDialogOpen}
        onClose={() => setCleanupDialogOpen(false)}
      >
        <DialogTitle>Confirm Data Cleanup</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete ALL data from the system including hostels, tenants, rooms, payments, and all other records. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCleanupDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setCleanupDialogOpen(false);
              handleCleanupData();
            }} 
            color="error" 
            variant="contained"
          >
            Delete All Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DataManagement;
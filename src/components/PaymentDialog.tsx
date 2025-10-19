import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { getAll } from '../services/fileDataService';
import { triggerNotificationRefresh } from '../utils/notificationTrigger';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    tenantId: '',
    tenantName: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    paymentMethod: '',
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });
  const [tenantsWithDues, setTenantsWithDues] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setFormData({
          tenantId: editingItem.tenantId || '',
          tenantName: editingItem.tenantName || '',
          amount: editingItem.amount?.toString() || '',
          month: editingItem.month || new Date().getMonth() + 1,
          year: editingItem.year || new Date().getFullYear(),
          paymentMethod: editingItem.paymentMethod || '',
          transactionId: editingItem.transactionId || '',
          paymentDate: editingItem.paymentDate || new Date().toISOString().split('T')[0]
        });
      } else {
        loadTenantsWithDues();
        setFormData({
          tenantId: '',
          tenantName: '',
          amount: '',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          paymentMethod: '',
          transactionId: '',
          paymentDate: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [open, editingItem]);

  const loadTenantsWithDues = async () => {
    try {
      const [tenants, payments] = await Promise.all([
        getAll('tenants'),
        getAll('payments')
      ]);

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const tenantsWithDuePayments = tenants.filter((tenant: any) => {
        // Check if tenant has pending dues or no payment for current month
        const hasCurrentMonthPayment = payments.some((payment: any) => 
          payment.tenantId === tenant.id && 
          payment.month === currentMonth && 
          payment.year === currentYear &&
          payment.status === 'paid'
        );
        
        return !hasCurrentMonthPayment || tenant.pendingDues > 0;
      }).map((tenant: any) => ({
        ...tenant,
        dueAmount: tenant.pendingDues || tenant.rent || 0
      }));

      setTenantsWithDues(tenantsWithDuePayments);
    } catch (error) {
      console.error('Error loading tenants with dues:', error);
    }
  };

  const handleTenantSelect = (tenantId: string) => {
    const tenant = tenantsWithDues.find(t => t.id === tenantId);
    if (tenant) {
      setSelectedTenant(tenant);
      setFormData(prev => ({
        ...prev,
        tenantId: tenant.id,
        tenantName: tenant.name,
        amount: tenant.dueAmount.toString()
      }));
    }
  };

  const handleSubmit = async () => {
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      status: 'paid'
    };

    // Update tenant's pending dues
    if (selectedTenant && !editingItem) {
      try {
        const { update } = await import('../services/fileDataService');
        const newPendingDues = Math.max(0, selectedTenant.pendingDues - parseFloat(formData.amount));
        await update('tenants', selectedTenant.id, {
          ...selectedTenant,
          pendingDues: newPendingDues
        });
      } catch (error) {
        console.error('Error updating tenant dues:', error);
      }
    }

    onSubmit(submitData);
    triggerNotificationRefresh();
    onClose();
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingItem ? 'Edit Payment' : 'Record New Payment'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {!editingItem && (
            <>
              <Typography variant="subtitle2" color="text.secondary">
                Select tenant with pending payment:
              </Typography>
              <FormControl fullWidth required>
                <InputLabel>Tenant</InputLabel>
                <Select
                  value={formData.tenantId}
                  onChange={(e) => handleTenantSelect(e.target.value)}
                  label="Tenant"
                >
                  {tenantsWithDues.map((tenant) => (
                    <MenuItem key={tenant.id} value={tenant.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{tenant.name} - {tenant.room}</span>
                        <Chip 
                          label={`₹${tenant.dueAmount}`} 
                          size="small" 
                          color="error" 
                          variant="outlined"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
          
          {(editingItem || selectedTenant) && (
            <>
              <TextField
                label="Tenant Name"
                value={formData.tenantName}
                disabled
                fullWidth
              />
              
              <TextField
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                fullWidth
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                    label="Month"
                  >
                    {months.map((month, index) => (
                      <MenuItem key={index + 1} value={index + 1}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="Year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  sx={{ flex: 1 }}
                />
              </Box>
              
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  label="Payment Method"
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="online">Online Transfer</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="cheque">Cheque</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Transaction ID"
                value={formData.transactionId}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                fullWidth
                helperText="Optional for cash payments"
              />
              
              <TextField
                label="Payment Date"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.tenantId || !formData.amount || !formData.paymentMethod}
        >
          {editingItem ? 'Update' : 'Record'} Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
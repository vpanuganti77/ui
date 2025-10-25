import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Chip, Typography } from '@mui/material';
import ListPage from '../../components/common/ListPage';
import { SupportTicketService } from '../../services/supportTicketService';

const SupportTickets: React.FC = () => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'subject', 
      headerName: 'Subject', 
      flex: 2, 
      minWidth: 200 
    },
    {
      field: 'submittedBy',
      headerName: 'Submitted By',
      width: 150,
    },
    {
      field: 'hostelName',
      headerName: 'Hostel',
      width: 150,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getPriorityColor(params.value) as any}
          size="small"
          variant="filled"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value) as any}
          size="small"
          variant="filled"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      valueFormatter: (params: any) => {
        if (!params) return '';
        const value = params.value || params.row?.createdAt;
        return value ? new Date(value).toLocaleDateString() : '';
      }
    }
  ];

  const updateFields = [
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'open', label: 'Open' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' },
      ],
    },
    {
      name: 'adminNotes',
      label: 'Admin Notes',
      type: 'textarea' as const,
      rows: 3,
      flex: '1 1 100%',
    },
  ];

  const handleUpdate = async (id: string, data: any, originalData: any) => {
    // Check if status changed to resolved
    if (originalData.status !== 'resolved' && data.status === 'resolved') {
      await SupportTicketService.handleTicketStatusUpdate(id, originalData.status, data.status);
    }
  };

  return (
    <ListPage
      title="Support Tickets"
      data={[]}
      columns={columns}
      fields={updateFields}
      entityName="Support Ticket"
      entityKey="supportTickets"
      idField="id"
      hideAdd={true}
      hideDelete={true}
      onUpdate={handleUpdate}
      mobileCardConfig={{
        titleField: 'subject',
        fields: [
          { key: 'submittedBy', label: 'From', value: 'submittedBy' },
          { key: 'hostelName', label: 'Hostel', value: 'hostelName' },
          { key: 'category', label: 'Category', value: 'category' },
          { key: 'priority', label: 'Priority', value: 'priority' },
          { key: 'status', label: 'Status', value: 'status' },
          { key: 'createdAt', label: 'Created', value: 'createdAt', render: (value: string) => new Date(value).toLocaleDateString() }
        ]
      }}
    />
  );
};

export default SupportTickets;
import React from 'react';
import { Button, Box } from '@mui/material';
import { Download, Upload } from '@mui/icons-material';
import { exportData, importData } from '../services/fileDataService';

interface DataManagerProps {
  onDataChange?: () => void;
}

const DataManager: React.FC<DataManagerProps> = ({ onDataChange }) => {
  const handleExport = async () => {
    try {
      const jsonData = await exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pgflow_data_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        await importData(text);
        onDataChange?.();
      } catch (error) {
        console.error('Import failed:', error);
      }
    }
  };

  return (
    <Box display="flex" gap={2}>
      <Button
        variant="outlined"
        startIcon={<Download />}
        onClick={handleExport}
      >
        Export Data
      </Button>
      <Button
        variant="outlined"
        startIcon={<Upload />}
        component="label"
      >
        Import Data
        <input
          type="file"
          accept=".json"
          hidden
          onChange={handleImport}
        />
      </Button>
    </Box>
  );
};

export default DataManager;
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Drawer,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
  Fab,
  Badge
} from '@mui/material';
import { Search, FilterList, Sort, Close, Tune } from '@mui/icons-material';

interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface SortOption {
  key: string;
  label: string;
  order: 'asc' | 'desc';
}

interface MobileFilterSortProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: Record<string, string>;
  onFiltersChange: (filters: Record<string, string>) => void;
  filterOptions: FilterOption[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  sortOptions: SortOption[];
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const MobileFilterSort: React.FC<MobileFilterSortProps> = ({
  searchValue,
  onSearchChange,
  filters,
  onFiltersChange,
  filterOptions,
  sortBy,
  sortOrder,
  onSortChange,
  sortOptions,
  onApplyFilters,
  onClearFilters
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false);
  const [showFloatingFilter, setShowFloatingFilter] = useState(false);

  // Show floating filter button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100;
      setShowFloatingFilter(scrolled);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(value => value).length;

  if (!isMobile) return null;

  return (
    <>
      {/* Mobile filter/sort bar */}
      <Box sx={{ 
        display: 'flex',
        gap: 1, 
        mb: 2, 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: 'background.paper',
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <TextField
          size="small"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            )
          }}
        />
        {filterOptions.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterList />}
            onClick={() => setFilterDrawerOpen(true)}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Filter
          </Button>
        )}
        <Button
          variant="outlined"
          size="small"
          startIcon={<Sort />}
          onClick={() => setSortDrawerOpen(true)}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          Sort
        </Button>
      </Box>

      {/* Filter Drawer */}
      <Drawer
        anchor="bottom"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ p: 2, minHeight: 300 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filterOptions.map((filterOption) => (
              <FormControl key={filterOption.key} fullWidth>
                <InputLabel>{filterOption.label}</InputLabel>
                <Select
                  value={filters[filterOption.key] || ''}
                  label={filterOption.label}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    [filterOption.key]: e.target.value
                  })}
                >
                  <MenuItem value="">All {filterOption.label}</MenuItem>
                  {filterOption.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
            
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  onClearFilters();
                  setFilterDrawerOpen(false);
                }}
              >
                Clear All
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  onApplyFilters();
                  setFilterDrawerOpen(false);
                }}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
      
      {/* Sort Drawer */}
      <Drawer
        anchor="bottom"
        open={sortDrawerOpen}
        onClose={() => setSortDrawerOpen(false)}
      >
        <Box sx={{ p: 2, minHeight: 250 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Sort Options</Typography>
            <IconButton onClick={() => setSortDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          
          <List>
            {sortOptions.map((option, index) => (
              <React.Fragment key={`${option.key}-${option.order}`}>
                <ListItemButton 
                  selected={sortBy === option.key && sortOrder === option.order}
                  onClick={() => {
                    onSortChange(option.key, option.order);
                    setSortDrawerOpen(false);
                  }}
                >
                  <ListItemText primary={option.label} />
                </ListItemButton>
                {index < sortOptions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>
      
      {/* Floating Filter Buttons - Top Right */}
      {isMobile && showFloatingFilter && (
        <Box sx={{ 
          position: 'fixed', 
          top: 80, 
          right: 16, 
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 0.5,
          boxShadow: 3
        }}>
          <Badge badgeContent={activeFiltersCount} color="primary">
            <IconButton
              color="primary"
              size="small"
              onClick={() => setFilterDrawerOpen(true)}
              sx={{ 
                bgcolor: 'primary.50',
                '&:hover': { bgcolor: 'primary.100' }
              }}
            >
              <Tune fontSize="small" />
            </IconButton>
          </Badge>
          <IconButton
            color="secondary"
            size="small"
            onClick={() => setSortDrawerOpen(true)}
            sx={{ 
              bgcolor: 'secondary.50',
              '&:hover': { bgcolor: 'secondary.100' }
            }}
          >
            <Sort fontSize="small" />
          </IconButton>
        </Box>
      )}
    </>
  );
};

export default MobileFilterSort;
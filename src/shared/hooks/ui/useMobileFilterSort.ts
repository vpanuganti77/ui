import { useState, useMemo } from 'react';

interface UseMobileFilterSortProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  filterFields?: Record<string, (item: T) => string>;
  sortFields?: Record<string, (a: T, b: T) => number>;
}

export const useMobileFilterSort = <T extends Record<string, any>>({
  data,
  searchFields,
  filterFields = {},
  sortFields = {}
}: UseMobileFilterSortProps<T>) => {
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      // Search filter (immediate)
      const matchesSearch = !searchValue || searchFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchValue.toLowerCase());
      });

      // Applied filters (on button click)
      const matchesFilters = Object.entries(appliedFilters).every(([key, value]) => {
        if (!value) return true;
        const filterFn = filterFields[key];
        return filterFn ? filterFn(item) === value : item[key] === value;
      });

      return matchesSearch && matchesFilters;
    });

    // Apply sorting
    if (sortBy && sortFields[sortBy]) {
      filtered.sort((a, b) => {
        const result = sortFields[sortBy](a, b);
        return sortOrder === 'desc' ? -result : result;
      });
    }

    return filtered;
  }, [data, searchValue, appliedFilters, sortBy, sortOrder, searchFields, filterFields, sortFields]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const handleClearFilters = () => {
    setFilters({});
    setAppliedFilters({});
    setSearchValue('');
  };

  return {
    searchValue,
    filters,
    appliedFilters,
    sortBy,
    sortOrder,
    filteredAndSortedData,
    handleSearchChange,
    handleFiltersChange,
    handleSortChange,
    handleApplyFilters,
    handleClearFilters
  };
};

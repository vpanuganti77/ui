import React, { useState, useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Business, People, Payment, TrendingUp } from '@mui/icons-material';

const stats = [
  { icon: <Business />, value: 500, label: 'Active Hostels', suffix: '+' },
  { icon: <People />, value: 15000, label: 'Happy Tenants', suffix: '+' },
  { icon: <Payment />, value: 2.5, label: 'Crores Processed', suffix: 'Cr+' },
  { icon: <TrendingUp />, value: 99.9, label: 'Uptime', suffix: '%' }
];

const StatsCounter: React.FC = () => {
  const [counters, setCounters] = useState(stats.map(() => 0));

  useEffect(() => {
    const timers = stats.map((stat, index) => {
      const increment = stat.value / 100;
      let current = 0;
      
      return setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timers[index]);
        }
        setCounters(prev => {
          const newCounters = [...prev];
          newCounters[index] = Math.floor(current);
          return newCounters;
        });
      }, 20);
    });

    return () => timers.forEach(timer => clearInterval(timer));
  }, []);

  return (
    <Box sx={{ py: 8, bgcolor: 'primary.main', color: 'white' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 4 }}>
          {stats.map((stat, index) => (
            <Box key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2, opacity: 0.8 }}>
                  {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {counters[index]}{stat.suffix}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {stat.label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default StatsCounter;
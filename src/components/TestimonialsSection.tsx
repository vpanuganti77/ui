import React from 'react';
import { Box, Typography, Container, Card, CardContent, Avatar, Rating } from '@mui/material';

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Hostel Owner, Mumbai',
    rating: 5,
    text: 'HostelPro transformed our operations. Revenue increased by 40% in just 3 months!',
    avatar: 'RK'
  },
  {
    name: 'Priya Sharma',
    role: 'Manager, Delhi Hostels',
    rating: 5,
    text: 'The automated payment system saved us 15 hours per week. Highly recommended!',
    avatar: 'PS'
  },
  {
    name: 'Amit Patel',
    role: 'Hostel Chain Owner',
    rating: 5,
    text: 'Managing 5 hostels is now effortless. The analytics help us make better decisions.',
    avatar: 'AP'
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" textAlign="center" sx={{ mb: 2, fontWeight: 700 }}>
          Trusted by 500+ Hostel Owners
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          See what our customers say about us
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          {testimonials.map((testimonial, index) => (
            <Box key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: 3 }}>
                  <Avatar sx={{ 
                    width: 60, 
                    height: 60, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '1.5rem',
                    fontWeight: 600
                  }}>
                    {testimonial.avatar}
                  </Avatar>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                    "{testimonial.text}"
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {testimonial.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {testimonial.role}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;

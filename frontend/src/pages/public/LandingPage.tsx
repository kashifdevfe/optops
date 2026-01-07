import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import logoImage from '../../assets/logootpos.png';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      title: 'Powerful Dashboard',
      description: 'Comprehensive analytics and insights at your fingertips',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure & Isolated',
      description: 'Multi-tenant architecture with complete data isolation',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Lightning Fast',
      description: 'Built for performance and scalability',
    },
    {
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      title: 'Fully Customizable',
      description: 'Branding and theme customization for every company',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFFFFF', position: 'relative' }}>
      {/* Subtle background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
          opacity: 0.5,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            pt: { xs: 8, md: 12 },
            pb: { xs: 6, md: 10 },
            textAlign: 'center',
          }}
        >
          <Box
            component="img"
            src={logoImage}
            alt="OPTOPS Logo"
            sx={{
              maxWidth: { xs: '180px', md: '280px' },
              height: 'auto',
              mb: 5,
              display: 'block',
              mx: 'auto',
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08))',
            }}
          />
          
          <Typography 
            variant="h3" 
            sx={{ 
              mb: 3, 
              color: '#1A1A1A',
              fontWeight: 700,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              letterSpacing: '-0.02em',
            }}
          >
            Multi-tenant SaaS Platform
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 6, 
              color: '#666666', 
              maxWidth: '680px', 
              mx: 'auto',
              fontWeight: 400,
              lineHeight: 1.6,
              fontSize: { xs: '1rem', md: '1.125rem' },
            }}
          >
            Enterprise-grade SaaS solution with complete tenant isolation, customizable branding, and powerful management tools.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 8 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/signup')}
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                px: 4, 
                py: 1.75,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ 
                px: 4, 
                py: 1.75,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Sign In
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3} sx={{ pb: { xs: 8, md: 12 } }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'left',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: '#FFFFFF',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)',
                    borderColor: 'rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box 
                    sx={{ 
                      color: 'primary.main', 
                      mb: 3,
                      display: 'inline-flex',
                      p: 1.5,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(212, 175, 55, 0.08)',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1.5, 
                      fontWeight: 700,
                      color: '#1A1A1A',
                      fontSize: '1.125rem',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: '#666666',
                      lineHeight: 1.6,
                      fontSize: '0.9375rem',
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  useTheme,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.js';
import { signup } from '../../store/slices/authSlice.js';

export const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userEmail: '',
    userName: '',
    address: '',
    phone: '',
    whatsapp: '',
  });
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(signup(formData)).unwrap();
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        p: 2,
        position: 'relative',
      }}
    >
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
      
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 1.5,
              color: '#1A1A1A',
              fontSize: { xs: '2rem', md: '2.5rem' },
              letterSpacing: '-0.02em',
            }}
          >
            Create Your Company Account
          </Typography>
          <Typography variant="body1" sx={{ color: '#666666', fontSize: '1rem' }}>
            Get started with your free account today
          </Typography>
        </Box>
        <Card
          sx={{
            borderRadius: '12px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
            backgroundColor: '#FFFFFF',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  fontWeight: 700,
                  color: '#1A1A1A',
                  fontSize: '1.125rem',
                }}
              >
                Company Information
              </Typography>
              <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={formData.name}
                    onChange={handleChange('name')}
                    required
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    required
                    autoComplete="email"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    required
                    helperText="Minimum 8 characters"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Address"
                    value={formData.address}
                    onChange={handleChange('address')}
                    placeholder="Shops 1-3 (Basement), Faisal Plaza, Near ZAH Medical Centre, Abubakkar Block, H-13, Islamabad"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    placeholder="+92 3299112277"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="WhatsApp Number"
                    value={formData.whatsapp}
                    onChange={handleChange('whatsapp')}
                    placeholder="+92 3299112277"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  fontWeight: 700,
                  color: '#1A1A1A',
                  fontSize: '1.125rem',
                }}
              >
                Admin User Information
              </Typography>
              <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    value={formData.userName}
                    onChange={handleChange('userName')}
                    required
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Your Email"
                    type="email"
                    value={formData.userEmail}
                    onChange={handleChange('userEmail')}
                    required
                    autoComplete="email"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mt: 2, 
                  mb: 2,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  py: 1.5,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

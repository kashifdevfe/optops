import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  useTheme,
} from '@mui/material';
import { adminApi } from '../../services/api.js';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await adminApi.login({ email, password });

      // Save token if returned (assuming result has accessToken as updated in backend service/controller)
      // The adminApi.login return type might need update in frontend api.ts but `result` will have it at runtime
      if ((result as any).accessToken) {
        localStorage.setItem('accessToken', (result as any).accessToken);
      }

      navigate('/admin/companies');
    } catch (err: any) {
      console.error('AdminLoginPage - Login error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            boxShadow: theme.shadows[10],
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, textAlign: 'center', color: 'text.primary' }}>
              Super Admin Login
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              Access super admin panel with super admin credentials
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
                autoComplete="email"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};


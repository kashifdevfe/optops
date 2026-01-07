import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button as MuiButton } from '@mui/material';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.js';
import { login } from '../../store/slices/authSlice.js';
import { authApi } from '../../services/api.js';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(login({ email, password })).unwrap();
    navigate('/dashboard');
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError('Please enter your email address');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError('');

    try {
      const result = await authApi.forgotPassword(forgotPasswordEmail);
      setResetEmail(result.email);
      setForgotPasswordOpen(false);
      setResetPasswordOpen(true);
      setForgotPasswordEmail('');
    } catch (err: any) {
      setForgotPasswordError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setForgotPasswordLoading(false);
    }
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
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
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
            Sign In
          </Typography>
          <Typography variant="body1" sx={{ color: '#666666', fontSize: '1rem' }}>
            Welcome back! Please sign in to your account.
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
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mt: 3, 
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
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link to="/signup" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                    Sign up
                  </Link>
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Button
                  onClick={() => setForgotPasswordOpen(true)}
                  sx={{ color: theme.palette.primary.main, textTransform: 'none', fontSize: '0.875rem' }}
                >
                  Forgot password?
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>

      {/* Forgot Password Dialog */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={() => setForgotPasswordOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem', pb: 1 }}>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your company email address. A new password will be generated and displayed for you to copy.
          </Typography>
          {forgotPasswordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {forgotPasswordError}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Company Email"
            type="email"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            margin="normal"
            required
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={() => setForgotPasswordOpen(false)}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleForgotPassword} 
            variant="contained" 
            disabled={forgotPasswordLoading}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {forgotPasswordLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Success Dialog */}
      <Dialog 
        open={resetPasswordOpen} 
        onClose={() => setResetPasswordOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem', pb: 1 }}>Password Reset Email Sent</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Password reset email has been sent successfully!
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            We've sent a password reset email to <strong>{resetEmail}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please check your email inbox (and spam folder) for the new password. Use that password to log in, and then change it from the Company Settings page.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> If you don't receive the email within a few minutes, please check your spam folder or contact support.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setResetPasswordOpen(false)} 
            variant="contained" 
            color="primary"
            fullWidth
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              py: 1.25,
            }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

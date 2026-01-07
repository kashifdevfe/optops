import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  useTheme,
  Alert,
} from '@mui/material';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const theme = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            OptOps
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary' }}>
            Reset Password
          </Typography>
        </Box>
        <Card>
          <CardContent sx={{ p: 4 }}>
            {submitted ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                If an account exists with this email, you will receive password reset instructions.
              </Alert>
            ) : (
              <form onSubmit={handleSubmit}>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>
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
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Send Reset Link
                </Button>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontSize: '0.875rem' }}>
                    Back to Sign In
                  </Link>
                </Box>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

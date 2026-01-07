import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Alert, Divider, FormControlLabel, Switch } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { companyApi } from '../../services/api.js';
import { initializeAuth } from '../../store/slices/authSlice.js';

export const CompanySettingsPage: React.FC = () => {
  const { company } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [name, setName] = useState(company?.name || '');
  const [address, setAddress] = useState(company?.address || '');
  const [phone, setPhone] = useState(company?.phone || '');
  const [whatsapp, setWhatsapp] = useState(company?.whatsapp || '');
  const [ecommerceEnabled, setEcommerceEnabled] = useState(company?.ecommerceEnabled || false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (company) {
      setName(company.name || '');
      setAddress(company.address || '');
      setPhone(company.phone || '');
      setWhatsapp(company.whatsapp || '');
      setEcommerceEnabled(company.ecommerceEnabled || false);
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      await companyApi.updateSettings({ 
        name,
        address: address || undefined,
        phone: phone || undefined,
        whatsapp: whatsapp || undefined,
        ecommerceEnabled,
      });
      // Refresh company data in Redux
      await dispatch(initializeAuth());
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess(false);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      setPasswordLoading(false);
      return;
    }

    try {
      await companyApi.updatePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
          Company Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update your company information and preferences
        </Typography>
      </Box>
      <Card>
        <CardContent sx={{ p: 4 }}>
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Settings updated successfully
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Company Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              value={company?.email || ''}
              margin="normal"
              disabled
              helperText="Email cannot be changed"
            />
            <TextField
              fullWidth
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              margin="normal"
              placeholder="Shops 1-3 (Basement), Faisal Plaza, Near ZAH Medical Centre, Abubakkar Block, H-13, Islamabad"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              margin="normal"
              placeholder="+92 3299112277"
            />
            <TextField
              fullWidth
              label="WhatsApp Number"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              margin="normal"
              placeholder="+92 3299112277"
            />
            <Box sx={{ mt: 3, mb: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Ecommerce Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={ecommerceEnabled}
                    onChange={(e) => setEcommerceEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Enable Ecommerce
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      When enabled, your products will be visible on the public ecommerce website
                    </Typography>
                  </Box>
                }
              />
            </Box>
            <Box sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Change Password
          </Typography>
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Password updated successfully
            </Alert>
          )}
          {passwordError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {passwordError}
            </Alert>
          )}
          <form onSubmit={handlePasswordChange}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              required
              helperText="Password must be at least 6 characters long"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
            />
            <Box sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" size="large" disabled={passwordLoading}>
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

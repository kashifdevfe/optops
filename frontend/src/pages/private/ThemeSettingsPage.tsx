import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Alert, Grid, MenuItem } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { companyApi } from '../../services/api.js';
import { updateThemeSettings } from '../../store/slices/authSlice.js';

// Available font families with proper fallbacks
const FONT_FAMILIES = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Raleway, sans-serif', label: 'Raleway' },
  { value: 'Ubuntu, sans-serif', label: 'Ubuntu' },
  { value: 'Nunito, sans-serif', label: 'Nunito' },
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
  { value: 'Merriweather, serif', label: 'Merriweather' },
  { value: 'Lora, serif', label: 'Lora' },
  { value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro' },
  { value: 'Oswald, sans-serif', label: 'Oswald' },
  { value: 'Dancing Script, cursive', label: 'Dancing Script' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
];

export const ThemeSettingsPage: React.FC = () => {
  const { themeSettings } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    primaryColor: '#D4AF37',
    secondaryColor: '#FFD700',
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F5F5F5',
    textColor: '#000000',
    fontFamily: 'Inter, sans-serif',
    logoUrl: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (themeSettings) {
      setFormData({
        primaryColor: themeSettings.primaryColor,
        secondaryColor: themeSettings.secondaryColor,
        backgroundColor: themeSettings.backgroundColor,
        surfaceColor: themeSettings.surfaceColor,
        textColor: themeSettings.textColor,
        fontFamily: themeSettings.fontFamily,
        logoUrl: themeSettings.logoUrl || '',
      });
      setLogoPreview(themeSettings.logoUrl || null);
    }
  }, [themeSettings]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, fontFamily: e.target.value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, logoUrl: base64String }));
      setLogoPreview(base64String);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const updated = await companyApi.updateThemeSettings({
        ...formData,
        logoUrl: formData.logoUrl || null,
      });
      dispatch(updateThemeSettings(updated));
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update theme settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
          Theme Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Customize your application's appearance and branding
        </Typography>
      </Box>
      <Card>
        <CardContent sx={{ p: 4 }}>
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Theme settings updated successfully
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Primary Color"
                  type="color"
                  value={formData.primaryColor}
                  onChange={handleChange('primaryColor')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Secondary Color"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={handleChange('secondaryColor')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Background Color"
                  type="color"
                  value={formData.backgroundColor}
                  onChange={handleChange('backgroundColor')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Surface Color"
                  type="color"
                  value={formData.surfaceColor}
                  onChange={handleChange('surfaceColor')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Text Color"
                  type="color"
                  value={formData.textColor}
                  onChange={handleChange('textColor')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Font Family"
                  value={formData.fontFamily}
                  onChange={handleFontFamilyChange}
                  helperText="Select a font family for your application"
                >
                  {FONT_FAMILIES.map((font) => (
                    <MenuItem key={font.value} value={font.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontFamily: font.value }}>{font.label}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto' }}>
                          {font.value}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload">
                    <Button variant="outlined" component="span" sx={{ mb: 2 }}>
                      Upload Logo
                    </Button>
                  </label>
                  {logoPreview && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                        />
                        <Button variant="outlined" color="error" onClick={handleRemoveLogo}>
                          Remove Logo
                        </Button>
                      </Box>
                    </Box>
                  )}
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                    Upload your company logo (max 2MB). The logo will be stored as base64.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Saving...' : 'Save Theme Settings'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

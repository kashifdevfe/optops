import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import { clpcApi } from '../../services/api.js';
import type { CalculateClpcDto, ClpcResult } from '../../types/index.js';

export const ClpcPage: React.FC = () => {
  const [formData, setFormData] = useState<CalculateClpcDto>({
    backVertexDistance: 12,
    rightEyeSphere: 0,
    rightEyeCylinder: 0,
    rightEyeAxis: 0,
    leftEyeSphere: 0,
    leftEyeCylinder: 0,
    leftEyeAxis: 0,
  });
  const [result, setResult] = useState<ClpcResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof CalculateClpcDto) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const data = await clpcApi.calculate(formData);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to calculate contact lens power');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
          Contact Lens Power Calculator
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Calculate contact lens power from spectacle prescription with axis correction
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Back Vertex Distance (mm)"
                  type="number"
                  value={formData.backVertexDistance}
                  onChange={handleChange('backVertexDistance')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Right Eye
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Sphere"
                  type="number"
                  value={formData.rightEyeSphere}
                  onChange={handleChange('rightEyeSphere')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Cylinder"
                  type="number"
                  value={formData.rightEyeCylinder}
                  onChange={handleChange('rightEyeCylinder')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Axis"
                  type="number"
                  value={formData.rightEyeAxis}
                  onChange={handleChange('rightEyeAxis')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Left Eye
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Sphere"
                  type="number"
                  value={formData.leftEyeSphere}
                  onChange={handleChange('leftEyeSphere')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Cylinder"
                  type="number"
                  value={formData.leftEyeCylinder}
                  onChange={handleChange('leftEyeCylinder')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Axis"
                  type="number"
                  value={formData.leftEyeAxis}
                  onChange={handleChange('leftEyeAxis')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<CalculateIcon />}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Calculating...' : 'Calculate Contact Lens Power'}
                </Button>
              </Grid>
            </Grid>
          </form>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          {result && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Results
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Right Eye
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body1">
                          <strong>Sphere:</strong> {result.rightEye.sphere}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Cylinder:</strong> {result.rightEye.cylinder}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Axis:</strong> {result.rightEye.axis}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Left Eye
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body1">
                          <strong>Sphere:</strong> {result.leftEye.sphere}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Cylinder:</strong> {result.leftEye.cylinder}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Axis:</strong> {result.leftEye.axis}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

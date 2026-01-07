import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import RefreshIcon from '@mui/icons-material/Refresh';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

export const RadiusDiopterCalculator: React.FC = () => {
  const [radius, setRadius] = useState<number>(7.5);
  const [diopters, setDiopters] = useState<number>(45.0);
  const [conversionType, setConversionType] = useState<'radiusToDiopter' | 'diopterToRadius'>('radiusToDiopter');

  // Generate radius options from 6.00 to 10.00 mm in 0.05 steps
  const radiusOptions = [];
  for (let i = 6.0; i <= 10.0; i += 0.05) {
    radiusOptions.push(parseFloat(i.toFixed(2)));
  }

  // Generate diopter options from 36.00 to 60.00 in 0.25 steps
  const diopterOptions = [];
  for (let i = 36.0; i <= 60.0; i += 0.25) {
    diopterOptions.push(parseFloat(i.toFixed(2)));
  }

  // Convert radius (mm) to diopters: D = 337.5 / r
  const radiusToDiopter = (radiusMm: number): number => {
    return 337.5 / radiusMm;
  };

  // Convert diopters to radius (mm): r = 337.5 / D
  const diopterToRadius = (diopter: number): number => {
    return 337.5 / diopter;
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    const calculatedDiopters = radiusToDiopter(newRadius);
    setDiopters(parseFloat(calculatedDiopters.toFixed(2)));
  };

  const handleDiopterChange = (newDiopters: number) => {
    setDiopters(newDiopters);
    const calculatedRadius = diopterToRadius(newDiopters);
    setRadius(parseFloat(calculatedRadius.toFixed(2)));
  };

  const handleSwap = () => {
    setConversionType(conversionType === 'radiusToDiopter' ? 'diopterToRadius' : 'radiusToDiopter');
  };

  const handleReset = () => {
    setRadius(7.5);
    setDiopters(45.0);
    setConversionType('radiusToDiopter');
  };

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Radius and Diopter Conversion
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Convert corneal curvature between millimeters (radius) and diopters (power) using the standard keratometric index (1.3375).
          Useful for comparing K readings, topography outputs, and contact lens base curves.
        </Typography>

        <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Conversion Formula:
          </Typography>
          <Typography variant="body2" component="div">
            • <strong>Radius to Diopters:</strong> D = 337.5 ÷ r (r in mm)
            <br />
            • <strong>Diopters to Radius:</strong> r = 337.5 ÷ D
            <br />
            • Uses keratometric index of <strong>1.3375</strong> (standard SimK convention)
            <br />
            • <strong>Shorter radius</strong> = steeper cornea = higher dioptric value
            <br />
            • <strong>Longer radius</strong> = flatter cornea = lower dioptric value
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          {conversionType === 'radiusToDiopter' ? (
            <>
              <Grid item xs={12} md={5}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Radius to Diopters
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Radius (mm)</InputLabel>
                    <Select
                      value={radius}
                      onChange={(e) => handleRadiusChange(e.target.value as number)}
                      label="Radius (mm)"
                    >
                      {radiusOptions.map((val) => (
                        <MenuItem key={val} value={val}>
                          {val.toFixed(2)} mm
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.contrastText' }}>
                      {diopters.toFixed(2)} D
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={handleSwap}
                  sx={{ minWidth: 56, minHeight: 56, borderRadius: '50%' }}
                >
                  <SwapHorizIcon />
                </Button>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Diopters to Radius
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Diopters (D)</InputLabel>
                    <Select
                      value={diopters}
                      onChange={(e) => handleDiopterChange(e.target.value as number)}
                      label="Diopters (D)"
                    >
                      {diopterOptions.map((val) => (
                        <MenuItem key={val} value={val}>
                          {val.toFixed(2)} D
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.contrastText' }}>
                      {radius.toFixed(2)} mm
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} md={5}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Diopters to Radius
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Diopters (D)</InputLabel>
                    <Select
                      value={diopters}
                      onChange={(e) => handleDiopterChange(e.target.value as number)}
                      label="Diopters (D)"
                    >
                      {diopterOptions.map((val) => (
                        <MenuItem key={val} value={val}>
                          {val.toFixed(2)} D
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.contrastText' }}>
                      {radius.toFixed(2)} mm
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={handleSwap}
                  sx={{ minWidth: 56, minHeight: 56, borderRadius: '50%' }}
                >
                  <SwapHorizIcon />
                </Button>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Radius to Diopters
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Radius (mm)</InputLabel>
                    <Select
                      value={radius}
                      onChange={(e) => handleRadiusChange(e.target.value as number)}
                      label="Radius (mm)"
                    >
                      {radiusOptions.map((val) => (
                        <MenuItem key={val} value={val}>
                          {val.toFixed(2)} mm
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.contrastText' }}>
                      {diopters.toFixed(2)} D
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Clinical Note:</strong> Around typical corneal radii, <strong>0.10 mm</strong> corresponds to roughly{' '}
              <strong>0.50 D</strong> of curvature change. This is a useful approximation when thinking about small base curve
              adjustments in RGP fitting. The exact value varies slightly with the starting radius.
            </Typography>
          </Alert>
        </Box>
      </CardContent>
    </Card>
  );
};


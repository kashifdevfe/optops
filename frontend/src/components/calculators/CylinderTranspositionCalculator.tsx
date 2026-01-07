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
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Prescription {
  sphere: number;
  cylinder: number;
  axis: number;
}

interface TransposedResult {
  sphere: number;
  cylinder: number;
  axis: number;
}

export const CylinderTranspositionCalculator: React.FC = () => {
  const [odPrescription, setOdPrescription] = useState<Prescription>({
    sphere: 0,
    cylinder: 0,
    axis: 0,
  });
  const [osPrescription, setOsPrescription] = useState<Prescription>({
    sphere: 0,
    cylinder: 0,
    axis: 0,
  });
  const [odResult, setOdResult] = useState<TransposedResult | null>(null);
  const [osResult, setOsResult] = useState<TransposedResult | null>(null);

  // Generate sphere options from -14.00 to +14.00 in 0.25 steps
  const sphereOptions = [];
  for (let i = -14.0; i <= 14.0; i += 0.25) {
    sphereOptions.push(parseFloat(i.toFixed(2)));
  }

  // Generate cylinder options from -6.00 to +6.00 in 0.25 steps
  const cylinderOptions = [];
  for (let i = -6.0; i <= 6.0; i += 0.25) {
    cylinderOptions.push(parseFloat(i.toFixed(2)));
  }

  // Generate axis options from 0 to 180
  const axisOptions = Array.from({ length: 181 }, (_, i) => i);

  const transposeCylinder = (prescription: Prescription): TransposedResult => {
    const { sphere, cylinder, axis } = prescription;

    // If cylinder is 0, no transposition needed
    if (cylinder === 0) {
      return {
        sphere: sphere,
        cylinder: 0,
        axis: axis,
      };
    }

    // Transposition rules:
    // 1. New sphere = original sphere + original cylinder
    // 2. New cylinder = same magnitude, opposite sign
    // 3. New axis = original axis plus or minus 90°, kept between 001 and 180

    const newSphere = sphere + cylinder;
    const newCylinder = -cylinder; // Opposite sign, same magnitude

    // Calculate new axis: add 90 if axis <= 90, subtract 90 if axis > 90
    let newAxis = axis <= 90 ? axis + 90 : axis - 90;

    // Normalize axis to be between 1 and 180
    if (newAxis <= 0) {
      newAxis = newAxis + 180;
    } else if (newAxis > 180) {
      newAxis = newAxis - 180;
    }

    return {
      sphere: parseFloat(newSphere.toFixed(2)),
      cylinder: parseFloat(newCylinder.toFixed(2)),
      axis: newAxis,
    };
  };

  const handleConvert = () => {
    const od = transposeCylinder(odPrescription);
    const os = transposeCylinder(osPrescription);
    setOdResult(od);
    setOsResult(os);
  };

  const handleReset = () => {
    setOdPrescription({ sphere: 0, cylinder: 0, axis: 0 });
    setOsPrescription({ sphere: 0, cylinder: 0, axis: 0 });
    setOdResult(null);
    setOsResult(null);
  };

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Plus/Minus Cylinder Conversion
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Transpose cylinder notation between plus and minus cylinder formats without changing effective power.
          Useful for standardizing prescriptions for documentation and ordering.
        </Typography>

        <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Transposition Rules:
          </Typography>
          <Typography variant="body2" component="div">
            1. New sphere = original sphere + original cylinder
            <br />
            2. New cylinder = same magnitude, opposite sign
            <br />
            3. New axis = original axis ± 90° (normalized to 1-180)
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Right Eye (OD)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Sphere</InputLabel>
                  <Select
                    value={odPrescription.sphere}
                    onChange={(e) =>
                      setOdPrescription((prev) => ({ ...prev, sphere: e.target.value as number }))
                    }
                    label="Sphere"
                  >
                    {sphereOptions.map((val) => (
                      <MenuItem key={val} value={val}>
                        {val >= 0 ? '+' : ''}{val.toFixed(2)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Cylinder</InputLabel>
                  <Select
                    value={odPrescription.cylinder}
                    onChange={(e) =>
                      setOdPrescription((prev) => ({ ...prev, cylinder: e.target.value as number }))
                    }
                    label="Cylinder"
                  >
                    {cylinderOptions.map((val) => (
                      <MenuItem key={val} value={val}>
                        {val >= 0 ? '+' : ''}{val.toFixed(2)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Axis</InputLabel>
                  <Select
                    value={odPrescription.axis}
                    onChange={(e) =>
                      setOdPrescription((prev) => ({ ...prev, axis: e.target.value as number }))
                    }
                    label="Axis"
                  >
                    {axisOptions.map((val) => (
                      <MenuItem key={val} value={val}>
                        {val}°
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Left Eye (OS)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Sphere</InputLabel>
                  <Select
                    value={osPrescription.sphere}
                    onChange={(e) =>
                      setOsPrescription((prev) => ({ ...prev, sphere: e.target.value as number }))
                    }
                    label="Sphere"
                  >
                    {sphereOptions.map((val) => (
                      <MenuItem key={val} value={val}>
                        {val >= 0 ? '+' : ''}{val.toFixed(2)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Cylinder</InputLabel>
                  <Select
                    value={osPrescription.cylinder}
                    onChange={(e) =>
                      setOsPrescription((prev) => ({ ...prev, cylinder: e.target.value as number }))
                    }
                    label="Cylinder"
                  >
                    {cylinderOptions.map((val) => (
                      <MenuItem key={val} value={val}>
                        {val >= 0 ? '+' : ''}{val.toFixed(2)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Axis</InputLabel>
                  <Select
                    value={osPrescription.axis}
                    onChange={(e) =>
                      setOsPrescription((prev) => ({ ...prev, axis: e.target.value as number }))
                    }
                    label="Axis"
                  >
                    {axisOptions.map((val) => (
                      <MenuItem key={val} value={val}>
                        {val}°
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<CalculateIcon />}
                onClick={handleConvert}
                fullWidth
              >
                Convert
              </Button>
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

        {(odResult || osResult) && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Transposed Prescription
            </Typography>
            <Grid container spacing={3}>
              {odResult && (
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Right Eye (OD)
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Typography variant="body1">
                          <strong>Original:</strong> {odPrescription.sphere >= 0 ? '+' : ''}{odPrescription.sphere.toFixed(2)}{' '}
                          {odPrescription.cylinder !== 0 && (
                            <>
                              {odPrescription.cylinder >= 0 ? '+' : ''}{odPrescription.cylinder.toFixed(2)} × {odPrescription.axis}°
                            </>
                          )}
                        </Typography>
                        <Divider />
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          <strong>Transposed:</strong> {odResult.sphere >= 0 ? '+' : ''}{odResult.sphere.toFixed(2)}{' '}
                          {odResult.cylinder !== 0 && (
                            <>
                              {odResult.cylinder >= 0 ? '+' : ''}{odResult.cylinder.toFixed(2)} × {odResult.axis}°
                            </>
                          )}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {osResult && (
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Left Eye (OS)
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Typography variant="body1">
                          <strong>Original:</strong> {osPrescription.sphere >= 0 ? '+' : ''}{osPrescription.sphere.toFixed(2)}{' '}
                          {osPrescription.cylinder !== 0 && (
                            <>
                              {osPrescription.cylinder >= 0 ? '+' : ''}{osPrescription.cylinder.toFixed(2)} × {osPrescription.axis}°
                            </>
                          )}
                        </Typography>
                        <Divider />
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          <strong>Transposed:</strong> {osResult.sphere >= 0 ? '+' : ''}{osResult.sphere.toFixed(2)}{' '}
                          {osResult.cylinder !== 0 && (
                            <>
                              {osResult.cylinder >= 0 ? '+' : ''}{osResult.cylinder.toFixed(2)} × {osResult.axis}°
                            </>
                          )}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Transposition changes notation only. The optical power in each meridian remains unchanged.
                This helps standardize prescriptions for documentation and ordering consistency.
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};


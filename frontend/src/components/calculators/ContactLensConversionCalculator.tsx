import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Divider,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Prescription {
  sphere: number;
  cylinder: number;
  axis: number;
}

interface ConversionResult {
  sphere: number;
  cylinder: number;
  axis: number;
  sphericalEquivalent?: number;
  useSphericalEquivalent: boolean;
}

export const ContactLensConversionCalculator: React.FC = () => {
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
  const [useSphericalEquivalent, setUseSphericalEquivalent] = useState(false);
  const [odResult, setOdResult] = useState<ConversionResult | null>(null);
  const [osResult, setOsResult] = useState<ConversionResult | null>(null);

  // Generate sphere options from -14.00 to +14.00 in 0.25 steps
  const sphereOptions = [];
  for (let i = -14.0; i <= 14.0; i += 0.25) {
    sphereOptions.push(parseFloat(i.toFixed(2)));
  }

  // Generate cylinder options from 0.00 to -6.00 in 0.25 steps
  const cylinderOptions = [];
  for (let i = 0.0; i >= -6.0; i -= 0.25) {
    cylinderOptions.push(parseFloat(i.toFixed(2)));
  }

  // Generate axis options from 0 to 180
  const axisOptions = Array.from({ length: 181 }, (_, i) => i);

  const calculateVertexCompensation = (power: number, vertexDistance: number = 12): number => {
    // Vertex distance compensation formula: Fcl = Fs / (1 - d * Fs)
    // where Fcl = contact lens power, Fs = spectacle power, d = vertex distance in meters
    if (Math.abs(power) < 4.0) {
      return power; // No compensation needed for powers less than ±4.00D
    }
    const d = vertexDistance / 1000; // Convert mm to meters
    return power / (1 - d * power);
  };

  const calculateSphericalEquivalent = (sphere: number, cylinder: number): number => {
    return sphere + cylinder / 2;
  };

  const roundToNearestStep = (value: number, step: number = 0.25): number => {
    return Math.round(value / step) * step;
  };

  const calculateConversion = (prescription: Prescription): ConversionResult => {
    const { sphere, cylinder, axis } = prescription;

    // Calculate meridional powers (sphere and sphere+cylinder)
    const sphereMeridian = sphere;
    const cylinderMeridian = sphere + cylinder;

    // Apply vertex compensation to each meridian if needed
    const compensatedSphereMeridian = calculateVertexCompensation(sphereMeridian);
    const compensatedCylinderMeridian = calculateVertexCompensation(cylinderMeridian);

    // Calculate new sphere and cylinder after vertex compensation
    let newSphere = compensatedSphereMeridian;
    let newCylinder = compensatedCylinderMeridian - compensatedSphereMeridian;
    let newAxis = axis;

    // Apply spherical equivalent if requested
    if (useSphericalEquivalent && cylinder !== 0) {
      const se = calculateSphericalEquivalent(newSphere, newCylinder);
      newSphere = roundToNearestStep(se);
      newCylinder = 0;
      newAxis = 0;
    } else {
      // Round to nearest 0.25D
      newSphere = roundToNearestStep(newSphere);
      newCylinder = roundToNearestStep(newCylinder);
    }

    return {
      sphere: parseFloat(newSphere.toFixed(2)),
      cylinder: parseFloat(newCylinder.toFixed(2)),
      axis: newAxis,
      sphericalEquivalent: useSphericalEquivalent && cylinder !== 0
        ? parseFloat(newSphere.toFixed(2))
        : undefined,
      useSphericalEquivalent,
    };
  };

  const handleCalculate = () => {
    const od = calculateConversion(odPrescription);
    const os = calculateConversion(osPrescription);
    setOdResult(od);
    setOsResult(os);
  };

  const handleReset = () => {
    setOdPrescription({ sphere: 0, cylinder: 0, axis: 0 });
    setOsPrescription({ sphere: 0, cylinder: 0, axis: 0 });
    setUseSphericalEquivalent(false);
    setOdResult(null);
    setOsResult(null);
  };

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Glasses to Contact Lens Conversion
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Convert spectacle prescription to contact lens prescription with vertex distance compensation and spherical equivalent calculation.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Lens Type</InputLabel>
            <Select
              value={useSphericalEquivalent ? 'spherical' : 'toric'}
              onChange={(e) => setUseSphericalEquivalent(e.target.value === 'spherical')}
              label="Lens Type"
            >
              <MenuItem value="toric">Toric (Full Cylinder Correction)</MenuItem>
              <MenuItem value="spherical">Spherical (Spherical Equivalent)</MenuItem>
            </Select>
          </FormControl>
          {useSphericalEquivalent && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Spherical equivalent will be calculated: SE = Sphere + (Cylinder ÷ 2). Use this for low astigmatism when some residual cylinder is acceptable.
            </Alert>
          )}
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
                        {val.toFixed(2)}
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
                        {val.toFixed(2)}
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
                onClick={handleCalculate}
                fullWidth
              >
                Calculate
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
              Contact Lens Prescription
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
                          <strong>Sphere:</strong> {odResult.sphere >= 0 ? '+' : ''}{odResult.sphere.toFixed(2)}
                        </Typography>
                        {odResult.cylinder !== 0 && (
                          <>
                            <Typography variant="body1">
                              <strong>Cylinder:</strong> {odResult.cylinder.toFixed(2)}
                            </Typography>
                            <Typography variant="body1">
                              <strong>Axis:</strong> {odResult.axis}°
                            </Typography>
                          </>
                        )}
                        {odResult.useSphericalEquivalent && odResult.sphericalEquivalent !== undefined && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                            Spherical Equivalent: {odResult.sphericalEquivalent >= 0 ? '+' : ''}{odResult.sphericalEquivalent.toFixed(2)}
                          </Typography>
                        )}
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
                          <strong>Sphere:</strong> {osResult.sphere >= 0 ? '+' : ''}{osResult.sphere.toFixed(2)}
                        </Typography>
                        {osResult.cylinder !== 0 && (
                          <>
                            <Typography variant="body1">
                              <strong>Cylinder:</strong> {osResult.cylinder.toFixed(2)}
                            </Typography>
                            <Typography variant="body1">
                              <strong>Axis:</strong> {osResult.axis}°
                            </Typography>
                          </>
                        )}
                        {osResult.useSphericalEquivalent && osResult.sphericalEquivalent !== undefined && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                            Spherical Equivalent: {osResult.sphericalEquivalent >= 0 ? '+' : ''}{osResult.sphericalEquivalent.toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Note:</strong> This is a starting point for ordering. Always confirm fit, comfort, and over-refraction on-eye, then adjust as needed.
                Vertex distance compensation is applied for powers beyond ±4.00D.
              </Typography>
            </Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};


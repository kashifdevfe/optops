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

interface Refraction {
  sphere: number;
  cylinder: number;
  axis: number;
}

interface Keratometry {
  flatK: number;
  steepK: number;
  steepKAxis: number;
}

interface RgpResult {
  baseCurve: number;
  diameter: number;
  power: number;
  tearLens: number;
  orderedPower: number;
}

export const RgpCalculator: React.FC = () => {
  const [refraction, setRefraction] = useState<Refraction>({
    sphere: 0,
    cylinder: 0,
    axis: 0,
  });
  const [keratometry, setKeratometry] = useState<Keratometry>({
    flatK: 42.0,
    steepK: 43.0,
    steepKAxis: 90,
  });
  const [lensDesign, setLensDesign] = useState<'spherical' | 'toric'>('spherical');
  const [lensDiameter, setLensDiameter] = useState<string>('8.7-9.3');
  const [result, setResult] = useState<RgpResult | null>(null);

  // Generate sphere options from -14.00 to +14.00 in 0.25 steps
  const sphereOptions = [];
  for (let i = -14.0; i <= 14.0; i += 0.25) {
    sphereOptions.push(parseFloat(i.toFixed(2)));
  }

  // Generate cylinder options from -8.00 to +8.00 in 0.25 steps
  const cylinderOptions = [];
  for (let i = -8.0; i <= 8.0; i += 0.25) {
    cylinderOptions.push(parseFloat(i.toFixed(2)));
  }

  // Generate axis options from 0 to 180
  const axisOptions = Array.from({ length: 181 }, (_, i) => i);

  // Generate K reading options from 36.00 to 52.00 in 0.25 steps
  const kOptions = [];
  for (let i = 36.0; i <= 52.0; i += 0.25) {
    kOptions.push(parseFloat(i.toFixed(2)));
  }

  // Convert diopters to radius (mm): r = 337.5 / K
  const diopterToRadius = (diopters: number): number => {
    return 337.5 / diopters;
  };

  // Convert radius (mm) to diopters: K = 337.5 / r
  const radiusToDiopter = (radius: number): number => {
    return 337.5 / radius;
  };

  // Calculate average K
  const calculateAverageK = (flatK: number, steepK: number): number => {
    return (flatK + steepK) / 2;
  };

  // Calculate base curve (typically 0.10-0.20 mm steeper than flat K for spherical, or match flat K for toric)
  const calculateBaseCurve = (flatK: number, design: 'spherical' | 'toric'): number => {
    if (design === 'toric') {
      // For toric, base curve typically matches flat K
      return flatK;
    } else {
      // For spherical, typically 0.10-0.20 mm steeper (about 0.50-1.00 D steeper)
      // Convert to radius, add 0.15mm (average), convert back
      const flatRadius = diopterToRadius(flatK);
      const baseCurveRadius = flatRadius - 0.15; // 0.15mm steeper
      return radiusToDiopter(baseCurveRadius);
    }
  };

  // Calculate tear lens power: Tear lens (D) ≈ Base curve (D) − flat K (D)
  const calculateTearLens = (baseCurve: number, flatK: number): number => {
    return baseCurve - flatK;
  };

  // Calculate ordered power accounting for tear lens
  // SAM: Steeper Add Minus (steeper BC = more plus tear lens = add minus to power)
  // FAP: Flatter Add Plus (flatter BC = more minus tear lens = add plus to power)
  const calculateOrderedPower = (refractionSphere: number, tearLens: number): number => {
    // The tear lens power needs to be subtracted from the refraction sphere
    // If tear lens is positive (BC steeper than K), we need less plus power
    // If tear lens is negative (BC flatter than K), we need more plus power
    return refractionSphere - tearLens;
  };

  // Calculate diameter based on design and selection
  const getDiameter = (design: 'spherical' | 'toric', diameterRange: string): number => {
    if (design === 'spherical') {
      // Typical spherical RGP diameter: 9.0-9.5mm
      return 9.2;
    } else {
      // Parse diameter range
      const ranges: Record<string, number> = {
        '8.0-8.6': 8.3,
        '8.7-9.3': 9.0,
        '9.4-10.2': 9.8,
      };
      return ranges[diameterRange] || 9.0;
    }
  };

  const handleCalculate = () => {
    const avgK = calculateAverageK(keratometry.flatK, keratometry.steepK);
    const baseCurve = calculateBaseCurve(keratometry.flatK, lensDesign);
    const tearLens = calculateTearLens(baseCurve, keratometry.flatK);
    const orderedPower = calculateOrderedPower(refraction.sphere, tearLens);
    const diameter = getDiameter(lensDesign, lensDiameter);

    setResult({
      baseCurve: parseFloat(baseCurve.toFixed(2)),
      diameter: parseFloat(diameter.toFixed(1)),
      power: refraction.sphere,
      tearLens: parseFloat(tearLens.toFixed(2)),
      orderedPower: parseFloat(orderedPower.toFixed(2)),
    });
  };

  const handleReset = () => {
    setRefraction({ sphere: 0, cylinder: 0, axis: 0 });
    setKeratometry({ flatK: 42.0, steepK: 43.0, steepKAxis: 90 });
    setLensDesign('spherical');
    setLensDiameter('8.7-9.3');
    setResult(null);
  };

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          RGP Lens Calculator
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Calculate empirical RGP base curve, diameter, and power selection from K readings and refraction.
          Accounts for tear lens effects using SAM (Steeper Add Minus) and FAP (Flatter Add Plus) principles.
        </Typography>

        <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Key Concepts:
          </Typography>
          <Typography variant="body2" component="div">
            • <strong>Tear Lens:</strong> Tear lens (D) ≈ Base curve (D) − flat K (D)
            <br />
            • <strong>SAM:</strong> Steeper Add Minus - steepening base curve creates plus tear lens
            <br />
            • <strong>FAP:</strong> Flatter Add Plus - flattening base curve creates minus tear lens
            <br />
            • <strong>Rule:</strong> 0.10 mm base curve change ≈ 0.50 D tear lens change
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Refraction
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Rx Sphere</InputLabel>
              <Select
                value={refraction.sphere}
                onChange={(e) =>
                  setRefraction((prev) => ({ ...prev, sphere: e.target.value as number }))
                }
                label="Rx Sphere"
              >
                {sphereOptions.map((val) => (
                  <MenuItem key={val} value={val}>
                    {val >= 0 ? '+' : ''}{val.toFixed(2)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Rx Cylinder</InputLabel>
              <Select
                value={refraction.cylinder}
                onChange={(e) =>
                  setRefraction((prev) => ({ ...prev, cylinder: e.target.value as number }))
                }
                label="Rx Cylinder"
              >
                {cylinderOptions.map((val) => (
                  <MenuItem key={val} value={val}>
                    {val >= 0 ? '+' : ''}{val.toFixed(2)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Rx Axis</InputLabel>
              <Select
                value={refraction.axis}
                onChange={(e) =>
                  setRefraction((prev) => ({ ...prev, axis: e.target.value as number }))
                }
                label="Rx Axis"
              >
                {axisOptions.map((val) => (
                  <MenuItem key={val} value={val}>
                    {val}°
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Keratometry
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Flat K (D)</InputLabel>
              <Select
                value={keratometry.flatK}
                onChange={(e) =>
                  setKeratometry((prev) => ({ ...prev, flatK: e.target.value as number }))
                }
                label="Flat K (D)"
              >
                {kOptions.map((val) => (
                  <MenuItem key={val} value={val}>
                    {val.toFixed(2)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Steep K (D)</InputLabel>
              <Select
                value={keratometry.steepK}
                onChange={(e) =>
                  setKeratometry((prev) => ({ ...prev, steepK: e.target.value as number }))
                }
                label="Steep K (D)"
              >
                {kOptions.map((val) => (
                  <MenuItem key={val} value={val}>
                    {val.toFixed(2)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Steep K Axis</InputLabel>
              <Select
                value={keratometry.steepKAxis}
                onChange={(e) =>
                  setKeratometry((prev) => ({ ...prev, steepKAxis: e.target.value as number }))
                }
                label="Steep K Axis"
              >
                {axisOptions.map((val) => (
                  <MenuItem key={val} value={val}>
                    {val}°
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Lens Design
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Lens Design</InputLabel>
              <Select
                value={lensDesign}
                onChange={(e) => setLensDesign(e.target.value as 'spherical' | 'toric')}
                label="Lens Design"
              >
                <MenuItem value="spherical">Spherical</MenuItem>
                <MenuItem value="toric">Toric</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {lensDesign === 'toric' && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Lens Diameter</InputLabel>
                <Select
                  value={lensDiameter}
                  onChange={(e) => setLensDiameter(e.target.value)}
                  label="Lens Diameter"
                >
                  <MenuItem value="8.0-8.6">8.0-8.6 mm</MenuItem>
                  <MenuItem value="8.7-9.3">8.7-9.3 mm</MenuItem>
                  <MenuItem value="9.4-10.2">9.4-10.2 mm</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

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

        {result && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              RGP Lens Parameters
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Calculated Parameters
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Typography variant="body1">
                        <strong>Base Curve:</strong> {result.baseCurve.toFixed(2)} D
                        <Typography variant="caption" color="text.secondary" display="block">
                          ({diopterToRadius(result.baseCurve).toFixed(2)} mm)
                        </Typography>
                      </Typography>
                      <Typography variant="body1">
                        <strong>Diameter:</strong> {result.diameter.toFixed(1)} mm
                      </Typography>
                      <Divider />
                      <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        <strong>Ordered Power:</strong> {result.orderedPower >= 0 ? '+' : ''}{result.orderedPower.toFixed(2)} D
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Tear Lens Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Typography variant="body1">
                        <strong>Refraction Sphere:</strong> {refraction.sphere >= 0 ? '+' : ''}{refraction.sphere.toFixed(2)} D
                      </Typography>
                      <Typography variant="body1">
                        <strong>Tear Lens Power:</strong> {result.tearLens >= 0 ? '+' : ''}{result.tearLens.toFixed(2)} D
                        <Typography variant="caption" color="text.secondary" display="block">
                          {result.tearLens > 0
                            ? 'Lens steeper than K (BC < K) - acts as plus'
                            : result.tearLens < 0
                            ? 'Lens flatter than K (BC > K) - acts as minus'
                            : 'Lens matches K - no tear lens effect'}
                        </Typography>
                      </Typography>
                      <Divider />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Calculation:</strong> Ordered Power = Refraction Sphere - Tear Lens
                        <br />
                        = {refraction.sphere.toFixed(2)} - ({result.tearLens.toFixed(2)})
                        <br />
                        = {result.orderedPower.toFixed(2)} D
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Note:</strong> This is an empirical starting point. Always evaluate fit and fluorescein pattern on-eye,
                obtain over-refraction, and adjust parameters based on manufacturer fitting guides and clinical findings.
                {refraction.cylinder !== 0 && (
                  <>
                    <br />
                    <strong>Cylinder:</strong> {refraction.cylinder >= 0 ? '+' : ''}{refraction.cylinder.toFixed(2)} D × {refraction.axis}°
                    {Math.abs(keratometry.steepK - keratometry.flatK) >= 2.5 && (
                      <>
                        <br />
                        <strong>Corneal Toricity:</strong> {Math.abs(keratometry.steepK - keratometry.flatK).toFixed(2)} D - Consider bitoric design if spherical lens shows instability.
                      </>
                    )}
                  </>
                )}
              </Typography>
            </Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};


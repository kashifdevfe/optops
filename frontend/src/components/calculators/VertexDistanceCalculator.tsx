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

export const VertexDistanceCalculator: React.FC = () => {
  const [vertexDistance, setVertexDistance] = useState<number>(12);
  const [powerMagnitude, setPowerMagnitude] = useState<number>(4.0);
  const [result, setResult] = useState<number | null>(null);

  // Generate vertex distance options from 8 to 16 mm
  const vertexDistanceOptions = Array.from({ length: 9 }, (_, i) => i + 8);

  // Generate power magnitude options from 4.00 to 20.00 in 0.25 steps
  const powerOptions = [];
  for (let i = 4.0; i <= 20.0; i += 0.25) {
    powerOptions.push(parseFloat(i.toFixed(2)));
  }

  // Calculate effective power at corneal plane
  // Formula: Fc = Fs / (1 - d * Fs)
  // where Fc = corneal plane power, Fs = spectacle plane power, d = vertex distance in meters
  const calculateEffectivePower = (spectaclePower: number, vertexDist: number): number => {
    const d = vertexDist / 1000; // Convert mm to meters
    return spectaclePower / (1 - d * spectaclePower);
  };

  const handleCalculate = () => {
    const effectivePower = calculateEffectivePower(powerMagnitude, vertexDistance);
    setResult(effectivePower);
  };

  const handleReset = () => {
    setVertexDistance(12);
    setPowerMagnitude(4.0);
    setResult(null);
  };

  // Calculate for both plus and minus powers
  const plusResult = result !== null ? calculateEffectivePower(Math.abs(powerMagnitude), vertexDistance) : null;
  const minusResult = result !== null ? calculateEffectivePower(-Math.abs(powerMagnitude), vertexDistance) : null;

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Vertex Distance Calculator
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Adjust effective power for vertex distance in high prescriptions. Calculate how moving a lens from the spectacle plane
          to the corneal plane changes its effective power.
        </Typography>

        <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Clinical Guidelines:
          </Typography>
          <Typography variant="body2" component="div">
            • Vertex distance is typically <strong>12-14 mm</strong> in trial frames/phoropters
            <br />
            • Effect becomes clinically meaningful at powers beyond <strong>±4.00 D</strong>
            <br />
            • <strong>Myopes:</strong> Contact lens power is usually less minus than spectacle power
            <br />
            • <strong>Hyperopes:</strong> Contact lens power is usually more plus than spectacle power
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Vertex Distance (mm)</InputLabel>
              <Select
                value={vertexDistance}
                onChange={(e) => setVertexDistance(e.target.value as number)}
                label="Vertex Distance (mm)"
              >
                {vertexDistanceOptions.map((val) => (
                  <MenuItem key={val} value={val}>
                    {val} mm
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Power Magnitude (D)</InputLabel>
              <Select
                value={powerMagnitude}
                onChange={(e) => setPowerMagnitude(e.target.value as number)}
                label="Power Magnitude (D)"
              >
                {powerOptions.map((val) => (
                  <MenuItem key={val} value={val}>
                    {val >= 0 ? '+' : ''}{val.toFixed(2)} D
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

        {result !== null && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Effective Power at Corneal Plane
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Plus Power (+{powerMagnitude.toFixed(2)} D)
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Typography variant="body1">
                        <strong>Spectacle Power:</strong> +{powerMagnitude.toFixed(2)} D
                      </Typography>
                      <Divider />
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '1.1rem' }}>
                        <strong>Corneal Plane Power:</strong> {plusResult! >= 0 ? '+' : ''}{plusResult!.toFixed(2)} D
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Difference: {plusResult! - powerMagnitude >= 0 ? '+' : ''}{(plusResult! - powerMagnitude).toFixed(2)} D
                        <br />
                        <em>More plus power needed at corneal plane</em>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Minus Power (-{powerMagnitude.toFixed(2)} D)
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Typography variant="body1">
                        <strong>Spectacle Power:</strong> -{powerMagnitude.toFixed(2)} D
                      </Typography>
                      <Divider />
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '1.1rem' }}>
                        <strong>Corneal Plane Power:</strong> {minusResult!.toFixed(2)} D
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Difference: {minusResult! - (-powerMagnitude) >= 0 ? '+' : ''}{(minusResult! - (-powerMagnitude)).toFixed(2)} D
                        <br />
                        <em>Less minus power needed at corneal plane</em>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Formula:</strong> Fc = Fs / (1 - d × Fs)
                <br />
                Where Fc = corneal plane power, Fs = spectacle plane power, d = vertex distance in meters ({vertexDistance} mm = {vertexDistance / 1000} m)
                <br />
                <br />
                <strong>Note:</strong> For toric prescriptions, vertex distance applies independently to each principal meridian.
                Use the Glasses to Contact Lens Conversion calculator for full toric vertex compensation.
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};


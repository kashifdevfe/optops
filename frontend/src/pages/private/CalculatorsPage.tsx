import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { ClpcCalculator } from '../../components/calculators/ClpcCalculator.js';
import { ContactLensConversionCalculator } from '../../components/calculators/ContactLensConversionCalculator.js';
import { CylinderTranspositionCalculator } from '../../components/calculators/CylinderTranspositionCalculator.js';
import { RgpCalculator } from '../../components/calculators/RgpCalculator.js';
import { VertexDistanceCalculator } from '../../components/calculators/VertexDistanceCalculator.js';
import { RadiusDiopterCalculator } from '../../components/calculators/RadiusDiopterCalculator.js';

export const CalculatorsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
          Calculators
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Professional optical calculators for prescriptions and conversions
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Contact Lens Power Calculator" />
          <Tab label="Glasses to Contact Lens Conversion" />
          <Tab label="Cylinder Transposition" />
          <Tab label="RGP Calculator" />
          <Tab label="Vertex Distance" />
          <Tab label="Radius & Diopter" />
        </Tabs>
      </Box>

      <Box>
        {activeTab === 0 && <ClpcCalculator />}
        {activeTab === 1 && <ContactLensConversionCalculator />}
        {activeTab === 2 && <CylinderTranspositionCalculator />}
        {activeTab === 3 && <RgpCalculator />}
        {activeTab === 4 && <VertexDistanceCalculator />}
        {activeTab === 5 && <RadiusDiopterCalculator />}
      </Box>
    </Box>
  );
};


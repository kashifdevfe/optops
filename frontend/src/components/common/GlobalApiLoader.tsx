import React from 'react';
import { Backdrop, Box } from '@mui/material';
import { keyframes } from '@mui/system';
import { useApiLoading } from '../../hooks/useApiLoading.js';
import { useAppSelector } from '../../hooks/redux.js';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.06); opacity: 1; }
`;

export const GlobalApiLoader: React.FC = () => {
  const { isLoading } = useApiLoading();
  const authLoading = useAppSelector((s) => s.auth.isLoading);
  const open = isLoading || authLoading;

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 200,
        bgcolor: 'rgba(10, 15, 25, 0.28)',
        backdropFilter: 'blur(10px) saturate(140%)',
      }}
    >
      <Box
        sx={{
          width: 320,
          maxWidth: '90vw',
          borderRadius: 4,
          p: 3,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.07) 100%)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            mx: 'auto',
            width: 88,
            height: 88,
            borderRadius: '50%',
            position: 'relative',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {/* Rotating gradient ring */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background:
                'conic-gradient(from 0deg, rgba(212,175,55,1), rgba(255,215,0,1), rgba(212,175,55,1))',
              filter: 'drop-shadow(0 6px 18px rgba(212,175,55,0.35))',
              animation: `${spin} 1.1s linear infinite`,
            }}
          />
          {/* Inner cutout */}
          <Box
            sx={{
              position: 'absolute',
              inset: 6,
              borderRadius: '50%',
              bgcolor: 'rgba(10, 15, 25, 0.55)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
          {/* Pulsing center dot */}
          <Box
            sx={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(212,175,55,1), rgba(255,215,0,1))',
              boxShadow: '0 0 0 10px rgba(212,175,55,0.12)',
              animation: `${pulse} 1.2s ease-in-out infinite`,
              zIndex: 1,
            }}
          />
        </Box>
      </Box>
    </Backdrop>
  );
};


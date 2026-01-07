import { createTheme, Theme } from '@mui/material/styles';
import type { ThemeSettings } from '../types/index.js';

const defaultThemeSettings: ThemeSettings = {
  id: '',
  companyId: '',
  primaryColor: '#D4AF37',
  secondaryColor: '#FFD700',
  backgroundColor: '#FFFFFF',
  surfaceColor: '#F5F5F5',
  textColor: '#000000',
  fontFamily: 'Inter, sans-serif',
  logoUrl: null,
  uiConfig: {},
  createdAt: '',
  updatedAt: '',
};

const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '212, 175, 55';
};

export const createAppTheme = (themeSettings: ThemeSettings | null): Theme => {
  const settings = themeSettings || defaultThemeSettings;
  const isDark = settings.backgroundColor === '#000000' || settings.backgroundColor.toLowerCase().includes('000');
  
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: settings.primaryColor || '#D4AF37',
        light: settings.secondaryColor || '#FFD700',
        dark: settings.primaryColor || '#B8860B',
        contrastText: '#000000',
      },
      secondary: {
        main: settings.secondaryColor || '#FFD700',
        light: settings.secondaryColor || '#FFD700',
        dark: settings.secondaryColor || '#FFA500',
        contrastText: '#000000',
      },
      background: {
        default: isDark ? settings.backgroundColor : '#F5F7FA',
        paper: settings.surfaceColor,
      },
      text: {
        primary: settings.textColor,
        secondary: isDark ? settings.textColor : 'rgba(0, 0, 0, 0.6)',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      grey: {
        50: '#F5F7FA',
        100: '#E4E7EB',
        200: '#CBD2D9',
        300: '#9AA5B1',
        400: '#7B8794',
        500: '#616E7C',
        600: '#52606D',
        700: '#3E4C59',
        800: '#323F4B',
        900: '#1F2933',
      },
      success: {
        main: '#00AB55',
        light: '#5BE584',
        dark: '#007B55',
      },
      warning: {
        main: '#FFC107',
        light: '#FFE082',
        dark: '#F57C00',
      },
      info: {
        main: '#1890FF',
        light: '#64B5F6',
        dark: '#0277BD',
      },
      error: {
        main: '#FF5630',
        light: '#FF8A65',
        dark: '#D32F2F',
      },
    },
    typography: {
      fontFamily: settings.fontFamily,
      allVariants: {
        color: settings.textColor,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: settings.backgroundColor,
            color: settings.textColor,
            fontFamily: settings.fontFamily,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 600,
            padding: '8px 16px',
            '&:hover': {
              boxShadow: `0 4px 12px rgba(${hexToRgb(settings.primaryColor)}, 0.3)`,
            },
          },
          contained: {
            background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${settings.secondaryColor} 0%, ${settings.primaryColor} 100%)`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: settings.surfaceColor,
            borderRadius: 16,
            boxShadow: isDark
              ? 'none'
              : '0 0 2px 0 rgba(145, 158, 171, 0.08), 0 12px 24px -4px rgba(145, 158, 171, 0.08)',
            border: isDark ? `1px solid rgba(255, 255, 255, 0.08)` : 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isDark ? 'none' : '0 0 2px 0 rgba(145, 158, 171, 0.08), 0 12px 24px -4px rgba(145, 158, 171, 0.08)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: settings.surfaceColor,
            borderRight: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDark ? settings.backgroundColor : '#FFFFFF',
              '&:hover fieldset': {
                borderColor: settings.primaryColor,
              },
              '&.Mui-focused fieldset': {
                borderColor: settings.primaryColor,
              },
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F5F7FA',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.87)',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
          },
        },
      },
    },
  });
};
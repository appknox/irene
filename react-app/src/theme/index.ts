/**
 * Custom MUI theme matching Appknox brand design system
 * Based on app/styles/_theme.scss
 */

import { createTheme, type ThemeOptions } from '@mui/material/styles';

// Exact brand colors from Ember app
const colors = {
  // Common
  black: '#000000',
  white: '#ffffff',

  // Background
  backgroundMain: '#ffffff',
  backgroundDark: '#424651',
  backgroundLight: '#fafafa',

  // Primary (Appknox red/coral)
  primaryMain: '#ff4d3f',
  primaryDark: '#e23123',
  primaryLight: 'rgba(254, 77, 63, 0.2)',
  primaryContrastText: '#ffffff',
  primaryMain10: 'rgba(254, 77, 63, 0.1)',

  // Secondary (dark navy)
  secondaryMain: '#424651',
  secondaryContrastText: '#ffffff',

  // Success
  successMain: '#2db421',
  successLight: '#e9f5ed',

  // Error
  errorMain: '#d72f2f',
  errorLight: '#ffd1d4',

  // Warning
  warningMain: '#ffd52e',
  warningDark: '#a5872d',
  warningLight: '#fff7d7',

  // Info
  infoMain: '#087edb',
  infoDark: '#0052cc',
  infoLight: '#deebff',

  // Greys (Neutral)
  grey50: '#fcfcfc',
  grey100: '#f5f5f5',
  grey200: '#e9e9e9',
  grey300: '#d9d9d9',
  grey400: '#c4c4c4',
  grey500: '#9d9d9d',
  grey600: '#7b7b7b',
  grey700: '#555555',
  grey800: '#434343',
  grey900: '#262626',

  // Text
  textPrimary: '#171717',
  textSecondary: '#7b7b7b',
  textDisabled: '#c4c4c4',

  // Divider
  divider: '#f5f5f5',
  dividerDark: '#e9e9e9',

  // Border
  borderColor1: '#e9e9e9',
  borderColor2: '#c4c4c4',

  // Hover states
  hoverDark: 'rgba(255, 255, 255, 0.15)',
  hoverLight: 'rgba(0, 0, 0, 0.04)',

  // Backdrop
  backdropOverlay: 'rgba(0, 0, 0, 0.42)',

  // Disabled
  disabledBackgroundTextField: '#f5f5f5',
  disabledBackgroundButton: '#c4c4c4',

  // Severity levels (for risk indicators)
  severityCritical: '#d72f2f',
  severityHigh: '#f98746',
  severityMedium: '#fad34a',
  severityLow: '#46cef9',
  severityInfo: '#2141b4',
  severityPassed: '#2db421',
  severityNone: '#a0a0a0',
  severityUntested: '#a0a0a0',
  severityUnknown: '#202020',
  severityEmpty: '#d3d3d3',

  // Platform
  android: '#33a852',
  ios: '#8d9096',
};

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: colors.primaryMain,
      dark: colors.primaryDark,
      light: colors.primaryLight,
      contrastText: colors.primaryContrastText,
    },
    secondary: {
      main: colors.secondaryMain,
      contrastText: colors.secondaryContrastText,
    },
    error: {
      main: colors.errorMain,
      light: colors.errorLight,
    },
    warning: {
      main: colors.warningMain,
      dark: colors.warningDark,
      light: colors.warningLight,
    },
    info: {
      main: colors.infoMain,
      dark: colors.infoDark,
      light: colors.infoLight,
    },
    success: {
      main: colors.successMain,
      light: colors.successLight,
    },
    grey: {
      50: colors.grey50,
      100: colors.grey100,
      200: colors.grey200,
      300: colors.grey300,
      400: colors.grey400,
      500: colors.grey500,
      600: colors.grey600,
      700: colors.grey700,
      800: colors.grey800,
      900: colors.grey900,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      disabled: colors.textDisabled,
    },
    divider: colors.divider,
    background: {
      default: colors.backgroundMain,
      paper: colors.backgroundMain,
    },
    action: {
      hover: colors.hoverLight,
      disabled: colors.textDisabled,
      disabledBackground: colors.disabledBackgroundButton,
    },
  },
  typography: {
    fontFamily: "'Open Sans', sans-serif",
    htmlFontSize: 14,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // Maintain case as-is (common in modern apps)
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 2, // 2px border radius from theme
  },
  shadows: [
    'none',
    '4px 4px 8px 0px rgba(0, 0, 0, 0.1)', // --box-shadow-1
    '4px 4px 10px 0px rgba(0, 0, 0, 0.15)', // --box-shadow-2
    '4px 4px 15px rgba(0, 0, 0, 0.04)', // --box-shadow-3
    '0px -4px 8px 4px rgba(0, 0, 0, 0.03)', // --box-shadow-4
    '3px 4px 6px rgba(216, 216, 216, 0.25)', // --box-shadow-5
    '0px 5px 14px 0px rgba(64, 64, 64, 0.05)', // --box-shadow-6
    '0px 2px 6px 0px rgba(64, 64, 64, 0.15)', // --box-shadow-7
    '-5px 0px 9px 0px rgba(64, 64, 64, 0.03)', // --box-shadow-8
    '0 5px 20px 0px rgba(0, 0, 0, 0.1)', // --box-shadow-9
    '5px 0px 10px 0px rgba(0, 0, 0, 0.05)', // --box-shadow-10
    '4px 4px 20px rgba(222, 222, 222, 0.25)', // --box-shadow-light
    '1px 0px 8px -1px rgba(0, 0, 0, 0.3)', // --box-shadow-dark
    '4px 4px 8px 0px rgba(0, 0, 0, 0.1)',
    '4px 4px 10px 0px rgba(0, 0, 0, 0.15)',
    '4px 4px 15px rgba(0, 0, 0, 0.04)',
    '0px -4px 8px 4px rgba(0, 0, 0, 0.03)',
    '3px 4px 6px rgba(216, 216, 216, 0.25)',
    '0px 5px 14px 0px rgba(64, 64, 64, 0.05)',
    '0px 2px 6px 0px rgba(64, 64, 64, 0.15)',
    '-5px 0px 9px 0px rgba(64, 64, 64, 0.03)',
    '0 5px 20px 0px rgba(0, 0, 0, 0.1)',
    '5px 0px 10px 0px rgba(0, 0, 0, 0.05)',
    '4px 4px 20px rgba(222, 222, 222, 0.25)',
    '1px 0px 8px -1px rgba(0, 0, 0, 0.3)',
  ],
  zIndex: {
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '4px 4px 8px 0px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          boxShadow: '4px 4px 10px 0px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 2,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 2,
        },
        elevation1: {
          boxShadow: '4px 4px 8px 0px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '4px 4px 10px 0px rgba(0, 0, 0, 0.15)',
        },
      },
    },
  },
};

// Create and export the theme
export const theme = createTheme(themeOptions);

// Export colors for direct usage if needed
export { colors };

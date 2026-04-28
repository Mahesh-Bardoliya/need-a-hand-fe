// Shared Design Tokens for the app
export const COLORS = {
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  primaryLight: '#EEF0FF',
  secondary: '#FF6584',
  accent: '#43C6AC',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: '#F0F2F5',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFAFA',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  shadow: '#000',
  inactive: '#D1D5DB',
  tag: {
    active: { bg: '#DCFCE7', text: '#16A34A' },
    inactive: { bg: '#FEE2E2', text: '#DC2626' },
  },
};

export const FONTS = {
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semiBold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
  extraBold: { fontWeight: '800' },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};

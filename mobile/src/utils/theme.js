export const lightTheme = {
  // Backgrounds
  background: '#F9FAFB',
  surface: '#FFFFFF',
  elevated: '#FFFFFF',
  overlay: '#FFFFFF',
  
  // Text colors
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // UI Elements
  border: '#E5E7EB',
  divider: '#F3F4F6',
  shadow: '#000000',
  
  // Status colors
  success: '#059669',
  error: '#DC2626',
  warning: '#D97706',
  info: '#2563EB',
  
  // Brand colors
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  secondary: '#1F2937',
  
  // Tab bar
  tabBackground: '#FFFFFF',
  tabBorder: '#DADADA',
  tabActive: '#3B82F6',
  tabInactive: '#6B7280',
};

export const darkTheme = {
  // Backgrounds
  background: '#121212',
  surface: '#1E1E1E',
  elevated: '#262626',
  overlay: '#2A2A2A',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#8C8C8C',
  textInverse: '#000000',
  
  // UI Elements
  border: '#3A3A3A',
  divider: '#2A2A2A',
  shadow: '#000000',
  
  // Status colors
  success: '#4ADE80',
  error: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',
  
  // Brand colors
  primary: '#60A5FA',
  primaryLight: '#93C5FD',
  secondary: '#F3F4F6',
  
  // Tab bar
  tabBackground: '#1E1E1E',
  tabBorder: '#3A3A3A',
  tabActive: '#60A5FA',
  tabInactive: '#8C8C8C',
};

export const getTheme = (colorScheme) => {
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};
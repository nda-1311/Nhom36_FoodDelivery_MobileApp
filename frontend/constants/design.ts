// Design System Constants for Food Delivery App

export const COLORS = {
  // Primary Colors - Bright Red/Orange
  primary: "#FF5722", // Vibrant orange-red
  primaryDark: "#E64A19",
  primaryLight: "#FF8A65",

  // Secondary Colors - Bright Teal
  secondary: "#00BCD4", // Bright cyan
  secondaryDark: "#0097A7",
  secondaryLight: "#4DD0E1",

  // Accent Colors - Bright Yellow/Gold
  accent: "#FFC107", // Vibrant amber
  accentDark: "#FFA000",
  warning: "#FF9800",
  success: "#4CAF50",
  info: "#2196F3",

  // Neutral Colors - Better contrast
  dark: "#212121",
  darkGray: "#424242",
  mediumGray: "#757575",
  lightGray: "#BDBDBD",
  extraLightGray: "#E0E0E0",
  background: "#FAFAFA",
  white: "#FFFFFF",

  // Text Colors - Strong contrast
  text: "#212121",
  textSecondary: "#616161",
  textLight: "#9E9E9E",

  // UI Colors
  border: "#E0E0E0",
  surface: "#FFFFFF",

  // Semantic Colors
  error: "#F44336",
  errorLight: "#FFEBEE",
  successGreen: "#4CAF50",
  successLight: "#E8F5E9",

  // Gradients - More vibrant
  gradientPrimary: ["#FF5722", "#FF6F00"],
  gradientSecondary: ["#00BCD4", "#00ACC1"],
  gradientAccent: ["#FFC107", "#FFB300"],
  gradientDark: ["#212121", "#424242"],
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    fontWeight: "800" as const,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700" as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: "600" as const,
    lineHeight: 16,
  },
  small: {
    fontSize: 10,
    fontWeight: "400" as const,
    lineHeight: 14,
  },
};

export const SPACING = {
  xs: 4,
  s: 8,
  sm: 8, // Alias for s
  m: 12,
  md: 16, // Alias for m (adjusted to 16 for common use)
  l: 16,
  lg: 24, // Alias for l (adjusted to 24 for large spacing)
  xl: 20,
  xxl: 24,
  xxxl: 32,
  bottomNav: 90, // Space for bottom navigation
};

export const RADIUS = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  full: 9999,
};

export const SHADOWS = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
};

export const ANIMATION = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },
};

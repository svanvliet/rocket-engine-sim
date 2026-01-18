import { TextStyle } from 'pixi.js';

/**
 * Centralized theme configuration for Rocket Engine Simulator
 * 
 * Fonts:
 * - Roboto: Used for headings and titles
 * - Inter: Used for body text, labels, and UI elements
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const Colors = {
  // Backgrounds
  background: 0x0a0a0a,
  backgroundLight: 0x0d0d12,
  panel: 0x111118,
  panelHover: 0x1a1a2e,
  panelSelected: 0x2a4a6a,
  
  // Borders
  border: 0x2a2a3a,
  borderLight: 0x333344,
  borderHover: 0x444444,
  
  // Primary accent (orange)
  primary: 0xff6b35,
  primaryHover: 0xff8c5a,
  primaryDark: 0xcc5528,
  
  // Secondary accent (cyan/teal)
  secondary: 0x4ecdc4,
  secondaryDark: 0x3ba89e,
  
  // Status colors
  success: 0x00ff88,
  successDark: 0x1a3a1a,
  warning: 0xffaa00,
  error: 0xff4444,
  errorDark: 0xff3333,
  danger: 0xff4444,  // Alias for error, used for destructive actions
  
  // Text colors
  textPrimary: 0xffffff,
  textSecondary: 0xcccccc,
  textMuted: 0x888888,
  textDark: 0x555555,
  textDisabled: 0x444444,
  
  // Component-specific
  fuel: 0x8b0000,
  fuelBorder: 0xcc4444,
  oxidizer: 0x4169e1,
  oxidizerBorder: 0x6699ff,
} as const;

// =============================================================================
// FONT FAMILIES
// =============================================================================

export const Fonts = {
  heading: 'Roboto, Arial, sans-serif',
  body: 'Inter, Arial, sans-serif',
  mono: 'Courier New, monospace',
} as const;

// =============================================================================
// TEXT STYLES
// =============================================================================

// --- Headings (Roboto) ---

export const TextStyles = {
  // Large title - used for game title, world names
  title: new TextStyle({
    fontFamily: Fonts.heading,
    fontSize: 48,
    fontWeight: 'bold',
    fill: Colors.textPrimary,
    align: 'center',
  }),

  // Screen title - used for screen headers
  screenTitle: new TextStyle({
    fontFamily: Fonts.heading,
    fontSize: 36,
    fontWeight: 'bold',
    fill: Colors.textPrimary,
  }),

  // Section heading - used for panel titles, section headers
  heading: new TextStyle({
    fontFamily: Fonts.heading,
    fontSize: 24,
    fontWeight: 'bold',
    fill: Colors.textPrimary,
  }),

  // Subheading - used for component names, subsections
  subheading: new TextStyle({
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: '500',
    fill: Colors.textPrimary,
  }),

  // Panel label - used for panel titles like "COMPONENTS", "PROPERTIES"
  panelLabel: new TextStyle({
    fontFamily: Fonts.heading,
    fontSize: 11,
    fontWeight: '500',
    fill: Colors.textMuted,
    letterSpacing: 2,
  }),

  // --- Body Text (Inter) ---

  // Standard body text
  body: new TextStyle({
    fontFamily: Fonts.body,
    fontSize: 14,
    fill: Colors.textSecondary,
  }),

  // Small body text
  bodySmall: new TextStyle({
    fontFamily: Fonts.body,
    fontSize: 12,
    fill: Colors.textSecondary,
  }),

  // UI label - used for form labels, button text
  label: new TextStyle({
    fontFamily: Fonts.body,
    fontSize: 14,
    fill: Colors.textSecondary,
  }),

  // Small label
  labelSmall: new TextStyle({
    fontFamily: Fonts.body,
    fontSize: 12,
    fill: Colors.textMuted,
  }),

  // Button text
  button: new TextStyle({
    fontFamily: Fonts.body,
    fontSize: 16,
    fontWeight: '600',
    fill: Colors.textPrimary,
  }),

  // Button text (small)
  buttonSmall: new TextStyle({
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '600',
    fill: Colors.textPrimary,
  }),

  // --- Special Styles ---

  // Level/world indicator
  levelIndicator: new TextStyle({
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: '500',
    fill: Colors.primary,
    letterSpacing: 4,
  }),

  // Value display (stats, metrics)
  value: new TextStyle({
    fontFamily: Fonts.mono,
    fontSize: 16,
    fontWeight: 'bold',
    fill: Colors.secondary,
  }),

  // Stat value for bottom bar stats display
  statValue: new TextStyle({
    fontFamily: Fonts.mono,
    fontSize: 14,
    fill: Colors.secondary,
  }),

  // Large value (countdown, big numbers)
  valueLarge: new TextStyle({
    fontFamily: Fonts.mono,
    fontSize: 48,
    fontWeight: 'bold',
    fill: Colors.success,
  }),

  // Cost/budget text
  cost: new TextStyle({
    fontFamily: Fonts.body,
    fontSize: 12,
    fill: Colors.secondary,
  }),

  // Warning text
  warning: new TextStyle({
    fontFamily: Fonts.body,
    fontSize: 12,
    fill: Colors.warning,
  }),

  // Error text
  error: new TextStyle({
    fontFamily: Fonts.body,
    fontSize: 12,
    fill: Colors.error,
  }),

  // Success text
  success: new TextStyle({
    fontFamily: Fonts.body,
    fontSize: 12,
    fill: Colors.success,
  }),

  // Muted/hint text
  muted: new TextStyle({
    fontFamily: Fonts.body,
    fontSize: 14,
    fill: Colors.textDark,
  }),

  // Quote/italic text
  quote: new TextStyle({
    fontFamily: Fonts.body,
    fontSize: 14,
    fontStyle: 'italic',
    fill: Colors.textMuted,
  }),

  // Icon text (for emoji/symbol icons)
  icon: new TextStyle({
    fontFamily: Fonts.body,
    fontSize: 18,
    fill: Colors.primary,
  }),

  // Tooltip text
  tooltip: new TextStyle({
    fontFamily: Fonts.body,
    fontSize: 12,
    fill: Colors.textSecondary,
    wordWrap: true,
    wordWrapWidth: 200,
  }),
} as const;

// =============================================================================
// STYLE HELPERS
// =============================================================================

/**
 * Create a modified version of an existing text style
 */
export function modifyStyle(
  baseStyle: TextStyle,
  overrides: Partial<ConstructorParameters<typeof TextStyle>[0]>
): TextStyle {
  const baseOptions = {
    fontFamily: baseStyle.fontFamily,
    fontSize: baseStyle.fontSize,
    fontWeight: baseStyle.fontWeight,
    fontStyle: baseStyle.fontStyle,
    fill: baseStyle.fill,
    align: baseStyle.align,
    letterSpacing: baseStyle.letterSpacing,
    wordWrap: baseStyle.wordWrap,
    wordWrapWidth: baseStyle.wordWrapWidth,
    lineHeight: baseStyle.lineHeight,
  };
  
  return new TextStyle({ ...baseOptions, ...overrides });
}

/**
 * Common style modifications
 */
export const StyleModifiers = {
  withColor: (style: TextStyle, color: number) => modifyStyle(style, { fill: color }),
  withSize: (style: TextStyle, size: number) => modifyStyle(style, { fontSize: size }),
  withAlign: (style: TextStyle, align: 'left' | 'center' | 'right') => modifyStyle(style, { align }),
  withWordWrap: (style: TextStyle, width: number) => modifyStyle(style, { wordWrap: true, wordWrapWidth: width }),
  asBold: (style: TextStyle) => modifyStyle(style, { fontWeight: 'bold' }),
};

// =============================================================================
// UI CONSTANTS
// =============================================================================

export const UI = {
  // Border radius
  borderRadius: {
    small: 4,
    medium: 6,
    large: 8,
    xlarge: 10,
  },
  
  // Spacing
  spacing: {
    xs: 5,
    sm: 10,
    md: 15,
    lg: 20,
    xl: 30,
  },
  
  // Panel widths
  panelWidth: {
    narrow: 200,
    medium: 250,
    wide: 300,
  },
  
  // Common button height
  buttonHeight: 40,
  
  // Button sizes
  button: {
    small: { width: 100, height: 32 },
    medium: { width: 140, height: 40 },
    large: { width: 180, height: 50 },
  },
  
  // Animation durations (ms)
  animation: {
    fast: 100,
    normal: 200,
    slow: 300,
  },
} as const;

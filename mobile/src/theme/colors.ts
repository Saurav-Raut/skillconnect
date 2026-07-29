/**
 * SKILLCONNECT — MOBILE DESIGN SYSTEM THEME
 * Synchronized with Website dark navy identity via @skillconnect/shared
 */

import { Colors as SharedColors, Typography as SharedTypography, Spacing as SharedSpacing, Radius as SharedRadius } from '@skillconnect/shared';

export const Colors = {
  ...SharedColors,
  // Backwards compatibility aliases for mobile screens
  primary: '#6366F1',       // Vibrant Indigo
  primaryDark: '#4F46E5',   // Hover / Pressed Indigo
  primaryLight: 'rgba(99, 102, 241, 0.15)',
  secondary: '#415A77',     // Secondary Muted Slate
  danger: '#C1443B',        // Red SOS / Offline / Danger
  warning: '#F4A93B',       // Amber Escrow / Highlight
  verified: '#2F9E68',      // Green Verified Badge
  dark: '#1B263B',          // Secondary Dark Surface
  text: '#FFFFFF',          // High-Contrast White Headlines
  textMain: '#E0E1DD',      // Light Paper Body Text
  textMuted: '#778DA9',     // Muted Blue-Grey Text
  border: 'rgba(65, 90, 119, 0.30)',
  borderLight: 'rgba(65, 90, 119, 0.15)',
  background: '#0D1B2A',    // Deep Dark Navy Background
  card: '#2B3C5A',          // Slate Blue Card Surface
  white: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.35)',
};

export const Spacing = { ...SharedSpacing };
export const Radius = { ...SharedRadius };
export const Typography = { ...SharedTypography };

export default { Colors, Spacing, Radius, Typography };

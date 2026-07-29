/**
 * SKILLCONNECT — SHARED COLOR DESIGN TOKENS
 * Single source of truth for Web (/frontend) and Mobile (/mobile).
 * Extracted directly from website index.css dark navy brand identity.
 */

export const Colors = {
  // Primary Navy & Slate Surfaces
  bgMain: '#0D1B2A',       // Deep Dark Navy Background
  bgCard: '#2B3C5A',       // Lighter Slate Blue for clean visual separation
  dark: '#1B263B',         // Secondary Dark Surface
  medium: '#415A77',       // Muted Slate Border/Icon color
  light: '#778DA9',        // Secondary Muted Text
  paper: '#E0E1DD',        // Primary Light Body Text
  white: '#FFFFFF',        // High-Contrast White Headlines & Icons

  // Interactive Accents
  primary: '#6366F1',      // Vibrant Indigo for Primary Action Buttons & Active Tabs
  primaryHover: '#4F46E5', // Pressed / Hover State Indigo
  secondary: '#415A77',    // Secondary Button Surface

  // Status & Badges
  verified: '#2F9E68',     // Green for "Verified Partner", Completed jobs, Online status
  warning: '#F4A93B',      // Amber for "Escrow Held ₹...", Pending jobs, Highlights
  danger: '#C1443B',       // Red for "SOS Ready", Disputed jobs, Offline status

  // Semantic Text Hierarchy
  text: '#FFFFFF',         // Default Strong Text (Headlines)
  textMain: '#E0E1DD',     // Main Reading Text
  textMuted: '#778DA9',    // Subtitles, metadata, timestamps

  // Borders & Glows
  border: 'rgba(65, 90, 119, 0.30)',
  borderLight: 'rgba(65, 90, 119, 0.15)',
  shadowGlow: 'rgba(99, 102, 241, 0.25)',
};

export default Colors;

/**
 * SKILLCONNECT — SHARED TYPOGRAPHY TOKENS
 */

export const Typography = {
  fontFamily: {
    heading: 'Fraunces',     // Serif typeface for premium brand headings
    body: 'Public Sans',     // Clean sans-serif for reading and buttons
  },
  sizes: {
    h1: 28,
    h2: 22,
    h3: 18,
    body: 14,
    caption: 12,
  },
  weights: {
    bold: '800' as const,
    semibold: '700' as const,
    medium: '600' as const,
    regular: '400' as const,
  },
};

export default Typography;

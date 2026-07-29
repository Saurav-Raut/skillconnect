# SkillConnect — Project Design Standards & Persistent Preferences

This document defines mandatory design standards and workflows for all future development on the SkillConnect codebase (`/frontend`, `/mobile`, `/shared`).

---

## 1. Typography & Font Bundling Rules
- **Serif Headings (`Fraunces`)**: All main headings, greeting titles, section headers, and card titles must render using the **Fraunces** serif font (`Fraunces_700Bold`, `Fraunces_800ExtraBold`).
- **Body & Subtitles (`Public Sans`)**: Body text, button text, labels, and captions must use **Public Sans**.
- **Expo Font Loading**: In `/mobile/App.tsx`, always load `@expo-google-fonts/fraunces` and `@expo-google-fonts/public-sans` via `useFonts`. Never silently substitute browser or system sans-serif defaults for serif headings.

---

## 2. MapView vs. Interactive Dark Navy Radar Grid Fallback
- **Primary Canvas**: `react-native-maps` (`<MapView>`) must remain the primary interactive map canvas whenever a Google Maps API key is present or when explicitly toggled.
- **Expo Go Fallback**: When running in Expo Go without an API key, never allow a blank beige box. Default to the **Interactive Dark Navy Rapido Radar Grid (`#0D1B2A` background with `#1B263B` concentric radar rings, distance badges, and clickable worker pins)**.
- **View Toggle**: Always provide a header toggle (`"📡 Radar"` / `"🗺️ Map"`) allowing users to switch between the simulated Rapido Radar and the Native MapView.

---

## 3. Shared Theme Token Library (`/shared/theme`)
- **Single Source of Truth**: All colors, typography, spacing, and border-radius tokens must be defined in `/shared/theme` (`colors.ts`, `typography.ts`, `spacing.ts`) and imported into `/mobile` via `@skillconnect/shared`.
- **Core Color Tokens**:
  - `bgMain` (`#0D1B2A`): Deep Navy Background
  - `bgCard` (`#2B3C5A`): Slate Blue Card Surface
  - `primary` (`#6366F1`): Indigo Accent for primary buttons & highlights
  - `verified` (`#2F9E68` / `#34D399`): Verified status badges
  - `warning` (`#F4A93B` / `#FBBF24`): Escrow status badges
- **Button & Badge Shapes**: Use `Radius.full` (`9999px`) for pill-shaped buttons, status tags, and category chips.
- **Layout Clearances**: Always include `paddingRight: 80` on top-right horizontal scroll containers (like skill filter bars) to prevent Expo Go development icons or header overlays from clipping or obscuring content.

---

## 4. Mandatory Visual Verification Workflow
- Before marking any UI or theme restyling task as complete, **generate visual UI mockup screenshots** of the restyled screens and embed them into a walkthrough artifact (`walkthrough.md`) for user verification and sign-off.
- Never rely solely on text descriptions of hex codes or colors when confirming design changes.

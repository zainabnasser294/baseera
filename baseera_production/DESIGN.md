# Design
<!-- impeccable:design-schema 1 -->

## Colors
**CRITICAL: DO NOT CHANGE THESE CORE COLORS. DO NOT SUGGEST TAILWIND BLUE/INDIGO WITHOUT MAPPING TO THESE EXACT HEX VALUES.**
- **Nile (Primary Dark):** `#2b2470`
- **Glow (Primary Accent):** `#7c6cf0`
- **Lavender (Soft Accent):** `#b9a6f2`
- **Accent 4 (Secondary Dark):** `#4a3f8a`
- **Ink (Text):** `#1e1b4b`

Gradient usage: `linear-gradient(135deg, #2b2470 0%, #7c6cf0 100%)` for primary actions and user chat bubbles.

## Typography
- Use modern Arabic/Latin fonts (e.g., Cairo, Tajawal, or Inter) defined in the system.
- Bold headings and crisp, readable text for analytics.

## Components & Elements
- **Glassmorphism:** Use translucent backgrounds with backdrop-blur. 
  - `background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.4);`
- **Corners:** Heavily rounded corners for a premium feel. Use `rounded-3xl` for main cards and `rounded-2xl` for internal widgets or chat bubbles.
- **Shadows:** Soft, colorful shadows (e.g., `box-shadow: 0 4px 24px rgba(27, 20, 75, 0.15)`) instead of harsh black dropshadows.
- **Micro-animations:** Elements should have smooth scale and hover transitions (`transform: scale(1.02); transition: all 0.3s cubic-bezier(...)`).

## Layout
- Supports RTL (Right-to-Left) for Arabic by default. Margin and padding utilities should respect logical properties or be explicitly mirrored for RTL (`ml` vs `mr`).
- Avoid cluttered tables; prefer cards with clear Visual Hierarchy and metrics.

## Design Rules
1. Never compromise the color palette. If you need a success/warning state, use standard emerald/amber but keep primary UI tied to the custom variables.
2. Premium Feel: No flat, lifeless components. Add subtle borders, blurs, and shadows.
3. Keep it spacious. Ample padding (`p-5`, `p-6`) makes the data digestible.

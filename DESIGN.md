---
name: Retro Desktop Cinema
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#414848'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#717878'
  outline-variant: '#c1c8c8'
  surface-tint: '#426465'
  primary: '#426465'
  on-primary: '#ffffff'
  primary-container: '#a5c9ca'
  on-primary-container: '#335556'
  inverse-primary: '#a9cdce'
  secondary: '#864e5a'
  on-secondary: '#ffffff'
  secondary-container: '#feb6c4'
  on-secondary-container: '#7a4450'
  tertiary: '#715c1d'
  on-tertiary: '#ffffff'
  tertiary-container: '#dcc076'
  on-tertiary-container: '#614d0e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c5e9ea'
  primary-fixed-dim: '#a9cdce'
  on-primary-fixed: '#002021'
  on-primary-fixed-variant: '#2a4c4d'
  secondary-fixed: '#ffd9df'
  secondary-fixed-dim: '#fbb3c1'
  on-secondary-fixed: '#360c19'
  on-secondary-fixed-variant: '#6b3743'
  tertiary-fixed: '#fee093'
  tertiary-fixed-dim: '#e0c47a'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574404'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  window-title:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: IBM Plex Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: -0.01em
  label-sm:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
  button-text:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1'
spacing:
  unit: 4px
  window-margin: 12px
  gutter: 8px
  internal-padding: 16px
---

## Brand & Style
The design system is a nostalgic tribute to the early-2000s personal web and desktop computing era. It prioritizes a high-density, tactile interface that feels like a curated digital scrapbook or a bespoke desktop application. The aesthetic is "New-Retro"—leveraging the structural constraints of classic operating systems (Windows 98, Mac OS Classic) while softening the palette and refining the execution for modern displays.

The UI should evoke a sense of playfulness, intimacy, and "low-fi" comfort. It rejects the vast whitespace of modern SaaS in favor of framed windows, tiled patterns, and pixel-perfect iconography. The emotional goal is to make movie matching feel like a collaborative, creative activity rather than a utility.

## Colors
The palette utilizes muted, "sun-faded" pastel tones to create a soft, accessible environment. 

- **Primary (Sky Blue):** Used for title bars, active states, and primary window headers.
- **Secondary (Pastel Pink):** Reserved for "Match" notifications, hearts, and celebratory accents.
- **Tertiary (Sunny Yellow):** Used for highlighting, stars, and important alerts.
- **Background:** A neutral pale grey-cream that mimics old hardware casings.
- **Surface:** Pure white is used sparingly for content areas within windows, always bounded by distinctive borders.

## Typography
This design system uses a dual-font approach. **IBM Plex Mono** provides the technical, "machine-like" personality required for navigation, labels, and title bars. **Inter** is used for body copy to ensure high readability during long browsing sessions.

The typography is characterized by its compact nature. Letter spacing is slightly tightened on headlines to mimic the "cramped but clean" look of classic UI dialogs. All headings should be treated as functional labels rather than expressive marketing copy.

## Layout & Spacing
The layout follows a "Layered Window" model. Instead of a single continuous flow, content is divided into draggable-style "Window" frames. 

- **Grid:** A standard 12-column grid is used, but windows rarely span the full width; they are typically offset to suggest depth and "stacking."
- **Nesting:** Content inside windows uses an 8px gutter system. 
- **Mobile:** On mobile, windows stack vertically but retain their "Title Bar" and 2px border treatment to maintain the desktop metaphor.
- **Density:** High density is encouraged. Elements are packed closely together to create a cozy, "utility-software" feel.

## Elevation & Depth
Depth is achieved through **structural bevels** rather than shadows. 
- **Outset Bevel:** Used for windows and unpressed buttons. A 2px border where the top/left are white (`#FFFFFF`) and the bottom/right are medium-grey (`#A9A9A9`) to simulate a raised edge.
- **Inset Bevel:** Used for input fields and "depressed" states. A 2px border where the top/left are dark-grey (`#808080`) and the bottom/right are white.
- **Layering:** Windows are stacked with a simple 1px dark-charcoal outline to define their silhouette against the background.

## Shapes
The design system is strictly **sharp-edged**. No border radii are used. This reinforces the early computing aesthetic where pixels were precious and curves were computationally expensive. All "pill-shaped" elements should be replaced with rectangular containers with pixelated or stepped corners if a softer feel is absolutely necessary.

## Components
- **Windows:** The primary container. Must include a title bar (Primary color background), a title (IBM Plex Mono, bold), and a "Functional X" button in the top right corner.
- **Buttons:** Rectangular with a 2px outset bevel. On `:active`, they switch to an inset bevel and shift the label 1px down and right to simulate physical movement.
- **Input Fields:** 2px inset border with a pure white background and `Deep Charcoal` text.
- **Pixel Icons:** All icons must be rendered in a 16x16 or 32x32 pixel-art style, using the system palette. No SVG blurs or gradients.
- **Chips/Tags:** Small rectangular blocks with a 1px solid border. Use `Pastel Pink` or `Sunny Yellow` for movie genres or status indicators.
- **Lists:** Dotted horizontal separators (1px height, repeating pixel pattern) between list items.
- **Decorative Elements:** Occasional pixel "sparkles" or "stars" should be placed at the intersections of windows or in the corners of empty states to add the "personal-web" charm.
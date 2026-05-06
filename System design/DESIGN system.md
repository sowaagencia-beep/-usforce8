---
name: USFORCE8
colors:
  surface: '#f7f9ff'
  surface-dim: '#d7dadf'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f9'
  surface-container: '#ebeef3'
  surface-container-high: '#e5e8ed'
  surface-container-highest: '#e0e3e8'
  on-surface: '#181c20'
  on-surface-variant: '#45464e'
  inverse-surface: '#2d3135'
  inverse-on-surface: '#eef1f6'
  outline: '#76767f'
  outline-variant: '#c6c6cf'
  surface-tint: '#505d88'
  primary: '#000b33'
  on-primary: '#ffffff'
  primary-container: '#15224a'
  on-primary-container: '#7e8ab8'
  inverse-primary: '#b9c5f6'
  secondary: '#4f5f79'
  on-secondary: '#ffffff'
  secondary-container: '#d0e0ff'
  on-secondary-container: '#53637d'
  tertiary: '#0d1011'
  on-tertiary: '#ffffff'
  tertiary-container: '#222527'
  on-tertiary-container: '#8a8c8e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b9c5f6'
  on-primary-fixed: '#0b1941'
  on-primary-fixed-variant: '#39456f'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#b7c7e5'
  on-secondary-fixed: '#0a1c32'
  on-secondary-fixed-variant: '#384760'
  tertiary-fixed: '#e1e2e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f7f9ff'
  on-background: '#181c20'
  surface-variant: '#e0e3e8'
typography:
  display:
    fontFamily: Orbitron
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.05em
  h1:
    fontFamily: Rajdhani
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  h2:
    fontFamily: Rajdhani
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  h3:
    fontFamily: Rajdhani
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.08em
---

## Brand & Style

This design system embodies a "Command and Control" aesthetic—a fusion of elite aerospace precision and high-end minimalist functionalism. The brand personality is disciplined, authoritative, and technologically advanced. It avoids the soft, organic trends of consumer apps in favor of a rigid, architectural structure that suggests reliability and high-performance engineering.

The visual style is defined by **Technical Minimalism**. It utilizes aggressive whitespace to create a sense of focus and importance, while the "45-degree angular details" serve as a signature motif, mimicking the chamfered edges of machined metal and stealth geometry. This system is designed for professional environments where clarity, speed of data ingestion, and a premium "executive" feel are paramount.

## Colors

The palette is anchored in a high-contrast foundation to ensure maximum legibility and a refined professional tone. 

- **Primary Navy (#15224A):** Used for critical actions, primary navigation, and heavy headings to establish authority.
- **Metallic Steel-Blue (#5B6B85):** Acts as a technical accent for secondary actions, iconography, and state indicators, providing a sophisticated bridge between the deep navy and the lighter grays.
- **Surface Tiers:** The background remains pure White (#FFFFFF) for maximum "airiness." The subtle Off-White (#F7F8FA) is reserved for background grouping and layout sections to provide depth without adding visual weight.
- **Structural Gray (#E4E7EC):** Applied to borders and dividers, this color ensures clear definition between elements while remaining unobtrusive.

## Typography

The typography strategy leverages a "High-Tech Utility" pairing. 

**Orbitron** is used exclusively for top-level display text and hero moments to establish the futuristic narrative. **Rajdhani**, with its condensed, squared-off letterforms, handles standard headings (H1-H3), providing a technical look that remains highly readable in dense layouts. **Inter** is the workhorse for all body copy and UI labels, chosen for its neutral, systematic clarity.

To maintain the refined aesthetic, avoid heavy weights for body text; rely on the uppercase transformation of labels for hierarchy instead. Ensure Orbitron always has a slight positive letter spacing to lean into the "premium tech" feel.

## Layout & Spacing

This design system utilizes a **Fixed-Fluid Hybrid Grid**. The primary content container is centered with a maximum width, while internal components follow a strict 12-column rhythm. 

The spacing philosophy is "Airy yet Structured." Large `xl` and `xxl` gaps should be used between major sections to prevent the UI from feeling cluttered. Gutters are kept wide (24px) to ensure that even complex data-heavy views feel breathable. Alignment should always be sharp; avoid centering elements within containers unless they are standalone hero components. Left-alignment is the default for all technical readouts and lists.

## Elevation & Depth

Depth is achieved through high-precision layering rather than atmospheric blurs. This design system rejects "glows" and "soft clouds" in favor of:

1.  **Crisp Shadows:** Shadows should have zero or very low spread, with a small blur radius (e.g., `4px 4px 0px rgba(0,0,0,0.05)`). This creates a "cut-out" or "elevated plate" effect rather than a floating one.
2.  **Tonal Offsets:** Use the Off-White (#F7F8FA) surface to create recessed areas (like code blocks or sidebar wells) and White (#FFFFFF) for elevated surfaces (like cards).
3.  **Hard Borders:** Every elevated element must be bounded by a 1px solid border (#E4E7EC). This "technical line-work" reinforces the precision of the brand.

## Shapes

The shape language is strictly **Angular**. All standard corners have a 0px radius (Sharp).

The defining characteristic of this design system is the **45-degree Chamfer**. This detail should be applied to the top-right and bottom-left corners of primary buttons, active tabs, and featured cards. It is not a rounded corner, but a straight diagonal cut. This motif should be used sparingly to highlight "interactive" or "active" states, ensuring it remains a sophisticated accent rather than a repetitive pattern.

## Components

- **Buttons:** Primary buttons use the Deep Navy (#15224A) background with White text and a 45-degree chamfer on the top-right corner. Secondary buttons use the Steel-Blue (#5B6B85) with a sharp 0px radius.
- **Inputs:** Fields are defined by 1px #E4E7EC borders with a #F7F8FA background. Labels sit above the field in Inter (uppercase, 12px). On focus, the border shifts to Deep Navy.
- **Cards:** White background, 1px #E4E7EC border, and a crisp, low-offset shadow. The card header should be separated by a subtle horizontal divider.
- **Chips/Tags:** Sharp-edged rectangles with a #F7F8FA background and #5B6B85 text. No rounded corners.
- **Lists:** Data lists should use "Zebra Striping" with the Off-White color for alternate rows, emphasizing the grid-like, systematic nature of the interface.
- **Iconography:** Use "Stroke" icons with a consistent 1.5pt weight. Avoid filled icons unless used for a primary "Active" state. Icons should be the Steel-Blue color to maintain a metallic look.
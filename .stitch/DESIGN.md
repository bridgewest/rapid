# Design System: Rapid

## 1. Visual Theme & Atmosphere
A confident, high-agency fintech interface with balanced structural density and fluid motion. The atmosphere is clinical yet warm - like a premium, well-lighted architectural studio. We employ offset asymmetric layouts, bold whitespace, and deliberate negative space to create breathing room. The visual language conveys high velocity, institutional-grade trust, and technical excellence.

## 2. Color Palette & Roles
- **Canvas White** (#FAFAFA) - Primary background surface
- **Pure Surface** (#FFFFFF) - Card, table, and secondary container fill
- **Charcoal Ink** (#18181B) - Primary typography, headings, high-contrast actions
- **Muted Steel** (#71717A) - Secondary text, labels, descriptors, timestamps
- **Whisper Border** (rgba(226,232,240,0.5)) - Subtle 1px boundaries, grid split lines, card strokes
- **Rapid Teal** (#0D9488) - The singular, low-saturation high-agency accent color for primary actions, active highlights, and focus indicators (Saturation: 68%)

## 3. Typography Rules
- **Display & Headlines:** Outfit, track-tight, semi-bold to bold weight. Sized aggressively but controlled via tight line heights (`leading-tight`).
- **Body Text:** Outfit, regular weight, relaxed line-height (`leading-relaxed`), max-width constrained to 65 characters per line (`max-w-2xl`) for superior readability.
- **Mono / Numbers:** JetBrains Mono or Geist Mono. All currency symbols, numerical transfer amounts, percentage values, transaction times, and IDs must use monospaced fonts to reflect analytical rigor.
- **Banned:**
  - `Inter` is strictly forbidden to avoid looking like a generic Bootstrap/Tailwind project.
  - Generic serif fonts (`Times New Roman`, `Georgia`, `Garamond`) are banned.

## 4. Layout Principles
- **Asymmetry over Symmetry:** Centered Hero sections and symmetrical horizontal layouts are banned. All primary sections must utilize asymmetric grids, offset 2-column panels, or split-screen structures.
- **Grid-first Architecture:** Utilize clean CSS Grids instead of custom margins or flexbox percentage hacks. Section gaps must scale proportionally.
- **The "3-Card Row" Ban:** Symmetrical three-card features are banned. Instead, use a two-column editorial spread, an asymmetric layout with one prominent featured panel, or a staggered card cascade.
- **No Stacking / Overlap:** Every interactive and visual element must maintain pristine separation. Absolute-positioned overlapping elements are banned.
- **Mobile-first Collapse:** All multi-column layouts must collapse elegantly into a single column on screens smaller than 768px. Touch targets must remain at least `44px`.

## 5. Component Stylings
- **Buttons:** Flat solid fill for primary CTAs using `Rapid Teal` (#0D9488). No outer shadows, no neon gradients. On hover, translate slightly (-1px Y-axis) for physical feedback. Ghost/border style for secondary buttons.
- **Cards:** Rounded corners of 1.5rem (24px). Soft, diffused natural gray shadows. Used only when structural elevation is required. Otherwise, use Whisper Borders.
- **Inputs & Fields:** Labels sit explicitly above the input field. Error messages must appear cleanly below. Active focus rings must transition smoothly into the accent color. Floating labels are banned.
- **Loaders:** Custom skeleton shimmers matching the exact layout dimensions. Standard circular spinners are banned.

## 6. Motion & Animation
- **Spring Physics:** All micro-interactions (hover, active, focus) must use organic spring physics (`stiffness: 100, damping: 20`) rather than mechanical linear transitions.
- **Staggered Orchestration:** Lists, cards, and text lines must animate sequentially using waterfall/cascade delays.

## 7. Anti-Patterns (Banned)
- No emojis anywhere in the interface.
- No pure black (#000000) or high-contrast harsh dark surfaces.
- No neon/outer glow effects or gradient borders.
- No AI copywriting cliches: "elevate your finances", "seamless payments", "unleash the potential", "next-gen transfers". Use active, professional fintech copy.
- No fabricated data, mock response times (e.g. "99.99%"), or round arbitrary metrics.

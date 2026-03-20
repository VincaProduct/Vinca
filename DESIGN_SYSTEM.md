# Vinca Wealth Design System

## Overview
Comprehensive design system for Vinca Wealth FFR (Financial Freedom Readiness) feature and Anchor product. Built with modern design principles focusing on clarity, trust, and action-oriented user experience.

---

## 1. COLOR PALETTE

### Primary Colors

#### Light Theme (Default)
```
Primary: hsl(158, 64%, 52%) - #26D07C (Teal/Emerald)
Primary Dark: hsl(142, 76%, 36%) - #1A7A4A (Deep Green)
Primary Foreground: hsl(0, 0%, 100%) - #FFFFFF (White)

Secondary: hsl(158, 25%, 95%) - #E8F5F0 (Light Teal)
Secondary Foreground: hsl(158, 64%, 25%) - #0D6B41 (Dark Teal)

Accent: hsl(158, 25%, 95%) - #E8F5F0 (Light Teal)
Accent Mid: hsl(158, 64%, 25%) - #0D6B41 (Dark Teal)
```

#### Dark Theme
```
Primary: hsl(158, 64%, 52%) - #26D07C (Teal/Emerald - unchanged)
Primary Dark: hsl(142, 76%, 36%) - #1A7A4A (Deep Green - unchanged)
Primary Foreground: hsl(0, 0%, 100%) - #FFFFFF (White)

Secondary: hsl(160, 25%, 95%) - #E8F4F0 (Adjusted Light)
Secondary Foreground: hsl(160, 75%, 68%) - #7FEFD7 (Brighter Teal)

Accent: hsl(160, 28%, 14%) - #1A2825 (Dark Surface)
Accent Mid: hsl(160, 75%, 68%) - #7FEFD7 (Bright Teal)
```

### Neutral Colors

#### Light Theme
```
Background: hsl(184, 100%, 99%) - #F5FFFE (Very Light Blue)
Surface: hsl(0, 0%, 100%) - #FFFFFF (White)
Surface-2: hsl(158, 25%, 98%) - #FAF8F7 (Off-White)

Foreground: hsl(185, 25%, 15%) - #1A3E38 (Dark Blue)
Foreground Muted: hsl(185, 15%, 45%) - #5A7B77 (Medium Blue)
Foreground Faint: hsl(185, 15%, 68%) - #96B4B0 (Light Blue)

Border: hsl(184, 32%, 89%) - #D9EAE7 (Light Border)
Border Strong: hsl(158, 32%, 78%) - #C4E8DD (Stronger Border)

Muted: hsl(184, 44%, 96%) - #EEF8F6 (Muted Background)
Muted Foreground: hsl(185, 15%, 45%) - #5A7B77 (Muted Text)
```

#### Dark Theme
```
Background: hsl(185, 30%, 6%) - #0A1210 (Very Dark Blue)
Surface: hsl(185, 25%, 11%) - #1A2825 (Dark Blue)
Surface-2: hsl(185, 25%, 14%) - #232F2D (Slightly Lighter Dark)

Foreground: hsl(160, 20%, 88%) - #D9E8E3 (Light Text)
Foreground Muted: hsl(160, 14%, 52%) - #6B8C87 (Medium Text)
Foreground Faint: hsl(160, 14%, 36%) - #40544E (Dim Text)

Border: hsl(160, 18%, 17%) - #1F2E2A (Dark Border)
Border Strong: hsl(160, 28%, 26%) - #2D4239 (Stronger Border)

Muted: hsl(160, 28%, 14%) - #1A2825 (Muted Background)
Muted Foreground: hsl(160, 14%, 52%) - #6B8C87 (Muted Text)
```

### Semantic Colors

#### Status
- **Success**: hsl(142, 76%, 36%) - #1A7A4A
- **Warning**: hsl(38, 92%, 50%) - #FFB800
- **Error/Destructive**: hsl(0, 84.2%, 60.2%) - #EF4444
- **Info**: hsl(158, 64%, 52%) - #26D07C

#### Gradients

**Hero Gradient**
```
linear-gradient(135deg, hsl(158 64% 52% / 0.1), hsl(158 64% 52% / 0.05))
```

**Card Gradient (Light)**
```
linear-gradient(135deg, hsl(0 0% 100%), hsl(158 25% 98%))
```

**Card Gradient (Dark)**
```
linear-gradient(135deg, hsl(160 20% 14%), hsl(160 25% 12%))
```

**Primary Gradient**
```
linear-gradient(135deg, hsl(158 64% 52%), hsl(142 76% 36%))
```

---

## 2. TYPOGRAPHY

### Font Families

#### Display Font
- **Family**: Cormorant Garamond
- **Source**: Google Fonts
- **Weights**: 500, 600, 700
- **Style**: Serif (elegant, premium)
- **Usage**: Headlines, major titles, prominent text
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap');`

#### Body Font
- **Family**: DM Sans
- **Source**: Google Fonts
- **Weights**: 300, 400, 500, 600
- **Style**: Sans-serif (modern, clean)
- **Usage**: Body text, buttons, labels, UI elements
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');`

### Typography Scale

| Element | Font Size | Weight | Line Height | Letter Spacing | Usage |
|---------|-----------|--------|-------------|----------------|-------|
| Display XL | clamp(2.4rem, 6vw, 4.2rem) | 600 | 1.08 | -0.02em | Page headlines (intro) |
| Display LG | clamp(1.9rem, 4.8vw, 3.3rem) | 600 | 1.08 | -0.02em | Question headlines |
| Display SM | clamp(1.85rem, 4.5vw, 3.2rem) | 600 | 1.08 | -0.02em | Bridge headlines |
| Heading 1 | 1.02rem | 600 | 1.72 | 0.01em | Major sections |
| Body Large | 0.97rem | 400 | 1.78 | 0 | Card body text |
| Body | 0.88rem | 400 | 1.6 | 0 | Question sub-text |
| Body Small | 0.82rem | 500 | 1.4 | 0 | Labels, urgency text |
| Label | 0.77rem | 300 | 1.45 | 0 | Description text |
| Caption | 0.73rem | 400 | 1.4 | 0 | Stat labels |
| Small | 0.70rem | 400 | 1 | 0.14em | Metadata, tags |
| Tiny | 0.68rem | 600 | 1 | 0.14em | Tags, badges |

### Text Styles

#### Display
- Font: Cormorant Garamond
- Weight: 600
- Line Height: 1.08
- Letter Spacing: -0.02em
- Color: var(--fg)

#### Question Headline
- Font: Cormorant Garamond
- Font Size: clamp(1.9rem, 4.8vw, 3.3rem)
- Weight: 600
- Line Height: 1.08
- Color: var(--fg)
- Display: white-space: pre-line

#### Intro Body
- Font: DM Sans
- Font Size: 1.02rem
- Weight: 300
- Line Height: 1.72
- Color: var(--fg-muted)

#### Bridge Body
- Font: DM Sans
- Font Size: 0.97rem
- Weight: 300
- Line Height: 1.78
- Color: var(--fg-muted)
- **Strong**: Weight 500, Color var(--fg)
- **Emphasis**: Font-style italic

---

## 3. SPACING SYSTEM

### Base Unit: 2px (1rem = 16px)

| Spacing | Value | Use Case |
|---------|-------|----------|
| xs | 4px | Minimal gaps |
| sm | 8px | Small spacing between elements |
| md | 12px | Medium spacing |
| lg | 18px | Large spacing |
| xl | 24px | Extra large spacing |
| 2xl | 28px | Major section spacing |
| 3xl | 36px | Page section spacing |
| 4xl | 52px | Full page padding |

### Component Spacing

#### Card Padding
- **Standard**: 20px 22px
- **Bridge Card**: 26px 28px
- **Mobile Bridge Card**: 20px 18px

#### Button Padding
- **CTA Large**: 15px 32px
- **CTA Full**: 17px 28px

#### Content Spacing
- **Main Content Padding**: 52px 24px (52px vertical, 24px horizontal)
- **Mobile Padding**: 36px 18px

#### Gap System
- **Choice Grid**: gap: 10px
- **Stat Grid**: gap: 11px
- **Bridge Bullets**: gap: 12px
- **Flex Items**: gap: 6px - 13px (varies by component)

---

## 4. BORDER & RADIUS SYSTEM

### Border Radius

| Level | Value | Usage |
|-------|-------|-------|
| Small (sm) | 8px | Icon backgrounds, small components |
| Default | 12px | Choice cards, buttons |
| Medium | 14px | Standard buttons, cards |
| Large | 16px | Bridge cards |
| Full | 100px | Pills, badges, tags |

### Borders

#### Thickness
- **Standard**: 1.5px (cards, choices)
- **Thin**: 1px (subtle borders)
- **Accent**: 3px (top border on stat cards)

#### Styles
```
Light Theme:
  Border: 1.5px solid hsl(184, 32%, 89%)
  Border Strong: 1.5px solid hsl(158, 32%, 78%)

Dark Theme:
  Border: 1.5px solid hsl(160, 18%, 17%)
  Border Strong: 1.5px solid hsl(160, 28%, 26%)
```

---

## 5. SHADOW SYSTEM

### Shadow Definitions

#### Soft Shadow
```
Light: 0 4px 6px -1px hsl(158 64% 52% / 0.10), 0 2px 4px -1px hsl(158 64% 52% / 0.06)
Dark: 0 4px 6px -1px hsl(158 64% 52% / 0.20), 0 2px 4px -1px hsl(158 64% 52% / 0.12)
```

#### Card Shadow
```
Light: 0 1px 3px hsl(185 25% 15% / 0.06), 0 8px 24px hsl(158 64% 52% / 0.08)
Dark: 0 1px 3px hsl(0 0% 0% / 0.20), 0 8px 24px hsl(158 64% 52% / 0.12)
```

#### Hover Shadow (Choices)
```
Light: 0 6px 18px hsl(158 64% 52% / 0.12)
Dark: 0 6px 18px hsl(158 64% 52% / 0.20)
```

#### Selected Shadow (Choices)
```
Light: 0 6px 20px hsl(158 64% 52% / 0.18)
Dark: 0 6px 20px hsl(158 64% 52% / 0.25)
```

#### CTA Button Shadow
```
Base: 0 4px 14px hsl(158 64% 52% / 0.35)
Hover: 0 8px 24px hsl(158 64% 52% / 0.45)
Dark Hover: 0 8px 24px hsl(158 64% 52% / 0.55)
```

---

## 6. COMPONENTS

### Buttons

#### Primary CTA Button
```
Background: linear-gradient(135deg, hsl(158 64% 52%), hsl(142 76% 36%))
Text Color: hsl(0, 0%, 100%)
Font Weight: 600
Font Size: 0.96rem - 1.02rem
Padding: 15px 32px (or 17px 28px for full width)
Border Radius: 14px
Border: none
Cursor: pointer

States:
  Hover:
    Transform: translateY(-2px)
    Box Shadow: 0 8px 24px hsl(158 64% 52% / 0.45)
    Filter: brightness(1.08)
  Active:
    Transform: translateY(0)

Transitions: 0.25s ease (transform, box-shadow, filter)
```

#### Back Button
```
Font Size: 0.80rem
Font Weight: 400
Text Color: var(--fg-faint)
Background: none
Border: none
Display: flex with gap: 5px

Hover:
  Color: var(--fg-muted)

Transition: 0.18s
```

### Choice Cards

```
Layout: Grid (repeat(auto-fit, minmax(270px, 1fr)), gap: 10px)

Card Styles:
  Border: 1.5px solid var(--border)
  Background: var(--surface)
  Border Radius: 14px
  Padding: 20px 22px 20px 20px
  Position: relative (for indicator)
  Width: 100%

States:
  Default:
    Box Shadow: var(--shadow-soft)
  Hover:
    Border Color: var(--primary)
    Background: var(--surface-2)
    Transform: translateY(-2px)
    Box Shadow: 0 6px 18px hsl(158 64% 52% / 0.12)
  Selected:
    Border Color: var(--primary)
    Background: linear-gradient(135deg, hsl(0 0% 100%), hsl(158 25% 97%))
    Dark Selected Background: linear-gradient(135deg, hsl(160 20% 14%), hsl(160 25% 12%))
    Transform: translateY(-2px)
    Box Shadow: 0 6px 20px hsl(158 64% 52% / 0.18) [light] / 0.25 [dark]

Selection Indicator (top-right):
  Position: absolute (top: 18px, right: 18px)
  Size: 18x18px
  Border Radius: 50%
  Border: 1.5px solid var(--border-strong)
  Background: transparent
  
  Selected State:
    Background: var(--primary)
    Border Color: var(--primary)
    SVG Opacity: 1

Transitions: 0.25s ease (all properties)
```

### Stat Card

```
Background: var(--surface)
Border: 1.5px solid var(--border)
Border Radius: 14px
Padding: 20px 18px

Top Border Accent:
  Height: 3px
  Background: linear-gradient(90deg, var(--primary), var(--primary-dark))
  Border Radius: 14px 14px 0 0

Icon Box:
  Size: 36x36px
  Border Radius: 10px
  Background: var(--accent-light)
  Display: flex center
  Margin Bottom: 12px

Stat Number:
  Font: Cormorant Garamond, 1.9rem, weight 600
  Color: hsl(158, 50%, 32%)
  Line Height: 1
  Margin Bottom: 4px

Stat Label:
  Font Size: 0.73rem
  Color: var(--fg-muted)
  Font Weight: 400
  Line Height: 1.4
```

### Bridge Card

```
Background: var(--surface)
Border: 1.5px solid var(--border)
Border Radius: 16px
Padding: 26px 28px (mobile: 20px 18px)
Box Shadow: var(--shadow-card)
Position: relative
Overflow: hidden

Background Gradient (::before):
  Position: absolute (top: -60px, right: -60px)
  Width: 180x180px
  Border Radius: 50%
  Background: radial-gradient(circle, hsl(158 64% 52% / 0.07) 0%, transparent 70%)
  Z-index: -1

Content (relative z-index: 1):
  Positioning: relative, z-index 1
  Margin Bottom: 22px
```

### Tags & Badges

#### Tag
```
Display: inline-flex
Align Items: center
Gap: 7px
Background: var(--accent-light)
Border: 1px solid var(--border-strong)
Border Radius: 100px
Padding: 5px 14px
Font Size: 0.68rem
Font Weight: 600
Letter Spacing: 0.14em
Text Transform: uppercase
Color: var(--accent-mid)
Margin Bottom: 28px

Dot Animation:
  Width: 5px, Height: 5px
  Border Radius: 50%
  Background: var(--primary)
  Animation: pdot 2s ease infinite
  
  @keyframes pdot {
    0%, 100%: opacity 1, scale 1
    50%: opacity 0.4, scale 0.6
  }
```

### Urgency Strip

```
Display: flex
Align Items: center
Gap: 13px
Background: hsl(158 64% 52% / 0.07)
Dark Background: hsl(160 55% 28% / 0.15)
Border: 1px solid hsl(158 64% 52% / 0.2)
Dark Border: hsl(160 55% 28% / 0.3)
Border Radius: 8px
Padding: 13px 18px
Margin Bottom: 26px

Icon Box:
  Size: 32x32px
  Border Radius: 8px
  Background: var(--accent-light)
  Border: 1.5px solid var(--border-strong)
  Display: flex center
  Flex Shrink: 0

Text:
  Font Size: 0.82rem
  Color: hsl(158, 50%, 28%)
  Dark Color: hsl(160, 70%, 60%)
  Font Weight: 500
  Line Height: 1.4
```

---

## 7. LAYOUTS & GRIDS

### Main Layout
```
Container Width: 100vw (full viewport)
Max Content Width: 720px
Margin: 0 auto (centered)

Main Content Area:
  Display: flex column, center, center
  Padding: 52px 24px (desktop) / 36px 18px (mobile)
  Flex: 1
  Align Items: center
  Justify Content: center
```

### Choice Grid
```
Display: grid
Grid Template Columns: repeat(auto-fit, minmax(270px, 1fr))
Gap: 10px
Mobile: grid-template-columns: 1fr
```

### Stat Grid
```
Display: grid
Grid Template Columns: repeat(3, 1fr)
Gap: 11px
Mobile (max-width: 560px): grid-template-columns: 1fr
```

### Bridge Bullets
```
Display: flex column
Gap: 12px

Bullet Item:
  Display: flex
  Align Items: flex-start
  Gap: 13px
```

---

## 8. TRANSITIONS & ANIMATIONS

### System Transitions
- **Default Duration**: 0.25s - 0.30s
- **Easing**: ease, cubic-bezier(0.22, 1, 0.36, 1)
- **Properties**: all, transform, opacity, color, box-shadow, border-color

### Scene Transitions
```
.anc-scene {
  transition: opacity 0.30s ease, transform 0.30s ease;
}

.out {
  opacity: 0;
  transform: translateY(18px);
}

.in {
  opacity: 1;
  transform: translateY(0);
}
```

### Dot Animation
```
@keyframes pdot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.6);
  }
}
```

### Button Hover States
```
Transform: translateY(-2px)
Duration: 0.25s ease
```

### Reduced Motion Support
```
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. ICONS

### Icon System
- **Source**: Lucide React (https://lucide.dev)
- **Default Size**: 16px - 17px (for text-adjacent icons)
- **Larger Icons**: 18px - 36px (for standalone icons in stat cards)
- **Stroke Width**: 1.8 - 2 (varies by size)

### Icons Used
```
ArrowRight - CTA navigation
ArrowLeft - Back navigation
Checkmark (SVG) - Selection indicator, bullet confirmation
Clock - Time-related stats
Wave - Flow/progression
Shield - Security/stability
Trend Arrow - Growth metrics
Target - Goal-focused
Zero/Nil - No hidden costs
Lightbulb - Ideas/guidance
```

### Icon Colors
```
Light Theme: 
  Default: hsl(158, 64%, 42%) - Primary teal
  Muted: varies based on container

Dark Theme:
  Default: hsl(158, 64%, 42%) - Primary teal (unchanged)
  Muted: hsl(160, 75%, 68%) - Bright teal
```

---

## 10. RESPONSIVE DESIGN

### Breakpoints

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| Mobile | < 640px | Small phones |
| Tablet | 640px - 1024px | Tablets, large phones |
| Desktop | > 1024px | Desktop computers |
| Mobile Max | max-width: 560px | Stat grid collapse |

### Responsive Adjustments

#### Typography Scaling
```css
/* Uses clamp() for fluid scaling */
font-size: clamp(min, preferred, max)
Example: font-size: clamp(1.9rem, 4.8vw, 3.3rem)
```

#### Layout Adjustments
```
Mobile (max-width: 640px):
  .anc-topbar: padding 14px 18px
  .anc-main: padding 36px 18px
  .anc-bridge-card: padding 20px 18px
  .anc-choices: grid-template-columns 1fr
  
Mobile (max-width: 560px):
  .anc-stat-grid: grid-template-columns 1fr (stacked)
```

---

## 11. DARK MODE IMPLEMENTATION

### CSS Variables with Media Query
```css
:root {
  --bg: hsl(184, 100%, 99%);
  --surface: hsl(0, 0%, 100%);
  /* ... light theme variables */
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: hsl(185, 30%, 6%);
    --surface: hsl(185, 25%, 11%);
    /* ... dark theme variables */
  }
}
```

### Automatic Theme Detection
- Uses system preference: `prefers-color-scheme: dark`
- No manual toggle needed
- Smooth 0.3s transition between themes
- All components update automatically via CSS variables

### Dark Theme Specific Overrides
- Box shadows increased opacity
- Border colors adjusted for visibility
- Background gradients modified
- Text colors optimized for dark contrast

---

## 12. ACCESSIBILITY

### Color Contrast
- **AA Standard**: 4.5:1 for normal text
- **AAA Standard**: 7:1 for large text
- **Components**: All interactive elements meet WCAG AA minimum

### Focus States
```
.anc-choice:focus-visible,
.anc-cta:focus-visible,
.anc-back:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Motion Preferences
- Respects `prefers-reduced-motion: reduce`
- All animations reduced to 0.01ms
- Iteration count set to 1
- No parallax or auto-playing animations

### Semantic HTML
- Use `<button>` for clickable elements
- Use `<h1>`, `<h2>` for headings
- Use `<p>` for paragraphs
- Use `<div>` with role attributes when needed

---

## 13. USAGE EXAMPLES

### Creating a New Card Component
```tsx
<div className="anc-bridge-card">
  <p className="anc-bridge-body">Your content here</p>
  <hr className="anc-bridge-divider" />
  {/* content */}
</div>
```

### Button Implementation
```tsx
<button className="anc-cta" onClick={handleClick}>
  Action Text <ArrowRight size={16} />
</button>
```

### Choice Card Implementation
```tsx
<button className={`anc-choice ${selected ? 'sel' : ''}`}>
  <div className="anc-choice-indicator">
    <svg>{/* checkmark */}</svg>
  </div>
  <div className="anc-choice-label">Label</div>
  <div className="anc-choice-sub">Sub text</div>
</button>
```

---

## 14. DESIGN TOKENS SUMMARY

### Quick Reference Table

| Token | Light Value | Dark Value | Purpose |
|-------|------------|-----------|---------|
| --primary | hsl(158, 64%, 52%) | hsl(158, 64%, 52%) | Brand color |
| --bg | hsl(184, 100%, 99%) | hsl(185, 30%, 6%) | Page background |
| --surface | hsl(0, 0%, 100%) | hsl(185, 25%, 11%) | Card background |
| --fg | hsl(185, 25%, 15%) | hsl(160, 20%, 88%) | Primary text |
| --fg-muted | hsl(185, 15%, 45%) | hsl(160, 14%, 52%) | Secondary text |
| --border | hsl(184, 32%, 89%) | hsl(160, 18%, 17%) | Borders |
| --radius | 14px | 14px | Border radius |
| --shadow-card | [light] | [dark] | Card shadow |

---

## 15. FILE REFERENCES

### Core Files
- **Component**: `src/pages/dashboard/AnchorPage.tsx`
- **Styles**: Inline CSS (scoped within component)
- **Config**: `src/App.tsx`, `src/index.css`

### Design System Files
- **Colors**: `src/index.css` (CSS variables)
- **Fonts**: Google Fonts (imported in AnchorPage.tsx)
- **Icons**: Lucide React library

---

## 16. BEST PRACTICES

### Do's ✓
- Use CSS variables for colors (allows theme switching)
- Use `clamp()` for responsive typography
- Apply transitions to all interactive elements
- Test in both light and dark modes
- Use semantic HTML elements
- Include proper spacing using the spacing system

### Don'ts ✗
- Don't hardcode colors (use variables)
- Don't use fixed font sizes (use clamp for responsive)
- Don't skip accessibility features
- Don't create custom animations (use standard transitions)
- Don't ignore mobile responsiveness
- Don't break color contrast ratios

---

## 17. VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-20 | Initial design system created |

---

**Last Updated**: March 20, 2026  
**Status**: Active  
**Maintained By**: Vinca Wealth Design Team

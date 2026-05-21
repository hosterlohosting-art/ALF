# design.md — Awad Law Firm Homepage & Practice Areas Design System

## 1. Project Overview

**Website Branding:** The Awad Law Firm (ALF)  
**Primary Goal:** Present a luxurious, high-end, and relentless personal injury advocate brand that converts visitors through free case evaluations, direct team calls, clear success statistics, and responsive practice directories.

The design is built to feel:
- Relentless & Authoritative
- Modern & Luxurious (SaaS-inspired Glassmorphism)
- Strategic & Clean
- Trust-focused & Empathetic
- Conversion-driven (Sticky desktop overlays, stacked mobile CTAs, 24/7 access callouts)

---

## 2. Brand Positioning

### Core Message
The website positions The Awad Law Firm as Georgia's trusted and relentless personal injury advocate, carrying the legal and emotional burdens of injured victims while securing maximum recovery.

### Main Promise
**Strategic injury law solutions for maximum recovery.**

### Key Conversion Actions
- Get Free Evaluation / Free Consultation
- Call Direct Phone Lines (e.g., Marietta & Dalton office lines)
- Explore Practice Area Directories (Car Accidents, Trucking, Slip & Fall, wrongful death)
- Review Proven Case Results ($70,000,000+ Recovered)

---

## 3. Visual Direction

### Style Keywords
Luxury dark mode, glowing ambient orbs, modern glassmorphism, geometric layouts, thin responsive borders, custom micro-animations, strong contrast.

### Overall Look
The website blends a modern light corporate aesthetic with deep, cinematic dark sections. High-end glassmorphic image frames, glowing blue ambient background spheres, warm gold rating badges, and custom interactive pulsing elements bring the brand to life across all screen sizes.

---

## 4. Color Palette System

The branding relies on a curated, deep slate-and-blue theme accented by luxury gold highlights:

```css
:root {
  /* Core Theme Colors */
  --color-primary-navy: #0A192F;       /* Signature deep corporate navy */
  --color-secondary-navy: #0C1827;     /* Dark navy for card containers & headers */
  --color-bg-dark: #060B11;            /* Ambient black for rich section backdrops */
  
  /* Bright Accent & Action Colors */
  --color-brand-primary: #6CA1E6;      /* Sky blue for buttons, hover states, and glow accents */
  --color-brand-primary-hover: #5A8DD0;/* Darker sky blue on hover */
  
  /* Soft Luxury Highlights */
  --color-awad-gold: #c6a15b;          /* Gold/bronze for trust row, stars, and key counters */
  --color-brand-pale: #EAF2FA;         /* Soft pale blue for step badges and icon cards */
  
  /* Neutrals & Borders */
  --color-brand-white: #FFFFFF;        /* Content background */
  --color-brand-offwhite: #F9FAFC;     /* Warm light gray for alternating sections */
  --color-brand-border: #E2E8F0;       /* Thin sleek gray for interactive borders */
  --color-text-dark: #0A1118;          /* Body copy dark neutral */
  --color-text-muted: #64748B;         /* Slate gray for descriptions */
}
```

### Color Usage Rules
- **Deep Navy & Ambient Black:** Hero overlays, sticky stats panels, cinematic call-to-actions, and website footer block.
- **Sky Blue:** Primary buttons, hover highlights, active status signals, Lucide icons, and ambient background glowing orbs.
- **Gold:** Ratings stars, special roles, guarantee labels, and award-winning numbers.
- **White / Off-White:** Clean narrative backgrounds, form cards, and directories.

---

## 5. Typography

The website implements exactly **three** premium font families to achieve clean editorial hierarchy and high contrast:

```css
:root {
  --font-heading: 'Outfit', sans-serif;         /* Modern geometric sans for headlines & numbers */
  --font-body: 'Manrope', sans-serif;           /* Highly readable sans for content body & inputs */
  --font-accent-serif: 'Playfair Display', serif; /* Luxurious editorial serif for elegant italic subtitles */
}
```

### Typography Scale & Styles

```css
h1 {
  font-family: var(--font-heading);
  font-size: clamp(38px, 6.5vw, 80px);
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: -0.04em;
}

h2 {
  font-family: var(--font-heading);
  font-size: clamp(30px, 4.5vw, 52px);
  line-height: 1.15;
  font-weight: 900;
  letter-spacing: -0.03em;
}

h3 {
  font-family: var(--font-heading);
  font-size: clamp(22px, 2.5vw, 32px);
  line-height: 1.25;
  font-weight: 800;
}

body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.7;
  font-weight: 500;
}

.accent-italic {
  font-family: var(--font-accent-serif);
  font-style: italic;
  font-weight: 700;
}
```

---

## 6. Layout & Spacing

### Containers
Unified boundary constraints keep content aligned across all viewports:
```css
.container {
  width: 100%;
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: 24px;
}
```

### Section Spacing
Generous vertical padding to feel spacious and premium:
```css
section {
  padding: 96px 0;
}
@media (max-width: 768px) {
  section {
    padding: 64px 0;
  }
}
```

---

## 7. Responsive Hero Section

### Desktop Version (Sticky Animated Layout)
- **Background:** Deep blue radial glows overlaying an animated, shifting blue aurora flow (`auroraFlow` keyframes over 26s).
- **Sticky Form Reveal:** Left column features large bold typography and case indicators, while the right column houses a sticky quick contact form that transitions and fades during scroll.
- **Overlay Elements:** Ibrahim Awad's single portrait is displayed with responsive scaling behind a clean slanted footer mask.

### Mobile Version (Centralized Content Flow)
- **Backdrop:** signature dark blue radial gradient matching the desktop version.
- **Shifting Aurora:** Re-enabled the rotating `::after` aurora flow animation.
- **Copy:** 100% centralized headline (`h1`), supporting subcopy, and trust elements.
- **CTA Buttons:** Vertically stacked consult and phone links, stretched to a uniform, thumb-friendly `320px` width.
- **Video Indicator:** Center-aligned glowing play button featuring a deep navy `#06162d` icon and a dual-ring out-of-phase ripple wave animation.
- **Hero Image:** Premium transparent asset `assets/clientpromisenew.png` floating at the bottom with a 3D drop-shadow.

---

## 8. Interactive Practice Area Directories

The site catalogs key legal services using a clean, modern card system:

### Directory Card Anatomy
- **Lucide Icon Badge:** Top-right aligned, floating on a pale blue circular field, shifting to sky blue on hover.
- **Step Count:** Unique tracking index (`01`, `02`, etc.) in muted gray.
- **Heading:** Outfit-font bold headers that highlight sky blue on hover.
- **Hover Lift:** 3D translation (`translateY(-8px)`) with deep drop shadows.

### Cataloged Directories
1. Car Accidents
2. Trucking Accidents
3. Motorcycle Accidents
4. Bicycle Accidents
5. Uber Accidents
6. Lyft Accidents
7. Slip & Fall Cases
8. Medical Malpractice
9. Wrongful Death

---

## 9. Trust & Success Verification

### Stats Panel
A key element used to build quick legal authority:
- **Metrics:** Bold, high-contrast highlights such as `$70,000,000+` Total Recovery, `99%` Success rate, and `24/7` communication availability.
- **Guarantees:** Muted labels inside navy glassmorphic cards, featuring glowing ambient border indicators.

---

## 10. Global UI Elements

### Buttons

```css
/* Primary Get Free Evaluation CTA */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-brand-primary);
  color: #FFFFFF;
  font-family: var(--font-heading);
  font-weight: 800;
  border-radius: 9999px;
  padding: 18px 36px;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(108, 161, 230, 0.3);
}

.btn-primary:hover {
  background: var(--color-brand-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(108, 161, 230, 0.45);
}

/* Secondary Outline Call button */
.btn-secondary-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  font-family: var(--font-heading);
  font-weight: 800;
  border-radius: 9999px;
  padding: 18px 36px;
  transition: all 0.3s ease;
}
```

---

## 11. SEO & Accessibility Best Practices

### SEO Markup
- Standardize on **exactly one `<h1>` per page** representing the core location-specific legal advocate target (e.g., *Marietta Personal Injury — Trusted Legal Advocate*).
- Bulletproof structured data formats (**JSON-LD**) representing `LegalService`, `Organization`, and `BreadcrumbList`.

### Accessibility Checklist
- **Contrast Check:** Sky blue elements and buttons ensure correct contrast ratio against dark backgrounds.
- **Aria-Labels:** Interactive video triggers and telephone anchors leverage descriptive titles (e.g., `aria-label="Play case review video"`).
- **Semantic Tags:** Layout structured via HTML5 tags (`<header>`, `<section>`, `<nav>`, `<article>`, `<footer>`).

# Vitty Agency 

A modern, highly-interactive landing page built for Vitty Agency, featuring a premium design, smooth scroll navigation, and engaging animations.

**Live Website:** [www.vittyagency.com](https://www.vittyagency.com)

## Stack

- **Framework:** React 18 + Vite
- **Styling:** Custom CSS (Flexbox/Grid, CSS Variables)
- **Animations:** Framer Motion + custom CSS animations + Canvas/Three.js

## Quick Start

To run this project locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── App.jsx                  # Root layout, lazy loads sections
├── index.css                # Global CSS variables & base styles
├── main.jsx                 # React DOM entry point
└── components/
    ├── Loader.jsx            # Animated typing boot screen
    ├── GearCanvas.jsx        # Canvas-drawn animated gear wheels (background)
    ├── Navbar.jsx            # Sticky nav — smooth scroll to all sections
    ├── Hero.jsx              # Hero section with animated counters
    ├── Marquee.jsx           # Auto-scrolling services ticker
    ├── Services.jsx          # Service cards with hover effects
    ├── Process.jsx           # 4-step protocol timeline
    ├── About.jsx             # Split layout: Three.js 3D + value pillars
    ├── Contact.jsx           # Form that opens mailto:hello@vittyagency.com
    ├── Footer.jsx            # 4-column footer with nav links
    └── useReveal.js          # Shared scroll-reveal IntersectionObserver hook
```

## Features

- **Dynamic Loading Screen** — Performant animated typing sequence that transitions seamlessly into the navigation.
- **Lazy Loading** — Optimizes performance by progressively loading heavier sections.
- **Three.js & Canvas Backgrounds** — Incorporates 3D and canvas-based animations for an engaging, premium feel.
- **Framer Motion** — Used for precise and smooth transitions across components.
- **Scroll Reveals** — Content gracefully appears as the user scrolls down using `IntersectionObserver`.
- **Responsive Design** — Tailored viewing experience across mobile, tablet, and desktop breakpoints.

## Contact Form

The form builds a dynamic `mailto` link to `vittyagency@gmail.com` with all form fields pre-filled in the email body. This can be easily swapped out for an API integration (like EmailJS or a custom backend) by modifying the `handleSubmit` logic in `Contact.jsx`.

## Colors

```css
--navy:       #0a0e1a
--navy-light: #142040
--blue-glow:  #1a4aff
--cyan:       #00d4ff
--white:      #f0f4ff
--black:      #050810
```

# Safar Landing Page | AI Travel Intelligence

A high-performance, luxury-themed marketing site for the **Safar** travel ecosystem. This project showcases the mobile application's features through a cinematic, responsive web experience.

## 🏛️ Architecture & Tech Stack

- **Core**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first, performant design system.
- **Typography**: [next/font/google](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) for zero-latency, self-hosted Google Fonts (Playfair Display & DM Sans).
- **Icons**: [Lucide React](https://lucide.dev/) for consistent, lightweight vector iconography.
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/) utilizing Static HTML Export for global edge delivery.

## 🚀 Performance Optimizations

This landing page is built with "Industry Standard" performance practices:

- **Optimized Image Delivery**: Utilizes `next/image` with the `priority` attribute for LCP (Largest Contentful Paint) elements and `unoptimized: true` for static exports.
- **Zero Layout Shift**: Explicit aspect ratio handling and local font hosting prevent unexpected shifts during load.
- **Cinematic Reveal Animations**: Lightweight Intersection Observer implementation for smooth, hardware-accelerated scroll reveals.
- **Clean Code Architecture**: Strictly followed a "No-Clutter" policy, removing all developer comments and unused CSS to minimize bundle size.

## 🎨 Design Philosophy

- **Minimalist Luxury**: A palette of deep blacks and curated gold accents (`#C9A84C`) inspired by premium travel brands.
- **Editorial Typography**: Staggered, overlapping headlines and mixed-weight serif/sans-serif combinations for a magazine-style aesthetic.
- **Glassmorphism**: Subtle backdrop blurs and semi-transparent borders create a sense of depth and modernity.

## 🛠️ Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run locally**:
   ```bash
   npm run dev
   ```

3. **Build for production (Static Export)**:
   ```bash
   npm run build
   ```
   The output will be generated in the `/out` directory, ready for deployment to Cloudflare Pages or Vercel.

---
*Part of the **Safar** ecosystem. Built with a focus on high-fidelity design and technical excellence.*

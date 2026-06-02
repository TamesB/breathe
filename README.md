# Breathe — Wim Hof Guided Breathing PWA

A free, mobile-first, fully customizable Wim Hof-style guided breathing app. Built with React, TypeScript, Tailwind CSS, Framer Motion and Vaul, and shipped as an installable PWA. Styled after [deepbreathe.app](https://www.deepbreathe.app): dark theme, soft rounded type, and a slow swirling "belly" gradient.

## The session

Each round runs three phases:

1. **Power breaths** — a set number of full inhale/exhale cycles (default 30).
2. **Breath retention** — exhale and hold with empty lungs (default 90s).
3. **Recovery hold** — a full inhale, held (default 15s).

Repeats for the configured number of rounds (default 3). Everything is customizable.

## Customization (Settings roll-up)

Open the bottom-sheet **Settings** drawer to tune:

- Rounds
- Breaths per round
- Inhale speed / Exhale speed (breathing pace)
- Breath retention duration
- Recovery hold duration

Settings persist to `localStorage` and apply to your next session. There's a live estimate of total session length.

During a session you can **Pause / Resume**, **Skip** the current phase, or **Stop**. Retention is recorded per round and shown on the completion screen.

## Tech stack

- **Vite + React + TypeScript**
- **Tailwind CSS** (class-based dark mode, shadcn-style HSL theme variables)
- **Framer Motion** — breathing orb + phase transitions
- **Vaul** — bottom-sheet settings drawer
- **Zustand** (+ persist) — settings state
- **vite-plugin-pwa** — offline-capable, installable PWA

> Note: the original site uses the paid *PP Pangram Sans Rounded* typeface. This prototype substitutes the free **Quicksand** Google Font for a similar rounded look.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build & preview

```bash
npm run build    # type-checks and builds to dist/ (emits manifest + service worker)
npm run preview  # serve the production build locally
```

## Deploy

Any static host works (Vercel, Netlify, Cloudflare Pages, GitHub Pages). Point it at the `dist/` output of `npm run build`. On Vercel, the framework preset for Vite works out of the box.

## Safety

Wim Hof breathing can cause lightheadedness. Always practice sitting or lying down in a safe place. Never practice in or near water, or while driving. If you are pregnant or have a cardiovascular condition or epilepsy, consult a doctor first.

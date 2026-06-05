# Breathe — Guided Breathing App

A free, mobile-first, fully customizable Wim Hof-style guided breathing app. Built with React, TypeScript, Tailwind CSS, Framer Motion and Vaul, and shipped as an installable PWA.

## Live preview

<p align="center">
  <a href="https://breathe-zeta-two.vercel.app/">
    <img
      src="https://img.shields.io/badge/Open_Live_App-▶-f2603c?style=for-the-badge&labelColor=0a0a0a"
      alt="Open live app"
    />
  </a>
</p>

<p align="center">
  <a href="https://breathe-zeta-two.vercel.app/"><strong>breathe-zeta-two.vercel.app</strong></a>
</p>

<p align="center">
  <a href="https://breathe-zeta-two.vercel.app/">
    <img src="https://img.shields.io/badge/demo-live-22c55e?style=flat-square" alt="Demo status" />
  </a>
  <img src="https://img.shields.io/badge/PWA-installable-000?style=flat-square&logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/guest_mode-no_sign--up_required-555?style=flat-square" alt="Guest mode" />
</p>

<p align="center"><sub>Best on mobile · Add to home screen for the full app experience</sub></p>

## The session

Each round runs four phases:

1. **Power breaths** — a set number of full inhale/exhale cycles (default 30).
2. **Breath retention** — exhale and hold with empty lungs (default 90s).
3. **Recovery hold** — a full inhale, held (default 15s).
4. **Break between rounds** — a short pause before the next round (default 5s).

Repeats for the configured number of rounds (default 3). Everything is customizable.

## Customization (Settings roll-up)

Open the bottom-sheet **Settings** drawer to tune:

- Rounds
- Breaths per round
- Inhale speed / Exhale speed (breathing pace)
- Breath retention duration
- **Indefinite hold** (optional) — hold until you request to breathe
- Recovery hold duration
- Break between rounds

Settings persist to `localStorage` and apply to your next session. There's a live estimate of total session length.

During a session you can **Pause / Resume** or **Stop**.

- **Skip is intentionally limited to the breath retention phase** (it’s the only skippable phase).
- When **Indefinite hold** is enabled, the Skip button becomes **“I need to breathe”** and also works via **double-tap anywhere** (excluding the buttons/inputs). Each time you end the hold, that round’s hold time is recorded.

Retention is recorded per round and shown on the completion screen.

## History & account

- **History** drawer — past sessions, stats (best hold, streak), stored on this device by default.
- **Account** drawer — optional sign-in via magic link or Google. When signed in, history syncs to Supabase and follows you across devices.
- On first sign-in, any guest sessions on this device are merged into your account.

Settings stay local for now; only breathing history syncs to the cloud.

## Tech stack

- **Vite + React + TypeScript**
- **Tailwind CSS** (class-based dark mode, shadcn-style HSL theme variables)
- **Framer Motion** — breathing orb + phase transitions
- **Vaul** — bottom-sheet drawers
- **Zustand** — settings + history + auth state
- **Supabase** — optional auth + Postgres history (RLS)
- **vite-plugin-pwa** — offline-capable, installable PWA

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — see Supabase setup below
npm run dev                  # http://localhost:5173
```

Without Supabase env vars the app runs fully in **guest mode** (localStorage only).

## Supabase setup (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migration in [`supabase/migrations/0001_breathing_sessions.sql`](supabase/migrations/0001_breathing_sessions.sql).
3. In **Project Settings → API**, copy the project URL and `anon` public key into `.env.local`:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. In **Authentication → URL configuration** (critical — if **Site URL** is `localhost`, magic links will send users there):
   - **Site URL:** your production URL (e.g. `https://your-app.vercel.app`) — **not** `http://localhost:5173`
   - **Redirect URLs:** add every URL you use, one per line:
     - `https://your-app.vercel.app`
     - `http://localhost:5173`
5. Enable **Email** (magic link) under Authentication → Providers.
6. (Optional) Enable **Google** and add OAuth client ID/secret from Google Cloud Console.

Restart `npm run dev` after changing env vars.

## Build & preview

```bash
npm run build    # type-checks and builds to dist/ (emits manifest + service worker)
npm run preview  # serve the production build locally
```

## Deploy on Vercel

The repo includes [`vercel.json`](vercel.json) (Vite build, SPA routing, PWA cache headers).

### One-time setup

1. Push this repo to GitHub (or GitLab / Bitbucket).
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** the repository.
3. Vercel should auto-detect **Vite**. Confirm:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Under **Environment Variables**, add (for Production, Preview, and Development):

   | Name | Value |
   |------|--------|
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon / publishable key |
   | `VITE_SITE_URL` | Your Vercel URL, e.g. `https://your-app.vercel.app` (no trailing slash) |

   These are baked in at build time. Redeploy after changing them.

5. Click **Deploy**.

### After deploy

1. Copy your production URL (e.g. `https://breathe-xyz.vercel.app`).
2. In **Supabase → Authentication → URL configuration**:
   - **Site URL:** your Vercel production URL (must match `VITE_SITE_URL`)
   - **Redirect URLs:** add your Vercel URL and `http://localhost:5173`
3. Redeploy on Vercel if you added or changed `VITE_SITE_URL`.
4. Run the SQL migration if you have not already ([`supabase/migrations/0001_breathing_sessions.sql`](supabase/migrations/0001_breathing_sessions.sql)).

### CLI (optional)

```bash
npx vercel          # preview deploy
npx vercel --prod   # production deploy
```

Do not commit `.env` — use Vercel’s dashboard for secrets. Guest mode works without Supabase env vars.

**Backend** — Supabase (managed). No separate API server; the browser uses Row Level Security.

## Safety

Wim Hof breathing can cause lightheadedness. Always practice sitting or lying down in a safe place. Never practice in or near water, or while driving. If you are pregnant or have a cardiovascular condition or epilepsy, consult a doctor first.

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

> Note: the original site uses the paid *PP Pangram Sans Rounded* typeface. This prototype substitutes the free **Quicksand** Google Font for a similar rounded look.

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

4. In **Authentication → URL configuration**, set:
   - **Site URL**: your production URL (e.g. `https://your-app.vercel.app`)
   - **Redirect URLs**: `http://localhost:5173`, your production URL
5. Enable **Email** (magic link) under Authentication → Providers.
6. (Optional) Enable **Google** and add OAuth client ID/secret from Google Cloud Console.

Restart `npm run dev` after changing env vars.

## Build & preview

```bash
npm run build    # type-checks and builds to dist/ (emits manifest + service worker)
npm run preview  # serve the production build locally
```

## Deploy

**Frontend** — any static host (Vercel, Netlify, Cloudflare Pages). Build command: `npm run build`, output: `dist/`.

Add environment variables on your host:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Update Supabase **Redirect URLs** to include your production domain.

**Backend** — Supabase (managed). No separate API server required; the browser talks to Postgres via Row Level Security policies.

## Safety

Wim Hof breathing can cause lightheadedness. Always practice sitting or lying down in a safe place. Never practice in or near water, or while driving. If you are pregnant or have a cardiovascular condition or epilepsy, consult a doctor first.

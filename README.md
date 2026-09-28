# LINK PWA 3.0.3.1

React/Tailwind production architecture for LINK, based on LINK 4.4 / build 443 and connected to the existing LINK Production Supabase backend.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Framer Motion
- Lucide React
- Supabase Auth / Postgres / Realtime / Storage
- vite-plugin-pwa + Workbox

## Important: GitHub Pages deployment

This repository is **source code**, not a static folder that GitHub Pages can serve directly.

For `https://oxvaa.github.io/`, configure:

**GitHub repository → Settings → Pages → Build and deployment → Source → GitHub Actions**

The included `.github/workflows/deploy-pages.yml` runs:

1. `npm install`
2. TypeScript check
3. Vite production build
4. deployment of **`dist/` only**

Do **not** use `Deploy from a branch → main / (root)` for this project. Doing that serves the raw `/src/main.tsx` entry before Vite has compiled it and can result in a completely white page.

See `PAGES_FIX.md` for the recovery steps.

## 3.0.1 white-screen protection

- GitHub user-site production base fixed to `/`
- PWA scope/start URL fixed to `/`
- Pages workflow verifies that `dist/index.html` no longer references raw `/src/main.tsx`
- visible boot fallback added instead of a silent blank screen
- global startup diagnostics added
- React render Error Boundary added
- `.nojekyll` shipped with the production public files

## Backend

The browser uses the Supabase publishable key only. No service-role secret is bundled.

Implemented backend flows include Auth, profiles, LINK requests, favorites/blocks, feed/posts, notes, LINK Now, direct/group chat creation, encrypted messages, Realtime refresh, notifications, avatar Storage upload, settings, highlights, and Moments read data.

## Local development

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run typecheck
npm run build
npm run preview
```


## 3.0.3 GitHub Pages fix

- Actual target repository: `oxvaa/linkpwa`
- Vite base: `/linkpwa/`
- PWA start URL / scope: `/linkpwa/`
- Workbox navigation fallback: `/linkpwa/index.html`
- Includes `.github/workflows/deploy-pages.yml` to build and deploy `dist/` instead of serving raw TypeScript source.

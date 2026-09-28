# LINK PWA 3.0

Major PWA rewrite of LINK 4.4 / build 443.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Framer Motion
- Lucide React
- Supabase Auth / Postgres / Realtime / Storage
- vite-plugin-pwa + Workbox

## Backend

This project connects to the existing **LINK Production** Supabase project. It does not create demo users or a local fallback account.

The browser only receives the Supabase **publishable** key. No service-role key is included.

### Implemented backend flows

- Required Auth gate on app launch
- Sign in, register, password reset, sign out
- Profiles + verified styles + account roles
- Profile edit + avatar upload to `avatars`
- LINK requests / accept / decline / unlink
- Favorites + blocks
- Feed / posts / likes / bookmarks / replies data model
- Notes and LINK Now
- Direct chats via `create_direct_chat`
- Groups via `create_group_chat`
- Chat keys from `chat_keys`
- AES-256-GCM message format compatible with the LINK 4.4 web/Expo backend format
- Realtime refresh for messages, reactions, connections, posts, profiles, notifications and chat membership
- Notifications / Activity
- User settings and theme sync
- Highlights and Moments read model

## UI direction

PWA 3.0 is rebuilt around an iOS-first design system:

- Instagram-style profiles and social hierarchy
- ChatGPT iOS-style grouped Settings
- Apple-style safe areas, sheets and spring transitions
- Floating Liquid Glass navigation only where blur is useful
- Chat header intentionally has **no backdrop blur**, so avatar/name stay sharp
- Fully rounded message bubbles
- Original blue verified asset from LINK 4.4 Expo is in `public/assets/verified-badge.png`

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Deploy without a PC

The repository includes `.github/workflows/deploy-pages.yml`.

1. Upload the project contents to a GitHub repository.
2. In GitHub → Settings → Pages, choose **GitHub Actions** as the source.
3. Push to `main` or run the workflow manually.
4. GitHub installs dependencies, builds Vite and deploys `dist/` automatically.

`vite.config.ts` uses `base: './'`, so it is suitable for GitHub Pages subpaths.

## PWA / iPhone

Open the deployed site in Safari → Share → **Add to Home Screen**. The PWA uses safe-area insets for Dynamic Island / Home Indicator and a standalone manifest.

## Important

This ZIP is the new React/Tailwind source architecture, not another patch to the previous monolithic `app.js`. The old PWA 2.0 files are not required.

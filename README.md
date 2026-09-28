# LINK PWA 1.0 — Full Solo / 4.4 Port

Source direction: **LINK 4.4 · Reliability · build 443 (SHARED SESSION)**.

This is no longer the small PWA proof-of-concept. It is a local-first web port of the major LINK 4.4 product surfaces that can work without Supabase/realtime.

## Ported into the PWA

- LINK 4.4 ONE navigation: Feed / Discover / Create / Chats / Profile
- Floating Liquid Glass-style 5-tab navigation + iOS safe areas
- Feed 4.0
- Notes
- Moments + viewer + reactions + Highlights
- LINK Pulse / LINK Now
- BACKSTAGE promo card + install instructions
- LINK Official feed card + read-only Official chat
- Posts 2.0: likes, replies, threads, repost state, quote posts, bookmarks, profile pin, delete
- Discover: people, posts, hashtags/trends, LINK requests
- Unified Search across people, groups and posts
- Activity center
- Profile 4.0: Posts / Replies / Media / Likes
- Profile editing, social fields, status and presence preview
- Local LINK relationships + favorites
- Direct chats and group chats
- Double Tap reaction
- Message actions: reply, edit, pin, forward, delete for me / everyone, reactions
- Pinned message bar
- Chat themes: Free, LINK Plus and LINK Pro collection from LINK 4.4
- Silent Chat local timer preview
- Group v3.5-style controls: rename, Everyone rename toggle, invite code, announcements-only, polls, admin note, member removal
- Group polls + local voting
- LINK Plus local entitlement preview
- LINK Pro local entitlement preview
- LINK Shop + profile effects + local LINK Coins
- Custom status colors/icons + Staff gradient collection
- Safety Center: block list, reports, security UI
- Local account switcher + local test account creation
- Staff Center preview (toggle in Settings → Solo testing)
- Local LINK Official message sending in Staff preview
- My LINK card / visual QR preview + simulated local scan
- Light / Dark / System appearance
- English / Czech core UI toggle
- Installable manifest and offline app shell service worker
- All local state persisted in localStorage

## Intentionally local / simulated

This build has **no backend** by request. The UI for server-dependent features is kept where useful, but actions stay on one device:

- no Supabase Auth
- no cross-device account sync
- no realtime remote messaging
- no production E2E key exchange (the PWA explicitly says this in Encryption Info)
- no remote push notifications
- no remote moderation enforcement
- no remote profile / username lookup
- no real LINK QR identity resolver

## Run / deploy

Upload the whole folder to an HTTPS static host such as GitHub Pages. Keep these paths together:

- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `sw.js`
- `assets/`

On iPhone/iPad: open the HTTPS URL in Safari → Share → **Add to Home Screen**.

## Reset

LINK Settings → Solo testing → Reset demo data.

## Build marker

`LINK PWA 1.0 · Full Solo · source 4.4/443`

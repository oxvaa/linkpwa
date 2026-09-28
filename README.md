# LINK PWA 1.0 — Solo Testing

Local-first PWA derived from the LINK 4.4 Shared Session 443 product/UI direction.

## What changed
- No Supabase / backend / realtime dependency.
- No shared Expo session.
- Local profile creation and local-only data.
- Home, Notes, Moments, People, Chats, Groups, Profile and Settings preview.
- LINK Plus / Pro local feature preview.
- Light/Dark appearance, custom status, local message history.
- Installable PWA manifest + service worker + iOS Home Screen metadata.
- Offline app shell after the first successful visit.

## Deploy
Upload the whole folder to a HTTPS host such as GitHub Pages. `index.html`, `manifest.webmanifest`, `sw.js` and `assets/` must keep the same relative structure.

## iPhone/iPad install
Open the deployed page in Safari → Share → Add to Home Screen.

## Important
This is a solo prototype. Chat messages and identity data live in browser localStorage on one device. It does not provide production authentication, E2E message delivery, remote push, cross-device sync, or realtime multi-user behavior.

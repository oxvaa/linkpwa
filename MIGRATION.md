# LINK 4.4 → PWA 3.0 migration map

## Ported into React architecture

- Auth gate and Production accounts
- Feed / ONE shell
- Discover / people search
- Profile 4.0-inspired layout
- Original verified badge asset
- Posts, likes and bookmarks
- Notes / Moments read strip
- Create Hub: Post, Note, LINK Now, Group
- Direct + group chat list
- Encrypted chat composer and message decrypt/encrypt
- Double Tap reaction
- Silent message expiry options
- Activity / notifications
- ChatGPT-style Settings
- Theme / accent / privacy toggles
- Avatar upload
- LINK requests / favorites / blocks
- PWA manifest, Workbox and GitHub Pages CI

## Next feature modules to port 1:1 from LINK 4.4

These are intentionally separated into modules instead of being mixed into one monolithic file:

- Group v3.5 admin controls + polls + invite flow
- LINK Shop / profile effects / name effects
- Plus / Pro purchase-preview surfaces
- LINK Pulse dedicated screen
- LINK Official announcement channel/feed card
- Staff Center / CEO tools
- Full Moments composer + private Storage signed URLs
- Profile post media uploader
- Typing/presence Broadcast optimization
- Read/delivered receipt UI
- Swipe-to-reply gesture layer

The database schema already contains the relevant tables for most of these modules, so they can be added without replacing the backend.

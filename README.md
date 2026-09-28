# LINK PWA 2.0 — Backend / source 4.4 build 443

LINK PWA 2.0 is the web/PWA port of LINK 4.4 (SHARED SESSION / Reliability build 443), redesigned for iOS with an Instagram × Apple × ChatGPT visual direction.

## What changed in 2.0

- New profile UI: flatter Instagram-style hierarchy, inline verified badge, compact metrics, Highlights and profile tabs.
- New profile detail and Edit Profile screens.
- ChatGPT-style iOS Settings: grouped cards, close button, right-side values, toggles and cleaner spacing.
- Chat header is now crisp and opaque — the old backdrop-filter blur over avatar/name is removed.
- Message bubbles use fully rounded Expo-style geometry.
- The blue verified badge is the original PNG asset extracted from LINK 4.4 Expo (`assets/verified-badge.png`).
- Reduced excessive blur across cards and headers; Liquid Glass is mainly retained for the floating bottom navigation.
- Updated iOS safe-area / 390–430 pt responsive layout.

## LINK Production backend

This build is configured for the existing Supabase project **LINK Production** using the browser-safe Supabase publishable key. It does not include a service-role secret.

When signed in, PWA 2.0 can sync:

- Supabase Auth session
- profiles and profile editing
- avatar upload to the existing `avatars` bucket
- LINK relationships / requests
- direct chats and group chats
- chat encryption keys
- AES-GCM encrypted messages compatible with LINK 4.4
- chat themes/settings snapshot
- notes
- profile posts + likes/bookmarks
- Moments read snapshot
- favorites and blocked users
- notifications
- Highlights
- LINK Now
- group polls
- selected user settings
- Realtime refreshes for the core social/chat tables

If no LINK account is signed in, the app keeps the local preview/fallback so the UI can still be tested.

## Backend compatibility

The backend already contains the required RLS-protected tables, RPCs and Supabase Realtime publications. No production database migration was required for this PWA build.

Core RPCs used by this build:

- `request_link(other_user uuid)`
- `create_direct_chat(other_user uuid)`
- `create_group_chat(group_name text, member_ids uuid[])`
- `recent_messages_for_my_chats(p_per_chat integer)`

Messages use the same AES-256-GCM combined format as LINK 4.4: 12-byte IV + ciphertext + 16-byte authentication tag.

## Run / deploy

Upload the whole folder to GitHub Pages, Vercel or any HTTPS static host. For iOS PWA installation, open the deployed URL in Safari and use **Share → Add to Home Screen**.

The Service Worker caches the local PWA shell and assets. Backend sync naturally requires an internet connection.

## Before a public launch

Supabase Security Advisor currently reports that leaked-password protection is disabled in Auth. Enable it before treating the app as a public production release. The Advisor also reports an RLS-enabled internal push-dispatch table with no client policy; this build does not depend on direct client access to that table.

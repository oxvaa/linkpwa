# LINK PWA 1.0.1 — Stability / Solo 443

Local-first PWA port based on LINK 4.4 Reliability / Shared Session build 443.
No Supabase/backend is required for this solo-testing build.

## 1.0.1 stabilization pass

- Fixed iOS viewport / keyboard resizing with VisualViewport height syncing.
- Increased form/composer input sizes to stop Safari focus auto-zoom.
- Improved safe-area handling for chat, modals, Moments and floating navigation.
- Fixed stale PWA assets by bumping the service-worker cache and using network-first navigation.
- Migrates existing 1.0 local data from the previous v3 storage key.
- Inbox / Archived tabs now work; chats can be archived and unarchived.
- Message context sheet now closes when tapping outside it.
- Silent Chat messages now actually expire locally according to the selected timer.
- Read-receipt setting now affects chat metadata.
- Group announcements-only mode is enforced for non-owners.
- Blocked accounts are removed from primary Feed / Discover / Chats / Search surfaces.
- Moments expire after 24 hours and local view counts increment once per session.
- Local account switching now preserves a separate LINK connection list per test account.
- Prevented local test accounts from creating accidental self-chats.
- Added a working local avatar image picker with 256px compression for localStorage.
- Profile layout setting now cycles Default / Compact / Showcase and visibly changes the profile.
- Login Alerts and Devices settings now respond instead of being dead rows.
- Device view shows the current local PWA session.
- Improved small-iPhone responsive spacing.

## Main LINK 4.4 surfaces in this PWA

ONE Feed, Discover, Create Hub, Posts 2.0, Threads, Quotes, Reposts, Bookmarks,
Notes, Moments, Highlights, LINK Pulse / LINK Now, Activity, Unified Search,
LINK Official, DMs, Group Chat v3.5, Polls, chat themes, Double Tap reactions,
Silent Chat, Profile 4.0, LINK Shop / profile effects, Plus / Pro preview,
Safety Center, QR / My LINK, local test accounts, BACKSTAGE card and Staff preview.

## Run

Host this directory over HTTPS (GitHub Pages is fine). On iPhone open in Safari,
then Share -> Add to Home Screen. Service workers do not run correctly when opening
`index.html` directly from the Files app.

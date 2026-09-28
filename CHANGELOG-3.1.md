# LINK PWA 3.1 — Comfy UI + Posts 2.1

## Comfy UI
- Reduced oversized screen titles, header controls and spacing by roughly 15–20% on iPhone.
- Smaller floating navbar with a more native iOS footprint.
- Compact Instagram-style profile header, stats, action buttons and highlights.
- Compact Feed Moments, Notes, LINK Pulse and post cards.
- Compact Discover, Chats, Chat header/composer and ChatGPT-style Settings groups.
- Slightly tighter message bubbles while keeping fully rounded LINK styling.

## Posts 2.1
- Tap anywhere on a post to open a full Post detail sheet.
- Live replies/comments from `profile_posts.parent_id`.
- Reply composer directly inside a thread.
- Reply count, repost count and quote count calculated from the existing backend model.
- One-tap repost using `repost_of_id`.
- Share action and improved quote/repost reference cards.
- Existing post media paths resolve to signed `profile-posts` Storage URLs for display.
- Post composer can now upload photos/GIFs to the existing `profile-posts` bucket.

## Markdown parity with LINK 4.4
Markdown rendering is enabled for Admin/CEO posts, matching the Expo behavior:
- `**bold**`
- `*italic*`
- `***bold italic***`
- `__underline__`
- `~~strikethrough~~`
- inline code and fenced code blocks
- block quotes
- headings
- ordered/unordered lists
- `||spoiler||`
- `[text](https://link.com)` links

Markdown 101 help is shown to Admin/CEO users in the post composer and reply composer. LINK Official announcements also render Markdown.

## Feed parity additions
- LINK Pulse now reads real `link_now_statuses` from Supabase and appears in the Feed.
- Published LINK Official announcements now appear in the Feed with Markdown and optional action buttons.
- Moments now resolve signed private Storage URLs instead of broken raw paths.
- Added a real Moment viewer.
- Added Moment creation/upload from the Create Hub and directly from “Your moment”.

## Build cleanup
- Fixed strict-null Supabase bootstrap typing by normalizing query results.
- Added `vite-plugin-pwa/client` type reference for `virtual:pwa-register`.
- Fixed `tsconfig.node.json` for TypeScript `allowImportingTsExtensions`.

## Still planned from Expo 4.4
High-priority ports remaining after 3.1: Moment reactions/viewers/music, Group v3.5 admin/polls/invites, quote-post composer, full LINK Pulse hub, LINK Official profile/read-only inbox, Shop/Profile Effects, deeper Plus/Pro surfaces, Safety Center depth and Staff Center.

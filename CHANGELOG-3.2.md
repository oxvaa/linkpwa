# LINK PWA 3.2 — Chat Stability + Compact UI

## Fixed from the screenshot
- New messages now load directly in an opened chat instead of depending only on the full-app bootstrap.
- Dedicated per-chat Supabase Realtime subscription.
- 5-second lightweight safety sync while the chat is visible (for iOS/PWA resume edge cases).
- Chat automatically scrolls to the latest message:
  - when opening a conversation,
  - when receiving a new message,
  - after sending,
  - after returning from background,
  - when focusing the composer.
- Sending is optimistic, so your own message appears instantly.
- Read receipts are written to `message_receipts`.
- The latest outgoing message shows `Seen` after another member opens/reads it.
- Chat color button now opens a real theme picker.
- Chat theme persists to Supabase (`theme_id` / `group_theme_id`) and syncs across devices.
- Free / Plus / Pro chat theme levels from the Expo LINK direction are included.
- Chat UI is smaller and more comfortable.

## Compact UI pass
- Smaller screen titles and action icons.
- Smaller floating navbar.
- Smaller profile header, stats, buttons and highlight circles.
- Smaller settings rows and toggles.
- Tighter radii/shadows.

## Supabase / Expo
This patch does **not** disconnect the Expo LINK client yet.
The reported bugs were PWA client bugs, not evidence of a backend collision.
Keeping the same backend preserves accounts, messages and encryption compatibility while we stabilize PWA.
A hard PWA-only backend split should be done separately after this build is proven stable.

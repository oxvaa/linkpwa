# LINK PWA 3.2.1 — Clean hotfix

This is intentionally a small hotfix, not another feature dump.

## Root causes found in the current repo

1. **Chat color persistence bug**
   Direct chats were effectively treated as if `group_theme_id` had priority.
   In the production database `group_theme_id` is usually `default` even for direct chats,
   while the real direct-chat color is stored in `theme_id`.

2. **Theme IDs did not match Expo**
   PWA used IDs such as `cyan-green` and `rose-pink`, while Expo/backend use
   `cyan_green`, `rose_pink`, `bright_red`, etc.

3. **Chat jump**
   The previous implementation used two scrolling mechanisms at once.
   This hotfix uses only the chat scroll container and never `scrollIntoView()`,
   so iOS should not pull the whole page upward.

4. **New message sync was coupled too tightly to bootstrap/encryption state**
   The opened chat now fetches its own last 100 messages directly.
   It still renders rows even if the encryption key is temporarily unavailable.
   Realtime is backed by a 2.5-second visible-only safety refresh for PWA resume edge cases.

5. **Seen**
   Incoming visible messages write `message_receipts`.
   The latest outgoing message shows Seen when another member has a seen/read receipt.

## UI
Only a small density pass:
- smaller chat header/composer,
- smaller main headers,
- smaller bottom navigation,
- slightly smaller profile header.

No extra redesign was added.

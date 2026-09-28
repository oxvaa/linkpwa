# LINK PWA 2.0 — Auth Required / Backend 443

This build removes the Solo/demo account layer completely.

## Authentication
- LINK Auth is the first screen on every signed-out launch.
- Existing LINK accounts sign in with Supabase Auth.
- New users can create a LINK account with name, username, e-mail and password.
- There is no guest mode, Continue local preview button, local account switcher, or seeded demo profile.
- A persisted Supabase session opens the user’s own LINK automatically.
- Sign out always returns to the LINK Auth screen.

## Backend
The PWA connects to the existing LINK Production Supabase project and then loads the signed-in user’s profile, LINKs, posts, Notes, Moments, notifications, groups and encrypted chats. The database trigger `on_auth_user_created_link` creates the profile/settings/entitlements for newly registered users from Auth metadata.

## Upgrade note
The service worker cache was bumped so an installed iOS PWA does not keep the old demo-account build. If Safari still shows the previous UI once, fully close LINK and reopen it after the new files are deployed.

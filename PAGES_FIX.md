# LINK PWA 3.0.1 — GitHub Pages white-screen fix

## What caused the white screen

This is a Vite/React source project. `index.html` intentionally points at `/src/main.tsx` **before build time**. Vite rewrites that reference to a compiled JavaScript bundle when `npm run build` creates `dist/`.

If GitHub Pages is configured as **Deploy from a branch** and serves the repository root directly, Safari receives the raw TypeScript/TSX entry instead of the Vite production bundle. React never mounts, so `#root` stays blank.

## Correct Pages configuration for oxvaa.github.io

1. Open the GitHub repository used for `https://oxvaa.github.io/`.
2. Open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Open **Actions** and run **Deploy LINK PWA to GitHub Pages**, or push any change to `main`.
5. Wait until both the `build` and `deploy` jobs are green.
6. Reload `https://oxvaa.github.io/` in Safari.

Do **not** choose `main / (root)` as the Pages source for this React/Vite repository.

## iPhone/PWA cache

After a successful deploy, if an older installed PWA still shows the previous page:

- first verify the site works in a normal Safari tab;
- then fully close the installed PWA and reopen it;
- if necessary, remove the old Home Screen icon once and add the new PWA again after Safari shows the correct deployment.

## Guard added in 3.0.1

The source `index.html` now contains a boot fallback. If raw source is accidentally published again, LINK should show a deployment diagnostic after a few seconds instead of an unexplained white page.

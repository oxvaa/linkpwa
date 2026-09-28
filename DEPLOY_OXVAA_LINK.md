# LINK PWA 3.0.2 — oxvaa/link GitHub Pages deploy

Canonical repository detected through GitHub: `oxvaa/link` (default branch `main`).

GitHub Pages for this repository is a **project site**, so the production URL is expected under:

`https://oxvaa.github.io/link/`

The Vite production base is therefore `/link/` (lower-case, matching the canonical repository name).

## Replace the old Expo launcher

The current `main` branch still contains the old Expo/Snack project (`App.js`, Expo `package.json`, old `index.html`).
For PWA 3.0.x, replace the repository contents with this project. Do not publish raw `src/` through branch-based Pages.

## Pages settings

1. Repository → Settings → Pages.
2. Source: **GitHub Actions**.
3. Push this project to `main`.
4. Wait for `Deploy LINK PWA to GitHub Pages` to finish.
5. Open `https://oxvaa.github.io/link/`.

## White screen diagnostics

If a blank page appears, inspect the built `dist/index.html`. Asset URLs must begin with `/link/assets/`, not `/assets/`, and the deployed HTML must not contain `/src/main.tsx`.

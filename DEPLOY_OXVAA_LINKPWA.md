# Deploy LINK PWA 3.0.3 to oxvaa/linkpwa

Target repository: `oxvaa/linkpwa`

Production URL: `https://oxvaa.github.io/linkpwa/`

## Why the old page was blank

The repository source was being served directly by GitHub Pages. The source `index.html` points at Vite/React TypeScript source and is not a production bundle. There was also no `.github/workflows/deploy-pages.yml` in the repository.

## Required setup

1. Replace/upload the contents of this folder into the root of `oxvaa/linkpwa`.
2. GitHub → repository → Settings → Pages.
3. Under Build and deployment set **Source = GitHub Actions**.
4. Push to `main` or run **Deploy LINK PWA to GitHub Pages** manually.
5. Wait until both `build` and `deploy` jobs are green.
6. Open `https://oxvaa.github.io/linkpwa/`.

The Vite production base, PWA scope and Workbox navigation fallback are all pinned to `/linkpwa/`.

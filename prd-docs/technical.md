# Bezan Bere — Technical

## Stack
- **Alpine.js** — reactivity and UI logic
- **Tailwind CSS v4** — styling, dark mode, RTL
- **Vazirmatn** — self-hosted Persian font
- **Vite** + `vite-plugin-singlefile` — bundles everything into one `index.html`

## Storage
- Tasks → `localStorage` (`bezanbere-tasks`)
- Theme → `localStorage` (`theme`)

## Offline / PWA
- Service worker caches all static assets on first load (cache-first)
- Bump `CACHE_NAME` in `sw.js` on every deploy to bust the cache
- `manifest.json` enables install on mobile and desktop

# Bezan Bere — Technical

## Stack
- **Alpine.js** — reactivity and UI logic
- **Tailwind CSS v4** — styling, dark mode, RTL
- **Vazirmatn** — self-hosted Persian font
- **Vite** + `vite-plugin-singlefile` — bundles everything into one `index.html`

## Storage
- Tasks → `localStorage` (`bezanbere-tasks`)
- Theme mode → `localStorage` (`bezanbere-theme-mode`)
- Task limit → `localStorage` (`bezanbere-task-limit`)

## Runtime Behavior
- Theme mode supports `light`, `dark`, and `system`
- System mode tracks OS color-scheme changes via `matchMedia`
- Task limit is clamped to `[currentTaskCount, 20]` and defaults to `5`
- Settings input is numeric (`type=number`) and uses `dir="ltr"` for stable number entry

## Offline / PWA
- Service worker caches all static assets on first load (cache-first)
- Bump `CACHE_NAME` in `sw.js` on every deploy to bust the cache
- `manifest.json` enables install on mobile and desktop

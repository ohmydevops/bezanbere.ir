# Bezan Bere — Technical

## Stack
- **Alpine.js** — reactivity and UI logic
- **Tailwind CSS v4** — styling, dark mode, RTL
- **Vazirmatn** — self-hosted Persian font
- **Vite** + `vite-plugin-singlefile` — bundles everything into one `index.html`

## UI
- Persian (Farsi), RTL, Vazirmatn font
- Settings modal (gear icon in header)
- Theme modes: Light / Dark / System
- Task limit input in Settings (numeric, LTR for stable number entry)
- Task detail modal: editable title textarea + Shamsi creation date
- Sand color palette, one accent — completion only
- Animations: subtle, 150–300ms, never bouncy

## Storage
- Tasks → `localStorage` (`bezanbere-tasks`)
- Theme mode → `localStorage` (`bezanbere-theme-mode`)
- Task limit → `localStorage` (`bezanbere-task-limit`)

## Task Schema
```json
{ "id": "<uuid>", "title": "string (max 100 chars)", "createdAt": 1234567890000 }
```

## Runtime Behavior
- Theme mode supports `light`, `dark`, and `system`
- System mode tracks OS color-scheme changes via `matchMedia`
- Task limit is clamped to `[currentTaskCount, 20]` and defaults to `5`
- Settings input is numeric (`type=number`) and uses `dir="ltr"` for stable number entry
- Task detail modal opens on title click; allows editing the title (textarea, 100 char limit)
- Shamsi (Persian calendar) date+time formatted via native `Intl.DateTimeFormat` with `ca-persian` — no external library
- Character limit validation is soft (no `maxlength` attribute): error shown and save blocked when > 100 chars

## Offline / PWA
- Service worker caches all static assets on first load (cache-first)
- `/cdn-cgi/*` requests (Cloudflare internals) are bypassed — never intercepted or cached
- Bump `CACHE_NAME` in `sw.js` on every deploy to bust the cache
- `manifest.json` enables install on mobile and desktop

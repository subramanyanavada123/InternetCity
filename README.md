# FutureOS — Design the City of 2050

A browser-based STEM simulation game that teaches networking and computer science concepts through interactive city-building. Students take on the role of a future infrastructure engineer, designing cities capable of surviving 2050's challenges.

## Gameplay

Each **module** teaches one core CS concept through hands-on simulation:

| Module | Concept | Status |
|--------|---------|--------|
| 1 — Connectivity | Graphs: nodes & edges | ✅ Available |
| 2 — Congestion | Queues & packet routing | ✅ Available |
| 3+ | Firewalls, Encryption, AI… | Coming soon |

Players connect buildings, manage traffic surges, reroute emergency services, and unlock concept reveals as they succeed.

## Tech Stack

- **Vite** — build tooling & dev server
- **Vanilla JS (ESM)** — no framework dependencies
- **HTML5 Canvas** — simulation rendering
- **PWA** — offline-capable via service worker

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build & Deploy

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

The `dist/` folder is a fully self-contained static site — deploy it to any static host:

- **Netlify**: drag-and-drop `dist/` or connect the repo (`Build command: npm run build`, `Publish directory: dist`)
- **Vercel**: `vercel --prod` (auto-detects Vite)
- **GitHub Pages**: push `dist/` to the `gh-pages` branch or use the included workflow
- **Any CDN/static host**: serve the contents of `dist/`

## Project Structure

```
src/
  data/         — city layouts, module config, scenario definitions (JSON)
  engine/       — pure logic: firewall, graph, queue, reassembly, stack
  render/       — canvas renderers (city view + packet view)
  sim/          — simulation: city twin, network, packets, congestion, loop
  ui/           — HUD, coach, screens, speech, dashboard components
  main.js       — app entry point & game state machine
  styles.css    — global styles

public/
  manifest.json — PWA manifest
  sw.js         — service worker (cache-first, offline support)

index.html      — HTML shell
vite.config.js  — Vite build config
```

## PWA / Offline Support

The app ships a service worker (`public/sw.js`) that caches assets on first load. It works offline after the initial visit. To add app icons (required for full PWA install prompt), place `icon-192.png` and `icon-512.png` in the `public/` folder.

## Teacher Mode

A built-in Teacher dashboard (`◈ Teacher` from the home screen) shows per-module star ratings and class progress, making it suitable for classroom use.

## License

MIT

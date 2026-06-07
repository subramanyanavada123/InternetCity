# Internet City — STEM Learning Games

A browser-based collection of mini-games that teach networking and computer science concepts to students aged 10–14. Every mission feels like a real game first — the engineering concepts reveal themselves naturally through play.

> "You've been using real Internet engineering skills the whole time."

---

## Two Versions

| Version | URL | Description |
|---------|-----|-------------|
| **V1 — FutureOS Classic** | `http://localhost:3001` | Network simulation with canvas-based city building |
| **V2 — Internet City** | `http://localhost:4000` | 6 standalone mini-games, each with a unique mechanic |

Both versions are live simultaneously. A **V1 ↔ V2** toggle is available on both home screens.

---

## V2 Modules

Each module is a completely different game hiding one CS concept:

| # | Game | Mechanic | Hidden Concept |
|---|------|----------|----------------|
| 1 | 🎁 **Delivery Kingdom** | Draw roads, watch trucks deliver gifts | Connectivity & Graph Theory |
| 2 | 💧 **Water Park** | Open/close gates, upgrade pipes to keep water flowing | Congestion & Throughput |
| 3 | 🚀 **Rocket Launch** | Drag rockets into the right launch order before countdown | Priority Queues & Scheduling |
| 4 | 👾 **Monster Attack** | Build backup towers before monsters stomp the network | Redundancy & Fault Tolerance |
| 5 | 🥷 **Cyber Ninja** | Slash threats flying at the portal, don't hit real data | Firewalls & False Positives |
| 6 | 🚗 **Traffic Hero** | Upgrade glowing roads before the city grinds to a halt | Optimization & Bottlenecks |

**Meta-game:** Coins 🪙, stars ⭐, and unlocks reward progress across all modules.

---

## V1 Modules

Node-and-edge network simulation across 6 scenarios:

| # | Module | Concept |
|---|--------|---------|
| 1 | Connectivity | Graphs: nodes & edges |
| 2 | Traffic & Congestion | Queues & throughput |
| 3 | Emergency Prioritization | Priority queues |
| 4 | Infrastructure Failure | Redundancy & failover |
| 5 | Cyber Defense | Firewalls & filtering |
| 6 | City Optimization | Bottlenecks & scaling |

---

## Running Locally

### Quick start (both servers)

```bash
# Terminal 1 — V1 on :3001
cd InternetCity
npm install && npm run build
node -e "
const http=require('http'),fs=require('fs'),path=require('path');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css'};
http.createServer((req,res)=>{
  let p=path.join('dist',req.url==='/'?'index.html':req.url);
  if(!fs.existsSync(p))p='dist/index.html';
  res.setHeader('Content-Type',mime[path.extname(p)]||'text/plain');
  fs.createReadStream(p).pipe(res);
}).listen(3001,()=>console.log('V1 → http://localhost:3001'));
"

# Terminal 2 — V2 on :4000
cd InternetCityV2
npm install && npm run build
node -e "
const http=require('http'),fs=require('fs'),path=require('path');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css'};
http.createServer((req,res)=>{
  let p=path.join('dist',req.url==='/'?'index.html':req.url);
  if(!fs.existsSync(p))p='dist/index.html';
  res.setHeader('Content-Type',mime[path.extname(p)]||'text/plain');
  fs.createReadStream(p).pipe(res);
}).listen(4000,()=>console.log('V2 → http://localhost:4000'));
"
```

### Dev mode (with hot reload)

```bash
# V1
cd InternetCity && npm run dev       # :3000

# V2
cd InternetCityV2 && npm run dev     # :3001
```

---

## Project Structure

```
internet-city/
├── InternetCity/          ← V1 (FutureOS Classic)
│   ├── src/
│   │   ├── data/          — city layouts, module config (JSON)
│   │   ├── engine/        — pure logic: graph, queue, firewall, assessment
│   │   ├── render/        — canvas renderers
│   │   ├── sim/           — network, packets, congestion, city twin
│   │   ├── ui/            — screens, HUD, coach, reflection, prediction
│   │   ├── main.js        — app entry & game state machine
│   │   └── styles.css
│   └── public/            — PWA manifest, service worker
│
└── InternetCityV2/        ← V2 (Internet City — new)
    ├── src/
    │   ├── shared/        — state.js, sfx.js, ui.js, base.css
    │   ├── screens/       — home.js
    │   └── modules/
    │       ├── m1-delivery/   🎁 Delivery Kingdom
    │       ├── m2-waterpark/  💧 Water Park
    │       ├── m3-rockets/    🚀 Rocket Launch
    │       ├── m4-monsters/   👾 Monster Attack
    │       ├── m5-ninja/      🥷 Cyber Ninja
    │       └── m6-traffic/    🚗 Traffic Hero
    └── index.html
```

---

## Tech Stack

- **Vite 5** — build tooling, code splitting per module
- **Vanilla JS (ESM)** — no framework dependencies
- **HTML5 Canvas** — game rendering (simulation, animations)
- **Web Audio API** — procedural sound effects, no audio files
- **PWA** — offline-capable via service worker (V1)

---

## Deployment

Both versions are fully static — build outputs to `dist/` and can be served from any CDN or static host.

```bash
# Build
cd InternetCity   && npm run build   # → InternetCity/dist/
cd InternetCityV2 && npm run build   # → InternetCityV2/dist/
```

| Host | Instructions |
|------|-------------|
| **Netlify** | Drag & drop the `dist/` folder, or connect repo with `Build command: npm run build` |
| **Vercel** | `vercel --prod` from either project directory |
| **GitHub Pages** | Push `dist/` contents to `gh-pages` branch |

---

## Classroom Use

**V1** includes a Teacher dashboard (◈ Teacher on home screen) showing per-student star ratings and concept mastery across all 6 modules.

**V2** stores progress in `localStorage` — suitable for individual devices or shared classroom tablets.

---

## License

MIT

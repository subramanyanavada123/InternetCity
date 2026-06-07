import cityData from './data/city.json';
import { CityTwin }       from './sim/city.js';
import { Network }        from './sim/network.js';
import { PacketSystem }   from './sim/packets.js';
import { CongestionControl } from './sim/congestion.js';
import { SimLoop }        from './sim/loop.js';
import { CityCanvasRenderer } from './render/city-canvas.js';
import { CanvasRenderer } from './render/canvas.js';
import { HUD }            from './ui/hud.js';
import { Coach }          from './ui/coach.js';
import { TwinDashboard }  from './ui/twin.js';
import { CrisisBanner }   from './ui/crisis.js';
import { speech }         from './ui/speech.js';
import {
  renderSplash, renderHome, renderModuleSelect,
  renderMissionBriefing, renderResults,
  renderTeacher, renderSettings, showConfetti,
} from './ui/screens.js';

const PROGRESS_KEY = 'futureos_progress';

function loadProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    if (p && typeof p === 'object') return { moduleStars: {}, completedModules: [], ...p };
  } catch (_) {}
  return { moduleStars: {}, completedModules: [] };
}
function saveProgress(p) { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); }

// ── Shared DOM builder ────────────────────────────────────────────────────
function makeGameScreen(app) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:row;background:#04101a;';

  const canvasWrap = document.createElement('div');
  canvasWrap.style.cssText = 'flex:1;position:relative;overflow:hidden;min-width:0;min-height:0;';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;cursor:crosshair;';
  canvasWrap.appendChild(canvas);

  const sidePanel = document.createElement('div');
  sidePanel.className = 'side-panel';

  screen.appendChild(canvasWrap);
  screen.appendChild(sidePanel);
  app.appendChild(screen);

  screen.getBoundingClientRect(); // force layout
  return { screen, canvas, canvasWrap, sidePanel };
}

// ── Instruction overlay (persistent — stays on screen) ───────────────────
function makeInstructionBox(parent) {
  const box = document.createElement('div');
  box.style.cssText = `
    position:absolute;top:16px;left:50%;transform:translateX(-50%);
    background:rgba(7,26,36,0.95);border:1px solid rgba(70,240,192,0.35);
    border-radius:12px;padding:14px 20px;max-width:420px;width:90%;
    font-size:14px;line-height:1.6;color:#a8d8c8;z-index:50;
    text-align:center;backdrop-filter:blur(8px);
    box-shadow:0 4px 24px rgba(0,0,0,0.5);
  `;
  parent.appendChild(box);
  return {
    el: box,
    set(html) {
      box.innerHTML = html;
      speech.coach(box.textContent.replace(/[◀▶◈⊕☀⊛▣⌂○⟳]/g, '').trim());
    },
  };
}

// ── Step indicator ────────────────────────────────────────────────────────
function makeStepTracker(parent, steps) {
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute;bottom:16px;left:50%;transform:translateX(-50%);
    display:flex;gap:8px;align-items:center;z-index:50;
    background:rgba(7,26,36,0.85);border:1px solid rgba(70,240,192,0.18);
    border-radius:20px;padding:8px 16px;
  `;
  parent.appendChild(el);
  return {
    el,
    update(current, total, label) {
      el.innerHTML = `
        <span style="color:#46f0c0;font-size:12px;font-weight:700;">Step ${current}/${total}</span>
        <span style="color:#8aa6b4;font-size:12px;margin-left:6px;">${label}</span>
      `;
    },
  };
}

// ── Concept reveal card ───────────────────────────────────────────────────
function showConceptReveal(parent, text, onContinue) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:absolute;inset:0;background:rgba(4,16,26,0.85);
    display:flex;align-items:center;justify-content:center;z-index:100;
    backdrop-filter:blur(4px);
  `;
  overlay.innerHTML = `
    <div style="background:#071a24;border:2px solid #46f0c0;border-radius:16px;
      padding:32px;max-width:400px;text-align:center;
      box-shadow:0 0 60px rgba(70,240,192,0.2);">
      <div style="font-size:36px;margin-bottom:12px;">◈</div>
      <div style="font-size:11px;color:#46f0c0;letter-spacing:3px;text-transform:uppercase;
        margin-bottom:12px;">YOU DISCOVERED</div>
      <div style="font-size:16px;color:#e0f4ec;line-height:1.6;margin-bottom:24px;">${text}</div>
      <button id="concept-continue" style="
        background:#46f0c0;color:#04101a;border:none;border-radius:100px;
        padding:12px 32px;font-size:15px;font-weight:700;cursor:pointer;">
        Continue ▶
      </button>
    </div>
  `;
  parent.appendChild(overlay);
  speech.celebrate(text);
  overlay.querySelector('#concept-continue').addEventListener('click', () => {
    overlay.remove();
    onContinue();
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Game state machine
// ═══════════════════════════════════════════════════════════════════════════
class Game {
  constructor() {
    this.app = document.getElementById('app');
    this.progress = loadProgress();
    this._sim = null;
  }

  start() { renderSplash(this.app, () => this.showHome()); }

  showHome() {
    this._destroySim();
    renderHome(this.app, {
      hasProgress: Object.keys(this.progress.moduleStars).length > 0,
      onPlay:     () => this.showModuleSelect(),
      onTeacher:  () => this.showTeacher(),
      onSettings: () => this.showSettings(),
    });
  }

  showModuleSelect() {
    this._destroySim();
    renderModuleSelect(this.app, {
      modules:    cityData.modules,
      progress:   this.progress,
      onSelect:   (modId) => this.showBriefing(modId),
      onBack:     () => this.showHome(),
      onSettings: () => this.showSettings(),
    });
  }

  showBriefing(modId) {
    const mod = cityData.modules.find(m => m.id === modId);
    if (!mod) return;
    renderMissionBriefing(this.app, {
      module: mod,
      onStart: () => this.launchModule(modId),
      onBack:  () => this.showModuleSelect(),
    });
  }

  launchModule(modId) {
    const mod = cityData.modules.find(m => m.id === modId);
    if (!mod) return;
    if (mod.id === 1) this._launchConnectivity(mod);
    else if (mod.id === 2) this._launchCongestion(mod);
    else this._launchComingSoon(mod);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODULE 1 — Connectivity: Build a graph by connecting buildings
  // ══════════════════════════════════════════════════════════════════════════
  _launchConnectivity(mod) {
    this._destroySim();
    const { canvas, canvasWrap, sidePanel } = makeGameScreen(this.app);

    const twin     = new CityTwin(mod);
    const renderer = new CityCanvasRenderer(canvas);
    const twinUI   = new TwinDashboard(sidePanel);

    // ── Persistent instruction box at top ──────────────────────────────
    const instr = makeInstructionBox(canvasWrap);
    const steps = makeStepTracker(canvasWrap, 4);

    // ── Back button ────────────────────────────────────────────────────
    const backBtn = document.createElement('button');
    backBtn.textContent = '◀ Modules';
    backBtn.style.cssText = `
      position:absolute;top:16px;left:16px;z-index:60;
      background:rgba(7,26,36,0.85);border:1px solid rgba(70,240,192,0.2);
      color:#8aa6b4;border-radius:8px;padding:8px 12px;font-size:12px;cursor:pointer;
    `;
    backBtn.addEventListener('click', () => { this._destroySim(); this.showModuleSelect(); });
    canvasWrap.appendChild(backBtn);

    // ── Tutorial steps ─────────────────────────────────────────────────
    let step = 1;
    let pendingFrom = null;
    let linksDrawn = 0;
    let goalMet = false;

    // Each step: one sentence of action + one sentence of WHY
    const STEPS = [
      // 1 — start
      { action: '👆 TAP any node (building) to select it.',
        why: 'Dashed lines = possible connections. Solid glowing lines = active links with data flowing.' },
      // 2 — first node selected
      { action: '👆 Now TAP a second node to draw a link between them.',
        why: 'A link is like a cable. Once linked, data can travel between those two buildings.' },
      // 3 — first link made
      { action: '✔ Link built! Keep tapping pairs to connect more buildings.',
        why: '📡 In CS this is a GRAPH — buildings are nodes, links are edges. The internet is a giant graph.' },
      // 4 — halfway
      { action: `Keep connecting! Goal: 95% online.`,
        why: '💡 Notice towers connect to many buildings at once — hubs reduce the total links needed.' },
    ];

    const setStep = (n) => {
      step = n;
      const s = STEPS[n - 1];
      instr.el.innerHTML = `
        <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:6px;">${s.action}</div>
        <div style="font-size:12px;color:#8aa6b4;line-height:1.5;">${s.why}</div>
      `;
      speech.coach(s.action + ' ' + s.why);
      steps.update(n, 4, ['Select a node','Connect it','Keep going','Almost done!'][n-1]);
    };

    setStep(1);

    // ── Canvas interaction ─────────────────────────────────────────────
    canvas.addEventListener('click', e => {
      const nodeId = renderer.hitTestNode(e.clientX, e.clientY);
      if (nodeId === null) {
        if (pendingFrom !== null) { pendingFrom = null; if (step === 2) setStep(1); }
        return;
      }

      if (pendingFrom === null) {
        pendingFrom = nodeId;
        if (step === 1) setStep(2);
      } else {
        if (pendingFrom === nodeId) { pendingFrom = null; return; }
        const activated = twin.activateLink(pendingFrom, nodeId);
        pendingFrom = null;
        if (activated) {
          linksDrawn++;
          if (linksDrawn === 1) setStep(3);
        } else {
          instr.el.innerHTML = `
            <div style="font-size:14px;color:#ffb454;font-weight:700;">⚠ Can't connect those two.</div>
            <div style="font-size:12px;color:#8aa6b4;margin-top:4px;">Only adjacent nodes can link — follow the dashed lines.</div>
          `;
          setTimeout(() => setStep(step), 2000);
        }
      }
    });

    // ── Simulation loop ────────────────────────────────────────────────
    const loop = new SimLoop({
      ticksPerSecond: 10,
      onTick: () => {
        twin.update(0.1);
        twinUI.update(twin.scores);

        const ratio = twin.getConnectivityRatio();
        const pct   = Math.round(ratio * 100);

        if (step >= 3) steps.update(step, 4, `${pct}% connected — need 95%`);
        if (!goalMet && pct >= 50 && pct < 95 && step === 3) setStep(4);

        // Goal met!
        if (!goalMet && pct >= 95) {
          goalMet = true;
          loop.pause();

          instr.el.innerHTML = `
            <strong style="color:#46f0c0;font-size:16px;">✔ City Connected! ${pct}%</strong><br>
            <span style="color:#e0f4ec">Every building can now send and receive data.</span>
          `;
          steps.update(4, 4, 'Mission Complete!');
          showConfetti();

          setTimeout(() => {
            showConceptReveal(canvasWrap, mod.conceptReveal, () => {
              this._endModule(mod, 3);
            });
          }, 1800);
        }
      },
      onRender: (alpha) => {
        renderer.render(twin.snapshot(), alpha, { pendingFrom });
      },
    });
    loop.start();

    // Add concept explainer to side panel
    this._addConceptPanel(sidePanel, {
      title: 'Graphs',
      items: [
        { icon: '○', label: 'Node', desc: 'A building or device' },
        { icon: '—', label: 'Edge / Link', desc: 'A connection between two nodes' },
        { icon: '◈', label: 'Connected', desc: 'Every node reachable from every other' },
        { icon: '▣', label: 'Core DC', desc: 'The heart of the network' },
      ],
    });

    this._sim = { loop, twinUI, renderer };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODULE 2 — Congestion: Festival surge, reroute emergency traffic
  // ══════════════════════════════════════════════════════════════════════════
  _launchCongestion(mod) {
    this._destroySim();
    const { canvas, canvasWrap, sidePanel } = makeGameScreen(this.app);

    const net  = new Network({
      nodes: mod.city.nodes,
      edges: mod.city.links.map(l => ({ a: l.a, b: l.b, capacity: l.capacity, up: l.up ?? true })),
    });
    const pkts  = new PacketSystem(net);
    const cong  = new CongestionControl(net, pkts);
    const twin  = new CityTwin(mod);

    const senderNodes = mod.city.nodes.filter(n =>
      n.type === 'residential' || n.type === 'hospital' || n.type === 'emergency'
    );
    senderNodes.forEach(n => cong.initSender(n.id, n.type === 'residential' ? 0.3 : 0.2));

    const renderer = new CanvasRenderer(canvas);
    const hud = new HUD(canvasWrap, {
      onToggleScope: () => {},
      onMute: () => speech.toggle(),
      onBack: () => { this._destroySim(); this.showModuleSelect(); },
    });
    const twinUI   = new TwinDashboard(sidePanel);
    const crisisUI = new CrisisBanner(canvasWrap);

    const instr = makeInstructionBox(canvasWrap);
    const steps = makeStepTracker(canvasWrap, 3);

    let step = 1;
    let crisisFired = false;
    let goalMet = false;
    let tick = 0;
    let selectedRouter = null;

    // ── Tutorial steps ─────────────────────────────────────────────────
    const STEPS = [
      { action: '👀 Watch the dots — that\'s data moving through the network.',
        why: 'Green links are fine. Red/orange links are getting full (congested). Festival starts soon!' },
      { action: '🎉 FESTIVAL! Traffic surged. 👆 TAP a Router ○ on the canvas.',
        why: 'When a link is full, packets queue up then DROP. Emergency services must stay online!' },
      { action: '✔ Use the right panel to pick a less-busy path for this router.',
        why: '📡 CS concept: a QUEUE. Data waits in line. If the queue overflows → data is lost.' },
    ];

    const setStep = (n, label) => {
      step = n;
      const s = STEPS[n - 1];
      instr.el.innerHTML = `
        <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:6px;">${s.action}</div>
        <div style="font-size:12px;color:#8aa6b4;line-height:1.5;">${s.why}</div>
      `;
      speech.coach(s.action);
      steps.update(n, 3, label);
    };

    setStep(1, 'Watch the network');

    // ── Controls panel (inline in side panel) ─────────────────────────
    const ctrlBox = document.createElement('div');
    ctrlBox.style.cssText = 'margin-top:12px;';
    sidePanel.appendChild(ctrlBox);

    const showRouterControls = (nodeId) => {
      const node = net.getNode(nodeId);
      if (!node) return;
      const neighbors = net.neighbors(nodeId).map(({ neighbor }) => net.getNode(neighbor)).filter(Boolean);

      ctrlBox.innerHTML = `
        <div style="font-size:11px;color:#46f0c0;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
          Route from: ${node.label}
        </div>
        <div style="font-size:11px;color:#8aa6b4;margin-bottom:8px;">Send data toward:</div>
      `;
      neighbors.forEach(nb => {
        const nbNode = net.getNode(nb.id);
        if (!nbNode) return;
        const edge = net.getEdge(nodeId, nb.id);
        const load = edge ? (edge.load || 0) : 0;
        const loadColor = load > 0.8 ? '#ff6b6b' : load > 0.5 ? '#ffb454' : '#46f0c0';
        const isActive = node.rule === nb.id;
        const btn = document.createElement('button');
        btn.style.cssText = `
          display:flex;align-items:center;gap:8px;width:100%;
          padding:10px 12px;margin-bottom:6px;border-radius:8px;cursor:pointer;
          background:${isActive ? 'rgba(70,240,192,0.15)' : 'rgba(70,240,192,0.04)'};
          border:1px solid ${isActive ? '#46f0c0' : 'rgba(70,240,192,0.15)'};
          color:#e0f4ec;font-size:13px;text-align:left;
        `;
        btn.innerHTML = `
          <span>${nbNode.emoji || '○'}</span>
          <span style="flex:1">${nbNode.label}</span>
          <span style="font-size:10px;color:${loadColor}">${Math.round(load * 100)}% load</span>
          ${isActive ? '<span style="color:#46f0c0">✔</span>' : ''}
        `;
        btn.addEventListener('click', () => {
          net.setRule(nodeId, nb.id);
          showRouterControls(nodeId); // refresh
          setStep(3, 'Rule set — watch packets reroute');
        });
        ctrlBox.appendChild(btn);
      });

      const clearBtn = document.createElement('button');
      clearBtn.textContent = '✕ Clear rule';
      clearBtn.style.cssText = `
        width:100%;padding:8px;border-radius:8px;cursor:pointer;
        background:transparent;border:1px solid rgba(255,107,107,0.3);
        color:#8aa6b4;font-size:12px;margin-top:4px;
      `;
      clearBtn.addEventListener('click', () => { net.setRule(nodeId, null); showRouterControls(nodeId); });
      ctrlBox.appendChild(clearBtn);
    };

    // ── Canvas click ───────────────────────────────────────────────────
    canvas.addEventListener('click', e => {
      const node = renderer.hitTestNode(net, e.clientX, e.clientY);
      if (!node) return;
      if (node.type === 'router') {
        selectedRouter = node.id;
        showRouterControls(node.id);
        if (step <= 2) setStep(3, `Routing from ${node.label}`);
      }
    });

    // ── Sim loop ───────────────────────────────────────────────────────
    const loop = new SimLoop({
      ticksPerSecond: 20,
      onTick: (dt) => {
        tick++;
        const crisis = mod.crisisEvent;

        // Fire festival crisis
        if (crisis && !crisisFired && tick >= crisis.tick) {
          crisisFired = true;
          crisisUI.show(crisis.label);
          setStep(2, 'Emergency services need help!');
          senderNodes.filter(n => n.type === 'residential').forEach(n => {
            cong.setRate(n.id, 1.5); // surge residential traffic
          });
        }

        // spawn packets
        senderNodes.forEach(s => {
          const node = net.getNode(s.id);
          if (!node) return;
          const sender = cong.getSender(s.id);
          const rate = sender ? sender.rate : 0.3;
          node._txAccum = (node._txAccum || 0) + rate / 20;
          while (node._txAccum >= 1) {
            node._txAccum--;
            const dcs = [...net.nodes.values()].filter(n => n.type === 'datacenter');
            if (dcs.length) pkts.spawn(s.id, dcs[0].id);
          }
        });

        pkts.tick(dt);
        pkts.tickLoads();
        cong.tick();

        pkts.getAll().forEach(p => {
          if (p.outcome === 'dropped' && crisisFired) {
            const s = senderNodes.find(n => n.id === p.from);
            if (s) cong.notifyLoss(s.id);
          }
        });

        twin.update(dt);
        twinUI.update(twin.scores);
        hud.update(pkts.stats);

        // refresh router panel with live load data
        if (selectedRouter !== null && tick % 10 === 0) {
          showRouterControls(selectedRouter);
        }

        // goal check
        const uptimeRatio = twin.getEmergencyUptimeRatio();
        const upPct = Math.round(uptimeRatio * 100);
        if (crisisFired && !goalMet && tick > 140 && uptimeRatio >= 0.75) {
          goalMet = true;
          loop.pause();
          instr.el.innerHTML = `
            <strong style="color:#46f0c0;font-size:16px;">✔ Emergency services stayed online!</strong><br>
            Uptime: ${upPct}% — you managed congestion by rerouting critical traffic.
          `;
          showConfetti();
          setTimeout(() => {
            showConceptReveal(canvasWrap, mod.conceptReveal, () => {
              this._endModule(mod, upPct >= 90 ? 3 : 2);
            });
          }, 2000);
        }
      },
      onRender: (_alpha) => {
        const snap = net.snapshot();
        snap.adjList = net.adjList;
        snap.edges = net.edges;
        renderer.render(snap, pkts.getLiving(), {});
      },
    });
    loop.start();

    this._addConceptPanel(sidePanel, {
      title: 'Queues & Congestion',
      items: [
        { icon: '→', label: 'Packet',   desc: 'A chunk of data traveling the network' },
        { icon: '⟳', label: 'Queue',    desc: 'Waiting line when a link is full' },
        { icon: '✕', label: 'Dropped',  desc: 'Packet lost when queue overflows' },
        { icon: '○', label: 'Router',   desc: 'Tap to set which path it uses' },
      ],
    });

    this._sim = { loop, twinUI, crisisUI, hud, renderer };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Coming soon shell for locked modules
  // ══════════════════════════════════════════════════════════════════════════
  _launchComingSoon(mod) {
    this._destroySim();
    this.app.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.style.cssText = `
      position:absolute;inset:0;display:flex;flex-direction:column;
      align-items:center;justify-content:center;background:#04101a;gap:16px;
    `;

    wrap.innerHTML = `
      <div style="font-size:52px;color:${mod.color}">${mod.icon}</div>
      <div style="font-family:'Bricolage Grotesque',sans-serif;font-size:24px;font-weight:800;color:${mod.color}">
        Module ${mod.id}: ${mod.title}
      </div>
      <div style="font-size:14px;color:#8aa6b4;max-width:340px;text-align:center;line-height:1.6;">
        ${mod.subtitle}
      </div>
      <div style="background:rgba(70,240,192,0.05);border:1px solid rgba(70,240,192,0.2);
        border-radius:12px;padding:16px 24px;max-width:340px;text-align:center;margin-top:8px;">
        <div style="font-size:10px;color:#46f0c0;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
          Concept you'll learn
        </div>
        <div style="font-size:15px;color:#e0f4ec;">${mod.concept}</div>
      </div>
      <div style="font-size:13px;color:#8aa6b4;margin-top:8px;">Coming in next update</div>
    `;

    const backBtn = document.createElement('button');
    backBtn.textContent = '◀ Back to Modules';
    backBtn.style.cssText = `
      margin-top:16px;background:rgba(70,240,192,0.1);border:1px solid rgba(70,240,192,0.3);
      color:#46f0c0;border-radius:100px;padding:12px 28px;font-size:14px;cursor:pointer;
    `;
    backBtn.addEventListener('click', () => { this._destroySim(); this.showModuleSelect(); });
    wrap.appendChild(backBtn);

    this.app.appendChild(wrap);
    this._sim = {};
  }

  // ── End a module ──────────────────────────────────────────────────────────
  _endModule(mod, stars) {
    const prev = this.progress.moduleStars[mod.id] || 0;
    this.progress.moduleStars[mod.id] = Math.max(prev, stars);
    if (stars >= 2 && !(this.progress.completedModules || []).includes(mod.id)) {
      this.progress.completedModules = [...(this.progress.completedModules || []), mod.id];
    }
    saveProgress(this.progress);

    renderResults(this.app, {
      stars,
      stats: null,
      conceptReveal: null, // already shown inline
      isCity: true,
      onNext:  () => this.showModuleSelect(),
      onRetry: () => this.launchModule(mod.id),
    });
  }

  // ── Concept glossary panel (side panel bottom) ────────────────────────────
  _addConceptPanel(container, { title, items }) {
    const box = document.createElement('div');
    box.style.cssText = `
      margin-top:auto;padding-top:12px;border-top:1px solid rgba(70,240,192,0.12);
    `;
    box.innerHTML = `
      <div style="font-size:9px;color:#46f0c0;letter-spacing:2px;text-transform:uppercase;
        margin-bottom:10px;">◈ ${title}</div>
    `;
    items.forEach(item => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:8px;align-items:flex-start;margin-bottom:8px;';
      row.innerHTML = `
        <span style="color:#46f0c0;font-size:14px;flex-shrink:0;min-width:16px;">${item.icon}</span>
        <div>
          <div style="font-size:11px;color:#e0f4ec;font-weight:600;">${item.label}</div>
          <div style="font-size:10px;color:#8aa6b4;line-height:1.4;">${item.desc}</div>
        </div>
      `;
      box.appendChild(row);
    });
    container.appendChild(box);
  }

  // ── Destroy active sim ────────────────────────────────────────────────────
  _destroySim() {
    if (!this._sim) return;
    this._sim.loop?.stop?.();
    this._sim.hud?.destroy?.();
    this._sim.twinUI?.destroy?.();
    this._sim.crisisUI?.destroy?.();
    this._sim.renderer?.destroy?.();
    this._sim = null;
  }

  showTeacher()  { this._destroySim(); renderTeacher(this.app,  { progress: this.progress, onBack: () => this.showHome() }); }
  showSettings() { this._destroySim(); renderSettings(this.app, { onBack: () => this.showHome() }); }
}

const game = new Game();
game.start();

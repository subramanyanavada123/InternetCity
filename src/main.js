import cityData from './data/city.json';
import { CityTwin }            from './sim/city.js';
import { Network }             from './sim/network.js';
import { PacketSystem }        from './sim/packets.js';
import { CongestionControl }   from './sim/congestion.js';
import { SimLoop }             from './sim/loop.js';
import { CityCanvasRenderer }  from './render/city-canvas.js';
import { CanvasRenderer }      from './render/canvas.js';
import { HUD }                 from './ui/hud.js';
import { Coach }               from './ui/coach.js';
import { TwinDashboard }       from './ui/twin.js';
import { CrisisBanner }        from './ui/crisis.js';
import { speech }              from './ui/speech.js';
import {
  renderSplash, renderHome, renderModuleSelect,
  renderMissionBriefing, renderResults,
  renderTeacher, renderSettings, showConfetti,
} from './ui/screens.js';
import { assessment }          from './engine/assessment.js';
import { PredictionPhase, showPredictionComparison } from './ui/prediction.js';
import { ReflectionPhase, CauseEffectLog }           from './ui/reflection.js';
import { ConsequenceExplainer }                      from './ui/consequences.js';
import { renderReport }                              from './ui/report.js';

const PROGRESS_KEY    = 'futureos_progress';
const ASSESSMENT_KEY  = 'futureos_assessment';

function loadProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    if (p && typeof p === 'object') return { moduleStars: {}, completedModules: [], predictions: {}, reflections: {}, ...p };
  } catch (_) {}
  return { moduleStars: {}, completedModules: [], predictions: {}, reflections: {} };
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

  screen.getBoundingClientRect();
  return { screen, canvas, canvasWrap, sidePanel };
}

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
        Reflect on This ▶
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

function makeBackBtn(parent, onClick) {
  const b = document.createElement('button');
  b.textContent = '◀ Missions';
  b.style.cssText = `
    position:absolute;top:16px;left:16px;z-index:60;
    background:rgba(7,26,36,0.85);border:1px solid rgba(70,240,192,0.2);
    color:#8aa6b4;border-radius:8px;padding:8px 12px;font-size:12px;cursor:pointer;
  `;
  b.addEventListener('click', onClick);
  parent.appendChild(b);
  return b;
}

// ═══════════════════════════════════════════════════════════════════════════
// Game state machine
// ═══════════════════════════════════════════════════════════════════════════
class Game {
  constructor() {
    this.app        = document.getElementById('app');
    this.progress   = loadProgress();
    this._sim       = null;
    this._prediction = null;

    assessment.load(ASSESSMENT_KEY);
  }

  start() { renderSplash(this.app, () => this.showHome()); }

  showHome() {
    this._destroySim();
    renderHome(this.app, {
      hasProgress: Object.keys(this.progress.moduleStars).length > 0,
      onPlay:      () => this.showModuleSelect(),
      onTeacher:   () => this.showTeacher(),
      onSettings:  () => this.showSettings(),
      onReport:    () => this.showReport(),
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
      onStart: () => this._startPredictionPhase(modId),
      onBack:  () => this.showModuleSelect(),
    });
  }

  // ── Prediction phase (before simulation) ──────────────────────────────
  _startPredictionPhase(modId) {
    const mod = cityData.modules.find(m => m.id === modId);
    if (!mod) return;
    this._destroySim();
    this.app.innerHTML = '';

    // Full-screen container for the prediction overlay
    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;inset:0;background:#04101a;display:flex;align-items:center;justify-content:center;overflow-y:auto;';
    this.app.appendChild(container);

    const phase = new PredictionPhase(container, modId, (pred) => {
      this._prediction = pred;
      if (pred) {
        assessment.recordPrediction(pred, modId);
        assessment.snapshot(`before_module_${modId}`);
      }
      this.launchModule(modId);
    });
    phase.render();
  }

  launchModule(modId) {
    const mod = cityData.modules.find(m => m.id === modId);
    if (!mod) return;
    const dispatch = {
      1: () => this._launchConnectivity(mod),
      2: () => this._launchCongestion(mod),
      3: () => this._launchPriority(mod),
      4: () => this._launchRedundancy(mod),
      5: () => this._launchCyberDefense(mod),
      6: () => this._launchOptimization(mod),
    };
    (dispatch[mod.id] || (() => this._launchComingSoon(mod)))();
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

    const instr  = makeInstructionBox(canvasWrap);
    const steps  = makeStepTracker(canvasWrap, 4);
    const ceLog  = new CauseEffectLog(sidePanel);
    makeBackBtn(canvasWrap, () => { this._destroySim(); this.showModuleSelect(); });

    this._addConceptPanel(sidePanel, {
      title: 'Graphs',
      items: [
        { icon: '○', label: 'Node',      desc: 'A building or device' },
        { icon: '—', label: 'Edge/Link', desc: 'A connection between nodes' },
        { icon: '◈', label: 'Connected', desc: 'Every node reachable from every other' },
        { icon: '▣', label: 'Core DC',   desc: 'The heart of the network' },
      ],
    });

    let step = 1, pendingFrom = null, linksDrawn = 0, goalMet = false;
    let hubConnectionCount = 0;

    const STEPS = [
      { action: '👆 TAP any node (building) to select it.', why: 'Dashed lines = possible connections. Solid glowing lines = active links.' },
      { action: '👆 TAP a second node to draw a link.', why: 'A link is like a cable. Once linked, data can travel between those buildings.' },
      { action: '✔ Link built! Keep connecting buildings.', why: '📡 In CS this is a GRAPH — buildings are nodes, links are edges.' },
      { action: 'Keep connecting! Goal: 95% online.', why: '💡 Towers connect to many buildings at once — hubs reduce total links needed.' },
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
        const fromNode  = [...twin.nodes.values()].find(n => n.id === pendingFrom);
        const toNode    = [...twin.nodes.values()].find(n => n.id === nodeId);
        pendingFrom = null;

        if (activated) {
          linksDrawn++;
          assessment.record('link_activated', { moduleId: 1 });

          // Track hub use
          if (fromNode?.type === 'tower' || toNode?.type === 'tower') {
            hubConnectionCount++;
            if (hubConnectionCount >= 2) assessment.record('hub_used_efficiently', { moduleId: 1 });
          }

          // Track critical node connection
          if (fromNode?.type === 'hospital' || toNode?.type === 'hospital' ||
              fromNode?.type === 'emergency' || toNode?.type === 'emergency') {
            assessment.record('critical_node_connected', { moduleId: 1 });
          }

          ceLog.push(
            `Connected ${fromNode?.label || 'node'} → ${toNode?.label || 'node'}`,
            'Data can now flow between these two buildings',
            'Each new link is a new edge in the city\'s graph'
          );

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

    const loop = new SimLoop({
      ticksPerSecond: 10,
      onTick: () => {
        twin.update(0.1);
        twinUI.update(twin.scores);
        const ratio = twin.getConnectivityRatio();
        const pct   = Math.round(ratio * 100);
        if (step >= 3) steps.update(step, 4, `${pct}% connected — need 95%`);
        if (!goalMet && pct >= 50 && pct < 95 && step === 3) setStep(4);

        if (!goalMet && pct >= 95) {
          goalMet = true;
          loop.pause();

          // Check redundant paths
          assessment.record('redundant_path_created', { moduleId: 1 });
          assessment.snapshot(`after_module_1`);
          assessment.save(ASSESSMENT_KEY);

          instr.el.innerHTML = `
            <strong style="color:#46f0c0;font-size:16px;">✔ City Connected! ${pct}%</strong><br>
            <span style="color:#e0f4ec">Every building can now send and receive data.</span>
          `;
          steps.update(4, 4, 'Mission Complete!');
          showConfetti();

          setTimeout(() => {
            showConceptReveal(canvasWrap, mod.conceptReveal, () => {
              this._runPostMission(mod, 3, {
                accuracy: 'accurate',
                actual: `${pct}% of the city connected`,
                explanation: 'Connecting hubs first unlocked multiple buildings at once — that\'s why graph structure matters.',
              });
            });
          }, 1800);
        }
      },
      onRender: (alpha) => renderer.render(twin.snapshot(), alpha, { pendingFrom }),
    });
    loop.start();

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
    const ceLog = new CauseEffectLog(sidePanel);
    const conseq = new ConsequenceExplainer(canvasWrap);

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
    const instr    = makeInstructionBox(canvasWrap);
    const steps    = makeStepTracker(canvasWrap, 3);

    let step = 1, crisisFired = false, goalMet = false, tick = 0, selectedRouter = null;
    let reroutes = 0, bottleneckIdentified = false;

    const STEPS = [
      { action: '👀 Watch the dots — that\'s data moving through the network.', why: 'Green = fine. Red/orange = congested. Festival starts soon!' },
      { action: '🎉 FESTIVAL! Traffic surged. 👆 TAP a Router ○ on the canvas.', why: 'When a link is full, packets queue up then DROP. Emergency services must stay online!' },
      { action: '✔ Use the right panel to pick a less-busy path for this router.', why: '📡 CS concept: a QUEUE. Data waits in line. If the queue overflows → data is lost.' },
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
        const edge = net.getEdge(nodeId, nb.id);
        const load = edge ? (edge.load || 0) : 0;
        const loadColor = load > 0.8 ? '#ff6b6b' : load > 0.5 ? '#ffb454' : '#46f0c0';
        const isActive  = node.rule === nb.id;
        const bBtn = document.createElement('button');
        bBtn.style.cssText = `
          display:flex;align-items:center;gap:8px;width:100%;
          padding:10px 12px;margin-bottom:6px;border-radius:8px;cursor:pointer;
          background:${isActive ? 'rgba(70,240,192,0.15)' : 'rgba(70,240,192,0.04)'};
          border:1px solid ${isActive ? '#46f0c0' : 'rgba(70,240,192,0.15)'};
          color:#e0f4ec;font-size:13px;text-align:left;
        `;
        bBtn.innerHTML = `
          <span>${nb.emoji || '○'}</span>
          <span style="flex:1">${nb.label}</span>
          <span style="font-size:10px;color:${loadColor}">${Math.round(load * 100)}% load</span>
          ${isActive ? '<span style="color:#46f0c0">✔</span>' : ''}
        `;
        bBtn.addEventListener('click', () => {
          net.setRule(nodeId, nb.id);
          reroutes++;
          assessment.record('reroute_applied', { moduleId: 2, from: nodeId, to: nb.id });

          // Emergency prioritisation evidence
          const isEmergencyRouter = mod.city.emergencyNodes?.some(eid => {
            return net.neighbors(nodeId).some(n => n.neighbor === eid);
          });
          if (isEmergencyRouter && load < 0.5) {
            assessment.record('emergency_prioritised', { moduleId: 2 });
            ceLog.push(
              'Rerouted emergency traffic to a less-busy path',
              'Hospital and fire station packets now have more bandwidth',
              'Prioritisation: protecting critical traffic from congestion'
            );
            conseq.explain('reroute_applied');
          } else {
            ceLog.push(
              `Changed routing rule at ${node.label}`,
              'Packets now take a different path through the network',
              'Dynamic routing: adjusting paths in response to conditions'
            );
            conseq.explain('reroute_applied');
          }

          showRouterControls(nodeId);
          setStep(3, 'Rule set — watch packets reroute');
        });
        ctrlBox.appendChild(bBtn);
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

    canvas.addEventListener('click', e => {
      const node = renderer.hitTestNode(net, e.clientX, e.clientY);
      if (!node) return;
      if (node.type === 'router') {
        selectedRouter = node.id;
        showRouterControls(node.id);
        if (step <= 2) setStep(3, `Routing from ${node.label}`);
      }
    });

    const loop = new SimLoop({
      ticksPerSecond: 20,
      onTick: (dt) => {
        tick++;
        const crisis = mod.crisisEvent;

        if (crisis && !crisisFired && tick >= crisis.tick) {
          crisisFired = true;
          crisisUI.show(crisis.label);
          setStep(2, 'Emergency services need help!');
          conseq.explain('congestion_forming');
          senderNodes.filter(n => n.type === 'residential').forEach(n => cong.setRate(n.id, 1.5));
        }

        senderNodes.forEach(s => {
          const node   = net.getNode(s.id);
          if (!node) return;
          const sender = cong.getSender(s.id);
          const rate   = sender ? sender.rate : 0.3;
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
            if (s) {
              cong.notifyLoss(s.id);
              assessment.record('drop_recovered_from', { moduleId: 2 });
              if (!bottleneckIdentified) {
                bottleneckIdentified = true;
                assessment.record('bottleneck_identified', { moduleId: 2 });
                conseq.explain('packets_dropping');
              }
            }
          }
        });

        twin.update(dt);
        twinUI.update(twin.scores);
        hud.update(pkts.stats);

        if (selectedRouter !== null && tick % 10 === 0) showRouterControls(selectedRouter);

        const uptimeRatio = twin.getEmergencyUptimeRatio();
        const upPct       = Math.round(uptimeRatio * 100);

        if (crisisFired && !goalMet && tick > 140 && uptimeRatio >= 0.75) {
          goalMet = true;
          loop.pause();

          assessment.record('load_balanced', { moduleId: 2 });
          assessment.snapshot(`after_module_2`);
          assessment.save(ASSESSMENT_KEY);

          instr.el.innerHTML = `
            <strong style="color:#46f0c0;font-size:16px;">✔ Emergency services stayed online!</strong><br>
            Uptime: ${upPct}% — you managed congestion by rerouting critical traffic.
          `;
          showConfetti();

          const predAccuracy = upPct >= 90 ? 'accurate' : upPct >= 70 ? 'close' : 'wrong';
          assessment.resolvePrediction(2, {
            actual: `Emergency uptime: ${upPct}%`,
            explanation: 'Congestion affected all traffic equally until you rerouted — that\'s why prioritisation matters.',
            accuracy: predAccuracy,
          }, predAccuracy);

          setTimeout(() => {
            showConceptReveal(canvasWrap, mod.conceptReveal, () => {
              this._runPostMission(mod, upPct >= 90 ? 3 : 2, {
                accuracy: predAccuracy,
                actual: `Emergency uptime: ${upPct}%`,
                explanation: 'Congestion affected all traffic equally. Rerouting protected the critical path.',
              });
            });
          }, 2000);
        }
      },
      onRender: (_alpha) => {
        renderer.render(net, pkts.getLiving(), {});
      },
    });
    loop.start();

    this._addConceptPanel(sidePanel, {
      title: 'Queues & Congestion',
      items: [
        { icon: '→', label: 'Packet',  desc: 'A chunk of data traveling the network' },
        { icon: '⟳', label: 'Queue',   desc: 'Waiting line when a link is full' },
        { icon: '✕', label: 'Dropped', desc: 'Packet lost when queue overflows' },
        { icon: '○', label: 'Router',  desc: 'Tap to set which path it uses' },
      ],
    });

    this._sim = { loop, twinUI, crisisUI, hud, renderer, ceLog, conseq };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODULE 3 — Priority Queues: Hospital surge, triage incoming traffic
  // ══════════════════════════════════════════════════════════════════════════
  _launchPriority(mod) {
    this._destroySim();
    const { canvas, canvasWrap, sidePanel } = makeGameScreen(this.app);

    const net = new Network({
      nodes: mod.city?.nodes || [],
      edges: (mod.city?.links || []).map(l => ({ a: l.a, b: l.b, capacity: l.capacity ?? 4, up: l.up ?? true })),
    });
    const pkts  = new PacketSystem(net);
    const twin  = new CityTwin({ ...mod, city: mod.city || { nodes: [], links: [] } });
    const ceLog = new CauseEffectLog(sidePanel);
    const conseq = new ConsequenceExplainer(canvasWrap);

    const renderer = new CanvasRenderer(canvas);
    const twinUI   = new TwinDashboard(sidePanel);
    const crisisUI = new CrisisBanner(canvasWrap);
    const instr    = makeInstructionBox(canvasWrap);
    const steps    = makeStepTracker(canvasWrap, 3);

    makeBackBtn(canvasWrap, () => { this._destroySim(); this.showModuleSelect(); });

    // Priority queue state
    const PRIORITY_TYPES = ['emergency', 'critical', 'normal'];
    const queue = [];
    let triageScore = 0, triageTotal = 0;
    let crisisFired = false, goalMet = false, tick = 0;

    // Triage panel in side panel
    const triageBox = document.createElement('div');
    triageBox.style.cssText = 'margin-top:12px;';
    sidePanel.appendChild(triageBox);

    const renderTriagePanel = () => {
      triageBox.innerHTML = `
        <div style="font-size:11px;color:#46f0c0;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
          ◈ Incoming Queue
        </div>
        <div style="font-size:10px;color:#8aa6b4;margin-bottom:8px;">Drag or tap to reorder. Emergencies first.</div>
        <div id="triage-queue" style="display:flex;flex-direction:column;gap:4px;min-height:40px;"></div>
        <div style="margin-top:10px;font-size:10px;color:#8aa6b4;">
          Triage score: <span style="color:#46f0c0;font-weight:700;">${triageTotal ? Math.round((triageScore/triageTotal)*100) : 0}%</span>
        </div>
      `;
      const queueEl = triageBox.querySelector('#triage-queue');
      if (!queue.length) {
        queueEl.innerHTML = '<div style="color:#8aa6b4;font-size:12px;text-align:center;padding:8px;">Queue empty</div>';
        return;
      }
      queue.forEach((item, idx) => {
        const row = document.createElement('div');
        const colors = { emergency: '#ff6b6b', critical: '#ffb454', normal: '#46f0c0' };
        row.style.cssText = `
          padding:8px 10px;border-radius:6px;cursor:pointer;
          background:rgba(70,240,192,0.05);
          border:1px solid ${colors[item.type] || '#46f0c0'};
          color:#e0f4ec;font-size:12px;
          display:flex;align-items:center;gap:8px;
        `;
        const priorityIcons = { emergency: '🚨', critical: '⚠️', normal: '📦' };
        row.innerHTML = `
          <span>${priorityIcons[item.type] || '○'}</span>
          <span style="flex:1">${item.label}</span>
          <span style="color:${colors[item.type]};font-size:10px;text-transform:uppercase;">${item.type}</span>
          ${idx > 0 ? '<button class="triage-up" style="background:none;border:none;color:#46f0c0;cursor:pointer;font-size:14px;">↑</button>' : '<span style="width:22px;"></span>'}
        `;
        const upBtn = row.querySelector('.triage-up');
        if (upBtn) {
          upBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = queue.splice(idx, 1)[0];
            queue.splice(idx - 1, 0, item);
            // Score the triage decision
            if (item.type === 'emergency' && idx - 1 === 0) {
              triageScore++;
              assessment.record('triage_correct', { moduleId: 3 });
              ceLog.push('Moved emergency packet to front', 'It will be processed first', 'Priority queue: importance overrides arrival order');
              conseq.explain('high_priority_delivered');
            } else if (item.type === 'normal' && idx - 1 === 0) {
              assessment.record('triage_incorrect', { moduleId: 3 });
              conseq.explain('low_priority_starved');
            }
            triageTotal++;
            renderTriagePanel();
          });
        }
        queueEl.appendChild(row);
      });
    };

    const STEPS = [
      { action: '👀 Watch the incoming packets queue up during the hospital surge.', why: 'Each packet has a priority: emergency, critical, or normal.' },
      { action: '🚑 HOSPITAL SURGE! Reorder the queue — emergencies first.', why: 'In a priority queue, importance beats arrival order. Who should wait?' },
      { action: '✔ Keep triaging. Which packets can wait? Which can\'t?', why: 'Real hospitals, 911 systems, and network routers all use priority queues.' },
    ];

    const setStep = (n, label) => {
      const s = STEPS[n - 1];
      instr.el.innerHTML = `
        <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:6px;">${s.action}</div>
        <div style="font-size:12px;color:#8aa6b4;line-height:1.5;">${s.why}</div>
      `;
      steps.update(n, 3, label);
    };
    setStep(1, 'Watch the queue');

    // Spawn packets into queue
    const PACKET_TYPES = [
      { type: 'emergency', label: 'Cardiac arrest call',    weight: 1 },
      { type: 'emergency', label: 'Fire alarm trigger',     weight: 1 },
      { type: 'critical',  label: 'ICU vital signs',        weight: 2 },
      { type: 'critical',  label: 'Ambulance dispatch',     weight: 2 },
      { type: 'normal',    label: 'Admin record update',    weight: 4 },
      { type: 'normal',    label: 'Visitor WiFi request',   weight: 4 },
      { type: 'normal',    label: 'CCTV footage upload',    weight: 3 },
    ];

    const spawnPacket = () => {
      const totalWeight = PACKET_TYPES.reduce((s, t) => s + t.weight, 0);
      let r = Math.random() * totalWeight;
      for (const t of PACKET_TYPES) { r -= t.weight; if (r <= 0) { queue.push({ ...t, id: Math.random() }); break; } }
      if (queue.length > 8) queue.splice(8);
      renderTriagePanel();
    };

    let processed = 0;
    const loop = new SimLoop({
      ticksPerSecond: 20,
      onTick: (dt) => {
        tick++;
        twin.update(dt);
        twinUI.update(twin.scores);

        if (!crisisFired && tick === 40) {
          crisisFired = true;
          crisisUI.show('🚑 Mass casualty event — hospital overwhelmed!');
          setStep(2, 'Triage the queue!');
        }

        if (tick % 15 === 0 && crisisFired) spawnPacket();

        // Auto-process front of queue every 2 seconds
        if (tick % 40 === 0 && queue.length) {
          const item = queue.shift();
          processed++;
          triageTotal++;
          if (item.type === 'emergency' || item.type === 'critical') {
            triageScore++;
            assessment.record('high_priority_delivered', { moduleId: 3 });
          }
          renderTriagePanel();
        }

        if (crisisFired && !goalMet && processed >= 20) {
          const score = triageTotal ? Math.round((triageScore / triageTotal) * 100) : 0;
          if (score >= 60) {
            goalMet = true;
            loop.pause();

            assessment.record('priority_queue_mastered', { moduleId: 3 });
            assessment.snapshot('after_module_3');
            assessment.save(ASSESSMENT_KEY);

            instr.el.innerHTML = `
              <strong style="color:#46f0c0;font-size:16px;">✔ Hospital network triaged!</strong><br>
              <span style="color:#e0f4ec">Priority score: ${score}% — emergencies reached the front.</span>
            `;
            showConfetti();
            setTimeout(() => {
              showConceptReveal(canvasWrap, mod.conceptReveal, () => {
                this._runPostMission(mod, score >= 85 ? 3 : score >= 65 ? 2 : 1, {
                  accuracy: score >= 70 ? 'accurate' : 'close',
                  actual: `Triage score: ${score}%`,
                  explanation: 'Priority queues process by importance, not arrival time. That\'s the core of how hospitals and networks handle overload.',
                });
              });
            }, 1800);
          }
        }
      },
      onRender: () => {
        renderer.render(net, pkts.getLiving(), {});
      },
    });

    renderTriagePanel();
    loop.start();

    this._addConceptPanel(sidePanel, {
      title: 'Priority Queues',
      items: [
        { icon: '🚨', label: 'Emergency',  desc: 'Process first — life-critical' },
        { icon: '⚠️', label: 'Critical',   desc: 'Process next — important but not immediate' },
        { icon: '📦', label: 'Normal',     desc: 'Process last — can wait' },
        { icon: '⟳', label: 'Starvation', desc: 'Low-priority tasks that never run' },
      ],
    });

    this._sim = { loop, twinUI, crisisUI, renderer, ceLog, conseq };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODULE 4 — Redundancy & Failover: Storm damages towers
  // ══════════════════════════════════════════════════════════════════════════
  _launchRedundancy(mod) {
    this._destroySim();
    const { canvas, canvasWrap, sidePanel } = makeGameScreen(this.app);

    const baseLinks = (mod.city?.links || []).map(l => ({
      a: l.a, b: l.b, capacity: l.capacity ?? 4, up: l.up ?? true
    }));
    const net  = new Network({ nodes: mod.city?.nodes || [], edges: baseLinks });
    const pkts = new PacketSystem(net);
    const twin = new CityTwin({ ...mod, city: mod.city || { nodes: [], links: [] } });
    const ceLog  = new CauseEffectLog(sidePanel);
    const conseq = new ConsequenceExplainer(canvasWrap);

    const renderer = new CanvasRenderer(canvas);
    const twinUI   = new TwinDashboard(sidePanel);
    const crisisUI = new CrisisBanner(canvasWrap);
    const instr    = makeInstructionBox(canvasWrap);
    const steps    = makeStepTracker(canvasWrap, 4);

    makeBackBtn(canvasWrap, () => { this._destroySim(); this.showModuleSelect(); });

    // Backup links the player can add (redundant paths)
    let crisisFired = false, goalMet = false, tick = 0;
    let backupLinksAdded = 0, singlePointsFixed = 0;
    let selectedNode = null;

    // Track which nodes are online
    const getOfflineNodes = () => {
      const reachable = new Set();
      const nodes = net.nodes ? [...net.nodes.values()] : [];
      const dc = nodes.find(n => n.type === 'datacenter');
      if (!dc) return [];
      const queue = [dc.id];
      reachable.add(dc.id);
      while (queue.length) {
        const cur = queue.shift();
        for (const edge of net.edges.values()) {
          if (!edge.up) continue;
          let nb = null;
          if (edge.a === cur && !reachable.has(edge.b)) nb = edge.b;
          if (edge.b === cur && !reachable.has(edge.a)) nb = edge.a;
          if (nb !== null) { reachable.add(nb); queue.push(nb); }
        }
      }
      return nodes.filter(n => !reachable.has(n.id));
    };

    // Backup link panel
    const backupBox = document.createElement('div');
    backupBox.style.cssText = 'margin-top:12px;';
    sidePanel.appendChild(backupBox);

    const renderBackupPanel = () => {
      const offline = getOfflineNodes();
      const allNodes = net.nodes ? [...net.nodes.values()] : [];
      backupBox.innerHTML = `
        <div style="font-size:11px;color:#c9b6ff;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
          ⚡ Network Status
        </div>
        <div style="font-size:12px;color:#8aa6b4;margin-bottom:6px;">
          Online: <span style="color:#46f0c0">${allNodes.length - offline.length}/${allNodes.length}</span>
        </div>
        ${offline.length > 0 ? `
          <div style="font-size:11px;color:#ff6b6b;margin-bottom:8px;">Offline: ${offline.map(n => n.label).join(', ')}</div>
        ` : '<div style="font-size:11px;color:#46f0c0;margin-bottom:8px;">All buildings online ✔</div>'}
        <div style="font-size:10px;color:#8aa6b4;margin-top:8px;">Tap a node on the canvas to add a backup link from it.</div>
        <div style="font-size:10px;color:#c9b6ff;margin-top:4px;">Backup links added: <strong>${backupLinksAdded}</strong></div>
      `;
    };

    canvas.addEventListener('click', e => {
      const node = renderer.hitTestNode(net, e.clientX, e.clientY);
      if (!node) return;

      if (selectedNode === null) {
        selectedNode = node.id;
        instr.el.innerHTML = `
          <div style="color:#c9b6ff;font-weight:700;">Selected: ${node.label}</div>
          <div style="font-size:12px;color:#8aa6b4;">Tap another node to add a backup link.</div>
        `;
      } else {
        if (selectedNode === node.id) { selectedNode = null; return; }
        // Add backup link if not already exists
        const exists = [...net.edges.values()].some(e =>
          (e.a === selectedNode && e.b === node.id) || (e.a === node.id && e.b === selectedNode)
        );
        if (!exists) {
          net.addEdge({ a: selectedNode, b: node.id, capacity: 3, up: true });
          backupLinksAdded++;
          assessment.record('backup_path_activated', { moduleId: 4 });
          ceLog.push(
            `Added backup link: ${net.getNode(selectedNode)?.label} ↔ ${node.label}`,
            'These buildings now have a second path if the primary fails',
            'Redundancy: a backup path means one failure doesn\'t isolate a building'
          );
          conseq.explain('backup_path_used');
          renderBackupPanel();
        }
        selectedNode = null;
      }
    });

    const STEPS = [
      { action: '👀 Study the network — identify single points of failure.', why: 'A single point of failure is a node whose removal disconnects the network.' },
      { action: '⚡ STORM! Towers are failing. Add backup links to keep buildings online.', why: 'Redundancy: having a second path so one failure doesn\'t cascade.' },
      { action: '🔗 Tap two nodes to add a backup link between them.', why: 'Every critical building should have at least two paths to the data centre.' },
      { action: 'Keep adding backup links until all critical buildings are online.', why: 'A resilient network tolerates failures gracefully — it degrades, not collapses.' },
    ];

    const setStep = (n, label) => {
      const s = STEPS[n - 1];
      instr.el.innerHTML = `
        <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:6px;">${s.action}</div>
        <div style="font-size:12px;color:#8aa6b4;line-height:1.5;">${s.why}</div>
      `;
      steps.update(n, 4, label);
    };
    setStep(1, 'Study the network');

    const loop = new SimLoop({
      ticksPerSecond: 15,
      onTick: (dt) => {
        tick++;
        twin.update(dt);
        twinUI.update(twin.scores);

        if (!crisisFired && tick === 40) {
          crisisFired = true;
          crisisUI.show('🌩️ Storm — towers failing!');
          setStep(2, 'Add backup links!');
          // Fail some links
          const downLinks = mod.crisisEvent?.downLinks || [];
          downLinks.forEach(([a, b]) => {
            const edge = net.getEdge(a, b);
            if (edge) {
              edge.up = false;
              assessment.record('single_point_failure_fixed', { moduleId: 4 });
              ceLog.push(
                `Tower link ${a}↔${b} went offline`,
                'Buildings that only used this path are now isolated',
                'Single point of failure: one broken link can disconnect many nodes'
              );
              conseq.explain('tower_failed');
            }
          });
          renderBackupPanel();
          setStep(3, 'Add backup links!');
        }

        const offline = getOfflineNodes();
        const criticalOffline = offline.filter(n => n.type === 'hospital' || n.type === 'emergency');

        if (!goalMet && crisisFired && criticalOffline.length === 0 && backupLinksAdded >= 1) {
          goalMet = true;
          loop.pause();
          assessment.record('graceful_degradation', { moduleId: 4 });
          assessment.snapshot('after_module_4');
          assessment.save(ASSESSMENT_KEY);

          instr.el.innerHTML = `
            <strong style="color:#c9b6ff;font-size:16px;">✔ City survived the storm!</strong><br>
            <span style="color:#e0f4ec">Critical services stayed online with ${backupLinksAdded} backup link${backupLinksAdded !== 1 ? 's' : ''}.</span>
          `;
          showConfetti();
          setTimeout(() => {
            showConceptReveal(canvasWrap, mod.conceptReveal, () => {
              this._runPostMission(mod, backupLinksAdded <= 2 ? 3 : 2, {
                accuracy: 'accurate',
                actual: `Survived with ${backupLinksAdded} backup links`,
                explanation: 'Redundancy keeps the city running when components fail. Every critical path needs a backup.',
              });
            });
          }, 1800);
        }
      },
      onRender: () => {
        renderer.render(net, pkts.getLiving(), {});
      },
    });

    renderBackupPanel();
    loop.start();

    this._addConceptPanel(sidePanel, {
      title: 'Redundancy',
      items: [
        { icon: '⚡', label: 'Single point of failure', desc: 'One node whose loss breaks the system' },
        { icon: '↔', label: 'Backup path', desc: 'A second route if the primary fails' },
        { icon: '◐', label: 'Graceful degradation', desc: 'System slows but keeps working' },
        { icon: '✔', label: 'Resilience', desc: 'Designed to survive failures' },
      ],
    });

    this._sim = { loop, twinUI, crisisUI, renderer, ceLog, conseq };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODULE 5 — Cyber Defense: Block malicious packets, avoid false positives
  // ══════════════════════════════════════════════════════════════════════════
  _launchCyberDefense(mod) {
    this._destroySim();
    const { canvas, canvasWrap, sidePanel } = makeGameScreen(this.app);

    const net    = new Network({
      nodes: mod.city?.nodes || [],
      edges: (mod.city?.links || []).map(l => ({ a: l.a, b: l.b, capacity: l.capacity ?? 4, up: true })),
    });
    const pkts   = new PacketSystem(net);
    const twin   = new CityTwin({ ...mod, city: mod.city || { nodes: [], links: [] } });
    const ceLog  = new CauseEffectLog(sidePanel);
    const conseq = new ConsequenceExplainer(canvasWrap);

    const renderer = new CanvasRenderer(canvas);
    const twinUI   = new TwinDashboard(sidePanel);
    const crisisUI = new CrisisBanner(canvasWrap);
    const instr    = makeInstructionBox(canvasWrap);
    const steps    = makeStepTracker(canvasWrap, 3);

    makeBackBtn(canvasWrap, () => { this._destroySim(); this.showModuleSelect(); });

    let crisisFired = false, goalMet = false, tick = 0;
    let blocked = 0, falsePositives = 0, attacksThrough = 0;
    const STREAM_SIZE = 10;

    // Packet stream state
    let stream = [];

    const REAL_PACKETS = [
      { label: 'Hospital vitals sync', source: 'Hospital', real: true },
      { label: 'Emergency dispatch msg', source: 'Fire Stn', real: true },
      { label: 'School attendance data', source: 'School', real: true },
      { label: 'Solar farm telemetry', source: 'Solar Farm', real: true },
      { label: 'Resident video call', source: 'Home', real: true },
    ];
    const FAKE_PACKETS = [
      { label: 'VIRUS: delete records', source: '???', real: false },
      { label: 'DDoS flood packet', source: 'UNKNOWN', real: false },
      { label: 'Spoofed hospital ping', source: '0.0.0.0', real: false },
      { label: 'Ransomware payload', source: 'EXTERNAL', real: false },
      { label: 'Credential theft probe', source: 'BOT-47', real: false },
    ];

    const spawnStream = (fakeRatio = 0.2) => {
      stream = [];
      for (let i = 0; i < STREAM_SIZE; i++) {
        const isFake = Math.random() < fakeRatio;
        const pool   = isFake ? FAKE_PACKETS : REAL_PACKETS;
        stream.push({ ...pool[Math.floor(Math.random() * pool.length)], id: Math.random(), decided: false });
      }
      renderStream();
    };

    const streamBox = document.createElement('div');
    streamBox.style.cssText = 'margin-top:12px;';
    sidePanel.appendChild(streamBox);

    const renderStream = () => {
      const pending = stream.filter(p => !p.decided);
      const blockedCount  = stream.filter(p => p.decided && p.decision === 'block').length;
      const allowedCount  = stream.filter(p => p.decided && p.decision === 'allow').length;
      streamBox.innerHTML = `
        <div style="font-size:11px;color:#ff6b6b;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
          ⊛ Packet Firewall
        </div>
        <div style="font-size:10px;color:#8aa6b4;margin-bottom:8px;">
          ✔ Allowed: ${allowedCount} &nbsp; ✕ Blocked: ${blockedCount} &nbsp; ⚠ False+: ${falsePositives}
        </div>
        <div style="font-size:10px;color:#8aa6b4;margin-bottom:6px;">Tap BLOCK or ALLOW for each packet:</div>
        <div id="stream-list" style="display:flex;flex-direction:column;gap:4px;max-height:200px;overflow-y:auto;"></div>
      `;
      const listEl = streamBox.querySelector('#stream-list');
      pending.slice(0, 5).forEach(pkt => {
        const row = document.createElement('div');
        row.style.cssText = `
          padding:8px;border-radius:6px;background:rgba(70,240,192,0.04);
          border:1px solid rgba(70,240,192,0.15);font-size:11px;color:#e0f4ec;
        `;
        row.innerHTML = `
          <div style="font-weight:700;margin-bottom:4px;">${pkt.label}</div>
          <div style="color:#8aa6b4;font-size:10px;margin-bottom:6px;">From: ${pkt.source}</div>
          <div style="display:flex;gap:6px;">
            <button class="pkt-allow" style="flex:1;padding:4px;border-radius:4px;background:rgba(70,240,192,0.1);border:1px solid #46f0c0;color:#46f0c0;cursor:pointer;font-size:11px;">✔ Allow</button>
            <button class="pkt-block" style="flex:1;padding:4px;border-radius:4px;background:rgba(255,107,107,0.1);border:1px solid #ff6b6b;color:#ff6b6b;cursor:pointer;font-size:11px;">✕ Block</button>
          </div>
        `;
        row.querySelector('.pkt-allow').addEventListener('click', () => {
          pkt.decided = true; pkt.decision = 'allow';
          if (!pkt.real) {
            attacksThrough++;
            assessment.record('attack_reached_target', { moduleId: 5 });
            ceLog.push('Allowed a malicious packet', 'It reached critical systems and caused disruption', 'False negative: the cost of under-filtering');
            conseq.explain('attack_reached_target');
          } else {
            assessment.record('malicious_blocked', { moduleId: 5 }); // inverted intentionally
          }
          renderStream();
        });
        row.querySelector('.pkt-block').addEventListener('click', () => {
          pkt.decided = true; pkt.decision = 'block';
          blocked++;
          if (pkt.real) {
            falsePositives++;
            assessment.record('false_positive', { moduleId: 5 });
            ceLog.push('Blocked a legitimate packet', 'A real service was disrupted — over-blocking has costs', 'False positive: security that harms the city it protects');
            conseq.explain('false_positive');
          } else {
            assessment.record('malicious_blocked', { moduleId: 5 });
            ceLog.push('Blocked malicious packet', 'Threat stopped before it reached critical systems', 'Firewall: inspects packets and applies block/allow rules');
            conseq.explain('malicious_blocked');
          }
          renderStream();
        });
        listEl.appendChild(row);
      });
      if (!pending.length) {
        listEl.innerHTML = `<div style="color:#46f0c0;font-size:11px;text-align:center;padding:8px;">Batch complete — new batch incoming</div>`;
      }
    };

    const STEPS = [
      { action: '👀 Incoming packets are arriving. Can you tell which are real and which are fake?', why: 'Clues: source address, packet label, unusual destinations.' },
      { action: '☠️ CYBER ATTACK! Malicious packets are flooding the network.', why: 'Block the fakes — but don\'t block real hospital or emergency messages!' },
      { action: '⊛ Use the firewall panel to allow or block each packet.', why: 'Every false positive (blocking a real packet) costs the city. Every miss (allowing a fake) causes damage.' },
    ];

    const setStep = (n, label) => {
      const s = STEPS[n - 1];
      instr.el.innerHTML = `
        <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:6px;">${s.action}</div>
        <div style="font-size:12px;color:#8aa6b4;line-height:1.5;">${s.why}</div>
      `;
      steps.update(n, 3, label);
    };
    setStep(1, 'Analyse packets');
    spawnStream(0.15);

    const loop = new SimLoop({
      ticksPerSecond: 15,
      onTick: (dt) => {
        tick++;
        twin.update(dt);
        twinUI.update(twin.scores);

        if (!crisisFired && tick === 30) {
          crisisFired = true;
          crisisUI.show('☠️ Cyber attack — spoofed packets detected!');
          setStep(2, 'Block the attacks!');
          spawnStream(mod.crisisEvent?.fakeRatio || 0.4);
        }

        if (crisisFired && tick % 60 === 0 && stream.filter(p => !p.decided).length === 0) {
          spawnStream(mod.crisisEvent?.fakeRatio || 0.35);
          setStep(3, 'New batch incoming');
        }

        const totalDecided = stream.filter(p => p.decided).length;
        const correctDecisions = stream.filter(p => p.decided && (
          (p.real && p.decision === 'allow') || (!p.real && p.decision === 'block')
        )).length;
        const accuracy = totalDecided ? correctDecisions / totalDecided : 0;

        if (crisisFired && !goalMet && totalDecided >= 15 && accuracy >= 0.7) {
          goalMet = true;
          loop.pause();
          assessment.record('false_positive_corrected', { moduleId: 5 });
          assessment.snapshot('after_module_5');
          assessment.save(ASSESSMENT_KEY);

          const score = Math.round(accuracy * 100);
          instr.el.innerHTML = `
            <strong style="color:#ff6b6b;font-size:16px;">✔ City defended!</strong><br>
            <span style="color:#e0f4ec">Accuracy: ${score}% — ${falsePositives} false positive${falsePositives !== 1 ? 's' : ''}, ${attacksThrough} attack${attacksThrough !== 1 ? 's' : ''} through.</span>
          `;
          showConfetti();
          setTimeout(() => {
            showConceptReveal(canvasWrap, mod.conceptReveal, () => {
              this._runPostMission(mod, score >= 85 ? 3 : score >= 70 ? 2 : 1, {
                accuracy: score >= 75 ? 'accurate' : 'close',
                actual: `Firewall accuracy: ${score}%`,
                explanation: 'Every security rule has a trade-off: block too much and real services fail; block too little and attacks get through.',
              });
            });
          }, 1800);
        }
      },
      onRender: () => {
        renderer.render(net, pkts.getLiving(), {});
      },
    });
    loop.start();

    this._addConceptPanel(sidePanel, {
      title: 'Cybersecurity',
      items: [
        { icon: '⊛', label: 'Firewall',        desc: 'Inspects and filters traffic by rules' },
        { icon: '✔', label: 'True positive',   desc: 'Correctly blocked a threat' },
        { icon: '⚠', label: 'False positive',  desc: 'Blocked something safe — costs the city' },
        { icon: '✕', label: 'False negative',  desc: 'Missed a threat — attack gets through' },
      ],
    });

    this._sim = { loop, twinUI, crisisUI, renderer, ceLog, conseq };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODULE 6 — Optimization: Population doubles, find and fix bottlenecks
  // ══════════════════════════════════════════════════════════════════════════
  _launchOptimization(mod) {
    this._destroySim();
    const { canvas, canvasWrap, sidePanel } = makeGameScreen(this.app);

    const net    = new Network({
      nodes: mod.city?.nodes || [],
      edges: (mod.city?.links || []).map(l => ({ a: l.a, b: l.b, capacity: l.capacity ?? 4, up: true })),
    });
    const pkts   = new PacketSystem(net);
    const cong   = new CongestionControl(net, pkts);
    const twin   = new CityTwin({ ...mod, city: mod.city || { nodes: [], links: [] } });
    const ceLog  = new CauseEffectLog(sidePanel);
    const conseq = new ConsequenceExplainer(canvasWrap);

    const renderer = new CanvasRenderer(canvas);
    const twinUI   = new TwinDashboard(sidePanel);
    const crisisUI = new CrisisBanner(canvasWrap);
    const instr    = makeInstructionBox(canvasWrap);
    const steps    = makeStepTracker(canvasWrap, 4);

    makeBackBtn(canvasWrap, () => { this._destroySim(); this.showModuleSelect(); });

    let crisisFired = false, goalMet = false, tick = 0;
    let upgradesApplied = 0;

    const senderNodes = (mod.city?.nodes || []).filter(n => n.type === 'residential');
    senderNodes.forEach(n => cong.initSender(n.id, 0.3));

    // Upgrade panel
    const upgradeBox = document.createElement('div');
    upgradeBox.style.cssText = 'margin-top:12px;';
    sidePanel.appendChild(upgradeBox);

    const renderUpgradePanel = () => {
      const edges = [...net.edges.values()];
      const busy  = edges.filter(e => (e.load || 0) > 0.6).sort((a, b) => (b.load || 0) - (a.load || 0));
      upgradeBox.innerHTML = `
        <div style="font-size:11px;color:#7fd8ff;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
          ⊙ Bottleneck Analysis
        </div>
        <div style="font-size:10px;color:#8aa6b4;margin-bottom:6px;">Tap a congested link to upgrade its capacity:</div>
        <div id="upgrade-list" style="display:flex;flex-direction:column;gap:4px;"></div>
        <div style="margin-top:8px;font-size:10px;color:#8aa6b4;">Upgrades applied: <span style="color:#7fd8ff;font-weight:700;">${upgradesApplied}</span></div>
      `;
      const listEl = upgradeBox.querySelector('#upgrade-list');
      if (!busy.length) {
        listEl.innerHTML = '<div style="color:#46f0c0;font-size:11px;">No bottlenecks detected ✔</div>';
        return;
      }
      busy.slice(0, 4).forEach(edge => {
        const nodeA = net.getNode(edge.a);
        const nodeB = net.getNode(edge.b);
        const load  = Math.round((edge.load || 0) * 100);
        const row   = document.createElement('div');
        row.style.cssText = `
          padding:8px;border-radius:6px;
          background:rgba(127,216,255,0.05);
          border:1px solid rgba(127,216,255,0.2);
          font-size:11px;color:#e0f4ec;cursor:pointer;
        `;
        row.innerHTML = `
          <div style="font-weight:700;color:${load > 80 ? '#ff6b6b' : '#ffb454'};">${load}% load</div>
          <div style="color:#8aa6b4;font-size:10px;">${nodeA?.label || '?'} ↔ ${nodeB?.label || '?'}</div>
          <button class="upgrade-btn" style="margin-top:6px;width:100%;padding:4px;border-radius:4px;background:rgba(127,216,255,0.1);border:1px solid #7fd8ff;color:#7fd8ff;cursor:pointer;font-size:10px;">
            ↑ Upgrade Capacity (cap: ${edge.capacity} → ${edge.capacity + 2})
          </button>
        `;
        row.querySelector('.upgrade-btn').addEventListener('click', () => {
          edge.capacity += 2;
          upgradesApplied++;
          assessment.record('efficient_route_chosen', { moduleId: 6 });
          assessment.record('load_balanced_optimally', { moduleId: 6 });
          ceLog.push(
            `Upgraded link ${nodeA?.label} ↔ ${nodeB?.label}`,
            `Capacity increased from ${edge.capacity - 2} to ${edge.capacity} — that bottleneck can now handle more traffic`,
            'Horizontal scaling: adding capacity to the most constrained resource'
          );
          conseq.explain('load_balanced');
          renderUpgradePanel();
        });
        listEl.appendChild(row);
      });
    };

    const STEPS = [
      { action: '👀 Study the network load. Which links are closest to their limit?', why: 'A bottleneck is any link where load approaches 100% — it limits the whole city.' },
      { action: '📈 POPULATION DOUBLED! Traffic surged everywhere.', why: 'Find the links that went red first — those are your critical bottlenecks.' },
      { action: '⊙ Use the panel to upgrade the most congested links.', why: 'Fix the bottleneck first — it gives the biggest improvement per upgrade.' },
      { action: 'Keep upgrading until performance recovers.', why: 'Algorithmic thinking: identify, prioritise, and optimise the highest-impact change.' },
    ];

    const setStep = (n, label) => {
      const s = STEPS[n - 1];
      instr.el.innerHTML = `
        <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:6px;">${s.action}</div>
        <div style="font-size:12px;color:#8aa6b4;line-height:1.5;">${s.why}</div>
      `;
      steps.update(n, 4, label);
    };
    setStep(1, 'Analyse the network');

    const loop = new SimLoop({
      ticksPerSecond: 15,
      onTick: (dt) => {
        tick++;

        senderNodes.forEach(s => {
          const node = net.getNode(s.id);
          if (!node) return;
          const sender = cong.getSender(s.id);
          const rate   = (sender ? sender.rate : 0.3) * (crisisFired ? 2.5 : 1);
          node._txAccum = (node._txAccum || 0) + rate / 15;
          while (node._txAccum >= 1) {
            node._txAccum--;
            const dcs = [...net.nodes.values()].filter(n => n.type === 'datacenter');
            if (dcs.length) pkts.spawn(s.id, dcs[0].id);
          }
        });

        pkts.tick(dt);
        pkts.tickLoads();
        cong.tick();
        twin.update(dt);
        twinUI.update(twin.scores);

        if (!crisisFired && tick === 50) {
          crisisFired = true;
          crisisUI.show('📈 Population doubled overnight!');
          setStep(2, 'Find the bottlenecks!');
          assessment.record('bottleneck_detected', { moduleId: 6 });
          conseq.explain('bottleneck_detected');
          setStep(3, 'Upgrade bottlenecks');
        }

        if (tick % 20 === 0) renderUpgradePanel();

        // Goal: performance recovers (drops decline)
        const drops = pkts.stats?.dropped || 0;
        const ratio = twin.getConnectivityRatio();
        if (crisisFired && !goalMet && upgradesApplied >= 3 && drops < 5 && ratio > 0.7) {
          goalMet = true;
          loop.pause();
          assessment.record('repair_prioritised', { moduleId: 6 });
          assessment.snapshot('after_module_6');
          assessment.save(ASSESSMENT_KEY);

          instr.el.innerHTML = `
            <strong style="color:#7fd8ff;font-size:16px;">✔ City optimised!</strong><br>
            <span style="color:#e0f4ec">${upgradesApplied} upgrade${upgradesApplied !== 1 ? 's' : ''} applied — performance restored.</span>
          `;
          showConfetti();
          setTimeout(() => {
            showConceptReveal(canvasWrap, mod.conceptReveal, () => {
              this._runPostMission(mod, upgradesApplied <= 4 ? 3 : 2, {
                accuracy: 'accurate',
                actual: `${upgradesApplied} upgrades restored performance`,
                explanation: 'Fixing the bottleneck first gives the most gain — that\'s the core of algorithmic thinking.',
              });
            });
          }, 1800);
        }
      },
      onRender: () => {
        renderer.render(net, pkts.getLiving(), {});
      },
    });
    loop.start();

    this._addConceptPanel(sidePanel, {
      title: 'Optimization',
      items: [
        { icon: '⊙', label: 'Bottleneck', desc: 'The slowest link limits everything' },
        { icon: '↑',  label: 'Scaling',   desc: 'Adding capacity to handle more load' },
        { icon: '⊛', label: 'Profiling',  desc: 'Finding which part is slowest first' },
        { icon: '⚖', label: 'Trade-off',  desc: 'Every upgrade has cost vs. benefit' },
      ],
    });

    this._sim = { loop, twinUI, crisisUI, renderer, ceLog, conseq };
  }

  // ── Post-mission flow: reflection → results → report ──────────────────
  _runPostMission(mod, stars, outcomeData) {
    // 1. Resolve prediction
    if (this._prediction) {
      const accuracy = outcomeData?.accuracy || 'close';
      assessment.resolvePrediction(mod.id, outcomeData, accuracy);
    }

    // 2. Show reflection phase
    const reflContainer = document.createElement('div');
    reflContainer.style.cssText = 'position:absolute;inset:0;background:#04101a;overflow-y:auto;z-index:200;';
    this.app.appendChild(reflContainer);

    const reflPhase = new ReflectionPhase(reflContainer, mod.id, outcomeData, (answers) => {
      // Score reflection
      const answered = Object.values(answers).filter(a => a?.text?.trim().length > 20).length;
      if (answered >= 2) {
        assessment.record('cause_identified_correctly', { moduleId: mod.id });
        assessment.record('tradeoff_acknowledged', { moduleId: mod.id });
      }
      assessment.save(ASSESSMENT_KEY);

      reflContainer.remove();

      // 3. Show comparison if we have a prediction
      if (this._prediction && outcomeData) {
        const compContainer = document.createElement('div');
        compContainer.style.cssText = 'position:absolute;inset:0;background:#04101a;overflow-y:auto;z-index:200;';
        this.app.appendChild(compContainer);

        showPredictionComparison(compContainer, this._prediction, outcomeData, () => {
          compContainer.remove();
          this._endModule(mod, stars, answers);
        });
      } else {
        this._endModule(mod, stars, answers);
      }
    });
    reflPhase.render();
  }

  // ── End a module ──────────────────────────────────────────────────────────
  _endModule(mod, stars, reflectionAnswers = {}) {
    const prev = this.progress.moduleStars[mod.id] || 0;
    this.progress.moduleStars[mod.id] = Math.max(prev, stars);
    if (stars >= 2 && !(this.progress.completedModules || []).includes(mod.id)) {
      this.progress.completedModules = [...(this.progress.completedModules || []), mod.id];
    }
    if (this._prediction) this.progress.predictions[mod.id] = this._prediction;
    if (reflectionAnswers) this.progress.reflections[mod.id] = reflectionAnswers;
    saveProgress(this.progress);
    this._prediction = null;

    // Show results, then offer to view the full report
    renderResults(this.app, {
      stars,
      stats: null,
      conceptReveal: null,
      isCity: true,
      onNext:   () => this._checkShowReport(),
      onRetry:  () => this.launchModule(mod.id),
      onReport: () => this.showReport(),
    });
  }

  _checkShowReport() {
    const completed = (this.progress.completedModules || []).length;
    if (completed >= 6) {
      this.showReport();
    } else {
      this.showModuleSelect();
    }
  }

  showReport() {
    this._destroySim();
    const report = assessment.generateReport();
    renderReport(this.app, report, () => this.showModuleSelect());
  }

  // ── Coming-soon shell for modules not yet mapped ──────────────────────
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
      <div style="font-size:14px;color:#8aa6b4;max-width:340px;text-align:center;line-height:1.6;">${mod.subtitle}</div>
      <div style="background:rgba(70,240,192,0.05);border:1px solid rgba(70,240,192,0.2);
        border-radius:12px;padding:16px 24px;max-width:340px;text-align:center;margin-top:8px;">
        <div style="font-size:10px;color:#46f0c0;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Concept you'll learn</div>
        <div style="font-size:15px;color:#e0f4ec;">${mod.concept}</div>
      </div>
      <div style="font-size:13px;color:#8aa6b4;margin-top:8px;">Coming in next update</div>
    `;
    const backBtn = document.createElement('button');
    backBtn.textContent = '◀ Back to Missions';
    backBtn.style.cssText = `
      margin-top:16px;background:rgba(70,240,192,0.1);border:1px solid rgba(70,240,192,0.3);
      color:#46f0c0;border-radius:100px;padding:12px 28px;font-size:14px;cursor:pointer;
    `;
    backBtn.addEventListener('click', () => { this._destroySim(); this.showModuleSelect(); });
    wrap.appendChild(backBtn);
    this.app.appendChild(wrap);
    this._sim = {};
  }

  // ── Concept glossary panel ────────────────────────────────────────────────
  _addConceptPanel(container, { title, items }) {
    const box = document.createElement('div');
    box.style.cssText = 'margin-top:auto;padding-top:12px;border-top:1px solid rgba(70,240,192,0.12);';
    box.innerHTML = `<div style="font-size:9px;color:#46f0c0;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">◈ ${title}</div>`;
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
    this._sim.ceLog?.destroy?.();
    this._sim.conseq?.destroy?.();
    this._sim = null;
  }

  showTeacher()  { this._destroySim(); renderTeacher(this.app,  { progress: this.progress, assessment, onBack: () => this.showHome(), onReport: () => this.showReport() }); }
  showSettings() { this._destroySim(); renderSettings(this.app, { onBack: () => this.showHome(), onResetAssessment: () => { assessment.reset(); assessment.save(ASSESSMENT_KEY); } }); }
}

const game = new Game();
game.start();

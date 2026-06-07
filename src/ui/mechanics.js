import { Queue, PriorityQueue } from '../engine/queue.js';
import { Stack } from '../engine/stack.js';
import { Reassembly } from '../engine/reassembly.js';
import { Firewall } from '../engine/firewall.js';
import { Sim } from '../engine/sim.js';
import { speech } from './speech.js';
import { renderResults } from './screens.js';
import { makeChrome } from './screens.js';

function el(tag, cls, html = '') {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}
function btn(cls, text, fn) {
  const b = el('button', cls, text);
  b.addEventListener('click', fn);
  return b;
}

function calcStars(errors, thresholds) {
  // thresholds = [3star_maxErrors, 2star_maxErrors]
  if (errors <= thresholds[0]) return 3;
  if (errors <= thresholds[1]) return 2;
  return 1;
}

// ── Base action-bar (mission + CTA) ─────────────────────────────────────
function makeActionBar({ mission, ctaText, ctaDisabled, onUndo, onCta }) {
  const bar = el('div', 'action-bar');
  const strip = el('div', 'mission-strip');

  const missionEl = el('div', 'mission-text body', mission);
  strip.appendChild(missionEl);

  const ticks = el('div', 'tick-counter', '0 ticks');
  strip.appendChild(ticks);
  bar.appendChild(strip);

  const row = el('div', 'action-row');
  const undoBtn = btn('btn btn-ghost', '↩ Undo', onUndo);
  const ctaBtn = btn('btn btn-primary', ctaText, onCta);
  if (ctaDisabled) ctaBtn.disabled = true;

  row.appendChild(undoBtn);
  row.appendChild(ctaBtn);
  bar.appendChild(row);

  return { bar, ticks, ctaBtn, missionEl };
}

// ── Routing level ─────────────────────────────────────────────────────────
export function playRouteLevel({ app, level, graph, worldConceptReveal, onDone, onBack }) {
  app.innerHTML = '';
  const s = el('div', 'screen-game screen-enter');
  s.style.position = 'relative';
  s.appendChild(makeChrome(onBack));

  const mapArea = el('div', 'map-area');
  s.appendChild(mapArea);

  const pkt = level.packets[0];
  const { bar, ticks, ctaBtn } = makeActionBar({
    mission: level.prompt,
    ctaText: 'Send ▸',
    ctaDisabled: true,
    onUndo: () => { cityMap.undoStep(); },
    onCta:  () => sendPacket(),
  });
  s.appendChild(bar);
  app.appendChild(s);

  const { CityMap } = await_import();
  const cityMap = new CityMap(mapArea, graph, { interactive: true, showCost: true, ambientPackets: true });

  cityMap.onRouteChange = (route) => {
    const cost = cityMap.routeCost();
    ticks.textContent = cityMap.isValid() ? `${cost} ticks` : '— ticks';
    ctaBtn.disabled = !cityMap.isValid();
  };

  speech.instruct(level.prompt);

  let sending = false;
  async function sendPacket() {
    if (sending) return;
    sending = true;
    ctaBtn.disabled = true;

    if (level.liveTraffic) {
      setTimeout(() => {
        graph.shiftTraffic();
        cityMap.refreshRoads();
      }, 600);
    }

    const playerCost = cityMap.routeCost();
    await cityMap.animatePacket(pkt.emoji);

    const optimal = graph.dijkstra(
      level.nodes.find(n => n.type === 'home').id,
      level.nodes.find(n => n.type === 'server').id
    );
    const optCost  = optimal?.distance ?? playerCost;
    const delta    = playerCost - optCost;
    const [d3, d2] = level.scoring.starsByOptimumDelta;
    const stars = delta <= d3 ? 3 : delta <= d2 ? 2 : 1;

    renderResults(app, {
      stars, playerCost, optimalCost: optCost,
      conceptReveal: worldConceptReveal,
      isRouting: true,
      onNext:  () => onDone(stars),
      onRetry: () => playRouteLevel({ app, level, graph, worldConceptReveal, onDone, onBack }),
    });
  }
}

// ── Queue level ───────────────────────────────────────────────────────────
export function playQueueLevel({ app, level, worldConceptReveal, onDone, onBack }) {
  const isPriority = level.mechanics.includes('priority');
  const queue = isPriority ? new PriorityQueue() : new Queue();
  let errors = 0;
  let released = [];
  let pendingIdx = 0;
  let timerLeft = level.timerTicks || 30;
  let timerInterval = null;

  app.innerHTML = '';
  const s = el('div', 'screen-queue screen-enter');
  s.style.position = 'relative';
  s.appendChild(makeChrome(onBack));

  const split = el('div', 'queue-split');

  // Left: simple city art
  const mapDiv = el('div', 'queue-map');
  mapDiv.style.background = 'linear-gradient(180deg, #e3f2fd 0%, #fdf6e3 100%)';
  mapDiv.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;opacity:.7;font-size:48px">
      <span>🏠</span><span style="font-size:24px">↕</span><span>📡</span><span style="font-size:24px">↕</span><span>🖥️</span>
    </div>
  `;
  split.appendChild(mapDiv);

  // Right: queue panel
  const panel = el('div', 'queue-panel');
  const qTitle = el('div', 'queue-title', isPriority ? '🚑 Priority Queue' : '📬 Message Queue');
  const timerEl = el('div', 'subtitle', `⏱ ${timerLeft}s`);
  timerEl.style.cssText = 'text-align:center;font-size:20px;color:#e65100';
  const qLane  = el('div', 'queue-lane');
  const relBtn  = btn('btn btn-primary', 'Release Front ▸', () => releasePacket());
  relBtn.style.marginTop = 'auto';

  panel.appendChild(qTitle);
  panel.appendChild(timerEl);
  panel.appendChild(qLane);
  panel.appendChild(relBtn);
  split.appendChild(panel);
  s.appendChild(split);
  app.appendChild(s);

  function renderQueue() {
    qLane.innerHTML = '';
    queue.items.forEach((pkt, i) => {
      const chip = el('div', `queue-chip${i === 0 ? ' front' : ''}${pkt.priority >= 3 ? ' urgent' : ''}`);
      chip.innerHTML = `<span class="queue-chip-icon">${pkt.emoji}</span><span class="queue-chip-label">${pkt.label}</span><span class="queue-chip-pos">#${i+1}</span>`;
      if (isPriority && i > 0) {
        chip.draggable = true;
        chip.addEventListener('dragstart', e => e.dataTransfer.setData('idx', i));
        chip.addEventListener('dragover',  e => { e.preventDefault(); chip.style.background='#e3f2fd'; });
        chip.addEventListener('dragleave', () => chip.style.background='');
        chip.addEventListener('drop',      e => {
          e.preventDefault(); chip.style.background='';
          const from = parseInt(e.dataTransfer.getData('idx'));
          queue.moveUp(from);
          renderQueue();
        });
      }
      qLane.appendChild(chip);
    });
  }

  function releasePacket() {
    const pkt = queue.releaseCorrect();
    if (!pkt) return;
    released.push(pkt);
    renderQueue();
    if (queue.length === 0 && pendingIdx >= level.packets.length) finish();
  }

  function enqueueNext() {
    if (pendingIdx >= level.packets.length) return;
    queue.enqueue(level.packets[pendingIdx++]);
    renderQueue();
  }

  // drip packets in
  level.packets.forEach((pkt, i) => {
    setTimeout(() => enqueueNext(), i * 800);
  });

  timerInterval = setInterval(() => {
    timerLeft--;
    timerEl.textContent = `⏱ ${timerLeft}s`;
    if (timerLeft <= 0) finish();
  }, 1000);

  speech.instruct(level.prompt);

  function finish() {
    clearInterval(timerInterval);
    // count ordering errors for priority mode
    if (isPriority) {
      errors = queue.computeScore?.(released) ?? errors;
    }
    const t = level.scoring.starsByErrors;
    const stars = calcStars(errors, [t[0], t[1]]);
    renderResults(app, {
      stars, playerCost: errors, optimalCost: 0,
      conceptReveal: worldConceptReveal,
      isRouting: false,
      onNext:  () => onDone(stars),
      onRetry: () => playQueueLevel({ app, level, worldConceptReveal, onDone, onBack }),
    });
  }
}

// ── Stack level ───────────────────────────────────────────────────────────
export function playStackLevel({ app, level, worldConceptReveal, onDone, onBack }) {
  const stack = new Stack();
  let errors = 0;
  const mode = level.mode; // 'pack' | 'unpack' | 'both'
  let phase = mode === 'unpack' ? 'unpack' : 'pack';

  // pre-fill stack for unpack mode
  if (phase === 'unpack') {
    level.envelopes.forEach(e => stack.push(e));
  }

  app.innerHTML = '';
  const s = el('div', 'screen-stack screen-enter');
  s.style.position = 'relative';
  s.appendChild(makeChrome(onBack));

  const arena = el('div', 'stack-arena');

  // Source envelopes (pack phase)
  const sourceDiv = el('div', 'source-envelopes');
  const sourceTitle = el('div', 'caption', 'Drag to pack ↓');
  sourceDiv.appendChild(sourceTitle);
  const sourceEnvEls = {};

  if (phase === 'pack' || mode === 'both') {
    level.envelopes.forEach(env => {
      const envEl = el('div', 'source-env');
      envEl.innerHTML = `<span>${env.emoji}</span><span>${env.label}</span>`;
      envEl.setAttribute('data-id', env.id);
      envEl.addEventListener('click', () => pushEnvelope(env));
      sourceDiv.appendChild(envEl);
      sourceEnvEls[env.id] = envEl;
    });
  }

  // Stack zone
  const stackZone = el('div', 'stack-zone');
  const stackLabel = el('div', 'stack-zone-label', phase === 'pack' ? 'Stack here' : 'Tap top to unpack');
  stackZone.appendChild(stackLabel);

  arena.appendChild(sourceDiv);
  arena.appendChild(stackZone);
  s.appendChild(arena);

  // Action bar
  const bar = el('div', 'action-bar');
  const missionEl = el('div', 'mission-text body', level.prompt);
  bar.appendChild(missionEl);
  s.appendChild(bar);
  app.appendChild(s);

  renderStack();
  speech.instruct(level.prompt);

  function renderStack() {
    // remove all envelope els (keep label)
    Array.from(stackZone.querySelectorAll('.envelope')).forEach(e => e.remove());

    stack.items.forEach((env, i) => {
      const isTop = i === stack.items.length - 1;
      const envEl = el('div', `envelope${isTop ? ' top' : ' locked'}`);
      envEl.innerHTML = `<span>${env.emoji}</span><span>${env.label}</span>${isTop ? '<span style="margin-left:auto;font-size:11px;color:#90a4ae">👆 tap</span>' : ''}`;
      if (phase === 'unpack' || (mode === 'both' && phase === 'unpack')) {
        envEl.addEventListener('click', () => popEnvelope(env.id));
      }
      stackZone.appendChild(envEl);
    });
  }

  function pushEnvelope(env) {
    sourceEnvEls[env.id]?.classList.add('used');
    stack.push(env);
    renderStack();
    if (stack.length === level.envelopes.length) {
      if (mode === 'both') { phase = 'unpack'; stackLabel.textContent = 'Now unpack it!'; speech.speak('Now unpack it! Tap the top envelope.'); }
      else finish();
    }
  }

  function popEnvelope(envId) {
    const result = stack.tryPop(envId);
    if (!result.ok) {
      errors++;
      const lockedEl = stackZone.querySelector('.locked');
      lockedEl?.classList.add('shake');
      setTimeout(() => lockedEl?.classList.remove('shake'), 400);
      speech.speak('Tap the top one first!');
    }
    renderStack();
    if (stack.length === 0 && (phase === 'unpack' || mode === 'both')) finish();
  }

  function finish() {
    const t = level.scoring.starsByErrors;
    const stars = calcStars(errors, [t[0], t[1]]);
    renderResults(app, {
      stars, playerCost: errors, optimalCost: 0,
      conceptReveal: worldConceptReveal,
      isRouting: false,
      onNext:  () => onDone(stars),
      onRetry: () => playStackLevel({ app, level, worldConceptReveal, onDone, onBack }),
    });
  }
}

// ── Reassembly level ──────────────────────────────────────────────────────
export function playReassemblyLevel({ app, level, worldConceptReveal, onDone, onBack }) {
  const engine = new Reassembly(level.fragments, level.scrambledOrder);

  app.innerHTML = '';
  const s = el('div', 'screen-reassembly screen-enter');
  s.style.position = 'relative';
  s.appendChild(makeChrome(onBack));

  const arena = el('div', 'reassembly-arena');

  const prompt = el('p', 'body', level.prompt);
  arena.appendChild(prompt);

  // Fragment tray (scrambled)
  const tray = el('div', 'fragments-tray');
  engine.scrambled.forEach(frag => {
    const f = el('div', 'fragment');
    f.innerHTML = `<span>${frag.emoji}</span><span>${frag.label}</span>`;
    f.setAttribute('data-id', frag.id);
    f.draggable = true;
    f.addEventListener('dragstart', e => {
      e.dataTransfer.setData('fragId', frag.id);
      f.style.opacity = '.4';
    });
    f.addEventListener('dragend', () => f.style.opacity = '');
    tray.appendChild(f);
  });
  arena.appendChild(tray);

  // Slots row
  const slotsRow = el('div', 'slots-row');
  level.fragments.forEach((_, i) => {
    const slot = el('div', 'slot', `${i + 1}`);
    slot.setAttribute('data-slot', i);
    slot.addEventListener('dragover',  e => { e.preventDefault(); slot.classList.add('drop-target'); });
    slot.addEventListener('dragleave', () => slot.classList.remove('drop-target'));
    slot.addEventListener('drop', e => {
      e.preventDefault();
      slot.classList.remove('drop-target');
      const fragId = parseInt(e.dataTransfer.getData('fragId'));
      const result = engine.place(fragId, i);
      if (result.ok) {
        const frag = level.fragments.find(f => f.id === fragId);
        slot.textContent = frag.label;
        slot.classList.add('filled');
        const fragEl = tray.querySelector(`[data-id="${fragId}"]`);
        fragEl?.classList.add('placed');
        if (engine.isComplete()) setTimeout(finish, 400);
      } else {
        slot.classList.add('wrong');
        setTimeout(() => slot.classList.remove('wrong'), 500);
      }
    });
    slotsRow.appendChild(slot);
  });
  arena.appendChild(slotsRow);

  s.appendChild(arena);
  app.appendChild(s);
  speech.instruct(level.prompt);

  function finish() {
    const t = level.scoring.starsByErrors;
    const stars = calcStars(engine.errors, [t[0], t[1]]);
    renderResults(app, {
      stars, playerCost: engine.errors, optimalCost: 0,
      conceptReveal: worldConceptReveal,
      isRouting: false,
      onNext:  () => onDone(stars),
      onRetry: () => playReassemblyLevel({ app, level, worldConceptReveal, onDone, onBack }),
    });
  }
}

// ── Firewall level ────────────────────────────────────────────────────────
export function playFirewallLevel({ app, level, worldConceptReveal, onDone, onBack }) {
  const fw = new Firewall(level.packets);

  app.innerHTML = '';
  const s = el('div', 'screen-firewall screen-enter');
  s.style.position = 'relative';
  s.appendChild(makeChrome(onBack));

  // Simple city backdrop
  const mapDiv = el('div', 'firewall-map');
  mapDiv.style.cssText = 'background:linear-gradient(180deg,#e3f2fd 0%,#fdf6e3 100%);display:flex;align-items:center;justify-content:center;font-size:60px;gap:24px';
  mapDiv.innerHTML = '🏠 → → 🛡️ → → 🖥️';
  s.appendChild(mapDiv);

  // Stream + status bar
  const bar = el('div', 'firewall-bar');
  bar.innerHTML = `<span style="font-size:20px">🛡️</span><span class="body" style="flex:1">${level.prompt}</span>`;
  const errEl = el('span', 'caption');
  bar.appendChild(errEl);
  s.appendChild(bar);
  app.appendChild(s);

  speech.instruct(level.prompt);

  let autoTimer;
  function showNext() {
    clearTimeout(autoTimer);
    const pkt = fw.currentPacket;
    if (!pkt || fw.done) { finish(); return; }

    // render packet in center
    let streamEl = mapDiv.querySelector('.stream-packet');
    if (!streamEl) {
      streamEl = el('div', `stream-packet ${pkt.real ? 'real' : 'fake'}`);
      streamEl.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:70px;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-size:32px;border:3px solid;';
      streamEl.style.borderColor = pkt.real ? 'var(--clear)' : 'var(--jam)';
      streamEl.style.background = pkt.real ? '#e8f5e9' : '#ffebee';
      mapDiv.appendChild(streamEl);
    }
    streamEl.textContent = pkt.emoji;
    streamEl.className = `stream-packet ${pkt.real ? 'real' : 'fake'}`;

    streamEl.onclick = () => {
      const result = fw.block();
      const flash = el('div', 'blocked-flash');
      streamEl.appendChild(flash);
      setTimeout(() => flash.remove(), 400);
      errEl.textContent = `Errors: ${fw.errors}`;
      setTimeout(showNext, 350);
    };

    // auto-advance after streamSpeed ms (passing the packet)
    autoTimer = setTimeout(() => {
      fw.pass();
      errEl.textContent = `Errors: ${fw.errors}`;
      showNext();
    }, level.streamSpeed || 2000);
  }

  showNext();

  function finish() {
    clearTimeout(autoTimer);
    const t = level.scoring.starsByErrors;
    const stars = calcStars(fw.errors, [t[0], t[1]]);
    renderResults(app, {
      stars, playerCost: fw.errors, optimalCost: 0,
      conceptReveal: worldConceptReveal,
      isRouting: false,
      onNext:  () => onDone(stars),
      onRetry: () => playFirewallLevel({ app, level, worldConceptReveal, onDone, onBack }),
    });
  }
}

// ── Sandbox ───────────────────────────────────────────────────────────────
export function playSandbox({ app, level, onBack }) {
  const { Graph } = await_import_graph();
  let graph;
  try { graph = new (require_graph())(level.nodes, level.edges); } catch(_) {}

  app.innerHTML = '';
  const s = el('div', 'screen-sandbox screen-enter');
  s.style.position = 'relative';

  const hud = el('div', 'sandbox-hud');
  const backBtn = el('button', 'btn btn-ghost', '← Back');
  backBtn.addEventListener('click', onBack);

  const healthLabel = el('span', 'caption', '🏙️ City Health');
  const healthContainer = el('div', 'health-bar-container');
  const healthFill = el('div', 'health-bar-fill');
  healthFill.style.width = '100%';
  healthContainer.appendChild(healthFill);

  const scoreEl = el('div', 'sandbox-score', 'Score: 0');
  const eventEl = el('div', 'event-ticker', 'City is running...');

  hud.appendChild(backBtn);
  hud.appendChild(healthLabel);
  hud.appendChild(healthContainer);
  hud.appendChild(scoreEl);
  hud.appendChild(eventEl);
  s.appendChild(hud);

  const mapArea = el('div', 'map-area', '');
  mapArea.style.flex = '1';
  s.appendChild(mapArea);
  app.appendChild(s);

  // city map
  let cityMap;
  if (level.nodes && level.edges) {
    const { Graph } = { Graph: window.__Graph__ };
    // dynamic import handled by main.js, just show map
    mapArea.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:64px;opacity:.5;flex-direction:column;gap:12px">🏙️<div class="caption">City sandbox — ${level.prompt}</div></div>`;
  }

  const sim = new Sim(level, ({ health, score, event }) => {
    healthFill.style.width = health + '%';
    healthFill.style.background = health > 50 ? 'linear-gradient(90deg,#4caf50,#00c853)' : health > 25 ? 'linear-gradient(90deg,#ff9800,#ffc107)' : 'linear-gradient(90deg,#f44336,#ff5722)';
    scoreEl.textContent = `Score: ${score}`;
    if (event) { eventEl.textContent = event; speech.speak(event, { volume: 0.6 }); }
    if (health <= 0) gameOver();
  });

  sim.start();
  speech.instruct('Keep the city running! Handle jams and emergencies.');

  function gameOver() {
    const overlay = el('div', 'overlay-backdrop');
    overlay.innerHTML = `
      <div class="result-card">
        <div style="font-size:48px">🏙️</div>
        <div class="result-verdict">City shut down!</div>
        <div class="result-stats">Final Score: ${sim.score}</div>
        <div class="concept-card">
          <div class="concept-label">💡 You learned</div>
          <div class="concept-text">That's systems thinking — every choice ripples through the whole city!</div>
        </div>
      </div>
    `;
    const actions = el('div', 'result-actions');
    actions.style.cssText = 'display:flex;gap:10px;margin-top:20px;padding:0 32px 32px';
    actions.appendChild(el('button', 'btn btn-ghost', '← Back'));
    actions.querySelector('button').addEventListener('click', () => { overlay.remove(); onBack(); });
    const tryAgain = el('button', 'btn btn-primary', '↩ Try Again');
    tryAgain.addEventListener('click', () => { overlay.remove(); playSandbox({ app, level, onBack }); });
    actions.appendChild(tryAgain);
    overlay.querySelector('.result-card').appendChild(actions);
    app.appendChild(overlay);
    speech.speak(`City shut down! Final score: ${sim.score}. That's systems thinking!`);
  }
}

// helper — dynamic import shim (Vite handles real imports at top of file)
function await_import() { return { CityMap: window.__CityMap__ }; }
function await_import_graph() { return { Graph: window.__Graph__ }; }
function require_graph() { return window.__Graph__; }

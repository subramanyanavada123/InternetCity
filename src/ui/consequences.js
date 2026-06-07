// Consequence Explainer — real-time "why did that just happen?" panel
// Every visible event in the simulation gets a plain-language cause→effect card.

import { speech } from './speech.js';

// Map simulation events to plain-language explanations for age 10-14
export const CONSEQUENCE_LIBRARY = {
  // Network / Connectivity
  link_activated: {
    title: 'New Link Active',
    cause: 'You connected two buildings',
    effect: 'Data can now travel between them',
    concept: 'Each connection is an "edge" in a graph. More edges = more possible paths.',
    severity: 'positive',
  },
  link_failed: {
    title: 'Link Went Down',
    cause: 'A link failed (storm / overload)',
    effect: 'All traffic using that path must reroute — or drop',
    concept: 'Failure propagates: one broken link affects every route that used it.',
    severity: 'warning',
  },
  node_isolated: {
    title: 'Building Cut Off',
    cause: 'No active links reach this building',
    effect: 'It can\'t send or receive any data',
    concept: 'An isolated node in a graph has degree 0 — completely unreachable.',
    severity: 'danger',
  },
  packets_dropping: {
    title: 'Packets Dropping',
    cause: 'A link\'s queue is full',
    effect: 'New packets that arrive have nowhere to wait — they\'re lost',
    concept: 'When demand > capacity, queues overflow. Dropped packets must be resent.',
    severity: 'danger',
  },
  congestion_forming: {
    title: 'Congestion Building',
    cause: 'More packets are arriving than the link can carry',
    effect: 'Packets queue up — delays grow — some will drop',
    concept: 'Congestion = demand exceeding supply. It self-reinforces without intervention.',
    severity: 'warning',
  },
  reroute_applied: {
    title: 'Traffic Rerouted',
    cause: 'You changed a router\'s forwarding rule',
    effect: 'Packets now take a different path through the network',
    concept: 'Routers follow rules, not instinct. Changing a rule changes all future traffic instantly.',
    severity: 'positive',
  },
  emergency_degraded: {
    title: 'Emergency Services Slowing',
    cause: 'Their network link is overloaded by other traffic',
    effect: 'Hospital and fire station response times are increasing',
    concept: 'Without traffic priority, critical services compete equally with casual traffic.',
    severity: 'danger',
  },
  emergency_restored: {
    title: 'Emergency Services Stable',
    cause: 'You freed up bandwidth on their path',
    effect: 'Critical traffic is flowing normally again',
    concept: 'Prioritisation works: protecting the most important traffic keeps the city safe.',
    severity: 'positive',
  },
  // Priority
  high_priority_delivered: {
    title: 'Emergency Packet Delivered',
    cause: 'You gave it top priority',
    effect: 'It skipped the queue and arrived on time',
    concept: 'Priority queues: process by importance, not just arrival order.',
    severity: 'positive',
  },
  low_priority_starved: {
    title: 'Low-Priority Traffic Waiting',
    cause: 'High-priority traffic is using all the bandwidth',
    effect: 'Normal packets are stuck in queue — starvation is starting',
    concept: 'Starvation: low-priority tasks may never run if high-priority ones never stop.',
    severity: 'warning',
  },
  // Redundancy
  tower_failed: {
    title: 'Tower Offline',
    cause: 'Storm damage took out a signal tower',
    effect: 'All buildings that only connected through it are now isolated',
    concept: 'Single point of failure: one node whose loss disconnects many others.',
    severity: 'danger',
  },
  backup_path_used: {
    title: 'Backup Path Active',
    cause: 'Primary link failed — secondary path exists',
    effect: 'Traffic automatically shifted to the backup route',
    concept: 'Redundancy: having a second path so one failure doesn\'t break the system.',
    severity: 'positive',
  },
  no_backup_available: {
    title: 'No Backup Path',
    cause: 'The failed link was the only route',
    effect: 'Buildings on that segment are now offline with no alternative',
    concept: 'This is why engineers always ask: "What happens if this fails?"',
    severity: 'danger',
  },
  // Cyber
  malicious_blocked: {
    title: 'Threat Blocked',
    cause: 'You identified and blocked a malicious packet',
    effect: 'It never reached its target — attack prevented',
    concept: 'Firewall: a gate that inspects packets and applies allow/block rules.',
    severity: 'positive',
  },
  false_positive: {
    title: 'Legitimate Packet Blocked',
    cause: 'A real packet matched your block rule too closely',
    effect: 'A real service was disrupted — the city is paying for over-blocking',
    concept: 'False positive: the cost of security that is too aggressive.',
    severity: 'warning',
  },
  attack_reached_target: {
    title: 'Attack Got Through',
    cause: 'A malicious packet wasn\'t blocked in time',
    effect: 'Critical systems are being disrupted',
    concept: 'False negative: the cost of security that is too lenient.',
    severity: 'danger',
  },
  // Optimization
  bottleneck_detected: {
    title: 'Bottleneck Detected',
    cause: 'All traffic is funnelling through one narrow link',
    effect: 'That link is limiting the whole network\'s performance',
    concept: 'Bottleneck: the slowest point limits the entire system\'s throughput.',
    severity: 'warning',
  },
  load_balanced: {
    title: 'Load Balanced',
    cause: 'Traffic is now spread across multiple links',
    effect: 'No single link is overwhelmed — overall throughput increased',
    concept: 'Load balancing: distribute work so no single resource is overloaded.',
    severity: 'positive',
  },
};

export class ConsequenceExplainer {
  constructor(container) {
    this._container = container;
    this._queue = [];
    this._showing = false;
    this._el = this._buildEl();
    container.appendChild(this._el);
  }

  _buildEl() {
    const el = document.createElement('div');
    el.className = 'consequence-panel';
    el.innerHTML = `
      <div class="conseq-header">
        <span class="conseq-title">◈ Why Is This Happening?</span>
        <button class="conseq-dismiss" title="Dismiss">✕</button>
      </div>
      <div class="conseq-body" id="conseq-body">
        <div class="conseq-idle">Actions you take will be explained here in real time.</div>
      </div>
    `;
    el.querySelector('.conseq-dismiss').addEventListener('click', () => this._clear());
    return el;
  }

  // Trigger an explanation by key
  explain(eventKey, overrides = {}) {
    const base = CONSEQUENCE_LIBRARY[eventKey];
    if (!base) return;
    const data = { ...base, ...overrides };
    this._show(data);
  }

  // Show raw explanation without library lookup
  explainRaw(cause, effect, concept, severity = 'info') {
    this._show({ cause, effect, concept, severity, title: '' });
  }

  _show(data) {
    this._queue.push(data);
    if (!this._showing) this._flush();
  }

  _flush() {
    if (!this._queue.length) { this._showing = false; return; }
    this._showing = true;
    const data = this._queue.shift();

    const body = this._el.querySelector('#conseq-body');
    const severityClass = {
      positive: 'conseq-positive',
      warning:  'conseq-warning',
      danger:   'conseq-danger',
      info:     '',
    }[data.severity] || '';

    body.innerHTML = `
      <div class="conseq-card ${severityClass}">
        ${data.title ? `<div class="conseq-card-title">${data.title}</div>` : ''}
        <div class="conseq-cause-row">
          <span class="conseq-row-label">Cause</span>
          <span class="conseq-row-text">${data.cause}</span>
        </div>
        <div class="conseq-arrow">↓</div>
        <div class="conseq-effect-row">
          <span class="conseq-row-label">Effect</span>
          <span class="conseq-row-text">${data.effect}</span>
        </div>
        <div class="conseq-concept">◈ ${data.concept}</div>
      </div>
    `;

    // Auto-clear after 6 seconds, then show next
    this._timer = setTimeout(() => this._flush(), 6000);
  }

  _clear() {
    clearTimeout(this._timer);
    this._queue = [];
    this._showing = false;
    const body = this._el.querySelector('#conseq-body');
    body.innerHTML = `<div class="conseq-idle">Actions you take will be explained here in real time.</div>`;
  }

  destroy() { clearTimeout(this._timer); this._el?.remove(); }
}

// Trade-off card: shown when a player makes a decision with visible costs/benefits
export class TradeoffCard {
  constructor(container) {
    this._container = container;
  }

  show({ decision, benefits, costs, ethicalNote, onAcknowledge }) {
    const overlay = document.createElement('div');
    overlay.className = 'tradeoff-overlay';

    const benefitsHtml = benefits.map(b => `<li class="tradeoff-benefit">✔ ${b}</li>`).join('');
    const costsHtml    = costs.map(c => `<li class="tradeoff-cost">✕ ${c}</li>`).join('');

    overlay.innerHTML = `
      <div class="tradeoff-card">
        <div class="tradeoff-eyebrow">⚖ Engineering Trade-Off</div>
        <div class="tradeoff-decision">${decision}</div>
        <div class="tradeoff-columns">
          <div class="tradeoff-col">
            <div class="tradeoff-col-label gains">Benefits</div>
            <ul class="tradeoff-list">${benefitsHtml}</ul>
          </div>
          <div class="tradeoff-col">
            <div class="tradeoff-col-label costs">Costs</div>
            <ul class="tradeoff-list">${costsHtml}</ul>
          </div>
        </div>
        ${ethicalNote ? `<div class="tradeoff-ethical">◈ ${ethicalNote}</div>` : ''}
        <button class="btn btn-primary tradeoff-ok" style="width:100%;margin-top:16px;">
          I Understand the Trade-Off ▶
        </button>
      </div>
    `;

    overlay.querySelector('.tradeoff-ok').addEventListener('click', () => {
      overlay.remove();
      onAcknowledge?.();
    });
    this._container.appendChild(overlay);
    speech.coach(`Engineering trade-off: ${decision}`);
  }
}

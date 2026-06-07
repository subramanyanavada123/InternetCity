// Reflection Phase UI — post-simulation cause-and-effect reasoning capture
// Shown after every module outcome before the results screen.

import { speech } from './speech.js';
import { assessment, DIMENSIONS } from '../engine/assessment.js';

// Per-module reflection prompts — Socratic, open-ended, age 10-14
const MODULE_REFLECTIONS = {
  1: {
    title: 'What Did You Observe?',
    prompts: [
      {
        id: 'cause',
        label: 'What happened when you added a link between two buildings?',
        placeholder: 'e.g. "When I connected the hospital to the tower, it turned green and data started flowing..."',
        dimension: DIMENSIONS.SYSTEMS,
      },
      {
        id: 'effect',
        label: 'Which connection made the biggest difference? Why?',
        placeholder: 'e.g. "Connecting the central tower first unlocked three buildings at once..."',
        dimension: DIMENSIONS.ENGINEERING,
      },
      {
        id: 'tradeoff',
        label: 'Did you have to choose between two buildings to connect? How did you decide?',
        placeholder: 'e.g. "I had to choose between the school and the hospital — I chose the hospital because it\'s more critical..."',
        dimension: DIMENSIONS.ETHICS,
      },
    ],
    causeEffect: [
      { cause: 'You connected a hub (tower)', effect: 'Multiple buildings went online at once — hubs multiply reach', concept: 'Hubs have higher degree in graph terms — one node connecting to many' },
      { cause: 'You connected two buildings directly', effect: 'A new path appeared in the network', concept: 'Every new edge creates new potential routes for data' },
    ],
  },
  2: {
    title: 'What Did You Observe?',
    prompts: [
      {
        id: 'cause',
        label: 'What happened to the network when the festival traffic surged?',
        placeholder: 'e.g. "The links turned red and packets started dropping — the queue filled up..."',
        dimension: DIMENSIONS.SYSTEMS,
      },
      {
        id: 'reroute',
        label: 'When you rerouted a router, what changed in the network?',
        placeholder: 'e.g. "The hospital packets found a different path and the drops went down..."',
        dimension: DIMENSIONS.ENGINEERING,
      },
      {
        id: 'tradeoff',
        label: 'Did rerouting help some parts of the network while hurting others? What trade-off did you make?',
        placeholder: 'e.g. "Rerouting the hospital freed it up, but the residential area got even more congested..."',
        dimension: DIMENSIONS.OPTIMIZATION,
      },
    ],
    causeEffect: [
      { cause: 'Festival traffic surged', effect: 'Links filled to capacity — queues grew — packets dropped', concept: 'Congestion: when demand exceeds capacity, queues overflow and data is lost' },
      { cause: 'You rerouted a router', effect: 'Traffic moved to a less busy path', concept: 'Dynamic routing: changing paths in response to network conditions' },
    ],
  },
  3: {
    title: 'What Did You Observe?',
    prompts: [
      {
        id: 'triage',
        label: 'What happened when you gave emergency calls the highest priority?',
        placeholder: 'e.g. "They got through even when everything else was congested..."',
        dimension: DIMENSIONS.ETHICS,
      },
      {
        id: 'fairness',
        label: 'Was it fair to let lower-priority traffic wait? Who decided what was "high priority"?',
        placeholder: 'e.g. "It feels unfair to regular patients, but emergency cases really can\'t wait..."',
        dimension: DIMENSIONS.ETHICS,
      },
      {
        id: 'tradeoff',
        label: 'What\'s the cost of always putting emergencies first?',
        placeholder: 'e.g. "Low-priority tasks could wait forever if emergencies never stop..."',
        dimension: DIMENSIONS.OPTIMIZATION,
      },
    ],
    causeEffect: [
      { cause: 'You raised a packet\'s priority', effect: 'It skipped the queue and arrived first', concept: 'Priority queues: items aren\'t processed in arrival order — importance matters' },
      { cause: 'Low-priority packets waited', effect: 'They eventually starved if high-priority traffic never stopped', concept: 'Starvation: a real problem in priority systems when low-priority work never runs' },
    ],
  },
  4: {
    title: 'What Did You Observe?',
    prompts: [
      {
        id: 'failure',
        label: 'When towers failed, which buildings went offline? Why those specific ones?',
        placeholder: 'e.g. "The buildings that only connected through Tower N went offline because they had no other path..."',
        dimension: DIMENSIONS.SYSTEMS,
      },
      {
        id: 'backup',
        label: 'Which connections saved the network? What made them useful?',
        placeholder: 'e.g. "The backup link between Router W and Router E kept the hospital running..."',
        dimension: DIMENSIONS.RESILIENCE,
      },
      {
        id: 'design',
        label: 'If you could redesign the network to survive this storm, what would you change?',
        placeholder: 'e.g. "I would give every critical building at least two different paths to the data centre..."',
        dimension: DIMENSIONS.ENGINEERING,
      },
    ],
    causeEffect: [
      { cause: 'A tower with many connections failed', effect: 'All buildings only connected through it went offline', concept: 'Single point of failure: one critical node whose failure breaks the whole system' },
      { cause: 'A building had two paths available', effect: 'It survived the tower failure by switching to the backup', concept: 'Redundancy: having a backup so one failure doesn\'t cascade' },
    ],
  },
  5: {
    title: 'What Did You Observe?',
    prompts: [
      {
        id: 'detection',
        label: 'How did you tell which packets were fake? What clues did you use?',
        placeholder: 'e.g. "The fake ones came from unknown sources and had strange patterns..."',
        dimension: DIMENSIONS.ENGINEERING,
      },
      {
        id: 'false_positive',
        label: 'Did you accidentally block any real packets? How did that affect the city?',
        placeholder: 'e.g. "I blocked some hospital messages by mistake — their uptime dropped..."',
        dimension: DIMENSIONS.ETHICS,
      },
      {
        id: 'tradeoff',
        label: 'What\'s the trade-off between blocking everything suspicious vs. letting some fake ones through?',
        placeholder: 'e.g. "If I block everything suspicious, real messages get blocked too. If I\'m too lenient, fake packets get through..."',
        dimension: DIMENSIONS.OPTIMIZATION,
      },
    ],
    causeEffect: [
      { cause: 'You blocked a packet correctly', effect: 'A threat was stopped before it reached critical systems', concept: 'Firewall: a gate that inspects and filters traffic by defined rules' },
      { cause: 'You blocked a legitimate packet', effect: 'A real service was disrupted — false positive cost', concept: 'False positive: blocking something safe. Too many = security that harms the city it protects' },
    ],
  },
  6: {
    title: 'What Did You Observe?',
    prompts: [
      {
        id: 'bottleneck',
        label: 'Where did the network break first when population doubled? Why there?',
        placeholder: 'e.g. "The links near the data centre broke first because all traffic eventually passes through them..."',
        dimension: DIMENSIONS.SYSTEMS,
      },
      {
        id: 'fix',
        label: 'What upgrade made the most difference? Why?',
        placeholder: 'e.g. "Adding a parallel link to the data centre doubled throughput..."',
        dimension: DIMENSIONS.OPTIMIZATION,
      },
      {
        id: 'design',
        label: 'What would you design differently from the start so the city could scale?',
        placeholder: 'e.g. "I would design with spare capacity from the beginning, not just fix problems as they appear..."',
        dimension: DIMENSIONS.ENGINEERING,
      },
    ],
    causeEffect: [
      { cause: 'Population doubled', effect: 'Bottlenecks appeared at high-traffic choke points', concept: 'Scalability: a system\'s ability to handle growing demand gracefully' },
      { cause: 'You added a parallel link', effect: 'Throughput doubled on that segment', concept: 'Horizontal scaling: adding capacity alongside existing infrastructure' },
    ],
  },
};

export class ReflectionPhase {
  constructor(container, moduleId, simulationOutcome, onComplete) {
    this._container = container;
    this._moduleId = moduleId;
    this._outcome = simulationOutcome;
    this._onComplete = onComplete;
    this._answers = {};
  }

  render() {
    const data = MODULE_REFLECTIONS[this._moduleId];
    if (!data) { this._onComplete({}); return; }

    const overlay = document.createElement('div');
    overlay.className = 'prediction-overlay';

    const causeEffectHtml = data.causeEffect.map(ce => `
      <div class="ce-row">
        <div class="ce-cause">
          <div class="ce-label">You did</div>
          <div class="ce-text">${ce.cause}</div>
        </div>
        <div class="ce-arrow">→</div>
        <div class="ce-effect">
          <div class="ce-label">This happened</div>
          <div class="ce-text">${ce.effect}</div>
        </div>
        <div class="ce-concept">
          <div class="ce-label">The concept</div>
          <div class="ce-text concept-highlight">${ce.concept}</div>
        </div>
      </div>
    `).join('');

    overlay.innerHTML = `
      <div class="reflection-card">
        <div class="prediction-eyebrow">◈ ${data.title}</div>

        <div class="reflection-ce-section">
          <div class="reflection-section-title">Cause → Effect</div>
          ${causeEffectHtml}
        </div>

        <div class="reflection-prompts" id="refl-prompts"></div>

        <div class="reflection-progress">
          <span id="refl-progress-text">Answer at least 1 question to continue</span>
        </div>
        <button id="refl-done" class="btn btn-primary" style="width:100%;margin-top:12px;" disabled>
          Save My Observations ▶
        </button>
      </div>
    `;

    const promptsEl = overlay.querySelector('#refl-prompts');
    const doneBtn   = overlay.querySelector('#refl-done');
    const progressEl = overlay.querySelector('#refl-progress-text');

    data.prompts.forEach((prompt, idx) => {
      const section = document.createElement('div');
      section.className = 'reflection-prompt-block';
      section.innerHTML = `
        <div class="reflection-prompt-label">
          <span class="reflection-prompt-num">${idx + 1}</span>
          ${prompt.label}
        </div>
        <textarea
          class="prediction-textarea reflection-textarea"
          placeholder="${prompt.placeholder}"
          maxlength="500"
          rows="3"
          data-id="${prompt.id}"
          data-dimension="${prompt.dimension}"
        ></textarea>
        <div class="reflection-char-count"><span class="refl-chars">0</span>/500</div>
      `;
      const ta = section.querySelector('textarea');
      const chars = section.querySelector('.refl-chars');
      ta.addEventListener('input', () => {
        this._answers[prompt.id] = { text: ta.value, dimension: prompt.dimension };
        chars.textContent = ta.value.length;

        const answered = Object.values(this._answers).filter(a => a.text.trim().length > 0).length;
        const total = data.prompts.length;
        if (answered >= 1) {
          doneBtn.disabled = false;
          progressEl.textContent = answered >= total
            ? `All ${total} questions answered ✔`
            : `${answered}/${total} answered`;
        }

        // Score reflection quality
        if (ta.value.trim().length > 30) {
          assessment.record('reflection_submitted', { moduleId: this._moduleId, promptId: prompt.id });
        }
      });
      promptsEl.appendChild(section);
    });

    doneBtn.addEventListener('click', () => {
      overlay.remove();
      this._onComplete(this._answers);
    });

    this._container.appendChild(overlay);
    setTimeout(() => speech.coach(`Great work! Now let's understand what just happened in your city.`), 400);
  }
}

// Standalone cause-effect explainer for real-time use (shown in side panel during play)
export class CauseEffectLog {
  constructor(container) {
    this._container = container;
    this._entries = [];
    this._el = null;
    this._render();
  }

  _render() {
    this._el = document.createElement('div');
    this._el.className = 'ce-log';
    this._el.innerHTML = `
      <div class="ce-log-title">◈ Why Is This Happening?</div>
      <div class="ce-log-entries" id="ce-entries">
        <div class="ce-log-empty">Actions you take will be explained here.</div>
      </div>
    `;
    this._container.appendChild(this._el);
  }

  push(cause, effect, concept) {
    this._entries.unshift({ cause, effect, concept, ts: Date.now() });
    const entriesEl = this._el.querySelector('#ce-entries');
    const empty = entriesEl.querySelector('.ce-log-empty');
    if (empty) empty.remove();

    const item = document.createElement('div');
    item.className = 'ce-log-item ce-log-item-enter';
    item.innerHTML = `
      <div class="ce-log-cause">▶ ${cause}</div>
      <div class="ce-log-arrow">↓</div>
      <div class="ce-log-effect">${effect}</div>
      <div class="ce-log-concept">◈ ${concept}</div>
    `;
    entriesEl.insertBefore(item, entriesEl.firstChild);

    // Keep only last 5
    while (entriesEl.children.length > 5) {
      entriesEl.removeChild(entriesEl.lastChild);
    }
  }

  destroy() { this._el?.remove(); }
}

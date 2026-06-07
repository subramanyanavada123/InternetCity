// Prediction Phase UI — shown before every simulation runs
// Captures student's hypothesis: what will happen and why?

import { speech } from './speech.js';

// Per-module prediction prompts, calibrated for age 10-14
const MODULE_PROMPTS = {
  1: {
    question: 'Before you connect anything — what do you think will happen to the city if some buildings are not connected to the network?',
    options: [
      { id: 'a', text: 'Only the disconnected buildings will have a problem', icon: '○' },
      { id: 'b', text: 'The whole network could slow down or fail', icon: '◈' },
      { id: 'c', text: 'Nothing — the other buildings will be fine', icon: '▣' },
      { id: 'd', text: 'The disconnected buildings will find their own path', icon: '⟳' },
    ],
    followUp: 'Why do you think that? (explain in your own words)',
    followUpPlaceholder: 'e.g. "I think if one building is cut off, it can\'t send messages to anyone..."',
    hint: 'Think about what happens to a group chat when someone loses their phone signal.',
  },
  2: {
    question: 'A city festival is about to start. Thousands of people will start streaming videos at the same time. What do you predict will happen to the hospital\'s network connection?',
    options: [
      { id: 'a', text: 'It will slow down because it shares links with everyone else', icon: '⟳' },
      { id: 'b', text: 'It will stay fast — it\'s a hospital, so it\'s protected', icon: '⊕' },
      { id: 'c', text: 'It will speed up because fewer people are using it normally', icon: '↑' },
      { id: 'd', text: 'It will crash completely and never recover', icon: '✕' },
    ],
    followUp: 'What would you do to protect the hospital\'s connection?',
    followUpPlaceholder: 'e.g. "I would give the hospital its own private path so other traffic can\'t block it..."',
    hint: 'Imagine a motorway where ambulances and regular cars share the same lanes.',
  },
  3: {
    question: 'The hospital network is overwhelmed. Emergency calls, regular patients, and admin tasks all need bandwidth right now. What do you think should happen first?',
    options: [
      { id: 'a', text: 'Emergency calls first — they could be life or death', icon: '⊛' },
      { id: 'b', text: 'Process them in order — fairness is most important', icon: '⟳' },
      { id: 'c', text: 'Admin tasks first — the backlog is biggest', icon: '⊞' },
      { id: 'd', text: 'Regular patients first — there are more of them', icon: '⌂' },
    ],
    followUp: 'What rule did you use to decide the order? Is it always fair?',
    followUpPlaceholder: 'e.g. "I picked emergencies first because a delay could mean someone dies, but it might not be fair to regular patients..."',
    hint: 'Think about how a hospital emergency room works when it\'s full.',
  },
  4: {
    question: 'A storm is about to knock out two of the city\'s signal towers. What do you predict will happen to buildings that relied on those towers?',
    options: [
      { id: 'a', text: 'They\'ll go offline — they have no other way to connect', icon: '✕' },
      { id: 'b', text: 'They\'ll automatically find a different path', icon: '⟳' },
      { id: 'c', text: 'The whole city will go offline at once', icon: '◈' },
      { id: 'd', text: 'The city will slow down but keep working', icon: '↓' },
    ],
    followUp: 'How would you design the network so it survives when towers fail?',
    followUpPlaceholder: 'e.g. "I would make sure every building has at least two different paths to the data centre..."',
    hint: 'Think about a road network — if one road closes, can you still get to your destination?',
  },
  5: {
    question: 'Fake data packets are spreading through the city network, pretending to be real messages. What do you think is the hardest part of stopping them?',
    options: [
      { id: 'a', text: 'Knowing which ones are fake without blocking real ones', icon: '⊛' },
      { id: 'b', text: 'Finding them fast enough before they cause damage', icon: '⟳' },
      { id: 'c', text: 'Blocking them all — even if some real messages get blocked too', icon: '✕' },
      { id: 'd', text: 'Getting everyone to agree on what is "fake"', icon: '◈' },
    ],
    followUp: 'What would you use to tell the difference between a real and fake packet?',
    followUpPlaceholder: 'e.g. "I would check where it came from and if it matches a known address..."',
    hint: 'Think about spam email — how does your inbox decide what\'s junk?',
  },
  6: {
    question: 'The city\'s population has just doubled overnight. The same network must serve twice as many people. What do you predict will break first?',
    options: [
      { id: 'a', text: 'The links near the data centre — everything goes through there', icon: '▣' },
      { id: 'b', text: 'The links to residential areas — there are most people there', icon: '⌂' },
      { id: 'c', text: 'Nothing breaks — networks just slow down gradually', icon: '↓' },
      { id: 'd', text: 'The hospital and emergency links — they need the most bandwidth', icon: '⊕' },
    ],
    followUp: 'How would you upgrade the network to handle twice the traffic?',
    followUpPlaceholder: 'e.g. "I would add more parallel links near the data centre and increase capacity on the busiest routes..."',
    hint: 'Think about what happens when a new neighbourhood is built next to a busy road.',
  },
};

export class PredictionPhase {
  constructor(container, moduleId, onComplete) {
    this._container = container;
    this._moduleId = moduleId;
    this._onComplete = onComplete;
    this._prediction = null;
    this._reasoning = '';
  }

  render() {
    const prompt = MODULE_PROMPTS[this._moduleId];
    if (!prompt) { this._onComplete(null); return; }

    const overlay = document.createElement('div');
    overlay.className = 'prediction-overlay';

    overlay.innerHTML = `
      <div class="prediction-card">
        <div class="prediction-eyebrow">◈ Before You Begin — Make a Prediction</div>
        <div class="prediction-question">${prompt.question}</div>
        <div class="prediction-hint">💡 ${prompt.hint}</div>
        <div class="prediction-options" id="pred-options"></div>
        <div class="prediction-followup" id="pred-followup" style="display:none;">
          <div class="prediction-followup-label">${prompt.followUp}</div>
          <textarea
            id="pred-reasoning"
            class="prediction-textarea"
            placeholder="${prompt.followUpPlaceholder}"
            maxlength="400"
            rows="3"
          ></textarea>
          <div class="prediction-char-count"><span id="pred-chars">0</span>/400</div>
        </div>
        <button id="pred-confirm" class="btn btn-primary prediction-confirm" disabled>
          Lock in Prediction ▶
        </button>
        <div class="prediction-note">There is no wrong answer — your prediction helps you learn.</div>
      </div>
    `;

    const optionsEl = overlay.querySelector('#pred-options');
    prompt.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'prediction-option';
      btn.dataset.id = opt.id;
      btn.innerHTML = `<span class="pred-opt-icon">${opt.icon}</span><span class="pred-opt-text">${opt.text}</span>`;
      btn.addEventListener('click', () => {
        optionsEl.querySelectorAll('.prediction-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this._prediction = opt;
        overlay.querySelector('#pred-followup').style.display = 'block';
        overlay.querySelector('#pred-followup').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        overlay.querySelector('#pred-confirm').disabled = false;
        speech.coach(`Good choice. Now explain your thinking.`);
      });
      optionsEl.appendChild(btn);
    });

    const textarea = overlay.querySelector('#pred-reasoning');
    const charCount = overlay.querySelector('#pred-chars');
    textarea.addEventListener('input', () => {
      this._reasoning = textarea.value;
      charCount.textContent = textarea.value.length;
    });

    overlay.querySelector('#pred-confirm').addEventListener('click', () => {
      overlay.remove();
      this._onComplete({
        option: this._prediction,
        reasoning: this._reasoning,
        moduleId: this._moduleId,
        ts: Date.now(),
      });
    });

    this._container.appendChild(overlay);
    setTimeout(() => speech.coach(prompt.question), 600);
  }
}

// Helper: show the prediction vs outcome comparison card
export function showPredictionComparison(container, prediction, outcome, onDone) {
  if (!prediction) { onDone(); return; }

  const accuracy = outcome.accuracy; // 'accurate' | 'close' | 'wrong'
  const colors   = { accurate: '#46f0c0', close: '#ffb454', wrong: '#ff6b6b' };
  const icons    = { accurate: '✔', close: '◑', wrong: '✕' };
  const labels   = { accurate: 'Your prediction was accurate!', close: 'You were partly right.', wrong: 'Your prediction didn\'t match — that\'s how we learn.' };

  const overlay = document.createElement('div');
  overlay.className = 'prediction-overlay';
  overlay.innerHTML = `
    <div class="prediction-card">
      <div class="prediction-eyebrow">◈ Prediction vs Reality</div>
      <div class="pred-compare-row">
        <div class="pred-compare-col">
          <div class="pred-compare-label">You predicted</div>
          <div class="pred-compare-value">${prediction.option?.text || '—'}</div>
          ${prediction.reasoning ? `<div class="pred-compare-reasoning">"${prediction.reasoning}"</div>` : ''}
        </div>
        <div class="pred-compare-arrow">→</div>
        <div class="pred-compare-col">
          <div class="pred-compare-label">What happened</div>
          <div class="pred-compare-value">${outcome.actual}</div>
        </div>
      </div>
      <div class="pred-accuracy-badge" style="border-color:${colors[accuracy]};color:${colors[accuracy]};">
        ${icons[accuracy]} ${labels[accuracy]}
      </div>
      <div class="pred-explain-box">${outcome.explanation}</div>
      <button class="btn btn-primary" id="pred-next" style="margin-top:20px;width:100%;">
        Reflect on This ▶
      </button>
    </div>
  `;

  overlay.querySelector('#pred-next').addEventListener('click', () => {
    overlay.remove();
    onDone();
  });
  container.appendChild(overlay);
  speech.coach(labels[accuracy] + ' ' + outcome.explanation);
}

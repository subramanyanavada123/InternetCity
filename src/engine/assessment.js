// Assessment Engine — measures thinking dimensions from player actions
// Five dimensions, each 0–100. Scores grow from evidence, never from time.

export const DIMENSIONS = {
  SYSTEMS:     'systemsThinking',
  RESILIENCE:  'resilienceThinking',
  OPTIMIZATION:'optimizationThinking',
  ETHICS:      'ethicalReasoning',
  ENGINEERING: 'engineeringReasoning',
};

// Each event type maps to which dimension(s) it provides evidence for and how much
const EVIDENCE_MAP = {
  // Connectivity module
  'link_activated':            [{ d: DIMENSIONS.SYSTEMS,     w: 3 }, { d: DIMENSIONS.ENGINEERING, w: 2 }],
  'hub_used_efficiently':      [{ d: DIMENSIONS.OPTIMIZATION,w: 5 }, { d: DIMENSIONS.SYSTEMS,     w: 3 }],
  'redundant_path_created':    [{ d: DIMENSIONS.RESILIENCE,  w: 6 }, { d: DIMENSIONS.ENGINEERING, w: 3 }],
  'critical_node_connected':   [{ d: DIMENSIONS.ETHICS,      w: 4 }, { d: DIMENSIONS.ENGINEERING, w: 3 }],
  'isolated_cluster_joined':   [{ d: DIMENSIONS.SYSTEMS,     w: 5 }],
  // Congestion module
  'reroute_applied':           [{ d: DIMENSIONS.SYSTEMS,     w: 4 }, { d: DIMENSIONS.ENGINEERING, w: 3 }],
  'emergency_prioritised':     [{ d: DIMENSIONS.ETHICS,      w: 7 }, { d: DIMENSIONS.RESILIENCE,  w: 4 }],
  'bottleneck_identified':     [{ d: DIMENSIONS.SYSTEMS,     w: 5 }, { d: DIMENSIONS.OPTIMIZATION,w: 4 }],
  'load_balanced':             [{ d: DIMENSIONS.OPTIMIZATION,w: 6 }, { d: DIMENSIONS.ENGINEERING, w: 3 }],
  'drop_recovered_from':       [{ d: DIMENSIONS.RESILIENCE,  w: 5 }],
  // Priority module
  'triage_correct':            [{ d: DIMENSIONS.ETHICS,      w: 6 }, { d: DIMENSIONS.ENGINEERING, w: 4 }],
  'triage_incorrect':          [{ d: DIMENSIONS.ETHICS,      w: -3}],
  'priority_queue_mastered':   [{ d: DIMENSIONS.OPTIMIZATION,w: 7 }, { d: DIMENSIONS.ENGINEERING, w: 5 }],
  // Redundancy module
  'backup_path_activated':     [{ d: DIMENSIONS.RESILIENCE,  w: 8 }, { d: DIMENSIONS.SYSTEMS,     w: 4 }],
  'single_point_failure_fixed':[{ d: DIMENSIONS.RESILIENCE,  w: 7 }, { d: DIMENSIONS.ENGINEERING, w: 5 }],
  'graceful_degradation':      [{ d: DIMENSIONS.RESILIENCE,  w: 6 }, { d: DIMENSIONS.SYSTEMS,     w: 5 }],
  // Cyber module
  'malicious_blocked':         [{ d: DIMENSIONS.ETHICS,      w: 5 }, { d: DIMENSIONS.ENGINEERING, w: 4 }],
  'legitimate_blocked':        [{ d: DIMENSIONS.ETHICS,      w: -4}, { d: DIMENSIONS.ENGINEERING, w: -2}],
  'false_positive_corrected':  [{ d: DIMENSIONS.ETHICS,      w: 6 }, { d: DIMENSIONS.RESILIENCE,  w: 3 }],
  // Optimization module
  'efficient_route_chosen':    [{ d: DIMENSIONS.OPTIMIZATION,w: 6 }, { d: DIMENSIONS.ENGINEERING, w: 4 }],
  'load_balanced_optimally':   [{ d: DIMENSIONS.OPTIMIZATION,w: 7 }, { d: DIMENSIONS.SYSTEMS,     w: 4 }],
  'repair_prioritised':        [{ d: DIMENSIONS.ENGINEERING, w: 5 }, { d: DIMENSIONS.ETHICS,      w: 3 }],
  // Reflection / Prediction
  'prediction_accurate':       [{ d: DIMENSIONS.SYSTEMS,     w: 8 }, { d: DIMENSIONS.ENGINEERING, w: 5 }],
  'prediction_close':          [{ d: DIMENSIONS.SYSTEMS,     w: 4 }],
  'prediction_wrong':          [{ d: DIMENSIONS.SYSTEMS,     w: 1 }], // still evidence of engagement
  'reflection_submitted':      [{ d: DIMENSIONS.SYSTEMS,     w: 3 }, { d: DIMENSIONS.ENGINEERING, w: 3 }],
  'cause_identified_correctly':[{ d: DIMENSIONS.SYSTEMS,     w: 6 }, { d: DIMENSIONS.RESILIENCE,  w: 3 }],
  'tradeoff_acknowledged':     [{ d: DIMENSIONS.ENGINEERING, w: 5 }, { d: DIMENSIONS.OPTIMIZATION,w: 4 }],
};

export class AssessmentEngine {
  constructor() {
    this._scores = {
      [DIMENSIONS.SYSTEMS]:      50,
      [DIMENSIONS.RESILIENCE]:   50,
      [DIMENSIONS.OPTIMIZATION]: 50,
      [DIMENSIONS.ETHICS]:       50,
      [DIMENSIONS.ENGINEERING]:  50,
    };
    // raw evidence log for the report
    this._log = [];
    // per-module snapshots to show growth
    this._snapshots = [];
    // prediction tracking
    this._predictions = [];
    // decision log (what the student chose and why it matters)
    this._decisions = [];
  }

  // Record a thinking event. context = { moduleId, detail }
  record(eventType, context = {}) {
    const evidences = EVIDENCE_MAP[eventType];
    if (!evidences) return;

    const entry = { eventType, context, ts: Date.now(), delta: {} };

    for (const { d, w } of evidences) {
      const before = this._scores[d];
      // Weighted nudge: larger weights move needle more, but with diminishing returns near extremes
      const nudge = w * this._diminishingFactor(before, w);
      this._scores[d] = Math.max(0, Math.min(100, Math.round(before + nudge)));
      entry.delta[d] = this._scores[d] - before;
    }

    this._log.push(entry);
    this._decisions.push({ eventType, context, scores: this.snapshot() });
  }

  // Diminishing returns: hard to move near 0 or 100
  _diminishingFactor(current, weight) {
    if (weight > 0) {
      // Harder to increase near 100
      return 1 - (current / 140);
    } else {
      // Harder to decrease near 0
      return 1 - ((100 - current) / 140);
    }
  }

  // Record a prediction + the eventual outcome
  recordPrediction(prediction, moduleId) {
    this._predictions.push({ prediction, moduleId, ts: Date.now(), outcome: null });
  }

  resolvePrediction(moduleId, outcome, accuracy) {
    const pred = this._predictions.findLast(p => p.moduleId === moduleId && p.outcome === null);
    if (pred) {
      pred.outcome = outcome;
      pred.accuracy = accuracy; // 'accurate' | 'close' | 'wrong'
      this.record(`prediction_${accuracy}`, { moduleId });
    }
  }

  // Snapshot current scores (for growth tracking)
  snapshot(label = '') {
    const snap = { label, ts: Date.now(), scores: { ...this._scores } };
    if (label) this._snapshots.push(snap);
    return snap.scores;
  }

  // Full report data
  generateReport(studentName = '') {
    const scores = { ...this._scores };
    const predictions = this._predictions;
    const totalPredictions = predictions.length;
    const accuratePredictions = predictions.filter(p => p.accuracy === 'accurate').length;
    const closePredictions = predictions.filter(p => p.accuracy === 'close').length;
    const predictionAccuracy = totalPredictions
      ? Math.round(((accuratePredictions + closePredictions * 0.5) / totalPredictions) * 100)
      : null;

    const overallScore = Math.round(
      (scores[DIMENSIONS.SYSTEMS] * 0.30 +
       scores[DIMENSIONS.RESILIENCE] * 0.20 +
       scores[DIMENSIONS.OPTIMIZATION] * 0.20 +
       scores[DIMENSIONS.ETHICS] * 0.15 +
       scores[DIMENSIONS.ENGINEERING] * 0.15)
    );

    const strengths = this._topDimensions(scores, 2);
    const growthAreas = this._bottomDimensions(scores, 2);
    const decisionQuality = this._decisionQuality();

    return {
      studentName,
      generatedAt: Date.now(),
      overallScore,
      scores,
      predictionAccuracy,
      predictionCount: totalPredictions,
      predictions,
      strengths,
      growthAreas,
      decisionQuality,
      snapshots: this._snapshots,
      eventCount: this._log.length,
      narrative: this._generateNarrative(scores, predictionAccuracy, decisionQuality),
    };
  }

  _topDimensions(scores, n) {
    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, n)
      .map(([d]) => d);
  }

  _bottomDimensions(scores, n) {
    return Object.entries(scores)
      .sort(([, a], [, b]) => a - b)
      .slice(0, n)
      .map(([d]) => d);
  }

  _decisionQuality() {
    const relevant = this._log.filter(e => EVIDENCE_MAP[e.eventType]);
    if (!relevant.length) return 50;
    const positive = relevant.filter(e =>
      EVIDENCE_MAP[e.eventType].some(ev => ev.w > 0)
    ).length;
    return Math.round((positive / relevant.length) * 100);
  }

  _generateNarrative(scores, predictionAccuracy, decisionQuality) {
    const top = this._topDimensions(scores, 1)[0];
    const narratives = {
      [DIMENSIONS.SYSTEMS]:      'You see how everything connects — a true systems thinker.',
      [DIMENSIONS.RESILIENCE]:   'You design for failure first. That\'s what real engineers do.',
      [DIMENSIONS.OPTIMIZATION]: 'You look for the most efficient path, not just any path.',
      [DIMENSIONS.ETHICS]:       'You protect the people who need it most. Ethics and engineering go together.',
      [DIMENSIONS.ENGINEERING]:  'You experiment, observe, and adapt. That\'s the engineering mindset.',
    };
    let text = narratives[top] || 'You think like an engineer.';
    if (predictionAccuracy !== null && predictionAccuracy >= 70) {
      text += ' Your predictions were accurate — you\'re building strong mental models of complex systems.';
    } else if (predictionAccuracy !== null && predictionAccuracy >= 40) {
      text += ' Your predictions were partially right — keep testing your mental models against reality.';
    }
    if (decisionQuality >= 75) {
      text += ' Most of your decisions moved the city in a better direction.';
    }
    return text;
  }

  // Persist to localStorage
  save(key = 'futureos_assessment') {
    try {
      localStorage.setItem(key, JSON.stringify({
        scores: this._scores,
        log: this._log.slice(-200), // keep last 200 events
        predictions: this._predictions,
        snapshots: this._snapshots,
      }));
    } catch (_) {}
  }

  load(key = 'futureos_assessment') {
    try {
      const raw = JSON.parse(localStorage.getItem(key));
      if (!raw) return false;
      if (raw.scores) this._scores = { ...this._scores, ...raw.scores };
      if (raw.log) this._log = raw.log;
      if (raw.predictions) this._predictions = raw.predictions;
      if (raw.snapshots) this._snapshots = raw.snapshots;
      return true;
    } catch (_) { return false; }
  }

  reset() {
    this._scores = Object.fromEntries(Object.values(DIMENSIONS).map(d => [d, 50]));
    this._log = [];
    this._predictions = [];
    this._snapshots = [];
    this._decisions = [];
  }
}

// Singleton shared across the app
export const assessment = new AssessmentEngine();

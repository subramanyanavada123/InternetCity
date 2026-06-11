// Internationalisation — English + Kannada
// Usage: import { t, getLang, setLang } from './i18n.js';

const STRINGS = {
  en: {
    // Home screen
    'home.beginner': 'Beginner',
    'home.advanced': 'Advanced ✦',
    'home.tagline': 'Build the Future.',
    'home.progress': '{n} / 12 missions complete',
    'home.locked': '🔒 Complete previous',
    'home.module': 'MODULE',
    // Language toggle
    'lang.en': 'English',
    'lang.kn': 'ಕನ್ನಡ',
    // Common UI
    'btn.play': "Let's Play ▶",
    'btn.continue': 'Continue ▶',
    'btn.retry': 'Try Again ↺',
    'btn.back': '← Missions',
    'ui.learning': "💡 You're learning",
    'ui.mission': 'Mission',
    'ui.whatlearn': "💡 What you'll learn",
    'ui.complete': '◈ Mission Complete',
    // Module titles
    'm1.title': 'Delivery Kingdom',
    'm1.sub': '3 rounds · MST · Earthquake!',
    'm2.title': 'Water Park',
    'm2.sub': 'Pipes, gates & flow',
    'm3.title': 'Rocket Launch',
    'm3.sub': 'Sort rockets, save missions',
    'm4.title': 'Monster Attack',
    'm4.sub': 'Survive the stomp',
    'm5.title': 'Cyber Ninja',
    'm5.sub': 'Slash fakes, protect real',
    'm6.title': 'Traffic Hero',
    'm6.sub': 'Keep the city moving',
    'm7.title': 'Maze Post Office',
    'm7.sub': 'Find the shortest path',
    'm8.title': 'Tower of Babel',
    'm8.sub': 'Stack layers in order',
    'm9.title': 'Memory Palace',
    'm9.sub': 'Cache the right things',
    'm10.title': 'Relay Race',
    'm10.sub': 'Reassemble the message',
    'm11.title': 'Auction House',
    'm11.sub': 'Allocate bandwidth fairly',
    'm12.title': 'Time Traveler',
    'm12.sub': 'Beat latency across the globe',
    // Intro concepts (English)
    'm1.concept': 'Graph Theory: nodes + edges = networks. Every device on the internet is a node. Every cable is an edge. N nodes need exactly N−1 edges to all connect (Minimum Spanning Tree). More edges = redundancy — the network survives failures.',
    'm1.howto': '3 rounds: R1 drag roads to connect the city (each road shows live latency in ms!). R2 connect using minimum budget — find the MST! R3 survive an earthquake — redundant roads auto-reroute data.',
    'm2.concept': 'Bandwidth = lanes on a highway. More lanes = more packets flow at once without drops.',
    'm2.howto': 'Tap a pipe to add a lane (upgrade bandwidth). Keep all 4 pools filled before time runs out!',
    'm3.concept': 'Priority Queues: urgent tasks run first. Rockets with higher priority (lower number = more urgent) must launch first or missions fail.',
    'm3.howto': 'Click the highest-priority rocket (P1 most urgent, P4 least). Auto-launch in 8s if you wait too long.',
    'm4.concept': 'Network Redundancy: The internet was designed to survive nuclear attacks by routing around broken links. Engineers add backup paths so if one cable is cut, data takes a different route.',
    'm4.howto': 'You have 30 seconds to add up to 5 backup links (gold dashed lines). Then 3 monsters destroy towers. Goal: keep 6+ buildings online for 2 stars, all 8 for 3 stars.',
    'm5.concept': 'Firewalls block bad traffic. Real firewalls inspect every packet — allow safe ones, block threats.',
    'm5.howto': "Slash (swipe) the dangerous 🔴 packets. Let the safe 🟢 ones through. Don't miss or let threats pass!",
    'm6.concept': 'Congestion Control: when too many cars use one road, everyone slows down. Rerouting traffic prevents gridlock — just like TCP slows down when networks get congested.',
    'm6.howto': 'Tap roads to upgrade capacity. Keep city happiness high by preventing gridlock!',
    'm7.concept': "Dijkstra's Algorithm finds the shortest path in a graph. Used in GPS, internet routing, and game AI.",
    'm7.howto': 'Click nodes to build your route from 📬 to 🏠. Find the shortest total distance to earn stars.',
    'm8.concept': 'OSI Model: When you send a WhatsApp message, it passes through 7 layers. App (7) → Encrypt (6) → Session (5) → Split into packets (4) → Route via IP (3) → WiFi hop (2) → Radio waves (1).',
    'm8.howto': 'Round 1: Drag layers into the tower in order (7 at top, 1 at bottom). Round 2: Quiz with cheat sheet visible. Round 3: Speed stack!',
    'm9.concept': 'Cache memory stores frequently-used data close to the CPU. Cache hit = fast. Cache miss = slow trip to RAM.',
    'm9.howto': 'Match the memory blocks to fill the cache. Remember positions for faster hits!',
    'm10.concept': 'TCP breaks messages into packets, sends them separately, then reassembles them in order at the destination.',
    'm10.howto': 'Receive the packets and drag them into the correct order to reassemble the message.',
    'm11.concept': 'Bandwidth allocation: when many users share a connection, a fair algorithm gives each user equal share — like dividing a pizza fairly.',
    'm11.howto': 'Bid in the auction to allocate bandwidth to users. Fairest distribution wins more stars.',
    'm12.concept': 'Latency: Every cable and router adds delay. A signal from New York to Tokyo travels ~11,000 km of fiber — that takes ~55ms just for physics! CDNs place servers near users to cut latency.',
    'm12.howto': 'Click cities to build a route from 📡 source to 🎯 destination. Place ⚡ boosters on slow segments. Beat the ms target to win!',
  },
  kn: {
    // Home screen
    'home.beginner': 'ಆರಂಭಿಕ',
    'home.advanced': 'ಮುಂದುವರಿದ ✦',
    'home.tagline': 'ಭವಿಷ್ಯ ನಿರ್ಮಿಸಿ.',
    'home.progress': '{n} / 12 ಕಾರ್ಯಗಳು ಪೂರ್ಣ',
    'home.locked': '🔒 ಹಿಂದಿನದನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ',
    'home.module': 'ಮಾಡ್ಯೂಲ್',
    // Language toggle
    'lang.en': 'English',
    'lang.kn': 'ಕನ್ನಡ',
    // Common UI
    'btn.play': 'ಆಡೋಣ ▶',
    'btn.continue': 'ಮುಂದುವರಿಸಿ ▶',
    'btn.retry': 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ↺',
    'btn.back': '← ಮಿಷನ್‌ಗಳು',
    'ui.learning': '💡 ನೀವು ಕಲಿಯುತ್ತಿರುವುದು',
    'ui.mission': 'ಮಿಷನ್',
    'ui.whatlearn': '💡 ನೀವು ಕಲಿಯಲಿರುವುದು',
    'ui.complete': '◈ ಮಿಷನ್ ಪೂರ್ಣ',
    // Module titles
    'm1.title': 'ವಿತರಣಾ ರಾಜ್ಯ',
    'm1.sub': '3 ಸುತ್ತು · MST · ಭೂಕಂಪ!',
    'm2.title': 'ನೀರಿನ ಉದ್ಯಾನ',
    'm2.sub': 'ಪೈಪ್, ಗೇಟ್ ಮತ್ತು ಹರಿವು',
    'm3.title': 'ರಾಕೆಟ್ ಉಡಾವಣೆ',
    'm3.sub': 'ರಾಕೆಟ್ ವಿಂಗಡಿಸಿ, ಮಿಷನ್ ಉಳಿಸಿ',
    'm4.title': 'ರಾಕ್ಷಸರ ದಾಳಿ',
    'm4.sub': 'ದಾಳಿಯಿಂದ ಬದುಕಿ',
    'm5.title': 'ಸೈಬರ್ ನಿಂಜಾ',
    'm5.sub': 'ನಕಲಿ ಕತ್ತರಿಸಿ, ನಿಜವ ರಕ್ಷಿಸಿ',
    'm6.title': 'ಟ್ರಾಫಿಕ್ ಹೀರೋ',
    'm6.sub': 'ನಗರ ಚಲಿಸುತ್ತಿರಲಿ',
    'm7.title': 'ಮೇಜ್ ಪೋಸ್ಟ್ ಆಫೀಸ್',
    'm7.sub': 'ಅತಿ ಚಿಕ್ಕ ದಾರಿ ಹುಡುಕಿ',
    'm8.title': 'ಬಾಬೆಲ್ ಗೋಪುರ',
    'm8.sub': 'ಪದರಗಳನ್ನು ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸಿ',
    'm9.title': 'ಸ್ಮಾರಕ ಅರಮನೆ',
    'm9.sub': 'ಸರಿಯಾದದ್ದನ್ನು ಕ್ಯಾಷ್ ಮಾಡಿ',
    'm10.title': 'ರಿಲೇ ರೇಸ್',
    'm10.sub': 'ಸಂದೇಶ ಮರುಜೋಡಿಸಿ',
    'm11.title': 'ಹರಾಜು ಮನೆ',
    'm11.sub': 'ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್ ಸಮಾನವಾಗಿ ಹಂಚಿ',
    'm12.title': 'ಕಾಲ ಪ್ರಯಾಣಿಕ',
    'm12.sub': 'ಜಗತ್ತಿನಾದ್ಯಂತ ತಡ ಗೆಲ್ಲಿ',
    // Intro concepts (Kannada)
    'm1.concept': 'ಗ್ರಾಫ್ ಥಿಯರಿ: ನೋಡ್‌ಗಳು + ಅಂಚುಗಳು = ನೆಟ್‌ವರ್ಕ್. N ನೋಡ್‌ಗಳಿಗೆ N−1 ಅಂಚುಗಳು ಸಾಕು (ಮಿನಿಮಮ್ ಸ್ಪ್ಯಾನಿಂಗ್ ಟ್ರೀ). ಹೆಚ್ಚು ಅಂಚುಗಳು = ರಿಡಂಡೆನ್ಸಿ = ವೈಫಲ್ಯ ತಡೆ.',
    'm1.howto': '3 ಸುತ್ತುಗಳು: ಸ1 ರಸ್ತೆ ನಿರ್ಮಿಸಿ (ಲೇಟೆನ್ಸಿ ms ನೋಡಿ). ಸ2 ಬಜೆಟ್‌ನಲ್ಲಿ MST ಹುಡುಕಿ. ಸ3 ಭೂಕಂಪ ತಡೆದುಕೊಳ್ಳಿ!',
    'm2.concept': 'ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್ = ಹೆದ್ದಾರಿಯ ಲೇನ್‌ಗಳು. ಹೆಚ್ಚು ಲೇನ್ = ಒಮ್ಮೆಗೆ ಹೆಚ್ಚು ಪ್ಯಾಕೆಟ್‌ಗಳು ಹರಿಯುತ್ತವೆ.',
    'm2.howto': 'ಪೈಪ್ ತಟ್ಟಿ ಲೇನ್ ಸೇರಿಸಿ. 4 ಕೊಳಗಳನ್ನು ತುಂಬಿಸಿ!',
    'm3.concept': 'ಆದ್ಯತಾ ಕ್ಯೂ: ತುರ್ತು ಕೆಲಸ ಮೊದಲು. P1 = ಅತ್ಯಂತ ತುರ್ತು, P4 = ಕಡಿಮೆ ತುರ್ತು.',
    'm3.howto': 'ಅತ್ಯಂತ ಆದ್ಯತೆಯ ರಾಕೆಟ್ ಕ್ಲಿಕ್ ಮಾಡಿ. 8 ಸೆಕೆಂಡ್ ಕಾದರೆ ತಾನೇ ಉಡಾಯಿಸುತ್ತದೆ.',
    'm4.concept': 'ನೆಟ್‌ವರ್ಕ್ ಅಧಿಕ ಬಲ: ಒಂದು ಕೇಬಲ್ ಮುರಿದರೆ, ಡೇಟಾ ಬೇರೆ ದಾರಿ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ.',
    'm4.howto': '5 ಬ್ಯಾಕಪ್ ಲಿಂಕ್‌ಗಳನ್ನು ಸೇರಿಸಲು 30 ಸೆಕೆಂಡ್. ರಾಕ್ಷಸರು ಟವರ್ ನಾಶ ಮಾಡುತ್ತಾರೆ. 6+ ಕಟ್ಟಡ ಆನ್‌ಲೈನ್ ಉಳಿಸಿ!',
    'm5.concept': 'ಫೈರ್‌ವಾಲ್ ಕೆಟ್ಟ ಟ್ರಾಫಿಕ್ ತಡೆಯುತ್ತದೆ. ನಿಜವಾದ ಫೈರ್‌ವಾಲ್ ಪ್ರತಿ ಪ್ಯಾಕೆಟ್ ಪರೀಕ್ಷಿಸುತ್ತದೆ.',
    'm5.howto': 'ಅಪಾಯಕಾರಿ 🔴 ಪ್ಯಾಕೆಟ್‌ಗಳನ್ನು ಕತ್ತರಿಸಿ (ಸ್ವೈಪ್). ಸುರಕ್ಷಿತ 🟢 ಅನ್ನು ಹಾದು ಹೋಗಲು ಬಿಡಿ.',
    'm6.concept': 'ದಟ್ಟಣೆ ನಿಯಂತ್ರಣ: ತುಂಬಾ ಕಾರುಗಳು = ತಡ. ಟ್ರಾಫಿಕ್ ಮರು ನಿರ್ದೇಶಿಸಿ.',
    'm6.howto': 'ರಸ್ತೆ ತಟ್ಟಿ ಸಾಮರ್ಥ್ಯ ಹೆಚ್ಚಿಸಿ. ನಗರ ಸಂತೋಷ ಹೆಚ್ಚಾಗಿ ಇರಲಿ!',
    'm7.concept': 'ಡಿಜ್ಕ್ಸ್ಟ್ರಾ ಅಲ್ಗಾರಿದಮ್ ಗ್ರಾಫ್‌ನಲ್ಲಿ ಚಿಕ್ಕ ದಾರಿ ಹುಡುಕುತ್ತದೆ. GPS, ರೂಟಿಂಗ್‌ನಲ್ಲಿ ಬಳಕೆ.',
    'm7.howto': '📬 ಇಂದ 🏠 ಗೆ ನೋಡ್‌ಗಳ ಮೂಲಕ ಅತಿ ಚಿಕ್ಕ ದಾರಿ ಹುಡುಕಿ.',
    'm8.concept': 'OSI ಮಾದರಿ: WhatsApp ಸಂದೇಶ 7 ಪದರಗಳ ಮೂಲಕ ಹೋಗುತ್ತದೆ. ಅಪ್ಲಿಕೇಶನ್ (7) → ಎನ್‌ಕ್ರಿಪ್ಟ್ (6) → ಸೆಷನ್ (5) → ಪ್ಯಾಕೆಟ್ (4) → IP ರೂಟ್ (3) → WiFi (2) → ರೇಡಿಯೋ ತರಂಗ (1).',
    'm8.howto': 'ಸುತ್ತ 1: ಪದರಗಳನ್ನು ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸಿ. ಸುತ್ತ 2: ಚೀಟ್ ಶೀಟ್ ನೋಡಿ ಕ್ವಿಜ್ ಉತ್ತರಿಸಿ. ಸುತ್ತ 3: ವೇಗ!',
    'm9.concept': 'ಕ್ಯಾಷ್ ಮೆಮೊರಿ ಹೆಚ್ಚಾಗಿ ಬಳಸುವ ಡೇಟಾ CPU ಹತ್ತಿರ ಇಡುತ್ತದೆ. ಕ್ಯಾಷ್ ಹಿಟ್ = ವೇಗ. ಮಿಸ್ = ನಿಧಾನ.',
    'm9.howto': 'ಮೆಮೊರಿ ಬ್ಲಾಕ್‌ಗಳನ್ನು ಕ್ಯಾಷ್ ತುಂಬಿಸಲು ಹೊಂದಿಸಿ.',
    'm10.concept': 'TCP ಸಂದೇಶ ಪ್ಯಾಕೆಟ್‌ಗಳಾಗಿ ಮುರಿದು ಕಳಿಸುತ್ತದೆ, ಗಮ್ಯದಲ್ಲಿ ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸುತ್ತದೆ.',
    'm10.howto': 'ಪ್ಯಾಕೆಟ್‌ಗಳನ್ನು ಸರಿಯಾದ ಕ್ರಮದಲ್ಲಿ ಎಳೆದು ಸಂದೇಶ ಜೋಡಿಸಿ.',
    'm11.concept': 'ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್ ಹಂಚಿಕೆ: ಸಮಾನ ಅಲ್ಗಾರಿದಮ್ ಪ್ರತಿ ಬಳಕೆದಾರರಿಗೆ ಸಮ ಪಾಲು ನೀಡುತ್ತದೆ.',
    'm11.howto': 'ಹರಾಜಿನಲ್ಲಿ ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್ ಹಂಚಿ. ನ್ಯಾಯಯುತ ಹಂಚಿಕೆ = ಹೆಚ್ಚು ನಕ್ಷತ್ರ.',
    'm12.concept': 'ಲೇಟೆನ್ಸಿ: ಪ್ರತಿ ಕೇಬಲ್ ತಡ ಸೇರಿಸುತ್ತದೆ. ನ್ಯೂಯಾರ್ಕ್-ಟೋಕ್ಯೋ ~55ms. CDN ಹತ್ತಿರದ ಸರ್ವರ್ ತಡ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.',
    'm12.howto': 'ಮೂಲ 📡 ಇಂದ ಗಮ್ಯ 🎯 ಗೆ ರಿಲೇ ನಗರಗಳ ಮೂಲಕ ರೂಟ್ ನಿರ್ಮಿಸಿ. ms ಗುರಿ ತಲುಪಿ!',
  },
};

const LS_KEY = 'ic2_lang';
const SUPPORTED = ['en', 'kn'];

export function getLang() {
  const stored = localStorage.getItem(LS_KEY);
  return SUPPORTED.includes(stored) ? stored : 'en';
}

export function setLang(l) {
  if (SUPPORTED.includes(l)) localStorage.setItem(LS_KEY, l);
}

/**
 * Translate a key in the current language.
 * Supports simple {var} interpolation: t('home.progress', { n: 3 }) → "3 / 12 missions complete"
 */
export function t(key, vars = {}) {
  const lang = getLang();
  const str = (STRINGS[lang] && STRINGS[lang][key]) ?? (STRINGS.en[key] ?? key);
  return Object.keys(vars).reduce((s, k) => s.replace(`{${k}}`, vars[k]), str);
}

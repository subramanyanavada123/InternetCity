// Home screen — city select with coins, badges, module cards
import { coinBurst } from '../shared/ui.js';

const MODULES = [
  { id: 1,  title: 'Delivery Kingdom',  emoji: '🎁', color: '#ffd700', sub: 'Build roads, move trucks',       bg: '#1a1500' },
  { id: 2,  title: 'Water Park',        emoji: '💧', color: '#00b4ff', sub: 'Pipes, gates & flow',            bg: '#00111a' },
  { id: 3,  title: 'Rocket Launch',     emoji: '🚀', color: '#ff6b35', sub: 'Sort rockets, save missions',    bg: '#1a0d00' },
  { id: 4,  title: 'Monster Attack',    emoji: '👾', color: '#c9b6ff', sub: 'Survive the stomp',              bg: '#0d0020' },
  { id: 5,  title: 'Cyber Ninja',       emoji: '🥷', color: '#46f0c0', sub: 'Slash fakes, protect real',      bg: '#001a0d' },
  { id: 6,  title: 'Traffic Hero',      emoji: '🚗', color: '#ff3860', sub: 'Keep the city moving',           bg: '#1a0005' },
  { id: 7,  title: 'Maze Post Office',  emoji: '🗺️', color: '#ffec3d', sub: 'Find the shortest path',        bg: '#1a1a00' },
  { id: 8,  title: 'Tower of Babel',    emoji: '🏗️', color: '#ff9f43', sub: 'Stack layers in order',         bg: '#1a0e00' },
  { id: 9,  title: 'Memory Palace',     emoji: '🧠', color: '#fd79a8', sub: 'Cache the right things',         bg: '#1a0010' },
  { id: 10, title: 'Relay Race',        emoji: '🏃', color: '#00cec9', sub: 'Reassemble the message',         bg: '#001a1a' },
  { id: 11, title: 'Auction House',     emoji: '💰', color: '#e17055', sub: 'Allocate bandwidth fairly',      bg: '#1a0800' },
  { id: 12, title: 'Time Traveler',     emoji: '⏱️', color: '#a29bfe', sub: 'Beat latency across the globe', bg: '#08001a' },
];

export function showHome(app, state, onSelect) {
  // Allow scroll on home screen, lock it inside games
  document.body.classList.add('home-screen');

  const root = document.createElement('div');
  root.style.cssText = `
    min-height:100%;background:#0a0a1a;
    display:flex;flex-direction:column;align-items:center;
    padding:0 0 60px;
  `;

  const v1Url = window.location.origin + '/v1/';
  const v2Url = window.location.origin + '/';

  root.innerHTML = `
    <div style="width:100%;max-width:720px;padding:20px 14px 0;">

      <!-- Version toggle -->
      <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
        <div style="
          display:inline-flex;border-radius:20px;overflow:hidden;
          border:1px solid rgba(255,255,255,0.12);font-size:11px;font-weight:700;
        ">
          <span style="
            padding:6px 14px;
            background:rgba(70,240,192,0.18);
            color:#46f0c0;
            border-right:1px solid rgba(255,255,255,0.1);
          ">Beginner</span>
          <a href="${v1Url}" style="
            padding:6px 14px;text-decoration:none;
            color:#8aa6b4;
            transition:background 0.2s,color 0.2s;
          " onmouseover="this.style.color='#46f0c0'" onmouseout="this.style.color='#8aa6b4'">Advanced ✦</a>
        </div>
      </div>

      <!-- Header -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px;flex-wrap:wrap;">
        <div>
          <div style="font-size:10px;color:#8aa6b4;letter-spacing:3px;text-transform:uppercase;">Internet City</div>
          <div style="font-size:clamp(20px,6vw,28px);font-weight:700;color:#fff;line-height:1.1;">Build the Future.</div>
        </div>
        <div class="coin-display" style="flex-shrink:0;">🪙 ${state.coins}</div>
      </div>
      <div style="font-size:12px;color:#8aa6b4;margin-top:4px;margin-bottom:20px;">
        ${state.completedModules.length} / 12 missions complete
        ${state.completedModules.length === 12 ? ' 🏆' : ''}
      </div>

      <div id="module-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(190px,100%),1fr));gap:12px;"></div>
    </div>
  `;
  app.appendChild(root);

  const grid = root.querySelector('#module-grid');
  const completed = state.completedModules || [];

  MODULES.forEach((mod, i) => {
    const stars = state.moduleStars?.[mod.id] || 0;
    const isUnlocked = mod.id === 1 || completed.includes(mod.id - 1) || completed.includes(mod.id);
    const card = document.createElement('div');
    card.className = 'module-card-v2' + (isUnlocked ? '' : ' locked');
    card.style.cssText = `
      border-radius:20px;padding:20px;cursor:${isUnlocked ? 'pointer' : 'not-allowed'};
      background:${mod.bg};border:1px solid ${isUnlocked ? mod.color + '44' : 'rgba(255,255,255,0.06)'};
      transition:transform 0.2s,border-color 0.2s,box-shadow 0.2s;
      animation:fadeInUp 0.4s ease ${i * 0.07}s both;
    `;
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="font-size:32px;line-height:1;flex-shrink:0;">${mod.emoji}</div>
        <div style="min-width:0;">
          <div style="font-size:10px;color:${mod.color};letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;font-weight:700;">MODULE ${mod.id}</div>
          <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:2px;line-height:1.2;">${mod.title}</div>
          <div style="font-size:11px;color:#8aa6b4;margin-bottom:6px;">${mod.sub}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div class="star-strip" style="font-size:14px;">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
            ${!isUnlocked ? '<div style="font-size:11px;color:#555;">🔒 Complete previous</div>' : ''}
          </div>
        </div>
      </div>
    `;
    if (isUnlocked) {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
        card.style.boxShadow = `0 8px 32px ${mod.color}33`;
        card.style.borderColor = mod.color + '88';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.borderColor = mod.color + '44';
      });
      card.addEventListener('click', () => onSelect(mod.id));
    }
    grid.appendChild(card);
  });
}

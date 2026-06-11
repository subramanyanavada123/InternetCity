// Home screen — city select with coins, badges, module cards
import { coinBurst } from '../shared/ui.js';
import { t, getLang, setLang } from '../shared/i18n.js';

function getModules() {
  return [
    { id: 1,  title: t('m1.title'), emoji: '🎁', color: '#ffd700', sub: t('m1.sub'), bg: '#1a1500' },
    { id: 2,  title: t('m2.title'), emoji: '💧', color: '#00b4ff', sub: t('m2.sub'), bg: '#00111a' },
    { id: 3,  title: t('m3.title'), emoji: '🚀', color: '#ff6b35', sub: t('m3.sub'), bg: '#1a0d00' },
    { id: 4,  title: t('m4.title'), emoji: '👾', color: '#c9b6ff', sub: t('m4.sub'), bg: '#0d0020' },
    { id: 5,  title: t('m5.title'), emoji: '🥷', color: '#46f0c0', sub: t('m5.sub'), bg: '#001a0d' },
    { id: 6,  title: t('m6.title'), emoji: '🚗', color: '#ff3860', sub: t('m6.sub'), bg: '#1a0005' },
    { id: 7,  title: t('m7.title'), emoji: '🗺️', color: '#ffec3d', sub: t('m7.sub'), bg: '#1a1a00' },
    { id: 8,  title: t('m8.title'), emoji: '🏗️', color: '#ff9f43', sub: t('m8.sub'), bg: '#1a0e00' },
    { id: 9,  title: t('m9.title'), emoji: '🧠', color: '#fd79a8', sub: t('m9.sub'), bg: '#1a0010' },
    { id: 10, title: t('m10.title'), emoji: '🏃', color: '#00cec9', sub: t('m10.sub'), bg: '#001a1a' },
    { id: 11, title: t('m11.title'), emoji: '💰', color: '#e17055', sub: t('m11.sub'), bg: '#1a0800' },
    { id: 12, title: t('m12.title'), emoji: '⏱️', color: '#a29bfe', sub: t('m12.sub'), bg: '#08001a' },
    { id: 13, title: t('m13.title'), emoji: '🏎️', color: '#74c0fc', sub: t('m13.sub'), bg: '#000d1a' },
    { id: 14, title: t('m14.title'), emoji: '⚡', color: '#ffd43b', sub: t('m14.sub'), bg: '#1a1800' },
    { id: 15, title: t('m15.title'), emoji: '🌳', color: '#69db7c', sub: t('m15.sub'), bg: '#001a00' },
  ];
}

export function showHome(app, state, onSelect) {
  // Allow scroll on home screen, lock it inside games
  document.body.classList.add('home-screen');

  const root = document.createElement('div');
  root.style.cssText = `
    min-height:100%;background:#0a0a1a;
    display:flex;flex-direction:column;align-items:center;
    padding:0 0 60px;
    font-family:'Space Mono','Noto Sans Kannada',monospace,sans-serif;
  `;

  const v1Url = window.location.origin + '/v1/';

  // ── Top toolbar: language toggle + version toggle ───────────────────
  const toolbar = document.createElement('div');
  toolbar.style.cssText = `
    width:100%;max-width:720px;padding:14px 14px 0;
    display:flex;flex-direction:column;gap:8px;
  `;

  // Language toggle (top row)
  const langRow = document.createElement('div');
  langRow.style.cssText = 'display:flex;justify-content:flex-end;';

  function buildLangToggle() {
    const lang = getLang();
    const pill = document.createElement('div');
    pill.style.cssText = `
      display:inline-flex;border-radius:20px;overflow:hidden;
      border:1px solid rgba(255,255,255,0.15);font-size:12px;font-weight:700;
      cursor:pointer;
    `;

    const enBtn = document.createElement('button');
    enBtn.textContent = 'EN';
    enBtn.style.cssText = `
      padding:6px 14px;border:none;font-size:12px;font-weight:700;
      cursor:pointer;font-family:inherit;min-height:0;touch-action:manipulation;
      -webkit-tap-highlight-color:transparent;
      background:${lang === 'en' ? 'rgba(70,240,192,0.22)' : 'transparent'};
      color:${lang === 'en' ? '#46f0c0' : '#8aa6b4'};
      border-right:1px solid rgba(255,255,255,0.1);
      transition:background 0.2s,color 0.2s;
    `;

    const knBtn = document.createElement('button');
    knBtn.textContent = 'ಕನ್ನಡ';
    knBtn.style.cssText = `
      padding:6px 14px;border:none;font-size:12px;font-weight:700;
      cursor:pointer;font-family:'Noto Sans Kannada','Space Mono',monospace,sans-serif;
      min-height:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
      background:${lang === 'kn' ? 'rgba(70,240,192,0.22)' : 'transparent'};
      color:${lang === 'kn' ? '#46f0c0' : '#8aa6b4'};
      transition:background 0.2s,color 0.2s;
    `;

    const switchTo = (l) => {
      setLang(l);
      // Re-render the whole home screen
      root.remove();
      showHome(app, state, onSelect);
    };

    enBtn.addEventListener('click', () => switchTo('en'));
    knBtn.addEventListener('click', () => switchTo('kn'));

    pill.appendChild(enBtn);
    pill.appendChild(knBtn);
    return pill;
  }

  langRow.appendChild(buildLangToggle());
  toolbar.appendChild(langRow);

  // Version toggle (second row)
  const versionRow = document.createElement('div');
  versionRow.style.cssText = 'display:flex;justify-content:flex-end;';
  versionRow.innerHTML = `
    <div style="
      display:inline-flex;border-radius:20px;overflow:hidden;
      border:1px solid rgba(255,255,255,0.12);font-size:11px;font-weight:700;
    ">
      <span style="
        padding:6px 14px;
        background:rgba(70,240,192,0.18);
        color:#46f0c0;
        border-right:1px solid rgba(255,255,255,0.1);
      ">${t('home.beginner')}</span>
      <a href="${v1Url}" style="
        padding:6px 14px;text-decoration:none;
        color:#8aa6b4;
        transition:background 0.2s,color 0.2s;
      " onmouseover="this.style.color='#46f0c0'" onmouseout="this.style.color='#8aa6b4'">${t('home.advanced')}</a>
    </div>
  `;
  toolbar.appendChild(versionRow);

  root.appendChild(toolbar);

  // ── Main content ────────────────────────────────────────────────────
  const content = document.createElement('div');
  content.style.cssText = 'width:100%;max-width:720px;padding:16px 14px 0;';

  const completedCount = (state.completedModules || []).length;
  const progressText = t('home.progress', { n: completedCount });

  content.innerHTML = `
    <!-- Header -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px;flex-wrap:wrap;">
      <div>
        <div style="font-size:10px;color:#8aa6b4;letter-spacing:3px;text-transform:uppercase;">Internet City</div>
        <div style="font-size:clamp(20px,6vw,28px);font-weight:700;color:#fff;line-height:1.1;">${t('home.tagline')}</div>
      </div>
      <div class="coin-display" style="flex-shrink:0;">🪙 ${state.coins}</div>
    </div>
    <div style="font-size:12px;color:#8aa6b4;margin-top:4px;margin-bottom:20px;">
      ${progressText}${completedCount >= 15 ? ' 🏆' : ''}
    </div>
    <div id="module-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(190px,100%),1fr));gap:12px;"></div>
  `;
  root.appendChild(content);
  app.appendChild(root);

  const grid = content.querySelector('#module-grid');
  const completed = state.completedModules || [];
  const MODULES = getModules();

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
      touch-action:manipulation;
    `;
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="font-size:32px;line-height:1;flex-shrink:0;">${mod.emoji}</div>
        <div style="min-width:0;">
          <div style="font-size:10px;color:${mod.color};letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;font-weight:700;">${t('home.module')} ${mod.id}</div>
          <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:2px;line-height:1.2;">${mod.title}</div>
          <div style="font-size:11px;color:#8aa6b4;margin-bottom:6px;">${mod.sub}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div class="star-strip" style="font-size:14px;">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
            ${!isUnlocked ? `<div style="font-size:11px;color:#555;">${t('home.locked')}</div>` : ''}
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

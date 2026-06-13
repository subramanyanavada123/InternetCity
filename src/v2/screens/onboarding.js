// First-time onboarding — 3 swipeable cards shown only once
export function showOnboarding(app, onDone) {
  const SLIDES = [
    {
      emoji: '🌐',
      title: 'Welcome to Internet City!',
      body: 'The internet runs everything — your videos, messages, games, and calls. But how does it actually work?',
      accent: '#46f0c0',
      cta: 'Next →',
    },
    {
      emoji: '🎮',
      title: '15 mini-games. 15 big ideas.',
      body: 'Each game teaches one real computer science concept — from how data travels, to how routers decide where to send packets, to how your phone remembers things.',
      accent: '#ffd700',
      cta: 'Next →',
    },
    {
      emoji: '🚀',
      title: 'Start with Module 1!',
      body: 'Connect buildings to build a network. Unlock new missions as you go. Earn coins, collect stars, and discover how the internet really works!',
      accent: '#ff9f43',
      cta: "Let's Play! ▶",
    },
  ];

  let current = 0;

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;background:#07071a;z-index:1000;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    font-family:'Space Mono','Noto Sans Kannada',monospace,sans-serif;
    padding:20px;
  `;

  // Dot indicators
  const dots = document.createElement('div');
  dots.style.cssText = 'display:flex;gap:8px;margin-bottom:28px;';
  SLIDES.forEach((_, i) => {
    const d = document.createElement('div');
    d.style.cssText = `width:8px;height:8px;border-radius:50%;transition:background 0.3s,transform 0.3s;`;
    dots.appendChild(d);
  });

  // Card
  const card = document.createElement('div');
  card.style.cssText = `
    background:#0f0f2a;border-radius:24px;padding:36px 28px;
    width:min(380px,92vw);text-align:center;
    box-shadow:0 8px 40px rgba(0,0,0,0.6);
    transition:opacity 0.25s;
  `;

  // Skip button
  const skipBtn = document.createElement('button');
  skipBtn.textContent = 'Skip';
  skipBtn.style.cssText = `
    position:absolute;top:20px;right:20px;
    background:transparent;border:none;color:#555;
    font-size:13px;cursor:pointer;font-family:inherit;
    padding:6px 10px;border-radius:8px;
    transition:color 0.2s;
  `;
  skipBtn.addEventListener('mouseenter', () => skipBtn.style.color = '#888');
  skipBtn.addEventListener('mouseleave', () => skipBtn.style.color = '#555');
  skipBtn.addEventListener('click', () => { overlay.remove(); onDone(); });

  overlay.appendChild(skipBtn);
  overlay.appendChild(dots);
  overlay.appendChild(card);
  app.appendChild(overlay);

  function render(idx, animate = false) {
    const slide = SLIDES[idx];
    if (animate) {
      card.style.opacity = '0';
      setTimeout(() => {
        fill(slide);
        card.style.opacity = '1';
      }, 200);
    } else {
      fill(slide);
    }
    // Update dots
    Array.from(dots.children).forEach((d, i) => {
      d.style.background = i === idx ? slide.accent : '#333';
      d.style.transform = i === idx ? 'scale(1.3)' : 'scale(1)';
    });
  }

  function fill(slide) {
    card.innerHTML = `
      <div style="font-size:64px;margin-bottom:16px;line-height:1;">${slide.emoji}</div>
      <div style="font-size:clamp(18px,5vw,24px);font-weight:700;color:${slide.accent};margin-bottom:12px;line-height:1.2;">${slide.title}</div>
      <div style="font-size:14px;color:#aaa;line-height:1.65;margin-bottom:28px;">${slide.body}</div>
      <button id="ob-cta" style="
        width:100%;padding:14px;border-radius:14px;border:none;
        background:${slide.accent};color:#000;
        font-size:16px;font-weight:700;cursor:pointer;
        font-family:inherit;letter-spacing:1px;
        box-shadow:0 4px 20px ${slide.accent}55;
        transition:transform 0.1s,box-shadow 0.1s;
      ">${slide.cta}</button>
    `;
    const cta = card.querySelector('#ob-cta');
    cta.addEventListener('mouseenter', () => { cta.style.transform = 'scale(1.04)'; });
    cta.addEventListener('mouseleave', () => { cta.style.transform = 'scale(1)'; });
    cta.addEventListener('click', () => {
      if (current < SLIDES.length - 1) {
        current++;
        render(current, true);
      } else {
        overlay.remove();
        onDone();
      }
    });
  }

  render(0);
}

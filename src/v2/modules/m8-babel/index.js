import { makeHUD, makeCard, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';
import { t } from '../../shared/i18n.js';

const LAYERS = [
  { num:7, name:'Application',  emoji:'🌐', color:'#46f0c0', desc:'Where you type your message',  example:'Browser, email app, HTTP' },
  { num:6, name:'Presentation', emoji:'🎨', color:'#ffd700', desc:'Translates & encrypts',         example:'HTTPS encryption, JPEG compression' },
  { num:5, name:'Session',      emoji:'🤝', color:'#ff9f43', desc:'Opens & closes the connection', example:'Login session, video call setup' },
  { num:4, name:'Transport',    emoji:'📦', color:'#ff6b6b', desc:'Splits into packets',           example:'TCP ensures delivery, UDP is fast' },
  { num:3, name:'Network',      emoji:'🗺️', color:'#c9b6ff', desc:'Finds the route',              example:'IP addresses, routers' },
  { num:2, name:'Data Link',    emoji:'🔗', color:'#00b4ff', desc:'Sends to next hop',             example:'WiFi, Ethernet, MAC addresses' },
  { num:1, name:'Physical',     emoji:'⚡', color:'#a8e063', desc:'Actual cables & signals',       example:'Fiber optic, copper wire, radio waves' },
];

const QUIZ = [
  { q:'Which layer splits data into packets?',     a:3 },
  { q:'Which layer finds the best route?',         a:2 },
  { q:'Where does the user type their message?',   a:0 },
  { q:'Which layer encrypts and translates data?', a:1 },
  { q:'Which layer uses actual cables & signals?', a:6 },
];

const shuffle = a => { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; };

(function injectStyles() {
  if (document.getElementById('m8-styles')) return;
  const s = document.createElement('style');
  s.id = 'm8-styles';
  s.textContent = `
    #m8root{position:fixed;inset:0;background:#0a0800;overflow:hidden;z-index:10;font-family:'Space Mono',monospace,sans-serif;}
    .m8b{width:260px;height:56px;border-radius:12px;display:flex;align-items:center;padding:0 14px;gap:10px;cursor:grab;user-select:none;border:2px solid transparent;}
    .m8b:hover{transform:scale(1.03);}  .m8b.drag{opacity:0.4;}
    .m8b .em{font-size:22px;flex-shrink:0;} .m8b .nm{font-size:13px;font-weight:700;} .m8b .ds{font-size:9px;color:rgba(255,255,255,0.6);}
    .m8sl{width:280px;height:64px;border-radius:12px;border:2px dashed rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;}
    .m8sl.over{border-color:#46f0c0;box-shadow:0 0 12px #46f0c044;} .m8sl.ok{border-style:solid;}
    .m8sl .lbl{font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:1px;}
    @keyframes m8bnc{0%,100%{transform:translateX(0)}25%{transform:translateX(-12px)}75%{transform:translateX(12px)}}
    @keyframes m8flsh{0%,100%{background:#0a0800}50%{background:#440000}}
    @keyframes m8env{0%{transform:translateX(-100px);opacity:0}50%{opacity:1}100%{transform:translateX(110vw);opacity:0}}
    @keyframes m8fw{0%{transform:scale(0) translateY(0);opacity:1}100%{transform:scale(1) translateY(-60px);opacity:0}}
    @keyframes m8pop{0%{transform:scale(0.4);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
    @keyframes m8tf{0%,100%{color:#ff6b6b}50%{color:#fff}}
  `;
  document.head.appendChild(s);
})();

export function launch(app, state, onComplete) {
  const timers = [];
  const T = fn => timers.push(fn);
  const to = (fn,ms) => { const id=setTimeout(fn,ms); T(()=>clearTimeout(id)); return id; };
  const iv = (fn,ms) => { const id=setInterval(fn,ms); T(()=>clearInterval(id)); return id; };

  const root = document.createElement('div');
  root.id = 'm8root';
  app.appendChild(root);

  const cleanup = () => { timers.forEach(f=>f()); root.remove(); };

  const hud = makeHUD(root, { color:'#46f0c0' });
  const backBtn = document.createElement('button');
  backBtn.style.cssText = 'position:absolute;top:8px;left:16px;z-index:70;background:rgba(0,0,0,0.5);border:1px solid #46f0c066;border-radius:10px;color:#46f0c0;font-size:13px;font-weight:700;cursor:pointer;padding:6px 12px;font-family:inherit;';
  backBtn.textContent = t('btn.back');
  backBtn.onclick = () => { cleanup(); onComplete(0,0); };
  root.appendChild(backBtn);

  let score = 0, round1Done = false, round2Score = 0, round3TimeLeft = 0;
  let dragIdx = null, dragEl = null, tClone = null;

  // ── helpers ──────────────────────────────────────────────────────────────────
  function makeBlock(li, draggable, showExample) {
    const L = LAYERS[li], el = document.createElement('div');
    el.className = 'm8b'; el.draggable = draggable;
    el.style.background = L.color+'22'; el.style.borderColor = L.color+'88';
    el.innerHTML = `<span class="em">${L.emoji}</span><div><div class="nm" style="color:${L.color}">${L.num} — ${L.name}</div><div class="ds">${L.desc}${showExample ? ' · <em>'+L.example+'</em>' : ''}</div></div>`;
    return el;
  }

  function makeCheatSheet() {
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;top:48px;right:8px;width:220px;background:#0a1a0a;border:1px solid #46f0c044;border-radius:10px;padding:8px 10px;z-index:50;font-size:9px;line-height:1.6;';
    el.innerHTML = '<div style="color:#46f0c0;font-size:9px;letter-spacing:2px;margin-bottom:6px;font-weight:700;">📋 OSI CHEAT SHEET</div>' +
      LAYERS.map(L => `<div style="color:${L.color};"><strong>${L.num}. ${L.name}</strong> — ${L.example}</div>`).join('');
    return el;
  }

  function makeSlot(i) {
    const el = document.createElement('div');
    el.className = 'm8sl'; el.dataset.i = i; el.dataset.f = '0';
    el.innerHTML = `<span class="lbl">Layer ${LAYERS[i].num}</span>`;
    return el;
  }

  function flashRed() {
    root.style.animation = 'm8flsh 0.4s ease';
    to(() => { root.style.animation=''; }, 400);
  }

  function fireworks() {
    for (let i=0; i<16; i++) to(() => {
      const fw = document.createElement('div');
      fw.style.cssText = `position:absolute;left:${10+Math.random()*80}%;top:${10+Math.random()*60}%;font-size:${20+Math.random()*20}px;pointer-events:none;z-index:300;animation:m8fw 0.8s ease-out forwards;`;
      fw.textContent = ['✨','🎆','💫','⭐'][i%4]; root.appendChild(fw);
      to(()=>fw.remove(), 800);
    }, i*80);
  }

  function transition(title, sub, onDone) {
    const d = document.createElement('div');
    d.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.75);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:200;animation:m8pop 0.5s ease;';
    d.innerHTML = `<div style="font-size:26px;font-weight:700;color:#46f0c0;margin-bottom:8px;text-align:center;">${title}</div><div style="font-size:15px;color:#fff;margin-bottom:24px;text-align:center;">${sub}</div><button style="padding:12px 32px;border-radius:12px;border:none;background:#46f0c0;color:#000;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;">Continue ▶</button>`;
    d.querySelector('button').onclick = () => { d.remove(); onDone(); };
    root.appendChild(d);
  }

  function clearArea() { root.querySelectorAll('.m8area').forEach(e=>e.remove()); }

  // shared drag-and-drop wiring for a stack game round
  function wireStack(area, slots, onPlace) {
    slots.forEach(slot => {
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); });
      slot.addEventListener('dragleave', () => slot.classList.remove('over'));
      slot.addEventListener('drop', e => {
        e.preventDefault(); slot.classList.remove('over');
        if (dragIdx===null) return;
        onPlace(parseInt(slot.dataset.i), dragIdx, dragEl);
      });
    });

    area.querySelectorAll('.m8b').forEach(block => {
      const li = parseInt(block.dataset.li);
      block.addEventListener('dragstart', e => {
        dragIdx=li; dragEl=block;
        to(()=>block.classList.add('drag'),0); e.dataTransfer.effectAllowed='move';
      });
      block.addEventListener('dragend', () => { block.classList.remove('drag'); dragIdx=null; dragEl=null; });
      block.addEventListener('touchstart', e => {
        e.preventDefault(); dragIdx=li;
        const t=e.touches[0]; tClone=block.cloneNode(true);
        tClone.style.cssText+='position:fixed;z-index:999;opacity:0.85;pointer-events:none;left:'+(t.clientX-130)+'px;top:'+(t.clientY-28)+'px;';
        document.body.appendChild(tClone);
      },{passive:false});
      block.addEventListener('touchmove', e => {
        e.preventDefault(); if(!tClone)return;
        const t=e.touches[0];
        tClone.style.left=(t.clientX-130)+'px'; tClone.style.top=(t.clientY-28)+'px';
        slots.forEach(s=>s.classList.remove('over'));
        const el=document.elementFromPoint(t.clientX,t.clientY), sl=el&&el.closest('.m8sl');
        if(sl) sl.classList.add('over');
      },{passive:false});
      block.addEventListener('touchend', e => {
        e.preventDefault(); if(tClone){tClone.remove();tClone=null;}
        slots.forEach(s=>s.classList.remove('over'));
        const t=e.changedTouches[0], el=document.elementFromPoint(t.clientX,t.clientY), sl=el&&el.closest('.m8sl');
        if(sl) onPlace(parseInt(sl.dataset.i), dragIdx, block);
        dragIdx=null;
      },{passive:false});
    });
  }

  function placeBlock(slotEl, block, li) {
    const L=LAYERS[li];
    block.classList.remove('drag'); block.draggable=false; block.style.cursor='default';
    block.style.boxShadow=`0 0 16px ${L.color},0 0 32px ${L.color}44`;
    block.style.width='276px'; block.remove();
    slotEl.innerHTML=''; slotEl.appendChild(block);
    slotEl.dataset.f='1'; slotEl.classList.add('ok');
    slotEl.style.borderColor=L.color; slotEl.style.boxShadow=`0 0 10px ${L.color}55`;
  }

  // ── Round 1 ──────────────────────────────────────────────────────────────────
  function round1() {
    hud.setLeft('🏗️ Tower of Babel'); hud.setCenter('Round 1 — Stack the OSI layers!'); hud.setRight('Score: '+score);
    clearArea();

    const area = document.createElement('div');
    area.className = 'm8area';
    area.style.cssText = 'position:absolute;inset:48px 0 0 0;display:flex;align-items:center;justify-content:center;gap:40px;padding:12px;overflow:hidden;';
    root.appendChild(area);

    const pile = document.createElement('div');
    pile.style.cssText = 'display:flex;flex-direction:column;gap:10px;align-items:center;';
    pile.innerHTML = '<div style="color:#46f0c0;font-size:10px;letter-spacing:2px;margin-bottom:4px;">LAYER BLOCKS</div>';

    const towerWrap = document.createElement('div');
    towerWrap.style.cssText = 'display:flex;flex-direction:column;gap:0;align-items:center;';
    towerWrap.innerHTML = '<div style="color:#46f0c0;font-size:10px;letter-spacing:2px;margin-bottom:8px;">TOWER (7 TOP → 1 BOTTOM)</div>';

    const slots = [];
    for(let i=0;i<7;i++){const s=makeSlot(i);towerWrap.appendChild(s);slots.push(s);}

    shuffle([0,1,2,3,4,5,6]).forEach(li => {
      const b=makeBlock(li,true); b.dataset.li=li; pile.appendChild(b);
    });

    area.appendChild(pile); area.appendChild(towerWrap);

    let placed = 0;
    wireStack(area, slots, (si, li, block) => {
      if(slots[si].dataset.f==='1'){sfx.fail();flashRed();return;}
      if(li===si){
        sfx.pop(); placeBlock(slots[si],block,li);
        score+=10; hud.setRight('Score: '+score);
        if(++placed===7){
          fireworks(); sfx.win();
          const env=document.createElement('div');
          env.style.cssText='position:absolute;top:50%;font-size:40px;z-index:200;animation:m8env 1.5s ease-in-out forwards;pointer-events:none;';
          env.textContent='📨'; root.appendChild(env);
          to(()=>env.remove(),1600);
          to(()=>{ round1Done=true; transition('MESSAGE SENT! 📨','Round 1 Complete!',round2); },1800);
        }
      } else {
        sfx.fail(); flashRed();
        block.style.animation='m8bnc 0.4s ease';
        to(()=>{block.style.animation='';},400);
      }
    });
  }

  // ── Round 2 ──────────────────────────────────────────────────────────────────
  function round2() {
    hud.setCenter('Round 2 — Quiz! (Use cheat sheet →)'); hud.setRight('Score: '+score);
    const qs=shuffle(QUIZ).slice(0,5); let qi=0, correct=0;
    const cheatSheet = makeCheatSheet(); root.appendChild(cheatSheet);

    function showQ() {
      clearArea();
      if(qi>=qs.length){cheatSheet.remove(); round2Score=correct/qs.length; transition(`${correct}/${qs.length} correct`,'Round 2 Complete!',round3); return;}
      const area=document.createElement('div');
      area.className='m8area';
      area.style.cssText='position:absolute;inset:48px 0 0 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:16px;';
      root.appendChild(area);

      const prog=document.createElement('div');
      prog.style.cssText='color:#46f0c0;font-size:11px;letter-spacing:2px;';
      prog.textContent=`QUESTION ${qi+1} / ${qs.length}`;

      const timerEl=document.createElement('div');
      timerEl.style.cssText='font-size:32px;font-weight:700;color:#ff6b6b;width:56px;height:56px;border-radius:50%;border:3px solid #ff6b6b;display:flex;align-items:center;justify-content:center;';
      timerEl.textContent='6';

      const qEl=document.createElement('div');
      qEl.style.cssText='font-size:16px;color:#fff;font-weight:700;text-align:center;max-width:420px;line-height:1.5;';
      qEl.textContent=qs[qi].q;

      const optWrap=document.createElement('div');
      optWrap.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:10px;width:min(560px,96vw);';

      area.appendChild(prog); area.appendChild(timerEl); area.appendChild(qEl); area.appendChild(optWrap);

      const ca=qs[qi].a;
      const opts=shuffle([ca,...shuffle([0,1,2,3,4,5,6].filter(i=>i!==ca)).slice(0,3)]);
      let answered=false;

      opts.forEach(li => {
        const btn=makeBlock(li,false); btn.style.cursor='pointer'; btn.style.width='100%';
        btn.addEventListener('click', ()=>{
          if(answered)return; answered=true; clearInterval(tid);
          if(li===ca){correct++;score+=20;btn.style.boxShadow=`0 0 16px ${LAYERS[li].color}`;btn.style.borderColor='#00ff88';sfx.pop();}
          else{score=Math.max(0,score-5);btn.style.borderColor='#ff4444';sfx.fail();flashRed();
            optWrap.querySelectorAll('.m8b').forEach((b,bi)=>{if(opts[bi]===ca)b.style.borderColor='#00ff88';});
          }
          hud.setRight('Score: '+score);
          to(()=>{qi++;showQ();},900);
        });
        optWrap.appendChild(btn);
      });

      let t=6;
      const tid=iv(()=>{
        t--; timerEl.textContent=t;
        if(t<=1)timerEl.style.animation='m8tf 0.5s infinite';
        if(t<=0){clearInterval(tid);if(!answered){answered=true;sfx.fail();score=Math.max(0,score-5);hud.setRight('Score: '+score);to(()=>{qi++;showQ();},600);}}
      },1000);
      T(()=>clearInterval(tid));
    }
    showQ();
  }

  // ── Round 3 ──────────────────────────────────────────────────────────────────
  function round3() {
    let tLeft=30;
    hud.setCenter('Round 3 — Speed Stack! ⏱ '+tLeft+'s'); hud.setRight('Score: '+score);
    clearArea();

    const area=document.createElement('div');
    area.className='m8area';
    area.style.cssText='position:absolute;inset:48px 0 0 0;display:flex;align-items:center;justify-content:center;gap:36px;padding:12px;overflow:hidden;';
    root.appendChild(area);

    const pile=document.createElement('div');
    pile.style.cssText='display:flex;flex-direction:column;gap:10px;align-items:center;';

    const towerWrap=document.createElement('div');
    towerWrap.style.cssText='display:flex;flex-direction:column;gap:0;align-items:center;';
    towerWrap.innerHTML='<div style="color:#ff6b6b;font-size:10px;letter-spacing:2px;margin-bottom:8px;">SPEED TOWER</div>';

    const slots=[];
    for(let i=0;i<7;i++){const s=makeSlot(i);towerWrap.appendChild(s);slots.push(s);}
    shuffle([0,1,2,3,4,5,6]).forEach(li=>{const b=makeBlock(li,true);b.dataset.li=li;pile.appendChild(b);});
    area.appendChild(pile); area.appendChild(towerWrap);

    let placed=0, done=false;

    const tid=iv(()=>{
      tLeft--;
      const c=tLeft<=10?'#ff6b6b':'#46f0c0';
      hud.setCenter(`Round 3 — Speed Stack! <span style="color:${c}">⏱ ${tLeft}s</span>`);
      if(tLeft<=0&&!done){done=true;clearInterval(tid);finish(0);}
    },1000);
    T(()=>clearInterval(tid));

    wireStack(area, slots, (si,li,block)=>{
      if(slots[si].dataset.f==='1'){sfx.fail();flashRed();return;}
      if(li===si){
        sfx.pop(); placeBlock(slots[si],block,li); score+=15; hud.setRight('Score: '+score);
        if(++placed===7&&!done){done=true;clearInterval(tid);fireworks();sfx.win();to(()=>finish(tLeft),1200);}
      } else {
        sfx.fail();flashRed();block.style.animation='m8bnc 0.4s ease';to(()=>{block.style.animation='';},400);
      }
    });

    function finish(rem){
      round3TimeLeft=rem;
      to(()=>{
        let stars=round1Done?1:0;
        if(round1Done&&round2Score>=0.6)stars=2;
        if(round1Done&&round2Score>=0.6&&rem>15)stars=3;
        const coins=score+stars*20;
        showStarResult(root,{
          stars,maxStars:3,
          title:['Tower Toppled!','Layer by Layer!','OSI Architect! 🏆','Network Master! 🏆'][stars],
          lines:[
            `Score: ${score} pts`,
            `Quiz: ${Math.round(round2Score*100)}% correct`,
            rem>0?`Speed stack: ${rem}s left`:'Speed stack timed out',
            '─────────────────────────',
            '📡 Every email, video call, webpage you load travels all 7 layers',
            '🔒 HTTPS is Layer 6/7. IP routing is Layer 3. WiFi is Layer 1/2.',
            '💡 Engineers use OSI to debug: "Is this a Layer 3 routing problem?"',
          ],
          coins,color:'#46f0c0',
          onContinue:(action,s)=>{ cleanup(); if(action!=='retry') onComplete(s,coins); else launch(app,state,onComplete); }
        });
      },500);
    }
  }

  // ── Encapsulation animation — shown before Round 1 ────────────────────────
  function showEncapsulation(onDone) {
    const panel = document.createElement('div');
    panel.style.cssText = `position:absolute;inset:0;background:#0a0800;z-index:100;
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;
      overflow:hidden;`;

    const title = document.createElement('div');
    title.style.cssText = 'color:#ff9f43;font-size:13px;letter-spacing:3px;font-weight:700;margin-bottom:12px;text-transform:uppercase;';
    title.textContent = '📨 How data travels through OSI layers';
    panel.appendChild(title);

    // The "email" content core
    const emailBox = document.createElement('div');
    emailBox.style.cssText = `
      font-size:13px;font-weight:700;color:#fff;
      background:#1a1200;border:2px solid #ff9f43;border-radius:8px;
      padding:6px 18px;margin-bottom:6px;white-space:nowrap;
      box-shadow:0 0 10px #ff9f4344;
    `;
    emailBox.textContent = '📧  "Hello, world!"  (your email)';
    panel.appendChild(emailBox);

    // Build each layer envelope one by one
    const layerEls = [];
    LAYERS.forEach((L, i) => {
      const wrap = document.createElement('div');
      wrap.style.cssText = `
        width:${220 + i*28}px;background:${L.color}18;border:2px solid ${L.color}88;
        border-radius:8px;padding:4px 10px;display:flex;align-items:center;gap:8px;
        opacity:0;transform:translateY(-12px);transition:opacity 0.35s,transform 0.35s;
        font-size:11px;color:${L.color};font-weight:700;margin-bottom:4px;
      `;
      wrap.innerHTML = `<span style="font-size:16px">${L.emoji}</span><span>Layer ${L.num}: ${L.name}</span>`;
      panel.appendChild(wrap);
      layerEls.push(wrap);
    });

    const skipBtn = document.createElement('button');
    skipBtn.style.cssText = `margin-top:18px;padding:10px 30px;border-radius:10px;border:none;
      background:#ff9f43;color:#000;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;`;
    skipBtn.textContent = 'Start Round 1 ▶';
    skipBtn.style.opacity = '0';
    skipBtn.style.transition = 'opacity 0.4s';
    skipBtn.onclick = () => { panel.remove(); onDone(); };
    panel.appendChild(skipBtn);

    root.appendChild(panel);

    // Animate layers appearing one by one (bottom layer = Physical = wraps first)
    const revOrder = [...layerEls].reverse(); // Physical first, Application last
    revOrder.forEach((el, i) => {
      to(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        sfx.pop && sfx.pop();
      }, 300 + i * 350);
    });
    // Show button after all layers revealed
    to(() => { skipBtn.style.opacity = '1'; }, 300 + LAYERS.length * 350 + 200);
  }

  showLessonBanner(root, {
    concept: t('m8.concept'),
    detail: t('m8.banner'),
    color: '#ff9f43',
  });

  showIntro(root, {
    emoji: '🏗️',
    title: t('m8.title'),
    concept: t('m8.concept'),
    howto: t('m8.howto'),
    color: '#ff9f43',
    onStart: () => {
      hud.setLeft('🏗️ Tower of Babel');
      showEncapsulation(() => round1());
    },
  });
}

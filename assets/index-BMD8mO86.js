import{a as Q,s as _,t as L,b as J,d as V}from"./main-BAQBCe3n.js";import{s as M}from"./sfx-DMPbFRfs.js";import"./modulepreload-polyfill-B5Qt9EMX.js";const Y=[{id:"medical",emoji:"🚑",label:"EMERGENCY",priority:4,color:"#ff6b6b"},{id:"satellite",emoji:"🛰",label:"CRITICAL",priority:3,color:"#c9b6ff"},{id:"gifts",emoji:"🎁",label:"NORMAL",priority:2,color:"#ffd700"},{id:"pizza",emoji:"🍕",label:"LOW",priority:1,color:"#ff9944"}];let Z=0;function T(){return{...Y[Math.floor(Math.random()*Y.length)],uid:++Z}}function ee(){if(document.getElementById("m3-styles"))return;const x=document.createElement("style");x.id="m3-styles",x.textContent=`
    .m3-col { position:absolute;top:56px;bottom:140px;width:44%;overflow-y:auto;
      display:flex;flex-direction:column;gap:8px;padding:8px;
      background:rgba(255,255,255,0.03);border-radius:12px; }
    .m3-col-left  { left:2%; }
    .m3-col-right { right:2%; }
    @media(max-width:500px){
      .m3-col { width:48%;bottom:110px; }
      .m3-col-left  { left:1%; }
      .m3-col-right { right:1%; }
      .m3-card { min-height:56px;padding:8px; }
      .m3-card-emoji { font-size:22px; }
      .m3-card-label { font-size:10px; }
      .m3-pad { height:100px; }
      .m3-countdown { font-size:22px; }
    }
    .m3-col-title { font-size:10px;letter-spacing:2px;color:#8aa6b4;
      text-transform:uppercase;text-align:center;margin-bottom:4px;font-weight:700; }
    .m3-card { border-radius:12px;padding:10px 12px;cursor:grab;user-select:none;
      display:flex;align-items:center;gap:10px;
      border:2px solid transparent;transition:transform 0.15s,opacity 0.15s;
      min-height:68px;position:relative;font-family:'Space Mono',monospace,sans-serif; }
    .m3-card:hover { transform:scale(1.03); }
    .m3-card.dragging { opacity:0.4; transform:scale(0.96); }
    .m3-card-emoji { font-size:28px;line-height:1; }
    .m3-card-info  { flex:1;min-width:0; }
    .m3-card-label { font-size:11px;font-weight:700;letter-spacing:1px; }
    .m3-card-pri   { font-size:10px;opacity:0.7;margin-top:2px; }
    .m3-badge { font-size:9px;font-weight:700;padding:2px 6px;border-radius:6px;
      background:rgba(0,0,0,0.35);letter-spacing:1px;white-space:nowrap; }
    .m3-drop-zone  { border:2px dashed rgba(255,255,255,0.15);border-radius:12px;
      min-height:68px;display:flex;align-items:center;justify-content:center;
      font-size:11px;color:rgba(255,255,255,0.25);letter-spacing:1px; }
    .m3-drop-zone.drag-over { border-color:#46f0c0;background:rgba(70,240,192,0.08); }
    .m3-pad { position:absolute;bottom:0;left:0;right:0;height:130px;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:rgba(0,0,0,0.4);border-top:1px solid rgba(255,255,255,0.08); }
    .m3-pad-label { font-size:10px;letter-spacing:2px;color:#8aa6b4;
      text-transform:uppercase;margin-bottom:4px; }
    .m3-countdown { font-size:28px;font-weight:700;color:#46f0c0;font-family:'Space Mono',monospace; }
    @keyframes m3-launch {
      0%   { transform:translateY(0) scale(1); opacity:1; }
      40%  { transform:translateY(-60px) scale(1.1); opacity:1; }
      100% { transform:translateY(-320px) scale(0.5); opacity:0; }
    }
    @keyframes m3-shake-screen {
      0%,100% { transform:translateX(0); }
      20%,60% { transform:translateX(-10px); }
      40%,80% { transform:translateX(10px); }
    }
    @keyframes m3-flash-red {
      0%,100% { box-shadow:none; }
      50%      { box-shadow:0 0 0 4px #ff3860 inset; }
    }
    @keyframes m3-flash-green {
      0%,100% { box-shadow:none; }
      50%      { box-shadow:0 0 0 4px #46f0c0 inset; }
    }
    @keyframes m3-pulse {
      0%,100% { transform:scale(1); }
      50%      { transform:scale(1.05); }
    }
    @keyframes m3-particle {
      0%   { transform:translate(0,0) scale(1); opacity:1; }
      100% { transform:translate(var(--dx),var(--dy)) scale(0); opacity:0; }
    }
    .m3-surge { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      font-size:32px;font-weight:700;color:#ff9944;letter-spacing:3px;
      text-shadow:0 0 24px #ff9944;pointer-events:none;z-index:80;
      animation:popIn 0.4s ease both; }
    @keyframes popIn {
      0%   { transform:translate(-50%,-50%) scale(0.5); opacity:0; }
      70%  { transform:translate(-50%,-50%) scale(1.15); opacity:1; }
      100% { transform:translate(-50%,-50%) scale(1); opacity:1; }
    }
  `,document.head.appendChild(x)}function ae(x,te,R){ee();const r=document.createElement("div");r.style.cssText=`position:fixed;inset:0;background:#05001a;z-index:10;
    font-family:'Space Mono',monospace,sans-serif;overflow:hidden;`,x.appendChild(r);const h=document.createElement("canvas");h.style.cssText="position:absolute;inset:0;pointer-events:none;",r.appendChild(h);function X(){const n=window.devicePixelRatio||1;h.width=r.clientWidth*n,h.height=r.clientHeight*n,h.style.width=r.clientWidth+"px",h.style.height=r.clientHeight+"px";const o=h.getContext("2d");o.setTransform(n,0,0,n,0,0),o.clearRect(0,0,r.clientWidth,r.clientHeight);for(let e=0;e<120;e++){const t=Math.random()*r.clientWidth,a=Math.random()*r.clientHeight,i=Math.random()*1.5+.3;o.beginPath(),o.arc(t,a,i,0,Math.PI*2),o.fillStyle=`rgba(255,255,255,${.3+Math.random()*.5})`,o.fill()}}X();let s=[],c=[],v=0,z=90,m=0,$=0,k=!1,b=8,C=null,f=null;const y=Q(r,{color:"#c9b6ff"});y.leftEl.style.cursor="pointer",y.leftEl.title="Quit",y.leftEl.addEventListener("click",()=>S(!0));function N(){y.setLeft("◀ Back"),y.setCenter(`🚀 ${m}/10 &nbsp;|&nbsp; ✅ ${$} correct &nbsp;|&nbsp; ⭐ ${v}pts`),y.setRight(`⏱ ${z}s`)}const g=document.createElement("div");g.className="m3-col m3-col-left",r.appendChild(g);const u=document.createElement("div");u.className="m3-col m3-col-right",r.appendChild(u);const I=document.createElement("div");I.className="m3-pad",I.innerHTML=`
    <div class="m3-pad-label">🚀 LAUNCH PAD — next launch in</div>
    <div class="m3-countdown" id="m3-cd">8s</div>
    <div style="font-size:10px;color:#8aa6b4;margin-top:4px;letter-spacing:1px;">
      Drag rockets into queue → priority order wins!
    </div>`,r.appendChild(I);function P(n,o,e){const t=document.createElement("div");t.className="m3-card",t.draggable=!0,t.style.cssText+=`background:${n.color}22;border-color:${n.color}55;`,t.innerHTML=`
      <div class="m3-card-emoji">${n.emoji}</div>
      <div class="m3-card-info">
        <div class="m3-card-label" style="color:${n.color}">${n.label}</div>
        <div class="m3-card-pri">Priority ${n.priority}</div>
      </div>
      <div class="m3-badge" style="color:${n.color}">P${n.priority}</div>`,t.addEventListener("dragstart",p=>{C=o,f=e,t.classList.add("dragging"),p.dataTransfer.effectAllowed="move"}),t.addEventListener("dragend",()=>t.classList.remove("dragging"));let a=null,i=0,d=0;return t.addEventListener("touchstart",p=>{const l=p.touches[0];C=o,f=e,i=l.clientX-t.getBoundingClientRect().left,d=l.clientY-t.getBoundingClientRect().top,a=t.cloneNode(!0),a.style.cssText+=`position:fixed;z-index:999;opacity:0.85;pointer-events:none;
        width:${t.offsetWidth}px;left:${l.clientX-i}px;top:${l.clientY-d}px;`,document.body.appendChild(a)},{passive:!0}),t.addEventListener("touchmove",p=>{p.preventDefault();const l=p.touches[0];a&&(a.style.left=l.clientX-i+"px",a.style.top=l.clientY-d+"px")},{passive:!1}),t.addEventListener("touchend",p=>{a&&(a.remove(),a=null);const l=p.changedTouches[0],H=document.elementFromPoint(l.clientX,l.clientY),W=H&&H.closest(".m3-col");W===u?w("queue",null):W===g&&w("incoming",null)}),t}function E(){g.innerHTML="",u.innerHTML="";const n=document.createElement("div");n.className="m3-col-title",n.textContent=`📡 INCOMING (${s.length}/5)`,g.appendChild(n);const o=document.createElement("div");if(o.className="m3-col-title",o.textContent="🚀 LAUNCH QUEUE",u.appendChild(o),s.length===0){const t=document.createElement("div");t.className="m3-drop-zone",t.textContent="AWAITING ROCKETS…",g.appendChild(t)}else s.forEach((t,a)=>g.appendChild(P(t,"incoming",a)));const e=document.createElement("div");e.className="m3-drop-zone",e.style.minHeight=c.length===0?"80px":"44px",e.textContent=c.length===0?"DROP ROCKETS HERE":"+",e.addEventListener("dragover",t=>{t.preventDefault(),e.classList.add("drag-over")}),e.addEventListener("dragleave",()=>e.classList.remove("drag-over")),e.addEventListener("drop",t=>{t.preventDefault(),e.classList.remove("drag-over"),w("queue",null)}),u.appendChild(e),c.forEach((t,a)=>{const i=P(t,"queue",a);i.addEventListener("dragover",d=>{d.preventDefault(),i.style.borderTopColor="#46f0c0"}),i.addEventListener("dragleave",()=>{i.style.borderTopColor=t.color+"55"}),i.addEventListener("drop",d=>{d.preventDefault(),i.style.borderTopColor=t.color+"55",w("queue",a)}),u.appendChild(i)}),u.addEventListener("dragover",t=>{t.preventDefault()}),u.addEventListener("drop",t=>{t.preventDefault(),w("queue",null)}),N(),document.getElementById("m3-cd").textContent=b+"s"}function w(n,o){if(C===null)return;let e;if(C==="incoming"){if(f===null||f>=s.length)return;e=s.splice(f,1)[0]}else{if(f===null||f>=c.length)return;e=c.splice(f,1)[0]}n==="queue"?o===null?c.push(e):c.splice(o,0,e):s.push(e),C=null,f=null,M.swipe(),E()}function q(){if(c.length===0)return;const n=Math.max(...c.map(t=>t.priority)),o=c.shift(),e=o.priority===n;m++,e?($++,v+=50,M.launch(),A(o.emoji,o.color),D("green"),j(`✅ Correct! P${o.priority} launched first`,"#46f0c0")):(v=Math.max(0,v-20),M.fail(),D("red"),j(`❌ Wrong order! P${n} should launch first`,"#ff6b6b")),b=8,E(),B()}function j(n,o){const e=document.createElement("div");e.style.cssText=`position:absolute;top:60px;left:50%;transform:translateX(-50%);
      background:rgba(0,0,0,0.8);border:1px solid ${o};border-radius:10px;
      padding:8px 16px;font-size:12px;font-weight:700;color:${o};
      z-index:90;pointer-events:none;white-space:nowrap;
      animation:popIn 0.3s ease both;`,e.textContent=n,r.appendChild(e),setTimeout(()=>e.remove(),1800)}function A(n,o){const e=document.createElement("div");e.style.cssText=`position:absolute;bottom:145px;left:50%;transform:translateX(-50%);
      font-size:36px;pointer-events:none;z-index:70;animation:m3-launch 0.7s ease-out forwards;`,e.textContent=n,r.appendChild(e),setTimeout(()=>e.remove(),750);for(let t=0;t<12;t++){const a=document.createElement("div"),i=-90+(Math.random()-.5)*60,d=60+Math.random()*80,p=Math.round(Math.cos(i*Math.PI/180)*d),l=Math.round(Math.sin(i*Math.PI/180)*d);a.style.cssText=`position:absolute;bottom:145px;left:50%;
        width:8px;height:8px;border-radius:50%;
        background:${o};pointer-events:none;z-index:69;
        --dx:${p}px;--dy:${l}px;
        animation:m3-particle 0.6s ease-out ${t*30}ms forwards;`,r.appendChild(a),setTimeout(()=>a.remove(),700)}}function D(n){r.style.animation="",r.offsetWidth,n==="red"?(r.style.animation="m3-shake-screen 0.4s ease",setTimeout(()=>{r.style.animation=""},420)):(r.style.boxShadow="inset 0 0 40px #46f0c080",setTimeout(()=>{r.style.boxShadow=""},600))}function O(){const n=Math.min(3,5-s.length);for(let e=0;e<n;e++)s.push(T());const o=document.createElement("div");o.className="m3-surge",o.textContent="⚡ SURGE! ⚡",r.appendChild(o),setTimeout(()=>o.remove(),1800),M.boom(),E()}function B(){m>=10&&S(!1)}function S(n){if(k)return;if(k=!0,clearInterval(K),clearInterval(G),clearInterval(F),n){R(0,0),r.remove();return}const o=m>0?$/m:0;let e=0;m>=5&&(e=1),m>=8&&o>.6&&(e=2),m>=10&&o>.8&&(e=3);const t=e*30+Math.floor(v/10);V(r,{stars:e,title:e===3?"Perfect Mission! 🚀":e===2?"Great Work!":"Mission Done",lines:[`Rockets launched: ${m}`,`Correct order: ${Math.round(o*100)}%`,`Score: ${v} pts`,'<br><strong style="color:#46f0c0">You just built a priority queue — the same algorithm hospitals,<br>911 centers, and internet routers use every second! 🌐</strong>'],coins:t,color:"#c9b6ff",onContinue:()=>{R(e,t),r.remove()}})}function U(){s.length<5&&(s.push(T()),E())}const G=setInterval(U,3e3),F=setInterval(O,2e4),K=setInterval(()=>{if(k)return;z--,b--,N();const n=document.getElementById("m3-cd");n&&(n.textContent=b+"s"),b<=0&&(b=8,q()),z<=0&&S(!1)},1e3);_(r,{concept:L("m3.concept"),detail:L("m3.banner"),color:"#ff6b35"}),J(r,{emoji:"🚀",title:L("m3.title"),concept:L("m3.concept"),howto:L("m3.howto"),color:"#c9b6ff",onStart:()=>{s.push(T()),s.push(T()),E()}})}export{ae as launch};

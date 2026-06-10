import{a as F,s as K,b as V,d as _}from"./main-BfiLMSbv.js";import{s as L}from"./sfx-DMPbFRfs.js";import"./modulepreload-polyfill-B5Qt9EMX.js";const H=[{id:"medical",emoji:"🚑",label:"EMERGENCY",priority:4,color:"#ff6b6b"},{id:"satellite",emoji:"🛰",label:"CRITICAL",priority:3,color:"#c9b6ff"},{id:"gifts",emoji:"🎁",label:"NORMAL",priority:2,color:"#ffd700"},{id:"pizza",emoji:"🍕",label:"LOW",priority:1,color:"#ff9944"}];let J=0;function M(){return{...H[Math.floor(Math.random()*H.length)],uid:++J}}function Z(){if(document.getElementById("m3-styles"))return;const x=document.createElement("style");x.id="m3-styles",x.textContent=`
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
  `,document.head.appendChild(x)}function re(x,ee,S){Z();const o=document.createElement("div");o.style.cssText=`position:fixed;inset:0;background:#05001a;z-index:10;
    font-family:'Space Mono',monospace,sans-serif;overflow:hidden;`,x.appendChild(o);const h=document.createElement("canvas");h.style.cssText="position:absolute;inset:0;pointer-events:none;",o.appendChild(h);function q(){const n=window.devicePixelRatio||1;h.width=o.clientWidth*n,h.height=o.clientHeight*n,h.style.width=o.clientWidth+"px",h.style.height=o.clientHeight+"px";const r=h.getContext("2d");r.setTransform(n,0,0,n,0,0),r.clearRect(0,0,o.clientWidth,o.clientHeight);for(let t=0;t<120;t++){const e=Math.random()*o.clientWidth,i=Math.random()*o.clientHeight,a=Math.random()*1.5+.3;r.beginPath(),r.arc(e,i,a,0,Math.PI*2),r.fillStyle=`rgba(255,255,255,${.3+Math.random()*.5})`,r.fill()}}q();let s=[],l=[],v=0,T=90,m=0,$=0,k=!1,b=8,E=null,f=null;const y=F(o,{color:"#c9b6ff"});y.leftEl.style.cursor="pointer",y.leftEl.title="Quit",y.leftEl.addEventListener("click",()=>I(!0));function N(){y.setLeft("◀ Back"),y.setCenter(`⭐ ${v}pts &nbsp;|&nbsp; 🚀 ${m} launched`),y.setRight(`⏱ ${T}s`)}const g=document.createElement("div");g.className="m3-col m3-col-left",o.appendChild(g);const u=document.createElement("div");u.className="m3-col m3-col-right",o.appendChild(u);const z=document.createElement("div");z.className="m3-pad",z.innerHTML=`
    <div class="m3-pad-label">🚀 LAUNCH PAD — next launch in</div>
    <div class="m3-countdown" id="m3-cd">8s</div>
    <div style="font-size:10px;color:#8aa6b4;margin-top:4px;letter-spacing:1px;">
      Drag rockets into queue → priority order wins!
    </div>`,o.appendChild(z);function R(n,r,t){const e=document.createElement("div");e.className="m3-card",e.draggable=!0,e.style.cssText+=`background:${n.color}22;border-color:${n.color}55;`,e.innerHTML=`
      <div class="m3-card-emoji">${n.emoji}</div>
      <div class="m3-card-info">
        <div class="m3-card-label" style="color:${n.color}">${n.label}</div>
        <div class="m3-card-pri">Priority ${n.priority}</div>
      </div>
      <div class="m3-badge" style="color:${n.color}">P${n.priority}</div>`,e.addEventListener("dragstart",p=>{E=r,f=t,e.classList.add("dragging"),p.dataTransfer.effectAllowed="move"}),e.addEventListener("dragend",()=>e.classList.remove("dragging"));let i=null,a=0,d=0;return e.addEventListener("touchstart",p=>{const c=p.touches[0];E=r,f=t,a=c.clientX-e.getBoundingClientRect().left,d=c.clientY-e.getBoundingClientRect().top,i=e.cloneNode(!0),i.style.cssText+=`position:fixed;z-index:999;opacity:0.85;pointer-events:none;
        width:${e.offsetWidth}px;left:${c.clientX-a}px;top:${c.clientY-d}px;`,document.body.appendChild(i)},{passive:!0}),e.addEventListener("touchmove",p=>{p.preventDefault();const c=p.touches[0];i&&(i.style.left=c.clientX-a+"px",i.style.top=c.clientY-d+"px")},{passive:!1}),e.addEventListener("touchend",p=>{i&&(i.remove(),i=null);const c=p.changedTouches[0],j=document.elementFromPoint(c.clientX,c.clientY),D=j&&j.closest(".m3-col");D===u?w("queue",null):D===g&&w("incoming",null)}),e}function C(){g.innerHTML="",u.innerHTML="";const n=document.createElement("div");n.className="m3-col-title",n.textContent=`📡 INCOMING (${s.length}/5)`,g.appendChild(n);const r=document.createElement("div");if(r.className="m3-col-title",r.textContent="🚀 LAUNCH QUEUE",u.appendChild(r),s.length===0){const e=document.createElement("div");e.className="m3-drop-zone",e.textContent="AWAITING ROCKETS…",g.appendChild(e)}else s.forEach((e,i)=>g.appendChild(R(e,"incoming",i)));const t=document.createElement("div");t.className="m3-drop-zone",t.style.minHeight=l.length===0?"80px":"44px",t.textContent=l.length===0?"DROP ROCKETS HERE":"+",t.addEventListener("dragover",e=>{e.preventDefault(),t.classList.add("drag-over")}),t.addEventListener("dragleave",()=>t.classList.remove("drag-over")),t.addEventListener("drop",e=>{e.preventDefault(),t.classList.remove("drag-over"),w("queue",null)}),u.appendChild(t),l.forEach((e,i)=>{const a=R(e,"queue",i);a.addEventListener("dragover",d=>{d.preventDefault(),a.style.borderTopColor="#46f0c0"}),a.addEventListener("dragleave",()=>{a.style.borderTopColor=e.color+"55"}),a.addEventListener("drop",d=>{d.preventDefault(),a.style.borderTopColor=e.color+"55",w("queue",i)}),u.appendChild(a)}),u.addEventListener("dragover",e=>{e.preventDefault()}),u.addEventListener("drop",e=>{e.preventDefault(),w("queue",null)}),N(),document.getElementById("m3-cd").textContent=b+"s"}function w(n,r){if(E===null)return;let t;if(E==="incoming"){if(f===null||f>=s.length)return;t=s.splice(f,1)[0]}else{if(f===null||f>=l.length)return;t=l.splice(f,1)[0]}n==="queue"?r===null?l.push(t):l.splice(r,0,t):s.push(t),E=null,f=null,L.swipe(),C()}function Y(){if(l.length===0)return;const n=l.shift();l.length>0&&Math.max(...l.map(e=>e.priority));const t=[...l,...s].map(e=>e.priority).every(e=>e<=n.priority);m++,t?($++,v+=50,L.launch(),W(n.emoji,n.color),P("green")):(v=Math.max(0,v-20),L.fail(),P("red"),A()),b=8,C(),X()}function W(n,r){const t=document.createElement("div");t.style.cssText=`position:absolute;bottom:145px;left:50%;transform:translateX(-50%);
      font-size:36px;pointer-events:none;z-index:70;animation:m3-launch 0.7s ease-out forwards;`,t.textContent=n,o.appendChild(t),setTimeout(()=>t.remove(),750);for(let e=0;e<12;e++){const i=document.createElement("div"),a=-90+(Math.random()-.5)*60,d=60+Math.random()*80,p=Math.round(Math.cos(a*Math.PI/180)*d),c=Math.round(Math.sin(a*Math.PI/180)*d);i.style.cssText=`position:absolute;bottom:145px;left:50%;
        width:8px;height:8px;border-radius:50%;
        background:${r};pointer-events:none;z-index:69;
        --dx:${p}px;--dy:${c}px;
        animation:m3-particle 0.6s ease-out ${e*30}ms forwards;`,o.appendChild(i),setTimeout(()=>i.remove(),700)}}function P(n){o.style.animation="",o.offsetWidth,n==="red"?(o.style.animation="m3-shake-screen 0.4s ease",setTimeout(()=>{o.style.animation=""},420)):(o.style.boxShadow="inset 0 0 40px #46f0c080",setTimeout(()=>{o.style.boxShadow=""},600))}function A(){const n=document.createElement("div");n.style.cssText=`position:absolute;top:50%;left:50%;
      transform:translate(-50%,-50%);
      background:#1a0010;border:2px solid #ff3860;border-radius:16px;
      padding:18px 32px;font-size:20px;font-weight:700;color:#ff3860;
      z-index:90;pointer-events:none;text-align:center;
      animation:popIn 0.3s ease both;`,n.textContent="MISSION FAILED 💥",o.appendChild(n),setTimeout(()=>n.remove(),1500)}function O(){const n=Math.min(3,5-s.length);for(let t=0;t<n;t++)s.push(M());const r=document.createElement("div");r.className="m3-surge",r.textContent="⚡ SURGE! ⚡",o.appendChild(r),setTimeout(()=>r.remove(),1800),L.boom(),C()}function X(){m>=10&&I(!1)}function I(n){if(k)return;if(k=!0,clearInterval(Q),clearInterval(U),clearInterval(G),n){S(0,0),o.remove();return}const r=m>0?$/m:0;let t=0;m>=5&&(t=1),m>=8&&r>.6&&(t=2),m>=10&&r>.8&&(t=3);const e=t*30+Math.floor(v/10);_(o,{stars:t,title:t===3?"Perfect Mission! 🚀":t===2?"Great Work!":"Mission Done",lines:[`Rockets launched: ${m}`,`Correct order: ${Math.round(r*100)}%`,`Score: ${v} pts`,'<br><strong style="color:#46f0c0">You just built a priority queue — the same algorithm hospitals,<br>911 centers, and internet routers use every second! 🌐</strong>'],coins:e,color:"#c9b6ff",onContinue:()=>{S(t,e),o.remove()}})}function B(){s.length<5&&(s.push(M()),C())}const U=setInterval(B,3e3),G=setInterval(O,2e4),Q=setInterval(()=>{if(k)return;T--,b--,N();const n=document.getElementById("m3-cd");n&&(n.textContent=b+"s"),b<=0&&(b=8,Y()),T<=0&&I(!1)},1e3);K(o,{concept:"Priority Queues & Scheduling",detail:"Networks prioritise critical traffic (VoIP, video) over bulk data. This is called QoS — Quality of Service.",color:"#ff6b35"}),V(o,{emoji:"🚀",title:"Rocket Launch",concept:"Priority scheduling decides which tasks run first. Emergency signals jump the queue — just like 911 calls skip phone congestion.",howto:"Drag rockets into the launch queue. High-priority rockets (red) must launch before low-priority ones!",color:"#ff6b35",onStart:()=>{s.push(M()),s.push(M()),C()}})}export{re as launch};

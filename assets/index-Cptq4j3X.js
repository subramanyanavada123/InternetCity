import{a as _,s as J,t as L,b as V,d as Z}from"./main-BGDcQ2ZI.js";import{s as M}from"./sfx-DMPbFRfs.js";import"./modulepreload-polyfill-B5Qt9EMX.js";const Y=[{id:"medical",emoji:"🚑",label:"EMERGENCY",priority:4,rank:1,color:"#ff6b6b"},{id:"satellite",emoji:"🛰",label:"CRITICAL",priority:3,rank:2,color:"#c9b6ff"},{id:"gifts",emoji:"🎁",label:"NORMAL",priority:2,rank:3,color:"#ffd700"},{id:"pizza",emoji:"🍕",label:"LOW",priority:1,rank:4,color:"#ff9944"}];let ee=0;function k(){return{...Y[Math.floor(Math.random()*Y.length)],uid:++ee}}function te(){if(document.getElementById("m3-styles"))return;const h=document.createElement("style");h.id="m3-styles",h.textContent=`
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
  `,document.head.appendChild(h)}function ne(h,X,T){te();const a=document.createElement("div");a.style.cssText=`position:fixed;inset:0;background:#05001a;z-index:10;
    font-family:'Space Mono',monospace,sans-serif;overflow:hidden;`,h.appendChild(a);const g=document.createElement("canvas");g.style.cssText="position:absolute;inset:0;pointer-events:none;",a.appendChild(g);function q(){const o=window.devicePixelRatio||1;g.width=a.clientWidth*o,g.height=a.clientHeight*o,g.style.width=a.clientWidth+"px",g.style.height=a.clientHeight+"px";const n=g.getContext("2d");n.setTransform(o,0,0,o,0,0),n.clearRect(0,0,a.clientWidth,a.clientHeight);for(let t=0;t<120;t++){const e=Math.random()*a.clientWidth,r=Math.random()*a.clientHeight,i=Math.random()*1.5+.3;n.beginPath(),n.arc(e,r,i,0,Math.PI*2),n.fillStyle=`rgba(255,255,255,${.3+Math.random()*.5})`,n.fill()}}q();let s=[],c=[],v=0,z=90,m=0,$=0,I=!1,b=8,C=null,f=null;const y=_(a,{color:"#c9b6ff"});y.leftEl.style.cursor="pointer",y.leftEl.title="Quit",y.leftEl.addEventListener("click",()=>R(!0));function N(){y.setLeft("◀ Back"),y.setCenter(`🚀 ${m}/10 &nbsp;|&nbsp; ✅ ${$} correct &nbsp;|&nbsp; ⭐ ${v}pts`),y.setRight(`⏱ ${z}s`)}const x=document.createElement("div");x.className="m3-col m3-col-left",a.appendChild(x);const u=document.createElement("div");u.className="m3-col m3-col-right",a.appendChild(u);const S=document.createElement("div");S.className="m3-pad",S.innerHTML=`
    <div class="m3-pad-label">🚀 LAUNCH PAD — next launch in</div>
    <div class="m3-countdown" id="m3-cd">8s</div>
    <div style="font-size:10px;color:#8aa6b4;margin-top:4px;letter-spacing:1px;">
      Drag rockets into queue → priority order wins!
    </div>`,a.appendChild(S);function j(o,n,t){const e=document.createElement("div");e.className="m3-card",e.draggable=!0,e.style.cssText+=`background:${o.color}22;border-color:${o.color}55;`,e.innerHTML=`
      <div class="m3-card-emoji">${o.emoji}</div>
      <div class="m3-card-info">
        <div class="m3-card-label" style="color:${o.color}">${o.label}</div>
        <div class="m3-card-pri">Launch order #${o.rank}</div>
      </div>
      <div class="m3-badge" style="color:${o.color}">#${o.rank}</div>`,e.addEventListener("dragstart",p=>{C=n,f=t,e.classList.add("dragging"),p.dataTransfer.effectAllowed="move"}),e.addEventListener("dragend",()=>e.classList.remove("dragging"));let r=null,i=0,d=0;return e.addEventListener("touchstart",p=>{const l=p.touches[0];C=n,f=t,i=l.clientX-e.getBoundingClientRect().left,d=l.clientY-e.getBoundingClientRect().top,r=e.cloneNode(!0),r.style.cssText+=`position:fixed;z-index:999;opacity:0.85;pointer-events:none;
        width:${e.offsetWidth}px;left:${l.clientX-i}px;top:${l.clientY-d}px;`,document.body.appendChild(r)},{passive:!0}),e.addEventListener("touchmove",p=>{p.preventDefault();const l=p.touches[0];r&&(r.style.left=l.clientX-i+"px",r.style.top=l.clientY-d+"px")},{passive:!1}),e.addEventListener("touchend",p=>{r&&(r.remove(),r=null);const l=p.changedTouches[0],P=document.elementFromPoint(l.clientX,l.clientY),W=P&&P.closest(".m3-col");W===u?w("queue",null):W===x&&w("incoming",null)}),e}function E(){x.innerHTML="",u.innerHTML="";const o=document.createElement("div");o.className="m3-col-title",o.textContent=`📡 INCOMING (${s.length}/5)`,x.appendChild(o);const n=document.createElement("div");if(n.className="m3-col-title",n.textContent="🚀 LAUNCH QUEUE",u.appendChild(n),s.length===0){const e=document.createElement("div");e.className="m3-drop-zone",e.textContent="AWAITING ROCKETS…",x.appendChild(e)}else s.forEach((e,r)=>x.appendChild(j(e,"incoming",r)));const t=document.createElement("div");t.className="m3-drop-zone",t.style.minHeight=c.length===0?"80px":"44px",t.textContent=c.length===0?"DROP ROCKETS HERE":"+",t.addEventListener("dragover",e=>{e.preventDefault(),t.classList.add("drag-over")}),t.addEventListener("dragleave",()=>t.classList.remove("drag-over")),t.addEventListener("drop",e=>{e.preventDefault(),t.classList.remove("drag-over"),w("queue",null)}),u.appendChild(t),c.forEach((e,r)=>{const i=j(e,"queue",r);i.addEventListener("dragover",d=>{d.preventDefault(),i.style.borderTopColor="#46f0c0"}),i.addEventListener("dragleave",()=>{i.style.borderTopColor=e.color+"55"}),i.addEventListener("drop",d=>{d.preventDefault(),i.style.borderTopColor=e.color+"55",w("queue",r)}),u.appendChild(i)}),u.addEventListener("dragover",e=>{e.preventDefault()}),u.addEventListener("drop",e=>{e.preventDefault(),w("queue",null)}),N(),document.getElementById("m3-cd").textContent=b+"s"}function w(o,n){if(C===null)return;let t;if(C==="incoming"){if(f===null||f>=s.length)return;t=s.splice(f,1)[0]}else{if(f===null||f>=c.length)return;t=c.splice(f,1)[0]}o==="queue"?n===null?c.push(t):c.splice(n,0,t):s.push(t),C=null,f=null,M.swipe(),E()}function A(){if(c.length===0)return;const o=Math.max(...c.map(e=>e.priority)),n=c.shift(),t=n.priority===o;if(m++,t)$++,v+=50,M.launch(),O(n.emoji,n.color),H("green"),D(`✅ Correct! ${n.label} launched first`,"#46f0c0");else{const e=c.find(r=>r.priority===o)||n;v=Math.max(0,v-20),M.fail(),H("red"),D(`❌ Wrong! ${e.label} should launch first`,"#ff6b6b")}b=8,E(),U()}function D(o,n){const t=document.createElement("div");t.style.cssText=`position:absolute;top:60px;left:50%;transform:translateX(-50%);
      background:rgba(0,0,0,0.8);border:1px solid ${n};border-radius:10px;
      padding:8px 16px;font-size:12px;font-weight:700;color:${n};
      z-index:90;pointer-events:none;white-space:nowrap;
      animation:popIn 0.3s ease both;`,t.textContent=o,a.appendChild(t),setTimeout(()=>t.remove(),1800)}function O(o,n){const t=document.createElement("div");t.style.cssText=`position:absolute;bottom:145px;left:50%;transform:translateX(-50%);
      font-size:36px;pointer-events:none;z-index:70;animation:m3-launch 0.7s ease-out forwards;`,t.textContent=o,a.appendChild(t),setTimeout(()=>t.remove(),750);for(let e=0;e<12;e++){const r=document.createElement("div"),i=-90+(Math.random()-.5)*60,d=60+Math.random()*80,p=Math.round(Math.cos(i*Math.PI/180)*d),l=Math.round(Math.sin(i*Math.PI/180)*d);r.style.cssText=`position:absolute;bottom:145px;left:50%;
        width:8px;height:8px;border-radius:50%;
        background:${n};pointer-events:none;z-index:69;
        --dx:${p}px;--dy:${l}px;
        animation:m3-particle 0.6s ease-out ${e*30}ms forwards;`,a.appendChild(r),setTimeout(()=>r.remove(),700)}}function H(o){a.style.animation="",a.offsetWidth,o==="red"?(a.style.animation="m3-shake-screen 0.4s ease",setTimeout(()=>{a.style.animation=""},420)):(a.style.boxShadow="inset 0 0 40px #46f0c080",setTimeout(()=>{a.style.boxShadow=""},600))}function B(){const o=Math.min(3,5-s.length);for(let t=0;t<o;t++)s.push(k());const n=document.createElement("div");n.className="m3-surge",n.textContent="⚡ SURGE! ⚡",a.appendChild(n),setTimeout(()=>n.remove(),1800),M.boom(),E()}function U(){m>=10&&R(!1)}function R(o){if(I)return;if(I=!0,clearInterval(Q),clearInterval(F),clearInterval(K),o){T(0,0),a.remove();return}const n=m>0?$/m:0;let t=0;m>=5&&(t=1),m>=8&&n>.6&&(t=2),m>=10&&n>.8&&(t=3);const e=t*30+Math.floor(v/10);Z(a,{stars:t,title:t===3?"Perfect Mission! 🚀":t===2?"Great Work!":"Mission Done",lines:[`Rockets launched: ${m}`,`Correct order: ${Math.round(n*100)}%`,`Score: ${v} pts`,'<br><strong style="color:#46f0c0">You just built a priority queue — the same algorithm hospitals,<br>911 centers, and internet routers use every second! 🌐</strong>'],coins:e,color:"#c9b6ff",onContinue:r=>{r!=="retry"?(T(t,e),a.remove()):(a.remove(),ne(h,X,T))}})}function G(){s.length<5&&(s.push(k()),E())}const F=setInterval(G,3e3),K=setInterval(B,2e4),Q=setInterval(()=>{if(I)return;z--,b--,N();const o=document.getElementById("m3-cd");o&&(o.textContent=b+"s"),b<=0&&(b=8,A()),z<=0&&R(!1)},1e3);J(a,{concept:L("m3.concept"),detail:L("m3.banner"),color:"#ff6b35"}),V(a,{emoji:"🚀",title:L("m3.title"),concept:L("m3.concept"),howto:L("m3.howto"),color:"#c9b6ff",onStart:()=>{s.push(k()),s.push(k()),E()}})}export{ne as launch};

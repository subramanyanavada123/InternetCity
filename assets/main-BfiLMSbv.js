const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-JVZ8gZKG.js","assets/sfx-DMPbFRfs.js","assets/modulepreload-polyfill-B5Qt9EMX.js","assets/index-BWgKxMo7.js","assets/index--Y_cTuMc.js","assets/index-BPXtX3Ul.js","assets/index-ChrjI1R6.js","assets/index-CnqDEJQi.js","assets/index-D1GhIUSz.js","assets/index-BTj5aiJG.js","assets/index-LOETdv_3.js","assets/index-DAKenrDH.js","assets/index-B7Apx_0E.js","assets/index-DRQmICga.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";const _="modulepreload",$=function(t){return"/"+t},v={},m=function(o,e,n){let r=Promise.resolve();if(e&&e.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),i=a?.nonce||a?.getAttribute("nonce");r=Promise.allSettled(e.map(c=>{if(c=$(c),c in v)return;v[c]=!0;const p=c.endsWith(".css"),d=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${d}`))return;const s=document.createElement("link");if(s.rel=p?"stylesheet":_,p||(s.as="script"),s.crossOrigin="",s.href=c,i&&s.setAttribute("nonce",i),document.head.appendChild(s),p)return new Promise((u,g)=>{s.addEventListener("load",u),s.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${c}`)))})}))}function l(a){const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=a,window.dispatchEvent(i),!i.defaultPrevented)throw a}return r.then(a=>{for(const i of a||[])i.status==="rejected"&&l(i.reason);return o().catch(l)})},y="ic2_state",b={coins:0,completedModules:[],moduleStars:{},badges:[],cityDecorations:[],totalScore:0};function k(){try{const t=localStorage.getItem(y);if(t)return{...b,...JSON.parse(t)}}catch{}return{...b}}function w(t){localStorage.setItem(y,JSON.stringify(t))}function T(t,o,e=null){const n={...t,coins:t.coins+o,totalScore:t.totalScore+o};return e&&!n.badges.includes(e)&&(n.badges=[...n.badges,e]),w(n),n}function L(t,o,e){const n=t.moduleStars[o]||0,r={...t,moduleStars:{...t.moduleStars,[o]:Math.max(n,e)},completedModules:t.completedModules.includes(o)?t.completedModules:[...t.completedModules,o]};return w(r),r}function j(t,{bgColor:o="#0a0a1a"}={}){const e=document.createElement("div");e.style.cssText=`
    position:fixed;inset:0;background:${o};
    display:flex;flex-direction:column;overflow:hidden;z-index:10;
    font-family:'Space Mono',monospace,sans-serif;
  `,t.appendChild(e);const n=document.createElement("canvas");n.style.cssText="position:absolute;inset:0;width:100%;height:100%;",e.appendChild(n);const r=()=>{const d=window.devicePixelRatio||1;n.width=e.clientWidth*d,n.height=e.clientHeight*d,n.style.width=e.clientWidth+"px",n.style.height=e.clientHeight+"px",n.getContext("2d").setTransform(d,0,0,d,0,0)};return r(),window.addEventListener("resize",r),{root:e,canvas:n,ctx:()=>n.getContext("2d"),W:()=>e.clientWidth,H:()=>e.clientHeight,destroy:()=>{window.removeEventListener("resize",r),e.remove()},canvasXY:d=>{const s=n.getBoundingClientRect(),u=d.touches?d.touches[0]:d.changedTouches?d.changedTouches[0]:d,g=s.width?e.clientWidth/s.width:1,E=s.height?e.clientHeight/s.height:1;return{x:(u.clientX-s.left)*g,y:(u.clientY-s.top)*E}}}}function z(t,{title:o,color:e="#46f0c0",width:n="min(440px,92vw)"}={}){const r=document.createElement("div");r.style.cssText=`
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);z-index:100;
  `;const l=document.createElement("div");if(l.style.cssText=`
    background:#0d1f2d;border:1px solid ${e}55;border-radius:20px;
    padding:28px 24px;width:${n};max-height:88vh;overflow-y:auto;
    box-shadow:0 8px 48px rgba(0,0,0,0.7),0 0 0 1px ${e}22;
  `,o){const i=document.createElement("div");i.style.cssText=`font-size:11px;color:${e};letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;font-weight:700;`,i.textContent=o,l.appendChild(i)}const a=document.createElement("div");return l.appendChild(a),r.appendChild(l),t.appendChild(r),{el:l,body:a,remove:()=>r.remove()}}function R(t,{color:o="#46f0c0"}={}){const e=document.createElement("div");e.style.cssText=`
    position:absolute;top:0;left:0;right:0;height:48px;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 16px;z-index:60;
    background:linear-gradient(to bottom,rgba(0,0,0,0.6),transparent);
    pointer-events:none;
  `;const n=document.createElement("div"),r=document.createElement("div"),l=document.createElement("div");return[n,r,l].forEach(a=>{a.style.cssText=`color:${o};font-size:13px;font-weight:700;pointer-events:auto;`,e.appendChild(a)}),t.appendChild(e),{el:e,setLeft:a=>{n.innerHTML=a},setCenter:a=>{r.innerHTML=a},setRight:a=>{l.innerHTML=a},leftEl:n,rightEl:l}}function A(t,o,e,n){const r=document.createElement("div");r.style.cssText=`
    position:absolute;left:${o}px;top:${e}px;
    font-size:18px;font-weight:700;color:#ffd700;
    pointer-events:none;z-index:200;
    animation:coinPop 0.9s ease-out forwards;
    text-shadow:0 2px 8px rgba(255,215,0,0.6);
  `,r.textContent=`+${n}🪙`,t.appendChild(r),setTimeout(()=>r.remove(),900)}(function(){if(document.getElementById("ic2-anims"))return;const o=document.createElement("style");o.id="ic2-anims",o.textContent=`
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
    @keyframes coinPop {
      0%   { transform:translate(-50%,-50%) scale(0.5); opacity:1; }
      60%  { transform:translate(-50%,-120%) scale(1.2); opacity:1; }
      100% { transform:translate(-50%,-180%) scale(1);   opacity:0; }
    }
    @keyframes fadeInUp {
      from { opacity:0; transform:translateY(24px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes shake {
      0%,100% { transform:translateX(0); }
      20%,60% { transform:translateX(-8px); }
      40%,80% { transform:translateX(8px); }
    }
    @keyframes popIn {
      0%   { transform:scale(0.5); opacity:0; }
      70%  { transform:scale(1.15); opacity:1; }
      100% { transform:scale(1); opacity:1; }
    }
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes float {
      0%,100% { transform:translateY(0); }
      50%     { transform:translateY(-8px); }
    }
    @keyframes glow {
      0%,100% { box-shadow:0 0 8px currentColor; }
      50%     { box-shadow:0 0 24px currentColor; }
    }
    @keyframes slideInRight {
      from { transform:translateX(120%); opacity:0; }
      to   { transform:translateX(0);   opacity:1; }
    }
    @keyframes slideOutLeft {
      from { transform:translateX(0);    opacity:1; }
      to   { transform:translateX(-120%);opacity:0; }
    }
  `,document.head.appendChild(o)})();function H(t,{concept:o,detail:e,color:n="#46f0c0"}){const r=document.createElement("div");return r.style.cssText=`
    position:absolute;bottom:0;left:0;right:0;z-index:55;
    background:linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.7) 70%,transparent 100%);
    padding:10px 16px 14px;pointer-events:none;
  `,r.innerHTML=`
    <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${n};font-weight:700;margin-bottom:2px;">💡 You're learning</div>
    <div style="font-size:13px;font-weight:700;color:#fff;">${o}</div>
    <div style="font-size:11px;color:#8aa6b4;margin-top:1px;line-height:1.4;">${e}</div>
  `,t.appendChild(r),r}function I(t,{emoji:o,title:e,concept:n,howto:r,color:l="#46f0c0",onStart:a}){const i=document.createElement("div");i.style.cssText=`
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.82);backdrop-filter:blur(8px);z-index:200;padding:20px;
  `,i.innerHTML=`
    <div style="
      background:#0d1f2d;border:1px solid ${l}44;border-radius:24px;
      padding:28px 24px;width:min(400px,100%);text-align:center;
    ">
      <div style="font-size:52px;margin-bottom:10px;">${o}</div>
      <div style="font-size:11px;color:${l};letter-spacing:3px;text-transform:uppercase;font-weight:700;margin-bottom:6px;">Mission</div>
      <div style="font-size:22px;font-weight:700;color:#fff;margin-bottom:14px;">${e}</div>
      <div style="
        background:${l}18;border:1px solid ${l}33;border-radius:12px;
        padding:12px 16px;margin-bottom:16px;text-align:left;
      ">
        <div style="font-size:10px;color:${l};letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:4px;">💡 What you'll learn</div>
        <div style="font-size:13px;color:#e0f4ec;line-height:1.5;">${n}</div>
      </div>
      <div style="font-size:12px;color:#8aa6b4;margin-bottom:20px;line-height:1.5;">${r}</div>
      <button id="intro-start" style="
        width:100%;padding:14px;border-radius:12px;border:none;
        background:${l};color:#000;font-size:15px;font-weight:700;
        cursor:pointer;font-family:inherit;
      ">Let's Play ▶</button>
    </div>
  `,t.appendChild(i),i.querySelector("#intro-start").addEventListener("click",()=>{i.remove(),a()})}function O(t,{stars:o,maxStars:e=3,title:n,lines:r=[],coins:l=0,color:a="#ffd700",onContinue:i}){const c=z(t,{title:"◈ Mission Complete",color:a});c.body.innerHTML=`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:40px;margin-bottom:8px;">${"⭐".repeat(o)}${"☆".repeat(e-o)}</div>
      <div style="font-size:22px;font-weight:700;color:#fff;margin-bottom:6px;">${n}</div>
      ${r.map(d=>`<div style="font-size:13px;color:#8aa6b4;margin-top:4px;">${d}</div>`).join("")}
      ${l?`<div style="font-size:18px;color:#ffd700;margin-top:12px;font-weight:700;">+${l} 🪙</div>`:""}
    </div>
  `;const p=document.createElement("button");p.style.cssText=`
    width:100%;padding:14px;border-radius:12px;border:none;
    background:${a};color:#000;font-size:15px;font-weight:700;
    cursor:pointer;margin-top:8px;font-family:inherit;
  `,p.textContent=o>=2?"Continue ▶":"Try Again ↺",p.addEventListener("click",()=>{c.remove(),i(o)}),c.body.appendChild(p)}const C=[{id:1,title:"Delivery Kingdom",emoji:"🎁",color:"#ffd700",sub:"Build roads, move trucks",bg:"#1a1500"},{id:2,title:"Water Park",emoji:"💧",color:"#00b4ff",sub:"Pipes, gates & flow",bg:"#00111a"},{id:3,title:"Rocket Launch",emoji:"🚀",color:"#ff6b35",sub:"Sort rockets, save missions",bg:"#1a0d00"},{id:4,title:"Monster Attack",emoji:"👾",color:"#c9b6ff",sub:"Survive the stomp",bg:"#0d0020"},{id:5,title:"Cyber Ninja",emoji:"🥷",color:"#46f0c0",sub:"Slash fakes, protect real",bg:"#001a0d"},{id:6,title:"Traffic Hero",emoji:"🚗",color:"#ff3860",sub:"Keep the city moving",bg:"#1a0005"},{id:7,title:"Maze Post Office",emoji:"🗺️",color:"#ffec3d",sub:"Find the shortest path",bg:"#1a1a00"},{id:8,title:"Tower of Babel",emoji:"🏗️",color:"#ff9f43",sub:"Stack layers in order",bg:"#1a0e00"},{id:9,title:"Memory Palace",emoji:"🧠",color:"#fd79a8",sub:"Cache the right things",bg:"#1a0010"},{id:10,title:"Relay Race",emoji:"🏃",color:"#00cec9",sub:"Reassemble the message",bg:"#001a1a"},{id:11,title:"Auction House",emoji:"💰",color:"#e17055",sub:"Allocate bandwidth fairly",bg:"#1a0800"},{id:12,title:"Time Traveler",emoji:"⏱️",color:"#a29bfe",sub:"Beat latency across the globe",bg:"#08001a"}];function S(t,o,e){document.body.classList.add("home-screen");const n=document.createElement("div");n.style.cssText=`
    min-height:100%;background:#0a0a1a;
    display:flex;flex-direction:column;align-items:center;
    padding:0 0 60px;
  `;const r=window.location.origin+"/v1/";n.innerHTML=`
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
          <a href="${r}" style="
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
        <div class="coin-display" style="flex-shrink:0;">🪙 ${o.coins}</div>
      </div>
      <div style="font-size:12px;color:#8aa6b4;margin-top:4px;margin-bottom:20px;">
        ${o.completedModules.length} / 12 missions complete
        ${o.completedModules.length===12?" 🏆":""}
      </div>

      <div id="module-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(190px,100%),1fr));gap:12px;"></div>
    </div>
  `,t.appendChild(n);const l=n.querySelector("#module-grid"),a=o.completedModules||[];C.forEach((i,c)=>{const p=o.moduleStars?.[i.id]||0,d=i.id===1||a.includes(i.id-1)||a.includes(i.id),s=document.createElement("div");s.className="module-card-v2"+(d?"":" locked"),s.style.cssText=`
      border-radius:20px;padding:20px;cursor:${d?"pointer":"not-allowed"};
      background:${i.bg};border:1px solid ${d?i.color+"44":"rgba(255,255,255,0.06)"};
      transition:transform 0.2s,border-color 0.2s,box-shadow 0.2s;
      animation:fadeInUp 0.4s ease ${c*.07}s both;
    `,s.innerHTML=`
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="font-size:32px;line-height:1;flex-shrink:0;">${i.emoji}</div>
        <div style="min-width:0;">
          <div style="font-size:10px;color:${i.color};letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;font-weight:700;">MODULE ${i.id}</div>
          <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:2px;line-height:1.2;">${i.title}</div>
          <div style="font-size:11px;color:#8aa6b4;margin-bottom:6px;">${i.sub}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div class="star-strip" style="font-size:14px;">${"⭐".repeat(p)}${"☆".repeat(3-p)}</div>
            ${d?"":'<div style="font-size:11px;color:#555;">🔒 Complete previous</div>'}
          </div>
        </div>
      </div>
    `,d&&(s.addEventListener("mouseenter",()=>{s.style.transform="translateY(-4px)",s.style.boxShadow=`0 8px 32px ${i.color}33`,s.style.borderColor=i.color+"88"}),s.addEventListener("mouseleave",()=>{s.style.transform="",s.style.boxShadow="",s.style.borderColor=i.color+"44"}),s.addEventListener("click",()=>e(i.id))),l.appendChild(s)})}const h=document.getElementById("app");let f=k();function x(t,...o){if(h.innerHTML="",t==="home")S(h,f,e=>x("module",e));else if(t==="module"){const e=o[0];M(e)}}async function M(t){document.body.classList.remove("home-screen");const e={1:()=>m(()=>import("./index-JVZ8gZKG.js"),__vite__mapDeps([0,1,2])),2:()=>m(()=>import("./index-BWgKxMo7.js"),__vite__mapDeps([3,1,2])),3:()=>m(()=>import("./index--Y_cTuMc.js"),__vite__mapDeps([4,1,2])),4:()=>m(()=>import("./index-BPXtX3Ul.js"),__vite__mapDeps([5,1,2])),5:()=>m(()=>import("./index-ChrjI1R6.js"),__vite__mapDeps([6,1,2])),6:()=>m(()=>import("./index-CnqDEJQi.js"),__vite__mapDeps([7,1,2])),7:()=>m(()=>import("./index-D1GhIUSz.js"),__vite__mapDeps([8,1,2])),8:()=>m(()=>import("./index-BTj5aiJG.js"),__vite__mapDeps([9,1,2])),9:()=>m(()=>import("./index-LOETdv_3.js"),__vite__mapDeps([10,1,2])),10:()=>m(()=>import("./index-DAKenrDH.js"),__vite__mapDeps([11,1,2])),11:()=>m(()=>import("./index-B7Apx_0E.js"),__vite__mapDeps([12,1,2])),12:()=>m(()=>import("./index-DRQmICga.js"),__vite__mapDeps([13,1,2]))}[t];if(!e)return x("home");(await e()).launch(h,f,(r,l)=>{f=L(f,t,r),f=T(f,l),x("home")})}x("home");export{R as a,I as b,A as c,O as d,z as e,j as m,H as s};

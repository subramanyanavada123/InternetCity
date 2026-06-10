const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CQa4Ujbt.js","assets/sfx-DMPbFRfs.js","assets/modulepreload-polyfill-B5Qt9EMX.js","assets/index-CSGrChkh.js","assets/index-CbQ78RCB.js","assets/index-DYw_u7QW.js","assets/index-Bmt7qp47.js","assets/index-BH9vtKBx.js","assets/index-X8EmM4pr.js","assets/index-Ck-Fj_7r.js","assets/index-DDPg4Ywk.js","assets/index-DQLO0GIL.js","assets/index-BvI8O_jV.js","assets/index-Bk_MWRSo.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";const _="modulepreload",w=function(t){return"/"+t},g={},p=function(o,e,n){let r=Promise.resolve();if(e&&e.length>0){document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),i=s?.nonce||s?.getAttribute("nonce");r=Promise.allSettled(e.map(d=>{if(d=w(d),d in g)return;g[d]=!0;const c=d.endsWith(".css"),m=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${m}`))return;const a=document.createElement("link");if(a.rel=c?"stylesheet":_,c||(a.as="script"),a.crossOrigin="",a.href=d,i&&a.setAttribute("nonce",i),document.head.appendChild(a),c)return new Promise((b,E)=>{a.addEventListener("load",b),a.addEventListener("error",()=>E(new Error(`Unable to preload CSS for ${d}`)))})}))}function l(s){const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=s,window.dispatchEvent(i),!i.defaultPrevented)throw s}return r.then(s=>{for(const i of s||[])i.status==="rejected"&&l(i.reason);return o().catch(l)})},v="ic2_state",h={coins:0,completedModules:[],moduleStars:{},badges:[],cityDecorations:[],totalScore:0};function k(){try{const t=localStorage.getItem(v);if(t)return{...h,...JSON.parse(t)}}catch{}return{...h}}function y(t){localStorage.setItem(v,JSON.stringify(t))}function T(t,o,e=null){const n={...t,coins:t.coins+o,totalScore:t.totalScore+o};return e&&!n.badges.includes(e)&&(n.badges=[...n.badges,e]),y(n),n}function $(t,o,e){const n=t.moduleStars[o]||0,r={...t,moduleStars:{...t.moduleStars,[o]:Math.max(n,e)},completedModules:t.completedModules.includes(o)?t.completedModules:[...t.completedModules,o]};return y(r),r}function P(t,{bgColor:o="#0a0a1a"}={}){const e=document.createElement("div");e.style.cssText=`
    position:fixed;inset:0;background:${o};
    display:flex;flex-direction:column;overflow:hidden;z-index:10;
    font-family:'Space Mono',monospace,sans-serif;
  `,t.appendChild(e);const n=document.createElement("canvas");n.style.cssText="position:absolute;inset:0;width:100%;height:100%;",e.appendChild(n);const r=()=>{const c=window.devicePixelRatio||1;n.width=e.clientWidth*c,n.height=e.clientHeight*c,n.style.width=e.clientWidth+"px",n.style.height=e.clientHeight+"px",n.getContext("2d").setTransform(c,0,0,c,0,0)};return r(),window.addEventListener("resize",r),{root:e,canvas:n,ctx:()=>n.getContext("2d"),W:()=>e.clientWidth,H:()=>e.clientHeight,destroy:()=>{window.removeEventListener("resize",r),e.remove()}}}function L(t,{title:o,color:e="#46f0c0",width:n="min(440px,92vw)"}={}){const r=document.createElement("div");r.style.cssText=`
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);z-index:100;
  `;const l=document.createElement("div");if(l.style.cssText=`
    background:#0d1f2d;border:1px solid ${e}55;border-radius:20px;
    padding:28px 24px;width:${n};max-height:88vh;overflow-y:auto;
    box-shadow:0 8px 48px rgba(0,0,0,0.7),0 0 0 1px ${e}22;
  `,o){const i=document.createElement("div");i.style.cssText=`font-size:11px;color:${e};letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;font-weight:700;`,i.textContent=o,l.appendChild(i)}const s=document.createElement("div");return l.appendChild(s),r.appendChild(l),t.appendChild(r),{el:l,body:s,remove:()=>r.remove()}}function j(t,{color:o="#46f0c0"}={}){const e=document.createElement("div");e.style.cssText=`
    position:absolute;top:0;left:0;right:0;height:48px;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 16px;z-index:60;
    background:linear-gradient(to bottom,rgba(0,0,0,0.6),transparent);
    pointer-events:none;
  `;const n=document.createElement("div"),r=document.createElement("div"),l=document.createElement("div");return[n,r,l].forEach(s=>{s.style.cssText=`color:${o};font-size:13px;font-weight:700;pointer-events:auto;`,e.appendChild(s)}),t.appendChild(e),{el:e,setLeft:s=>{n.innerHTML=s},setCenter:s=>{r.innerHTML=s},setRight:s=>{l.innerHTML=s},leftEl:n,rightEl:l}}function R(t,o,e,n){const r=document.createElement("div");r.style.cssText=`
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
  `,document.head.appendChild(o)})();function A(t,{stars:o,maxStars:e=3,title:n,lines:r=[],coins:l=0,color:s="#ffd700",onContinue:i}){const d=L(t,{title:"◈ Mission Complete",color:s});d.body.innerHTML=`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:40px;margin-bottom:8px;">${"⭐".repeat(o)}${"☆".repeat(e-o)}</div>
      <div style="font-size:22px;font-weight:700;color:#fff;margin-bottom:6px;">${n}</div>
      ${r.map(m=>`<div style="font-size:13px;color:#8aa6b4;margin-top:4px;">${m}</div>`).join("")}
      ${l?`<div style="font-size:18px;color:#ffd700;margin-top:12px;font-weight:700;">+${l} 🪙</div>`:""}
    </div>
  `;const c=document.createElement("button");c.style.cssText=`
    width:100%;padding:14px;border-radius:12px;border:none;
    background:${s};color:#000;font-size:15px;font-weight:700;
    cursor:pointer;margin-top:8px;font-family:inherit;
  `,c.textContent=o>=2?"Continue ▶":"Try Again ↺",c.addEventListener("click",()=>{d.remove(),i(o)}),d.body.appendChild(c)}const C=[{id:1,title:"Delivery Kingdom",emoji:"🎁",color:"#ffd700",sub:"Build roads, move trucks",bg:"#1a1500"},{id:2,title:"Water Park",emoji:"💧",color:"#00b4ff",sub:"Pipes, gates & flow",bg:"#00111a"},{id:3,title:"Rocket Launch",emoji:"🚀",color:"#ff6b35",sub:"Sort rockets, save missions",bg:"#1a0d00"},{id:4,title:"Monster Attack",emoji:"👾",color:"#c9b6ff",sub:"Survive the stomp",bg:"#0d0020"},{id:5,title:"Cyber Ninja",emoji:"🥷",color:"#46f0c0",sub:"Slash fakes, protect real",bg:"#001a0d"},{id:6,title:"Traffic Hero",emoji:"🚗",color:"#ff3860",sub:"Keep the city moving",bg:"#1a0005"},{id:7,title:"Maze Post Office",emoji:"🗺️",color:"#ffec3d",sub:"Find the shortest path",bg:"#1a1a00"},{id:8,title:"Tower of Babel",emoji:"🏗️",color:"#ff9f43",sub:"Stack layers in order",bg:"#1a0e00"},{id:9,title:"Memory Palace",emoji:"🧠",color:"#fd79a8",sub:"Cache the right things",bg:"#1a0010"},{id:10,title:"Relay Race",emoji:"🏃",color:"#00cec9",sub:"Reassemble the message",bg:"#001a1a"},{id:11,title:"Auction House",emoji:"💰",color:"#e17055",sub:"Allocate bandwidth fairly",bg:"#1a0800"},{id:12,title:"Time Traveler",emoji:"⏱️",color:"#a29bfe",sub:"Beat latency across the globe",bg:"#08001a"}];function S(t,o,e){document.body.classList.add("home-screen");const n=document.createElement("div");n.style.cssText=`
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
  `,t.appendChild(n);const l=n.querySelector("#module-grid"),s=o.completedModules||[];C.forEach((i,d)=>{const c=o.moduleStars?.[i.id]||0,m=i.id===1||s.includes(i.id-1)||s.includes(i.id),a=document.createElement("div");a.className="module-card-v2"+(m?"":" locked"),a.style.cssText=`
      border-radius:20px;padding:20px;cursor:${m?"pointer":"not-allowed"};
      background:${i.bg};border:1px solid ${m?i.color+"44":"rgba(255,255,255,0.06)"};
      transition:transform 0.2s,border-color 0.2s,box-shadow 0.2s;
      animation:fadeInUp 0.4s ease ${d*.07}s both;
    `,a.innerHTML=`
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="font-size:32px;line-height:1;flex-shrink:0;">${i.emoji}</div>
        <div style="min-width:0;">
          <div style="font-size:10px;color:${i.color};letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;font-weight:700;">MODULE ${i.id}</div>
          <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:2px;line-height:1.2;">${i.title}</div>
          <div style="font-size:11px;color:#8aa6b4;margin-bottom:6px;">${i.sub}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div class="star-strip" style="font-size:14px;">${"⭐".repeat(c)}${"☆".repeat(3-c)}</div>
            ${m?"":'<div style="font-size:11px;color:#555;">🔒 Complete previous</div>'}
          </div>
        </div>
      </div>
    `,m&&(a.addEventListener("mouseenter",()=>{a.style.transform="translateY(-4px)",a.style.boxShadow=`0 8px 32px ${i.color}33`,a.style.borderColor=i.color+"88"}),a.addEventListener("mouseleave",()=>{a.style.transform="",a.style.boxShadow="",a.style.borderColor=i.color+"44"}),a.addEventListener("click",()=>e(i.id))),l.appendChild(a)})}const x=document.getElementById("app");let f=k();function u(t,...o){if(x.innerHTML="",t==="home")S(x,f,e=>u("module",e));else if(t==="module"){const e=o[0];M(e)}}async function M(t){document.body.classList.remove("home-screen");const e={1:()=>p(()=>import("./index-CQa4Ujbt.js"),__vite__mapDeps([0,1,2])),2:()=>p(()=>import("./index-CSGrChkh.js"),__vite__mapDeps([3,1,2])),3:()=>p(()=>import("./index-CbQ78RCB.js"),__vite__mapDeps([4,1,2])),4:()=>p(()=>import("./index-DYw_u7QW.js"),__vite__mapDeps([5,1,2])),5:()=>p(()=>import("./index-Bmt7qp47.js"),__vite__mapDeps([6,1,2])),6:()=>p(()=>import("./index-BH9vtKBx.js"),__vite__mapDeps([7,1,2])),7:()=>p(()=>import("./index-X8EmM4pr.js"),__vite__mapDeps([8,1,2])),8:()=>p(()=>import("./index-Ck-Fj_7r.js"),__vite__mapDeps([9,1,2])),9:()=>p(()=>import("./index-DDPg4Ywk.js"),__vite__mapDeps([10,1,2])),10:()=>p(()=>import("./index-DQLO0GIL.js"),__vite__mapDeps([11,1,2])),11:()=>p(()=>import("./index-BvI8O_jV.js"),__vite__mapDeps([12,1,2])),12:()=>p(()=>import("./index-Bk_MWRSo.js"),__vite__mapDeps([13,1,2]))}[t];if(!e)return u("home");(await e()).launch(x,f,(r,l)=>{f=$(f,t,r),f=T(f,l),u("home")})}u("home");export{j as a,L as b,R as c,P as m,A as s};

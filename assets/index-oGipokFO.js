import{a as J,t as b,e as X,d as Z,s as ee,b as te}from"./main-BGDcQ2ZI.js";import{s as E}from"./sfx-DMPbFRfs.js";import"./modulepreload-polyfill-B5Qt9EMX.js";const oe=[{id:"hospital",emoji:"🚑",name:"Hospital",priority:"CRITICAL",needs:40,color:"#ff6b6b"},{id:"fire",emoji:"🚒",name:"Fire Station",priority:"CRITICAL",needs:30,color:"#ff9f43"},{id:"school",emoji:"🏫",name:"School",priority:"HIGH",needs:25,color:"#ffd700"},{id:"news",emoji:"📡",name:"News Station",priority:"HIGH",needs:20,color:"#74b9ff"},{id:"residential",emoji:"🏠",name:"Residential",priority:"MEDIUM",needs:35,color:"#a29bfe"},{id:"mall",emoji:"🛒",name:"Mall",priority:"MEDIUM",needs:25,color:"#fd79a8"},{id:"gaming",emoji:"🎮",name:"Gaming Server",priority:"LOW",needs:50,color:"#55efc4"},{id:"streaming",emoji:"📺",name:"Streaming",priority:"LOW",needs:45,color:"#636e72"}],ne={CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1},x=[{label:"Normal Operations",pool:150,surgeIds:[]},{label:"BLACKOUT",pool:80,surgeIds:[]}];function ie(){if(document.getElementById("m11-styles"))return;const a=document.createElement("style");a.id="m11-styles",a.textContent=`
    @keyframes m11-pulse-red {
      0%,100% { box-shadow:0 0 0 0 rgba(255,80,80,0); }
      50%      { box-shadow:0 0 0 8px rgba(255,80,80,0.6); }
    }
    @keyframes m11-float-up {
      0%   { transform:translateY(0); opacity:1; }
      100% { transform:translateY(-60px); opacity:0; }
    }
    @keyframes m11-amber-glow {
      0%,100% { box-shadow:0 2px 12px rgba(255,160,50,0.12); }
      50%      { box-shadow:0 2px 24px rgba(255,160,50,0.35); }
    }
    .m11-card-pulse { animation:m11-pulse-red 0.8s infinite; }
    .m11-bidder-card {
      background:linear-gradient(145deg,#2a1400,#1a0c00);
      border:1px solid rgba(255,160,50,0.2);
      border-radius:14px;
      padding:12px;
      position:relative;
      animation:m11-amber-glow 3s ease-in-out infinite;
      transition:border-color 0.3s;
    }
    .m11-floater {
      position:absolute;top:8px;right:8px;
      pointer-events:none;z-index:20;font-size:28px;
      animation:m11-float-up 1.2s ease-out forwards;
    }
    .m11-slider { -webkit-appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer; }
    .m11-slider::-webkit-slider-thumb {
      -webkit-appearance:none;width:18px;height:18px;border-radius:50%;
      cursor:pointer;border:2px solid rgba(255,255,255,0.4);
    }
    .m11-slider::-moz-range-thumb {
      width:18px;height:18px;border-radius:50%;
      cursor:pointer;border:2px solid rgba(255,255,255,0.4);
    }
  `,document.head.appendChild(a)}function M(a,g){return a>=g?1:a>=g*.7?.7:.3}function re(a){return a>=1?"😊":a>=.7?"😐":"😤"}function se(a,g){let y=0;for(const i of a){const v=M(g[i.id]||0,i.needs);i.priority==="CRITICAL"&&(g[i.id]||0)===0&&(y-=50),y+=v*100*ne[i.priority]}return Math.round(y)}function ae(a,g,y){ie();const i=document.createElement("div");i.style.cssText=`
    position:fixed;inset:0;background:#1a0800;
    font-family:'Space Mono',monospace,sans-serif;
    overflow-y:auto;z-index:10;color:#fff;
  `,a.appendChild(i);const v=J(i,{color:"#ffb347"}),C=document.createElement("button");C.style.cssText=`
    position:fixed;top:8px;left:16px;z-index:70;
    background:rgba(0,0,0,0.5);border:1px solid #ffb34766;border-radius:10px;
    color:#ffb347;font-size:13px;font-weight:700;cursor:pointer;
    padding:6px 12px;font-family:inherit;
  `,C.textContent=b("btn.back"),C.addEventListener("click",()=>{G(),y(0,0)}),i.appendChild(C);let c=0,p=0,w=30,m=null,S=!1,f={},u=[];function _(){const t=x[c];u=oe.map(o=>({...o,needs:t.surgeIds.includes(o.id)?o.needs*2:o.needs})),f={},u.forEach(o=>{f[o.id]=0})}function B(){return x[c].pool}function A(){return Object.values(f).reduce((t,o)=>t+o,0)}const T=document.createElement("div");T.style.cssText="text-align:center;padding:56px 16px 6px;",T.innerHTML=`
    <div style="font-size:11px;letter-spacing:3px;color:#ffb347;text-transform:uppercase;margin-bottom:4px;">◈ Internet Bandwidth Auction</div>
    <div id="m11-round-label" style="font-size:17px;font-weight:700;color:#fff;"></div>
  `,i.appendChild(T);const L=document.createElement("div");L.style.cssText="padding:8px 20px 4px;max-width:860px;margin:0 auto;",L.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
      <span style="font-size:11px;color:#ffb347;font-weight:700;letter-spacing:2px;">BANDWIDTH POOL</span>
      <span id="m11-pool-text" style="font-size:12px;font-weight:700;color:#fff;"></span>
    </div>
    <div style="background:#2a1400;border-radius:8px;height:14px;overflow:hidden;border:1px solid #ffb34733;">
      <div id="m11-pool-bar" style="height:100%;border-radius:8px;transition:width 0.15s,background 0.3s;width:0%;background:#2ecc71;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:2px;">
      <span style="font-size:10px;color:#666;">0</span>
      <span id="m11-pool-limit" style="font-size:10px;color:#666;"></span>
    </div>
  `,i.appendChild(L);const R=document.createElement("div");R.style.cssText="padding:4px 20px 6px;max-width:860px;margin:0 auto;",R.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
      <span style="font-size:10px;color:#888;letter-spacing:2px;">TIME</span>
      <span id="m11-timer" style="font-size:12px;font-weight:700;color:#ffd700;">30s</span>
    </div>
    <div style="background:#2a1400;border-radius:4px;height:5px;overflow:hidden;">
      <div id="m11-timer-bar" style="height:100%;border-radius:4px;background:#ffd700;transition:width 1s linear;width:100%;"></div>
    </div>
  `,i.appendChild(R);const $=document.createElement("div");$.style.cssText=`
    display:grid;grid-template-columns:repeat(2,1fr);gap:10px;
    padding:6px 14px;max-width:860px;margin:0 auto;
  `,i.appendChild($);const d=document.createElement("button");d.style.cssText=`
    display:block;margin:10px auto 28px;
    background:linear-gradient(135deg,#ff9f43,#e67e22);
    border:none;border-radius:14px;color:#fff;
    font-size:15px;font-weight:700;cursor:pointer;
    padding:13px 38px;font-family:inherit;
    box-shadow:0 4px 20px rgba(255,160,50,0.4);
    transition:transform 0.1s,box-shadow 0.1s;letter-spacing:1px;
  `,d.textContent="CONFIRM ALLOCATION",d.addEventListener("mouseenter",()=>{d.style.transform="scale(1.04)",d.style.boxShadow="0 6px 28px rgba(255,160,50,0.6)"}),d.addEventListener("mouseleave",()=>{d.style.transform="scale(1)",d.style.boxShadow="0 4px 20px rgba(255,160,50,0.4)"}),d.addEventListener("click",D),i.appendChild(d);function P(){$.innerHTML="";const t=x[c],o={CRITICAL:"#ff6b6b",HIGH:"#ffd700",MEDIUM:"#a29bfe",LOW:"#55efc4"};u.forEach(e=>{const n=document.createElement("div");n.className="m11-bidder-card",n.id=`m11-card-${e.id}`,n.style.borderColor=e.color+"44";const r=t.surgeIds.includes(e.id)?'<span style="font-size:9px;background:#ff4444;color:#fff;border-radius:4px;padding:1px 5px;margin-left:4px;">2× SURGE</span>':"";n.innerHTML=`
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:7px;">
            <span style="font-size:20px;">${e.emoji}</span>
            <div>
              <div style="font-size:12px;font-weight:700;color:#fff;">${e.name}${r}</div>
              <span style="font-size:9px;font-weight:700;color:${o[e.priority]};
                background:${o[e.priority]}22;padding:1px 5px;border-radius:4px;">
                ${e.priority}
              </span>
            </div>
          </div>
          <div id="m11-hap-${e.id}" style="font-size:22px;line-height:1;">😐</div>
        </div>
        <div style="font-size:11px;color:#aaa;margin-bottom:6px;">
          Needs: <strong style="color:${e.color};">${e.needs} units</strong>
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span style="font-size:10px;color:#666;min-width:14px;">0</span>
          <input type="range" class="m11-slider" id="m11-sl-${e.id}"
            min="0" max="60" value="0" step="1"
            style="background:linear-gradient(to right,${e.color} 0%,#333 0%);"
          />
          <span style="font-size:10px;color:#666;min-width:20px;">60</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
          <span style="font-size:11px;color:#bbb;">Allocated:</span>
          <span id="m11-val-${e.id}" style="font-size:13px;font-weight:700;color:${e.color};">0</span>
        </div>
        <div style="background:#1a0800;border-radius:5px;height:7px;overflow:hidden;">
          <div id="m11-hbar-${e.id}" style="height:100%;border-radius:5px;width:0%;background:#555;transition:width 0.15s,background 0.3s;"></div>
        </div>
        <div id="m11-warn-${e.id}" style="display:none;font-size:10px;color:#ff4444;margin-top:3px;font-weight:700;">⚠️ EMERGENCY UNSERVED!</div>
      `,$.appendChild(n);const s=document.createElement("style");s.textContent=`#m11-sl-${e.id}::-webkit-slider-thumb{background:${e.color}}#m11-sl-${e.id}::-moz-range-thumb{background:${e.color}}`,document.head.appendChild(s);const l=n.querySelector(`#m11-sl-${e.id}`);l.addEventListener("input",()=>V(e.id,parseInt(l.value)))})}function j(){const t=A(),o=B(),e=Math.min(t/o,1)*100,n=t>o,r=document.getElementById("m11-pool-bar"),s=document.getElementById("m11-pool-text"),l=document.getElementById("m11-pool-limit");r&&(r.style.width=e+"%",r.style.background=n?"#ff4444":e>80?"#ffb347":"#2ecc71"),s&&(s.textContent=`${t} / ${o} units${n?" — OVER LIMIT!":""}`,s.style.color=n?"#ff4444":"#fff"),l&&(l.textContent=String(o))}function H(t){const o=u.find(k=>k.id===t);if(!o)return;const e=f[t]||0,n=M(e,o.needs),r=n>=1?"#2ecc71":n>=.7?"#f9ca24":"#ff4444",s=o.priority==="CRITICAL",l=e===0,h=document.getElementById(`m11-val-${t}`),z=document.getElementById(`m11-hbar-${t}`),W=document.getElementById(`m11-hap-${t}`),F=document.getElementById(`m11-warn-${t}`),I=document.getElementById(`m11-card-${t}`),Y=document.getElementById(`m11-sl-${t}`);if(h&&(h.textContent=String(e)),z&&(z.style.width=n*100+"%",z.style.background=r),W&&(W.textContent=re(n)),F&&(F.style.display=s&&l?"block":"none"),I&&(s&&l?(I.classList.add("m11-card-pulse"),I.style.borderColor="#ff444488"):(I.classList.remove("m11-card-pulse"),I.style.borderColor=o.color+"44")),Y){const k=e/60*100;Y.style.background=`linear-gradient(to right,${o.color} ${k}%,#333 ${k}%)`}}function V(t,o){const e=f[t]||0,n=A()-e,r=Math.min(60,B()-n),s=Math.max(0,Math.min(o,r));if(s!==o){const l=document.getElementById(`m11-sl-${t}`);l&&(l.value=String(s))}f[t]=s,H(t),j(),E.click()}const O=20;function q(){w=O,N(),m=setInterval(()=>{w--,N(),w<=0&&(clearInterval(m),m=null,D())},1e3)}function N(){const t=document.getElementById("m11-timer"),o=document.getElementById("m11-timer-bar");t&&(t.textContent=w+"s"),o&&(o.style.width=w/O*100+"%")}function U(){_(),P();const t=document.getElementById("m11-round-label");if(t){const o=x[c];t.textContent=`Round ${c+1}/${x.length} — ${o.label}`,t.style.color=c===x.length-1?"#ff6b6b":c===1?"#ffb347":"#fff"}v.setLeft(`Score: ${p}`),v.setRight(`Round ${c+1} / ${x.length}`),j(),u.forEach(o=>H(o.id)),d.disabled=!1,d.style.opacity="1",q()}function D(){m&&(clearInterval(m),m=null),d.disabled=!0,d.style.opacity="0.5";const t=se(u,f);p+=t,v.setLeft(`Score: ${p}`),u.filter(e=>e.priority==="CRITICAL"&&(f[e.id]||0)===0).length>0?(S=!0,E.fail()):E.coin(),u.forEach((e,n)=>{setTimeout(()=>{const r=M(f[e.id]||0,e.needs),s=r>=1?"😊":r>=.7?"😐":"😡",l=document.getElementById(`m11-card-${e.id}`);if(!l)return;const h=document.createElement("div");h.className="m11-floater",h.textContent=s,l.appendChild(h),setTimeout(()=>h.remove(),1200)},n*90)}),setTimeout(()=>K(t,c>=x.length-1),1400)}function K(t,o){const e=X(i,{title:`◈ Round ${c+1} Complete`,color:"#ffb347"}),n=u.filter(s=>s.priority==="CRITICAL"&&(f[s.id]||0)===0).length*50;e.body.innerHTML=`
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:36px;margin-bottom:8px;">${t>200?"🎉":t>0?"👍":"😬"}</div>
        <div style="font-size:13px;color:#ccc;margin-top:6px;">Round score: <strong style="color:#ffd700;">+${t}</strong></div>
        <div style="font-size:13px;color:#ccc;margin-top:6px;">${n>0?`<span style="color:#ff4444;">Critical penalty: -${n} pts</span>`:"All critical services covered ✓"}</div>
        <div style="font-size:13px;color:#ccc;margin-top:6px;">Running total: <strong style="color:#ffb347;">${p}</strong></div>
      </div>
    `;const r=document.createElement("button");r.style.cssText=`
      width:100%;padding:12px;border-radius:10px;border:none;
      background:#ffb347;color:#000;font-size:14px;font-weight:700;
      cursor:pointer;font-family:inherit;margin-top:4px;
    `,r.textContent=o?"See Final Results":`Round ${c+2}: ${x[c+1].label} →`,r.addEventListener("click",()=>{e.remove(),o?Q():(c++,U())}),e.body.appendChild(r)}function Q(){let t=S?0:1;p>500&&(t=2),p>750&&(t=3);const o=Math.floor(p/10),e=["Needs Work","Bandwidth Manager","Efficient Allocator","QoS Master!"];t>=2?E.win():E.fail(),Z(i,{stars:t,title:e[t],lines:[`Total score: ${p}`,p>750?"Near-optimal allocation every round!":p>500?"Good balance of priorities!":"Try allocating more to critical services.",t<3?"Score >750 for ⭐⭐⭐":"All services optimally served! 🏆"],coins:o,color:"#ffb347",onContinue:(n,r)=>{G(),n!=="retry"?y(r,o):ae(a,g,y)}})}function G(){m&&(clearInterval(m),m=null),i.remove()}ee(i,{concept:b("m11.concept"),detail:b("m11.banner"),color:"#e17055"}),te(i,{emoji:"💰",title:b("m11.title"),concept:b("m11.concept"),howto:b("m11.howto"),color:"#e17055",onStart:()=>{U()}})}export{ae as launch};

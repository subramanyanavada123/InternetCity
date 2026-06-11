import{a as Q,e as J,d as X,s as Z,t as k,b as ee}from"./main-C4nONDbG.js";import{s as w}from"./sfx-DMPbFRfs.js";import"./modulepreload-polyfill-B5Qt9EMX.js";const te=[{id:"hospital",emoji:"🚑",name:"Hospital",priority:"CRITICAL",needs:40,color:"#ff6b6b"},{id:"fire",emoji:"🚒",name:"Fire Station",priority:"CRITICAL",needs:30,color:"#ff9f43"},{id:"school",emoji:"🏫",name:"School",priority:"HIGH",needs:25,color:"#ffd700"},{id:"news",emoji:"📡",name:"News Station",priority:"HIGH",needs:20,color:"#74b9ff"},{id:"residential",emoji:"🏠",name:"Residential",priority:"MEDIUM",needs:35,color:"#a29bfe"},{id:"mall",emoji:"🛒",name:"Mall",priority:"MEDIUM",needs:25,color:"#fd79a8"},{id:"gaming",emoji:"🎮",name:"Gaming Server",priority:"LOW",needs:50,color:"#55efc4"},{id:"streaming",emoji:"📺",name:"Streaming",priority:"LOW",needs:45,color:"#636e72"}],oe={CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1},I=[{label:"Normal Operations",pool:150,surgeIds:[]},{label:"SURGE EVENT",pool:150,surgeIds:["hospital","fire"]},{label:"BLACKOUT",pool:80,surgeIds:[]}];function ne(){if(document.getElementById("m11-styles"))return;const l=document.createElement("style");l.id="m11-styles",l.textContent=`
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
  `,document.head.appendChild(l)}function M(l,g){return l>=g?1:l>=g*.7?.7:.3}function ie(l){return l>=1?"😊":l>=.7?"😐":"😤"}function re(l,g){let y=0;for(const i of l){const h=M(g[i.id]||0,i.needs);i.priority==="CRITICAL"&&(g[i.id]||0)===0&&(y-=50),y+=h*100*oe[i.priority]}return Math.round(y)}function le(l,g,y){ne();const i=document.createElement("div");i.style.cssText=`
    position:fixed;inset:0;background:#1a0800;
    font-family:'Space Mono',monospace,sans-serif;
    overflow-y:auto;z-index:10;color:#fff;
  `,l.appendChild(i);const h=Q(i,{color:"#ffb347"}),E=document.createElement("button");E.style.cssText=`
    position:fixed;top:8px;left:16px;z-index:70;
    background:rgba(0,0,0,0.5);border:1px solid #ffb34766;border-radius:10px;
    color:#ffb347;font-size:13px;font-weight:700;cursor:pointer;
    padding:6px 12px;font-family:inherit;
  `,E.textContent="← Missions",E.addEventListener("click",()=>{G(),y(0,0)}),i.appendChild(E);let c=0,p=0,b=30,m=null,S=!1,f={},u=[];function P(){const t=I[c];u=te.map(o=>({...o,needs:t.surgeIds.includes(o.id)?o.needs*2:o.needs})),f={},u.forEach(o=>{f[o.id]=0})}function B(){return I[c].pool}function A(){return Object.values(f).reduce((t,o)=>t+o,0)}const T=document.createElement("div");T.style.cssText="text-align:center;padding:56px 16px 6px;",T.innerHTML=`
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
  `,i.appendChild(R);const C=document.createElement("div");C.style.cssText=`
    display:grid;grid-template-columns:repeat(2,1fr);gap:10px;
    padding:6px 14px;max-width:860px;margin:0 auto;
  `,i.appendChild(C);const a=document.createElement("button");a.style.cssText=`
    display:block;margin:10px auto 28px;
    background:linear-gradient(135deg,#ff9f43,#e67e22);
    border:none;border-radius:14px;color:#fff;
    font-size:15px;font-weight:700;cursor:pointer;
    padding:13px 38px;font-family:inherit;
    box-shadow:0 4px 20px rgba(255,160,50,0.4);
    transition:transform 0.1s,box-shadow 0.1s;letter-spacing:1px;
  `,a.textContent="CONFIRM ALLOCATION",a.addEventListener("mouseenter",()=>{a.style.transform="scale(1.04)",a.style.boxShadow="0 6px 28px rgba(255,160,50,0.6)"}),a.addEventListener("mouseleave",()=>{a.style.transform="scale(1)",a.style.boxShadow="0 4px 20px rgba(255,160,50,0.4)"}),a.addEventListener("click",U),i.appendChild(a);function Y(){C.innerHTML="";const t=I[c],o={CRITICAL:"#ff6b6b",HIGH:"#ffd700",MEDIUM:"#a29bfe",LOW:"#55efc4"};u.forEach(e=>{const n=document.createElement("div");n.className="m11-bidder-card",n.id=`m11-card-${e.id}`,n.style.borderColor=e.color+"44";const s=t.surgeIds.includes(e.id)?'<span style="font-size:9px;background:#ff4444;color:#fff;border-radius:4px;padding:1px 5px;margin-left:4px;">2× SURGE</span>':"";n.innerHTML=`
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:7px;">
            <span style="font-size:20px;">${e.emoji}</span>
            <div>
              <div style="font-size:12px;font-weight:700;color:#fff;">${e.name}${s}</div>
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
      `,C.appendChild(n);const r=document.createElement("style");r.textContent=`#m11-sl-${e.id}::-webkit-slider-thumb{background:${e.color}}#m11-sl-${e.id}::-moz-range-thumb{background:${e.color}}`,document.head.appendChild(r);const d=n.querySelector(`#m11-sl-${e.id}`);d.addEventListener("input",()=>V(e.id,parseInt(d.value)))})}function j(){const t=A(),o=B(),e=Math.min(t/o,1)*100,n=t>o,s=document.getElementById("m11-pool-bar"),r=document.getElementById("m11-pool-text"),d=document.getElementById("m11-pool-limit");s&&(s.style.width=e+"%",s.style.background=n?"#ff4444":e>80?"#ffb347":"#2ecc71"),r&&(r.textContent=`${t} / ${o} units${n?" — OVER LIMIT!":""}`,r.style.color=n?"#ff4444":"#fff"),d&&(d.textContent=String(o))}function H(t){const o=u.find($=>$.id===t);if(!o)return;const e=f[t]||0,n=M(e,o.needs),s=n>=1?"#2ecc71":n>=.7?"#f9ca24":"#ff4444",r=o.priority==="CRITICAL",d=e===0,x=document.getElementById(`m11-val-${t}`),z=document.getElementById(`m11-hbar-${t}`),D=document.getElementById(`m11-hap-${t}`),W=document.getElementById(`m11-warn-${t}`),v=document.getElementById(`m11-card-${t}`),F=document.getElementById(`m11-sl-${t}`);if(x&&(x.textContent=String(e)),z&&(z.style.width=n*100+"%",z.style.background=s),D&&(D.textContent=ie(n)),W&&(W.style.display=r&&d?"block":"none"),v&&(r&&d?(v.classList.add("m11-card-pulse"),v.style.borderColor="#ff444488"):(v.classList.remove("m11-card-pulse"),v.style.borderColor=o.color+"44")),F){const $=e/60*100;F.style.background=`linear-gradient(to right,${o.color} ${$}%,#333 ${$}%)`}}function V(t,o){const e=f[t]||0,n=A()-e,s=Math.min(60,B()-n),r=Math.max(0,Math.min(o,s));if(r!==o){const d=document.getElementById(`m11-sl-${t}`);d&&(d.value=String(r))}f[t]=r,H(t),j(),w.click()}function _(){b=30,N(),m=setInterval(()=>{b--,N(),b<=0&&(clearInterval(m),m=null,U())},1e3)}function N(){const t=document.getElementById("m11-timer"),o=document.getElementById("m11-timer-bar");t&&(t.textContent=b+"s"),o&&(o.style.width=b/30*100+"%")}function O(){P(),Y();const t=document.getElementById("m11-round-label");if(t){const o=I[c];t.textContent=`Round ${c+1}/3 — ${o.label}`,t.style.color=c===2?"#ff6b6b":c===1?"#ffb347":"#fff"}h.setLeft(`Score: ${p}`),h.setRight(`Round ${c+1} / 3`),j(),u.forEach(o=>H(o.id)),a.disabled=!1,a.style.opacity="1",_()}function U(){m&&(clearInterval(m),m=null),a.disabled=!0,a.style.opacity="0.5";const t=re(u,f);p+=t,h.setLeft(`Score: ${p}`),u.filter(e=>e.priority==="CRITICAL"&&(f[e.id]||0)===0).length>0?(S=!0,w.fail()):w.coin(),u.forEach((e,n)=>{setTimeout(()=>{const s=M(f[e.id]||0,e.needs),r=s>=1?"😊":s>=.7?"😐":"😡",d=document.getElementById(`m11-card-${e.id}`);if(!d)return;const x=document.createElement("div");x.className="m11-floater",x.textContent=r,d.appendChild(x),setTimeout(()=>x.remove(),1200)},n*90)}),setTimeout(()=>q(t,c>=2),1400)}function q(t,o){const e=J(i,{title:`◈ Round ${c+1} Complete`,color:"#ffb347"}),n=u.filter(r=>r.priority==="CRITICAL"&&(f[r.id]||0)===0).length*50;e.body.innerHTML=`
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:36px;margin-bottom:8px;">${t>200?"🎉":t>0?"👍":"😬"}</div>
        <div style="font-size:13px;color:#ccc;margin-top:6px;">Round score: <strong style="color:#ffd700;">+${t}</strong></div>
        <div style="font-size:13px;color:#ccc;margin-top:6px;">${n>0?`<span style="color:#ff4444;">Critical penalty: -${n} pts</span>`:"All critical services covered ✓"}</div>
        <div style="font-size:13px;color:#ccc;margin-top:6px;">Running total: <strong style="color:#ffb347;">${p}</strong></div>
      </div>
    `;const s=document.createElement("button");s.style.cssText=`
      width:100%;padding:12px;border-radius:10px;border:none;
      background:#ffb347;color:#000;font-size:14px;font-weight:700;
      cursor:pointer;font-family:inherit;margin-top:4px;
    `,s.textContent=o?"See Final Results":`Round ${c+2}: ${I[c+1].label} →`,s.addEventListener("click",()=>{e.remove(),o?K():(c++,O())}),e.body.appendChild(s)}function K(){let t=S?0:1;p>500&&(t=2),p>750&&(t=3);const o=Math.floor(p/10),e=["Needs Work","Bandwidth Manager","Efficient Allocator","QoS Master!"];t>=2?w.win():w.fail(),X(i,{stars:t,title:e[t],lines:[`Total score: ${p}`,p>750?"Near-optimal allocation every round!":p>500?"Good balance of priorities!":"Try allocating more to critical services.",t<3?"Score >750 for ⭐⭐⭐":"All services optimally served! 🏆"],coins:o,color:"#ffb347",onContinue:n=>{G(),y(n,o)}})}function G(){m&&(clearInterval(m),m=null),i.remove()}Z(i,{concept:k("m11.concept"),detail:"Networks share limited bandwidth between many users. Prioritising critical services keeps the network fair and reliable.",color:"#e17055"}),ee(i,{emoji:"💰",title:k("m11.title"),concept:k("m11.concept"),howto:k("m11.howto"),color:"#e17055",onStart:()=>{O()}})}export{le as launch};

const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CI6ID_iy.js","assets/sfx-DMPbFRfs.js","assets/modulepreload-polyfill-B5Qt9EMX.js","assets/index-D3N-SfnY.js","assets/index-C9KLoGeg.js","assets/index-CAq8F6FW.js","assets/index-cMJ9vV9M.js","assets/index-D_gvaqi6.js","assets/index-DfaTam9h.js","assets/index-CjIxFi8m.js","assets/index-CEF9dPWo.js","assets/index-DDKGGQ6E.js","assets/index-pHEKJ99_.js","assets/index-BZS25q5W.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";const j="modulepreload",I=function(e){return"/"+e},_={},f=function(o,t,n){let i=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),c=r?.nonce||r?.getAttribute("nonce");i=Promise.allSettled(t.map(d=>{if(d=I(d),d in _)return;_[d]=!0;const u=d.endsWith(".css"),l=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${l}`))return;const p=document.createElement("link");if(p.rel=u?"stylesheet":j,u||(p.as="script"),p.crossOrigin="",p.href=d,c&&p.setAttribute("nonce",c),document.head.appendChild(p),u)return new Promise((g,x)=>{p.addEventListener("load",g),p.addEventListener("error",()=>x(new Error(`Unable to preload CSS for ${d}`)))})}))}function a(r){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=r,window.dispatchEvent(c),!c.defaultPrevented)throw r}return i.then(r=>{for(const c of r||[])c.status==="rejected"&&a(c.reason);return o().catch(a)})},S="ic2_state",$={coins:0,completedModules:[],moduleStars:{},badges:[],cityDecorations:[],totalScore:0};function D(){try{const e=localStorage.getItem(S);if(e)return{...$,...JSON.parse(e)}}catch{}return{...$}}function L(e){localStorage.setItem(S,JSON.stringify(e))}function H(e,o,t=null){const n={...e,coins:e.coins+o,totalScore:e.totalScore+o};return t&&!n.badges.includes(t)&&(n.badges=[...n.badges,t]),L(n),n}function O(e,o,t){const n=e.moduleStars[o]||0,i={...e,moduleStars:{...e.moduleStars,[o]:Math.max(n,t)},completedModules:e.completedModules.includes(o)?e.completedModules:[...e.completedModules,o]};return L(i),i}const T={en:{"home.beginner":"Beginner","home.advanced":"Advanced ✦","home.tagline":"Build the Future.","home.progress":"{n} / 12 missions complete","home.locked":"🔒 Complete previous","home.module":"MODULE","lang.en":"English","lang.kn":"ಕನ್ನಡ","btn.play":"Let's Play ▶","btn.continue":"Continue ▶","btn.retry":"Try Again ↺","btn.back":"← Missions","ui.learning":"💡 You're learning","ui.mission":"Mission","ui.whatlearn":"💡 What you'll learn","ui.complete":"◈ Mission Complete","m1.title":"Delivery Kingdom","m1.sub":"3 rounds · MST · Earthquake!","m2.title":"Water Park","m2.sub":"Pipes, gates & flow","m3.title":"Rocket Launch","m3.sub":"Sort rockets, save missions","m4.title":"Monster Attack","m4.sub":"Survive the stomp","m5.title":"Cyber Ninja","m5.sub":"Slash fakes, protect real","m6.title":"Traffic Hero","m6.sub":"Keep the city moving","m7.title":"Maze Post Office","m7.sub":"Find the shortest path","m8.title":"Tower of Babel","m8.sub":"Stack layers in order","m9.title":"Memory Palace","m9.sub":"Cache the right things","m10.title":"Relay Race","m10.sub":"Reassemble the message","m11.title":"Auction House","m11.sub":"Allocate bandwidth fairly","m12.title":"Time Traveler","m12.sub":"Beat latency across the globe","m1.concept":"Graph Theory: nodes + edges = networks. Every device on the internet is a node. Every cable is an edge. N nodes need exactly N−1 edges to all connect (Minimum Spanning Tree). More edges = redundancy — the network survives failures.","m1.howto":"3 rounds: R1 drag roads to connect the city (each road shows live latency in ms!). R2 connect using minimum budget — find the MST! R3 survive an earthquake — redundant roads auto-reroute data.","m2.concept":"Bandwidth = lanes on a highway. More lanes = more packets flow at once without drops.","m2.howto":"Tap a pipe to add a lane (upgrade bandwidth). Keep all 4 pools filled before time runs out!","m3.concept":"Priority Queues: urgent tasks run first. Rockets with higher priority (lower number = more urgent) must launch first or missions fail.","m3.howto":"Click the highest-priority rocket (P1 most urgent, P4 least). Auto-launch in 8s if you wait too long.","m4.concept":"Network Redundancy: The internet was designed to survive nuclear attacks by routing around broken links. Engineers add backup paths so if one cable is cut, data takes a different route.","m4.howto":"You have 30 seconds to add up to 5 backup links (gold dashed lines). Then 3 monsters destroy towers. Goal: keep 6+ buildings online for 2 stars, all 8 for 3 stars.","m5.concept":"Firewalls block bad traffic. Real firewalls inspect every packet — allow safe ones, block threats.","m5.howto":"Slash (swipe) the dangerous 🔴 packets. Let the safe 🟢 ones through. Don't miss or let threats pass!","m6.concept":"Congestion Control: when too many cars use one road, everyone slows down. Rerouting traffic prevents gridlock — just like TCP slows down when networks get congested.","m6.howto":"Tap roads to upgrade capacity. Keep city happiness high by preventing gridlock!","m7.concept":"Dijkstra's Algorithm finds the shortest path in a graph. Used in GPS, internet routing, and game AI.","m7.howto":"Click nodes to build your route from 📬 to 🏠. Find the shortest total distance to earn stars.","m8.concept":"OSI Model: When you send a WhatsApp message, it passes through 7 layers. App (7) → Encrypt (6) → Session (5) → Split into packets (4) → Route via IP (3) → WiFi hop (2) → Radio waves (1).","m8.howto":"Round 1: Drag layers into the tower in order (7 at top, 1 at bottom). Round 2: Quiz with cheat sheet visible. Round 3: Speed stack!","m9.concept":"Cache memory stores frequently-used data close to the CPU. Cache hit = fast. Cache miss = slow trip to RAM.","m9.howto":"Match the memory blocks to fill the cache. Remember positions for faster hits!","m10.concept":"TCP breaks messages into packets, sends them separately, then reassembles them in order at the destination.","m10.howto":"Receive the packets and drag them into the correct order to reassemble the message.","m11.concept":"Bandwidth allocation: when many users share a connection, a fair algorithm gives each user equal share — like dividing a pizza fairly.","m11.howto":"Bid in the auction to allocate bandwidth to users. Fairest distribution wins more stars.","m12.concept":"Latency: Every cable and router adds delay. A signal from New York to Tokyo travels ~11,000 km of fiber — that takes ~55ms just for physics! CDNs place servers near users to cut latency.","m12.howto":"Click cities to build a route from 📡 source to 🎯 destination. Place ⚡ boosters on slow segments. Beat the ms target to win!"},kn:{"home.beginner":"ಆರಂಭಿಕ","home.advanced":"ಮುಂದುವರಿದ ✦","home.tagline":"ಭವಿಷ್ಯ ನಿರ್ಮಿಸಿ.","home.progress":"{n} / 12 ಕಾರ್ಯಗಳು ಪೂರ್ಣ","home.locked":"🔒 ಹಿಂದಿನದನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ","home.module":"ಮಾಡ್ಯೂಲ್","lang.en":"English","lang.kn":"ಕನ್ನಡ","btn.play":"ಆಡೋಣ ▶","btn.continue":"ಮುಂದುವರಿಸಿ ▶","btn.retry":"ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ↺","btn.back":"← ಮಿಷನ್‌ಗಳು","ui.learning":"💡 ನೀವು ಕಲಿಯುತ್ತಿರುವುದು","ui.mission":"ಮಿಷನ್","ui.whatlearn":"💡 ನೀವು ಕಲಿಯಲಿರುವುದು","ui.complete":"◈ ಮಿಷನ್ ಪೂರ್ಣ","m1.title":"ವಿತರಣಾ ರಾಜ್ಯ","m1.sub":"3 ಸುತ್ತು · MST · ಭೂಕಂಪ!","m2.title":"ನೀರಿನ ಉದ್ಯಾನ","m2.sub":"ಪೈಪ್, ಗೇಟ್ ಮತ್ತು ಹರಿವು","m3.title":"ರಾಕೆಟ್ ಉಡಾವಣೆ","m3.sub":"ರಾಕೆಟ್ ವಿಂಗಡಿಸಿ, ಮಿಷನ್ ಉಳಿಸಿ","m4.title":"ರಾಕ್ಷಸರ ದಾಳಿ","m4.sub":"ದಾಳಿಯಿಂದ ಬದುಕಿ","m5.title":"ಸೈಬರ್ ನಿಂಜಾ","m5.sub":"ನಕಲಿ ಕತ್ತರಿಸಿ, ನಿಜವ ರಕ್ಷಿಸಿ","m6.title":"ಟ್ರಾಫಿಕ್ ಹೀರೋ","m6.sub":"ನಗರ ಚಲಿಸುತ್ತಿರಲಿ","m7.title":"ಮೇಜ್ ಪೋಸ್ಟ್ ಆಫೀಸ್","m7.sub":"ಅತಿ ಚಿಕ್ಕ ದಾರಿ ಹುಡುಕಿ","m8.title":"ಬಾಬೆಲ್ ಗೋಪುರ","m8.sub":"ಪದರಗಳನ್ನು ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸಿ","m9.title":"ಸ್ಮಾರಕ ಅರಮನೆ","m9.sub":"ಸರಿಯಾದದ್ದನ್ನು ಕ್ಯಾಷ್ ಮಾಡಿ","m10.title":"ರಿಲೇ ರೇಸ್","m10.sub":"ಸಂದೇಶ ಮರುಜೋಡಿಸಿ","m11.title":"ಹರಾಜು ಮನೆ","m11.sub":"ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್ ಸಮಾನವಾಗಿ ಹಂಚಿ","m12.title":"ಕಾಲ ಪ್ರಯಾಣಿಕ","m12.sub":"ಜಗತ್ತಿನಾದ್ಯಂತ ತಡ ಗೆಲ್ಲಿ","m1.concept":"ಗ್ರಾಫ್ ಥಿಯರಿ: ನೋಡ್‌ಗಳು + ಅಂಚುಗಳು = ನೆಟ್‌ವರ್ಕ್. N ನೋಡ್‌ಗಳಿಗೆ N−1 ಅಂಚುಗಳು ಸಾಕು (ಮಿನಿಮಮ್ ಸ್ಪ್ಯಾನಿಂಗ್ ಟ್ರೀ). ಹೆಚ್ಚು ಅಂಚುಗಳು = ರಿಡಂಡೆನ್ಸಿ = ವೈಫಲ್ಯ ತಡೆ.","m1.howto":"3 ಸುತ್ತುಗಳು: ಸ1 ರಸ್ತೆ ನಿರ್ಮಿಸಿ (ಲೇಟೆನ್ಸಿ ms ನೋಡಿ). ಸ2 ಬಜೆಟ್‌ನಲ್ಲಿ MST ಹುಡುಕಿ. ಸ3 ಭೂಕಂಪ ತಡೆದುಕೊಳ್ಳಿ!","m2.concept":"ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್ = ಹೆದ್ದಾರಿಯ ಲೇನ್‌ಗಳು. ಹೆಚ್ಚು ಲೇನ್ = ಒಮ್ಮೆಗೆ ಹೆಚ್ಚು ಪ್ಯಾಕೆಟ್‌ಗಳು ಹರಿಯುತ್ತವೆ.","m2.howto":"ಪೈಪ್ ತಟ್ಟಿ ಲೇನ್ ಸೇರಿಸಿ. 4 ಕೊಳಗಳನ್ನು ತುಂಬಿಸಿ!","m3.concept":"ಆದ್ಯತಾ ಕ್ಯೂ: ತುರ್ತು ಕೆಲಸ ಮೊದಲು. P1 = ಅತ್ಯಂತ ತುರ್ತು, P4 = ಕಡಿಮೆ ತುರ್ತು.","m3.howto":"ಅತ್ಯಂತ ಆದ್ಯತೆಯ ರಾಕೆಟ್ ಕ್ಲಿಕ್ ಮಾಡಿ. 8 ಸೆಕೆಂಡ್ ಕಾದರೆ ತಾನೇ ಉಡಾಯಿಸುತ್ತದೆ.","m4.concept":"ನೆಟ್‌ವರ್ಕ್ ಅಧಿಕ ಬಲ: ಒಂದು ಕೇಬಲ್ ಮುರಿದರೆ, ಡೇಟಾ ಬೇರೆ ದಾರಿ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ.","m4.howto":"5 ಬ್ಯಾಕಪ್ ಲಿಂಕ್‌ಗಳನ್ನು ಸೇರಿಸಲು 30 ಸೆಕೆಂಡ್. ರಾಕ್ಷಸರು ಟವರ್ ನಾಶ ಮಾಡುತ್ತಾರೆ. 6+ ಕಟ್ಟಡ ಆನ್‌ಲೈನ್ ಉಳಿಸಿ!","m5.concept":"ಫೈರ್‌ವಾಲ್ ಕೆಟ್ಟ ಟ್ರಾಫಿಕ್ ತಡೆಯುತ್ತದೆ. ನಿಜವಾದ ಫೈರ್‌ವಾಲ್ ಪ್ರತಿ ಪ್ಯಾಕೆಟ್ ಪರೀಕ್ಷಿಸುತ್ತದೆ.","m5.howto":"ಅಪಾಯಕಾರಿ 🔴 ಪ್ಯಾಕೆಟ್‌ಗಳನ್ನು ಕತ್ತರಿಸಿ (ಸ್ವೈಪ್). ಸುರಕ್ಷಿತ 🟢 ಅನ್ನು ಹಾದು ಹೋಗಲು ಬಿಡಿ.","m6.concept":"ದಟ್ಟಣೆ ನಿಯಂತ್ರಣ: ತುಂಬಾ ಕಾರುಗಳು = ತಡ. ಟ್ರಾಫಿಕ್ ಮರು ನಿರ್ದೇಶಿಸಿ.","m6.howto":"ರಸ್ತೆ ತಟ್ಟಿ ಸಾಮರ್ಥ್ಯ ಹೆಚ್ಚಿಸಿ. ನಗರ ಸಂತೋಷ ಹೆಚ್ಚಾಗಿ ಇರಲಿ!","m7.concept":"ಡಿಜ್ಕ್ಸ್ಟ್ರಾ ಅಲ್ಗಾರಿದಮ್ ಗ್ರಾಫ್‌ನಲ್ಲಿ ಚಿಕ್ಕ ದಾರಿ ಹುಡುಕುತ್ತದೆ. GPS, ರೂಟಿಂಗ್‌ನಲ್ಲಿ ಬಳಕೆ.","m7.howto":"📬 ಇಂದ 🏠 ಗೆ ನೋಡ್‌ಗಳ ಮೂಲಕ ಅತಿ ಚಿಕ್ಕ ದಾರಿ ಹುಡುಕಿ.","m8.concept":"OSI ಮಾದರಿ: WhatsApp ಸಂದೇಶ 7 ಪದರಗಳ ಮೂಲಕ ಹೋಗುತ್ತದೆ. ಅಪ್ಲಿಕೇಶನ್ (7) → ಎನ್‌ಕ್ರಿಪ್ಟ್ (6) → ಸೆಷನ್ (5) → ಪ್ಯಾಕೆಟ್ (4) → IP ರೂಟ್ (3) → WiFi (2) → ರೇಡಿಯೋ ತರಂಗ (1).","m8.howto":"ಸುತ್ತ 1: ಪದರಗಳನ್ನು ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸಿ. ಸುತ್ತ 2: ಚೀಟ್ ಶೀಟ್ ನೋಡಿ ಕ್ವಿಜ್ ಉತ್ತರಿಸಿ. ಸುತ್ತ 3: ವೇಗ!","m9.concept":"ಕ್ಯಾಷ್ ಮೆಮೊರಿ ಹೆಚ್ಚಾಗಿ ಬಳಸುವ ಡೇಟಾ CPU ಹತ್ತಿರ ಇಡುತ್ತದೆ. ಕ್ಯಾಷ್ ಹಿಟ್ = ವೇಗ. ಮಿಸ್ = ನಿಧಾನ.","m9.howto":"ಮೆಮೊರಿ ಬ್ಲಾಕ್‌ಗಳನ್ನು ಕ್ಯಾಷ್ ತುಂಬಿಸಲು ಹೊಂದಿಸಿ.","m10.concept":"TCP ಸಂದೇಶ ಪ್ಯಾಕೆಟ್‌ಗಳಾಗಿ ಮುರಿದು ಕಳಿಸುತ್ತದೆ, ಗಮ್ಯದಲ್ಲಿ ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸುತ್ತದೆ.","m10.howto":"ಪ್ಯಾಕೆಟ್‌ಗಳನ್ನು ಸರಿಯಾದ ಕ್ರಮದಲ್ಲಿ ಎಳೆದು ಸಂದೇಶ ಜೋಡಿಸಿ.","m11.concept":"ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್ ಹಂಚಿಕೆ: ಸಮಾನ ಅಲ್ಗಾರಿದಮ್ ಪ್ರತಿ ಬಳಕೆದಾರರಿಗೆ ಸಮ ಪಾಲು ನೀಡುತ್ತದೆ.","m11.howto":"ಹರಾಜಿನಲ್ಲಿ ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್ ಹಂಚಿ. ನ್ಯಾಯಯುತ ಹಂಚಿಕೆ = ಹೆಚ್ಚು ನಕ್ಷತ್ರ.","m12.concept":"ಲೇಟೆನ್ಸಿ: ಪ್ರತಿ ಕೇಬಲ್ ತಡ ಸೇರಿಸುತ್ತದೆ. ನ್ಯೂಯಾರ್ಕ್-ಟೋಕ್ಯೋ ~55ms. CDN ಹತ್ತಿರದ ಸರ್ವರ್ ತಡ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.","m12.howto":"ಮೂಲ 📡 ಇಂದ ಗಮ್ಯ 🎯 ಗೆ ರಿಲೇ ನಗರಗಳ ಮೂಲಕ ರೂಟ್ ನಿರ್ಮಿಸಿ. ms ಗುರಿ ತಲುಪಿ!"}},M="ic2_lang",z=["en","kn"];function P(){const e=localStorage.getItem(M);return z.includes(e)?e:"en"}function N(e){z.includes(e)&&localStorage.setItem(M,e)}function s(e,o={}){const t=P(),n=(T[t]&&T[t][e])??T.en[e]??e;return Object.keys(o).reduce((i,a)=>i.replace(`{${a}}`,o[a]),n)}function V(e,{bgColor:o="#0a0a1a"}={}){const t=document.createElement("div");t.style.cssText=`
    position:fixed;inset:0;background:${o};
    display:flex;flex-direction:column;overflow:hidden;z-index:10;
    font-family:'Space Mono','Noto Sans Kannada',monospace,sans-serif;
  `,e.appendChild(t);const n=document.createElement("canvas");n.style.cssText="position:absolute;inset:0;width:100%;height:100%;touch-action:none;-webkit-user-select:none;user-select:none;",t.appendChild(n);const i=()=>{const l=window.devicePixelRatio||1;n.width=t.clientWidth*l,n.height=t.clientHeight*l,n.style.width=t.clientWidth+"px",n.style.height=t.clientHeight+"px",n.getContext("2d").setTransform(l,0,0,l,0,0)};return i(),window.addEventListener("resize",i),{root:t,canvas:n,ctx:()=>n.getContext("2d"),W:()=>t.clientWidth,H:()=>t.clientHeight,destroy:()=>{window.removeEventListener("resize",i),t.remove()},canvasXY:l=>{const p=n.getBoundingClientRect(),g=l.changedTouches&&l.changedTouches.length?l.changedTouches[0]:l.touches&&l.touches.length?l.touches[0]:l,x=p.width?t.clientWidth/p.width:1,y=p.height?t.clientHeight/p.height:1;return{x:(g.clientX-p.left)*x,y:(g.clientY-p.top)*y}}}}function B(e,{title:o,color:t="#46f0c0",width:n="min(440px,92vw)"}={}){const i=document.createElement("div");i.style.cssText=`
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);z-index:100;
  `;const a=document.createElement("div");if(a.style.cssText=`
    background:#0d1f2d;border:1px solid ${t}55;border-radius:20px;
    padding:28px 24px;width:${n};max-height:min(520px,88vh);
    display:flex;flex-direction:column;
    box-shadow:0 8px 48px rgba(0,0,0,0.7),0 0 0 1px ${t}22;
  `,o){const c=document.createElement("div");c.style.cssText=`font-size:11px;color:${t};letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;font-weight:700;flex-shrink:0;`,c.textContent=o,a.appendChild(c)}const r=document.createElement("div");return r.style.cssText="overflow-y:auto;flex:1;",a.appendChild(r),i.appendChild(a),e.appendChild(i),{el:a,body:r,remove:()=>i.remove()}}function K(e,{color:o="#46f0c0"}={}){const t=document.createElement("div");t.style.cssText=`
    position:absolute;top:0;left:0;right:0;height:48px;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 16px;z-index:60;
    background:linear-gradient(to bottom,rgba(0,0,0,0.6),transparent);
    pointer-events:none;
  `;const n=document.createElement("div"),i=document.createElement("div"),a=document.createElement("div");return[n,i,a].forEach(r=>{r.style.cssText=`color:${o};font-size:13px;font-weight:700;pointer-events:auto;`,t.appendChild(r)}),e.appendChild(t),{el:t,setLeft:r=>{n.innerHTML=r},setCenter:r=>{i.innerHTML=r},setRight:r=>{a.innerHTML=r},leftEl:n,rightEl:a}}function X(e,o,t,n){const i=document.createElement("div");i.style.cssText=`
    position:absolute;left:${o}px;top:${t}px;
    font-size:18px;font-weight:700;color:#ffd700;
    pointer-events:none;z-index:200;
    animation:coinPop 0.9s ease-out forwards;
    text-shadow:0 2px 8px rgba(255,215,0,0.6);
  `,i.textContent=`+${n}🪙`,e.appendChild(i),setTimeout(()=>i.remove(),900)}(function(){if(document.getElementById("ic2-anims"))return;const o=document.createElement("style");o.id="ic2-anims",o.textContent=`
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Sans+Kannada:wght@400;700&display=swap');
    body, button, input, select, textarea {
      font-family: 'Space Mono', 'Noto Sans Kannada', monospace, sans-serif;
    }
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
    /* D2: play button active state */
    #intro-start:active { transform:scale(0.95) !important; opacity:0.85; }
  `,document.head.appendChild(o)})();function F(e,{concept:o,detail:t,color:n="#46f0c0"}){const i=document.createElement("div");return i.style.cssText=`
    position:absolute;bottom:0;left:0;right:0;z-index:55;
    background:linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.7) 70%,transparent 100%);
    padding:10px 16px 14px;pointer-events:none;
    max-height:80px;overflow:hidden;
  `,i.innerHTML=`
    <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${n};font-weight:700;margin-bottom:2px;">${s("ui.learning")}</div>
    <div style="font-size:13px;font-weight:700;color:#fff;">${o}</div>
    <div style="font-size:11px;color:#8aa6b4;margin-top:1px;line-height:1.4;">${t}</div>
  `,e.appendChild(i),i}function q(e,{emoji:o,title:t,concept:n,howto:i,color:a="#46f0c0",onStart:r}){const c=document.createElement("div");c.style.cssText=`
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.82);backdrop-filter:blur(8px);z-index:200;padding:20px;
  `;const d=document.createElement("div");d.style.cssText=`
    background:#0d1f2d;border:1px solid ${a}44;border-radius:24px;
    width:min(400px,100%);
    max-height:min(520px,88vh);
    display:flex;flex-direction:column;
    overflow:hidden;
  `;const u=document.createElement("div");u.style.cssText=`
    padding:clamp(16px,4vw,24px) clamp(14px,4vw,24px) 12px;
    text-align:center;flex-shrink:0;
  `,u.innerHTML=`
    <div style="font-size:48px;margin-bottom:8px;line-height:1;">${o}</div>
    <div style="font-size:9px;color:${a};letter-spacing:3px;text-transform:uppercase;font-weight:700;margin-bottom:4px;">${s("ui.mission")}</div>
    <div style="font-size:clamp(18px,5vw,22px);font-weight:700;color:#fff;">${t}</div>
  `,d.appendChild(u);const l=document.createElement("div");l.style.cssText=`
    flex:1;overflow-y:auto;padding:0 clamp(14px,4vw,24px) 12px;
    -webkit-overflow-scrolling:touch;
  `;const p=document.createElement("div");p.style.cssText=`
    background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
    border-radius:12px;padding:10px 14px;margin-bottom:10px;text-align:left;
  `,p.innerHTML=`
    <div style="font-size:10px;color:#fff;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:5px;">🎮 How to play</div>
    <div style="font-size:12px;color:#c8e6f0;line-height:1.55;">${i}</div>
  `,l.appendChild(p);const g=document.createElement("div");g.style.cssText=`
    background:${a}14;border:1px solid ${a}30;border-radius:12px;
    padding:10px 14px;text-align:left;
  `,g.innerHTML=`
    <div style="font-size:10px;color:${a};letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:5px;">${s("ui.whatlearn")}</div>
    <div style="font-size:11px;color:#e0f4ec;line-height:1.55;max-height:80px;overflow-y:auto;-webkit-overflow-scrolling:touch;">${n}</div>
  `,l.appendChild(g),d.appendChild(l);const x=document.createElement("div");x.style.cssText=`
    padding:12px clamp(14px,4vw,24px) clamp(14px,4vw,20px);
    flex-shrink:0;
  `;const y=document.createElement("button");y.id="intro-start",y.style.cssText=`
    width:100%;padding:14px;border-radius:12px;border:none;
    background:${a};color:#000;font-size:15px;font-weight:700;
    cursor:pointer;font-family:inherit;
    min-height:48px;touch-action:manipulation;
    -webkit-tap-highlight-color:transparent;
    transition:transform 0.1s,opacity 0.1s;
    display:block;
  `,y.textContent=s("btn.play"),y.addEventListener("click",()=>{c.remove(),r()}),x.appendChild(y),d.appendChild(x),c.appendChild(d),e.appendChild(c)}function G(e,{stars:o,maxStars:t=3,title:n,lines:i=[],coins:a=0,color:r="#ffd700",onContinue:c}){const d=B(e,{title:s("ui.complete"),color:r});d.body.innerHTML=`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:40px;margin-bottom:8px;">${"⭐".repeat(o)}${"☆".repeat(t-o)}</div>
      <div style="font-size:22px;font-weight:700;color:#fff;margin-bottom:6px;">${n}</div>
      ${i.map(l=>`<div style="font-size:13px;color:#8aa6b4;margin-top:4px;">${l}</div>`).join("")}
      ${a?`<div style="font-size:18px;color:#ffd700;margin-top:12px;font-weight:700;">+${a} 🪙</div>`:""}
    </div>
  `;const u=document.createElement("button");u.style.cssText=`
    width:100%;padding:14px;border-radius:12px;border:none;
    background:${r};color:#000;font-size:15px;font-weight:700;
    cursor:pointer;margin-top:8px;font-family:inherit;
    min-height:48px;touch-action:manipulation;
    -webkit-tap-highlight-color:transparent;
  `,u.textContent=o>=2?s("btn.continue"):s("btn.retry"),u.addEventListener("click",()=>{d.remove(),c(o)}),d.body.appendChild(u)}function U(){return[{id:1,title:s("m1.title"),emoji:"🎁",color:"#ffd700",sub:s("m1.sub"),bg:"#1a1500"},{id:2,title:s("m2.title"),emoji:"💧",color:"#00b4ff",sub:s("m2.sub"),bg:"#00111a"},{id:3,title:s("m3.title"),emoji:"🚀",color:"#ff6b35",sub:s("m3.sub"),bg:"#1a0d00"},{id:4,title:s("m4.title"),emoji:"👾",color:"#c9b6ff",sub:s("m4.sub"),bg:"#0d0020"},{id:5,title:s("m5.title"),emoji:"🥷",color:"#46f0c0",sub:s("m5.sub"),bg:"#001a0d"},{id:6,title:s("m6.title"),emoji:"🚗",color:"#ff3860",sub:s("m6.sub"),bg:"#1a0005"},{id:7,title:s("m7.title"),emoji:"🗺️",color:"#ffec3d",sub:s("m7.sub"),bg:"#1a1a00"},{id:8,title:s("m8.title"),emoji:"🏗️",color:"#ff9f43",sub:s("m8.sub"),bg:"#1a0e00"},{id:9,title:s("m9.title"),emoji:"🧠",color:"#fd79a8",sub:s("m9.sub"),bg:"#1a0010"},{id:10,title:s("m10.title"),emoji:"🏃",color:"#00cec9",sub:s("m10.sub"),bg:"#001a1a"},{id:11,title:s("m11.title"),emoji:"💰",color:"#e17055",sub:s("m11.sub"),bg:"#1a0800"},{id:12,title:s("m12.title"),emoji:"⏱️",color:"#a29bfe",sub:s("m12.sub"),bg:"#08001a"}]}function R(e,o,t){document.body.classList.add("home-screen");const n=document.createElement("div");n.style.cssText=`
    min-height:100%;background:#0a0a1a;
    display:flex;flex-direction:column;align-items:center;
    padding:0 0 60px;
    font-family:'Space Mono','Noto Sans Kannada',monospace,sans-serif;
  `;const i=window.location.origin+"/v1/",a=document.createElement("div");a.style.cssText=`
    width:100%;max-width:720px;padding:14px 14px 0;
    display:flex;flex-direction:column;gap:8px;
  `;const r=document.createElement("div");r.style.cssText="display:flex;justify-content:flex-end;";function c(){const m=P(),w=document.createElement("div");w.style.cssText=`
      display:inline-flex;border-radius:20px;overflow:hidden;
      border:1px solid rgba(255,255,255,0.15);font-size:12px;font-weight:700;
      cursor:pointer;
    `;const v=document.createElement("button");v.textContent="EN",v.style.cssText=`
      padding:6px 14px;border:none;font-size:12px;font-weight:700;
      cursor:pointer;font-family:inherit;min-height:0;touch-action:manipulation;
      -webkit-tap-highlight-color:transparent;
      background:${m==="en"?"rgba(70,240,192,0.22)":"transparent"};
      color:${m==="en"?"#46f0c0":"#8aa6b4"};
      border-right:1px solid rgba(255,255,255,0.1);
      transition:background 0.2s,color 0.2s;
    `;const b=document.createElement("button");b.textContent="ಕನ್ನಡ",b.style.cssText=`
      padding:6px 14px;border:none;font-size:12px;font-weight:700;
      cursor:pointer;font-family:'Noto Sans Kannada','Space Mono',monospace,sans-serif;
      min-height:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
      background:${m==="kn"?"rgba(70,240,192,0.22)":"transparent"};
      color:${m==="kn"?"#46f0c0":"#8aa6b4"};
      transition:background 0.2s,color 0.2s;
    `;const h=A=>{N(A),n.remove(),R(e,o,t)};return v.addEventListener("click",()=>h("en")),b.addEventListener("click",()=>h("kn")),w.appendChild(v),w.appendChild(b),w}r.appendChild(c()),a.appendChild(r);const d=document.createElement("div");d.style.cssText="display:flex;justify-content:flex-end;",d.innerHTML=`
    <div style="
      display:inline-flex;border-radius:20px;overflow:hidden;
      border:1px solid rgba(255,255,255,0.12);font-size:11px;font-weight:700;
    ">
      <span style="
        padding:6px 14px;
        background:rgba(70,240,192,0.18);
        color:#46f0c0;
        border-right:1px solid rgba(255,255,255,0.1);
      ">${s("home.beginner")}</span>
      <a href="${i}" style="
        padding:6px 14px;text-decoration:none;
        color:#8aa6b4;
        transition:background 0.2s,color 0.2s;
      " onmouseover="this.style.color='#46f0c0'" onmouseout="this.style.color='#8aa6b4'">${s("home.advanced")}</a>
    </div>
  `,a.appendChild(d),n.appendChild(a);const u=document.createElement("div");u.style.cssText="width:100%;max-width:720px;padding:16px 14px 0;";const l=(o.completedModules||[]).length,p=s("home.progress",{n:l});u.innerHTML=`
    <!-- Header -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px;flex-wrap:wrap;">
      <div>
        <div style="font-size:10px;color:#8aa6b4;letter-spacing:3px;text-transform:uppercase;">Internet City</div>
        <div style="font-size:clamp(20px,6vw,28px);font-weight:700;color:#fff;line-height:1.1;">${s("home.tagline")}</div>
      </div>
      <div class="coin-display" style="flex-shrink:0;">🪙 ${o.coins}</div>
    </div>
    <div style="font-size:12px;color:#8aa6b4;margin-top:4px;margin-bottom:20px;">
      ${p}${l===12?" 🏆":""}
    </div>
    <div id="module-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(190px,100%),1fr));gap:12px;"></div>
  `,n.appendChild(u),e.appendChild(n);const g=u.querySelector("#module-grid"),x=o.completedModules||[];U().forEach((m,w)=>{const v=o.moduleStars?.[m.id]||0,b=m.id===1||x.includes(m.id-1)||x.includes(m.id),h=document.createElement("div");h.className="module-card-v2"+(b?"":" locked"),h.style.cssText=`
      border-radius:20px;padding:20px;cursor:${b?"pointer":"not-allowed"};
      background:${m.bg};border:1px solid ${b?m.color+"44":"rgba(255,255,255,0.06)"};
      transition:transform 0.2s,border-color 0.2s,box-shadow 0.2s;
      animation:fadeInUp 0.4s ease ${w*.07}s both;
      touch-action:manipulation;
    `,h.innerHTML=`
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="font-size:32px;line-height:1;flex-shrink:0;">${m.emoji}</div>
        <div style="min-width:0;">
          <div style="font-size:10px;color:${m.color};letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;font-weight:700;">${s("home.module")} ${m.id}</div>
          <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:2px;line-height:1.2;">${m.title}</div>
          <div style="font-size:11px;color:#8aa6b4;margin-bottom:6px;">${m.sub}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div class="star-strip" style="font-size:14px;">${"⭐".repeat(v)}${"☆".repeat(3-v)}</div>
            ${b?"":`<div style="font-size:11px;color:#555;">${s("home.locked")}</div>`}
          </div>
        </div>
      </div>
    `,b&&(h.addEventListener("mouseenter",()=>{h.style.transform="translateY(-4px)",h.style.boxShadow=`0 8px 32px ${m.color}33`,h.style.borderColor=m.color+"88"}),h.addEventListener("mouseleave",()=>{h.style.transform="",h.style.boxShadow="",h.style.borderColor=m.color+"44"}),h.addEventListener("click",()=>t(m.id))),g.appendChild(h)})}const C=document.getElementById("app");let k=D();function E(e,...o){if(C.innerHTML="",e==="home")R(C,k,t=>E("module",t));else if(e==="module"){const t=o[0];W(t)}}async function W(e){document.body.classList.remove("home-screen");const t={1:()=>f(()=>import("./index-CI6ID_iy.js"),__vite__mapDeps([0,1,2])),2:()=>f(()=>import("./index-D3N-SfnY.js"),__vite__mapDeps([3,1,2])),3:()=>f(()=>import("./index-C9KLoGeg.js"),__vite__mapDeps([4,1,2])),4:()=>f(()=>import("./index-CAq8F6FW.js"),__vite__mapDeps([5,1,2])),5:()=>f(()=>import("./index-cMJ9vV9M.js"),__vite__mapDeps([6,1,2])),6:()=>f(()=>import("./index-D_gvaqi6.js"),__vite__mapDeps([7,1,2])),7:()=>f(()=>import("./index-DfaTam9h.js"),__vite__mapDeps([8,1,2])),8:()=>f(()=>import("./index-CjIxFi8m.js"),__vite__mapDeps([9,1,2])),9:()=>f(()=>import("./index-CEF9dPWo.js"),__vite__mapDeps([10,1,2])),10:()=>f(()=>import("./index-DDKGGQ6E.js"),__vite__mapDeps([11,1,2])),11:()=>f(()=>import("./index-pHEKJ99_.js"),__vite__mapDeps([12,1,2])),12:()=>f(()=>import("./index-BZS25q5W.js"),__vite__mapDeps([13,1,2]))}[e];if(!t)return E("home");(await t()).launch(C,k,(i,a)=>{k=O(k,e,i),k=H(k,a),E("home")})}E("home");export{K as a,q as b,X as c,G as d,B as e,V as m,F as s,s as t};

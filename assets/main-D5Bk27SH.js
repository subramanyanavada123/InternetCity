const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-btKR7Kvo.js","assets/sfx-DMPbFRfs.js","assets/modulepreload-polyfill-B5Qt9EMX.js","assets/index-BtAkZLZh.js","assets/index--6WPR_qy.js","assets/index-Bb_Qo-FL.js","assets/index-CNQeJYVX.js","assets/index-DpYMJjMY.js","assets/index-DMQqeJ-d.js","assets/index-DkM5QcWc.js","assets/index-cpOv7Fcm.js","assets/index-DgVl0hhc.js","assets/index-DgD3ygDP.js","assets/index-DMgil8Xv.js","assets/index-ebPubBhs.js","assets/index-CtnReseJ.js","assets/index-DzTpL5EE.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";const D="modulepreload",j=function(t){return"/"+t},L={},f=function(o,e,n){let s=Promise.resolve();if(e&&e.length>0){document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),c=r?.nonce||r?.getAttribute("nonce");s=Promise.allSettled(e.map(d=>{if(d=j(d),d in L)return;L[d]=!0;const p=d.endsWith(".css"),g=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${g}`))return;const l=document.createElement("link");if(l.rel=p?"stylesheet":D,p||(l.as="script"),l.crossOrigin="",l.href=d,c&&l.setAttribute("nonce",c),document.head.appendChild(l),p)return new Promise((h,b)=>{l.addEventListener("load",h),l.addEventListener("error",()=>b(new Error(`Unable to preload CSS for ${d}`)))})}))}function a(r){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=r,window.dispatchEvent(c),!c.defaultPrevented)throw r}return s.then(r=>{for(const c of r||[])c.status==="rejected"&&a(c.reason);return o().catch(a)})},$="ic2_state",P={coins:0,completedModules:[],moduleStars:{},badges:[],cityDecorations:[],totalScore:0};function B(){try{const t=localStorage.getItem($);if(t)return{...P,...JSON.parse(t)}}catch{}return{...P}}function M(t){localStorage.setItem($,JSON.stringify(t))}function U(t,o,e=null){const n={...t,coins:t.coins+o,totalScore:t.totalScore+o};return e&&!n.badges.includes(e)&&(n.badges=[...n.badges,e]),M(n),n}function H(t,o,e){const n=t.moduleStars[o]||0,s={...t,moduleStars:{...t.moduleStars,[o]:Math.max(n,e)},completedModules:t.completedModules.includes(o)?t.completedModules:[...t.completedModules,o]};return M(s),s}const S={en:{"home.beginner":"Beginner","home.advanced":"Advanced ✦","home.tagline":"Build the Future.","home.progress":"{n} / 15 missions complete","home.locked":"🔒 Complete previous","home.module":"MODULE","lang.en":"English","lang.kn":"ಕನ್ನಡ","btn.play":"Let's Play ▶","btn.continue":"Continue ▶","btn.retry":"Try Again ↺","btn.back":"← Missions","ui.learning":"💡 You're learning","ui.mission":"Mission","ui.whatlearn":"💡 What you'll learn","ui.complete":"◈ Mission Complete","m1.title":"Delivery Kingdom","m1.sub":"3 rounds · MST · Earthquake!","m2.title":"Water Park","m2.sub":"Pipes, gates & flow","m3.title":"Rocket Launch","m3.sub":"Sort rockets, save missions","m4.title":"Monster Attack","m4.sub":"Survive the stomp","m5.title":"Cyber Ninja","m5.sub":"Slash fakes, protect real","m6.title":"Traffic Hero","m6.sub":"Keep the city moving","m7.title":"Maze Post Office","m7.sub":"Find the shortest path","m8.title":"Tower of Babel","m8.sub":"Stack layers in order","m9.title":"Memory Palace","m9.sub":"Cache the right things","m10.title":"Relay Race","m10.sub":"Reassemble the message","m11.title":"Auction House","m11.sub":"Allocate bandwidth fairly","m12.title":"Time Traveler","m12.sub":"Beat latency across the globe","m13.title":"Sorting Race","m13.sub":"Watch 5 algorithms battle it out","m14.title":"Logic Gates","m14.sub":"Build circuits like a CPU","m15.title":"Binary Tree","m15.sub":"Insert, search, beat the BST","m1.concept":"Graph Theory: nodes + edges = networks. Every device on the internet is a node. Every cable is an edge. N nodes need exactly N−1 edges to all connect (Minimum Spanning Tree). More edges = redundancy — the network survives failures.","m1.howto":"3 rounds: R1 drag roads to connect the city (each road shows live latency in ms!). R2 connect using minimum budget — find the MST! R3 survive an earthquake — redundant roads auto-reroute data.","m2.concept":"Bandwidth = lanes on a highway. More lanes = more packets flow at once without drops.","m2.howto":"Tap a pipe to add a lane (upgrade bandwidth). Keep all 4 pools filled before time runs out!","m3.concept":"Priority Queues: urgent tasks run first. Rockets with higher priority (lower number = more urgent) must launch first or missions fail.","m3.howto":"Click the highest-priority rocket (P1 most urgent, P4 least). Auto-launch in 8s if you wait too long.","m4.concept":"Network Redundancy: The internet was designed to survive nuclear attacks by routing around broken links. Engineers add backup paths so if one cable is cut, data takes a different route.","m4.howto":"You have 30 seconds to add up to 5 backup links (gold dashed lines). Then 3 monsters destroy towers. Goal: keep 6+ buildings online for 2 stars, all 8 for 3 stars.","m5.concept":"Firewalls block bad traffic. Real firewalls inspect every packet — allow safe ones, block threats.","m5.howto":"Slash (swipe) the dangerous 🔴 packets. Let the safe 🟢 ones through. Don't miss or let threats pass!","m6.concept":"Congestion Control: when too many cars use one road, everyone slows down. Rerouting traffic prevents gridlock — just like TCP slows down when networks get congested.","m6.howto":"Tap roads to upgrade capacity. Keep city happiness high by preventing gridlock!","m7.concept":"Dijkstra's Algorithm finds the shortest path in a graph. Used in GPS, internet routing, and game AI.","m7.howto":"Click nodes to build your route from 📬 to 🏠. Find the shortest total distance to earn stars.","m8.concept":"OSI Model: When you send a WhatsApp message, it passes through 7 layers. App (7) → Encrypt (6) → Session (5) → Split into packets (4) → Route via IP (3) → WiFi hop (2) → Radio waves (1).","m8.howto":"Round 1: Drag layers into the tower in order (7 at top, 1 at bottom). Round 2: Quiz with cheat sheet visible. Round 3: Speed stack!","m9.concept":"Cache memory stores frequently-used data close to the CPU. Cache hit = fast. Cache miss = slow trip to RAM.","m9.howto":"Match the memory blocks to fill the cache. Remember positions for faster hits!","m10.concept":"TCP breaks messages into packets, sends them separately, then reassembles them in order at the destination.","m10.howto":"Receive the packets and drag them into the correct order to reassemble the message.","m11.concept":"Bandwidth allocation: when many users share a connection, a fair algorithm gives each user equal share — like dividing a pizza fairly.","m11.howto":"Bid in the auction to allocate bandwidth to users. Fairest distribution wins more stars.","m12.concept":"Latency: Every cable and router adds delay. A signal from New York to Tokyo travels ~11,000 km of fiber — that takes ~55ms just for physics! CDNs place servers near users to cut latency.","m12.howto":"Click cities to build a route from 📡 source to 🎯 destination. Place ⚡ boosters on slow segments. Beat the ms target to win!","m13.concept":"Algorithm Complexity: O(n²) algorithms (Bubble, Selection, Insertion) do n² comparisons. O(n log n) algorithms (Merge, Quick) are exponentially faster on large data — used in every OS, database, and search engine.","m13.howto":"Pick an array type (Random / Nearly Sorted / Reversed) then tap RACE to watch 5 algorithms compete simultaneously. Try all 3 array types — see how the winner changes!","m14.concept":"Boolean Logic: Every computer is built from AND, OR, NOT, XOR gates — physical switches that turn on/off. Combine them → half adder → full adder → 32-bit CPU. Your phone has 15 BILLION gates!","m14.howto":"Drag wires from outputs (yellow dots) to inputs (blue dots) to connect switches through gates to the light bulb. Toggle switches to test. Build all 5 circuits to win!","m15.concept":"Binary Search Tree: insert a number and it goes left if smaller, right if larger. Searching skips HALF the remaining nodes at every step — 1 million items take at most 20 comparisons. Used in every database index.","m15.howto":"Round 1: watch the BST build itself. Round 2: watch binary search find numbers in the tree. Round 3: YOU search — tap nodes to navigate to the target in as few steps as possible!","m1.banner":"Nodes = devices. Edges = cables. N nodes need N−1 edges to connect. More edges = redundancy = fault tolerance.","m2.banner":"More lanes on a pipe = more packets at once. Tap congested pipes to upgrade!","m3.banner":"Networks prioritise critical traffic (VoIP, video) over bulk data. This is called QoS — Quality of Service.","m4.banner":"Real internet cables break. Redundancy = extra backup paths so data still flows around failures.","m5.banner":"Firewalls inspect every packet and block threats. Real or fake — a firewall decides in milliseconds.","m6.banner":"Networks slow down when too much data flows through one link. Routing spreads the load.","m7.banner":"Routers find the fastest route using graph algorithms. Fewer hops = lower latency.","m8.banner":"Every network message travels through 7 layers — Physical → Data Link → Network → Transport → Session → Presentation → Application.","m9.banner":"Caches store frequently used data close to the CPU. When full, the Least Recently Used item is evicted.","m10.banner":"Large messages split into packets, travel different paths, then reassemble in order at the destination — that's TCP/IP.","m11.banner":"Networks share limited bandwidth between many users. Prioritising critical services keeps the network fair and reliable.","m12.banner":"Latency = how long data takes to travel. Routing via nearby servers reduces delay. Used in CDNs worldwide.","m13.banner":"O(n²): Bubble, Selection, Insertion — slow on big data. O(n log n): Merge, Quick — exponentially faster. Every app you use runs O(n log n) sorting.","m14.banner":"AND · OR · NOT · XOR gates combine to build adders, memory, and CPUs. All computation is just switches turning on and off.","m15.banner":"BST search halves the search space each step. 1 million items → max 20 comparisons. Used in every database, file system, and search engine.","result.delivered":"Delivered","result.dropped":"Dropped","result.pools":"Pools filled","result.bandwidth":"💡 Bandwidth = lanes on a highway.","result.morelanes":"More lanes = more packets at once = no drops.","result.isps":"📡 Real ISPs upgrade links exactly this way!"},kn:{"home.beginner":"ಆರಂಭಿಕ","home.advanced":"ಮುಂದುವರಿದ ✦","home.tagline":"ಭವಿಷ್ಯ ನಿರ್ಮಿಸಿ.","home.progress":"{n} / 15 ಕಾರ್ಯಗಳು ಪೂರ್ಣ","home.locked":"🔒 ಹಿಂದಿನದನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ","home.module":"ಮಾಡ್ಯೂಲ್","lang.en":"English","lang.kn":"ಕನ್ನಡ","btn.play":"ಆಡೋಣ ▶","btn.continue":"ಮುಂದುವರಿಸಿ ▶","btn.retry":"ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ↺","btn.back":"← ಮಿಷನ್‌ಗಳು","ui.learning":"💡 ನೀವು ಕಲಿಯುತ್ತಿರುವುದು","ui.mission":"ಮಿಷನ್","ui.whatlearn":"💡 ನೀವು ಕಲಿಯಲಿರುವುದು","ui.complete":"◈ ಮಿಷನ್ ಪೂರ್ಣ","m1.title":"ವಿತರಣಾ ರಾಜ್ಯ","m1.sub":"3 ಸುತ್ತು · MST · ಭೂಕಂಪ!","m2.title":"ನೀರಿನ ಉದ್ಯಾನ","m2.sub":"ಪೈಪ್, ಗೇಟ್ ಮತ್ತು ಹರಿವು","m3.title":"ರಾಕೆಟ್ ಉಡಾವಣೆ","m3.sub":"ರಾಕೆಟ್ ವಿಂಗಡಿಸಿ, ಮಿಷನ್ ಉಳಿಸಿ","m4.title":"ರಾಕ್ಷಸರ ದಾಳಿ","m4.sub":"ದಾಳಿಯಿಂದ ಬದುಕಿ","m5.title":"ಸೈಬರ್ ನಿಂಜಾ","m5.sub":"ನಕಲಿ ಕತ್ತರಿಸಿ, ನಿಜವ ರಕ್ಷಿಸಿ","m6.title":"ಟ್ರಾಫಿಕ್ ಹೀರೋ","m6.sub":"ನಗರ ಚಲಿಸುತ್ತಿರಲಿ","m7.title":"ಮೇಜ್ ಪೋಸ್ಟ್ ಆಫೀಸ್","m7.sub":"ಅತಿ ಚಿಕ್ಕ ದಾರಿ ಹುಡುಕಿ","m8.title":"ಬಾಬೆಲ್ ಗೋಪುರ","m8.sub":"ಪದರಗಳನ್ನು ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸಿ","m9.title":"ಸ್ಮಾರಕ ಅರಮನೆ","m9.sub":"ಸರಿಯಾದದ್ದನ್ನು ಕ್ಯಾಷ್ ಮಾಡಿ","m10.title":"ರಿಲೇ ರೇಸ್","m10.sub":"ಸಂದೇಶ ಮರುಜೋಡಿಸಿ","m11.title":"ಹರಾಜು ಮನೆ","m11.sub":"ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್ ಸಮಾನವಾಗಿ ಹಂಚಿ","m12.title":"ಕಾಲ ಪ್ರಯಾಣಿಕ","m12.sub":"ಜಗತ್ತಿನಾದ್ಯಂತ ತಡ ಗೆಲ್ಲಿ","m13.title":"ವಿಂಗಡಣಾ ಸ್ಪರ್ಧೆ","m13.sub":"5 ಅಲ್ಗಾರಿದಮ್ ಸ್ಪರ್ಧೆ ನೋಡಿ","m14.title":"ತರ್ಕ ದ್ವಾರಗಳು","m14.sub":"CPU ತರ ಸರ್ಕ್ಯೂಟ್ ನಿರ್ಮಿಸಿ","m15.title":"ದ್ವಿಮಾನ ಮರ","m15.sub":"ಸೇರಿಸಿ, ಹುಡುಕಿ, BST ಗೆಲ್ಲಿ","m1.concept":"ಗ್ರಾಫ್ ಥಿಯರಿ: ನೋಡ್‌ಗಳು + ಅಂಚುಗಳು = ನೆಟ್‌ವರ್ಕ್. N ನೋಡ್‌ಗಳಿಗೆ N−1 ಅಂಚುಗಳು ಸಾಕು (ಮಿನಿಮಮ್ ಸ್ಪ್ಯಾನಿಂಗ್ ಟ್ರೀ). ಹೆಚ್ಚು ಅಂಚುಗಳು = ರಿಡಂಡೆನ್ಸಿ = ವೈಫಲ್ಯ ತಡೆ.","m1.howto":"3 ಸುತ್ತುಗಳು: ಸ1 ರಸ್ತೆ ನಿರ್ಮಿಸಿ (ಲೇಟೆನ್ಸಿ ms ನೋಡಿ). ಸ2 ಬಜೆಟ್‌ನಲ್ಲಿ MST ಹುಡುಕಿ. ಸ3 ಭೂಕಂಪ ತಡೆದುಕೊಳ್ಳಿ!","m2.concept":"ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್ = ಹೆದ್ದಾರಿಯ ಲೇನ್‌ಗಳು. ಹೆಚ್ಚು ಲೇನ್ = ಒಮ್ಮೆಗೆ ಹೆಚ್ಚು ಪ್ಯಾಕೆಟ್‌ಗಳು ಹರಿಯುತ್ತವೆ.","m2.howto":"ಪೈಪ್ ತಟ್ಟಿ ಲೇನ್ ಸೇರಿಸಿ. 4 ಕೊಳಗಳನ್ನು ತುಂಬಿಸಿ!","m3.concept":"ಆದ್ಯತಾ ಕ್ಯೂ: ತುರ್ತು ಕೆಲಸ ಮೊದಲು. P1 = ಅತ್ಯಂತ ತುರ್ತು, P4 = ಕಡಿಮೆ ತುರ್ತು.","m3.howto":"ಅತ್ಯಂತ ಆದ್ಯತೆಯ ರಾಕೆಟ್ ಕ್ಲಿಕ್ ಮಾಡಿ. 8 ಸೆಕೆಂಡ್ ಕಾದರೆ ತಾನೇ ಉಡಾಯಿಸುತ್ತದೆ.","m4.concept":"ನೆಟ್‌ವರ್ಕ್ ಅಧಿಕ ಬಲ: ಒಂದು ಕೇಬಲ್ ಮುರಿದರೆ, ಡೇಟಾ ಬೇರೆ ದಾರಿ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ.","m4.howto":"5 ಬ್ಯಾಕಪ್ ಲಿಂಕ್‌ಗಳನ್ನು ಸೇರಿಸಲು 30 ಸೆಕೆಂಡ್. ರಾಕ್ಷಸರು ಟವರ್ ನಾಶ ಮಾಡುತ್ತಾರೆ. 6+ ಕಟ್ಟಡ ಆನ್‌ಲೈನ್ ಉಳಿಸಿ!","m5.concept":"ಫೈರ್‌ವಾಲ್ ಕೆಟ್ಟ ಟ್ರಾಫಿಕ್ ತಡೆಯುತ್ತದೆ. ನಿಜವಾದ ಫೈರ್‌ವಾಲ್ ಪ್ರತಿ ಪ್ಯಾಕೆಟ್ ಪರೀಕ್ಷಿಸುತ್ತದೆ.","m5.howto":"ಅಪಾಯಕಾರಿ 🔴 ಪ್ಯಾಕೆಟ್‌ಗಳನ್ನು ಕತ್ತರಿಸಿ (ಸ್ವೈಪ್). ಸುರಕ್ಷಿತ 🟢 ಅನ್ನು ಹಾದು ಹೋಗಲು ಬಿಡಿ.","m6.concept":"ದಟ್ಟಣೆ ನಿಯಂತ್ರಣ: ತುಂಬಾ ಕಾರುಗಳು = ತಡ. ಟ್ರಾಫಿಕ್ ಮರು ನಿರ್ದೇಶಿಸಿ.","m6.howto":"ರಸ್ತೆ ತಟ್ಟಿ ಸಾಮರ್ಥ್ಯ ಹೆಚ್ಚಿಸಿ. ನಗರ ಸಂತೋಷ ಹೆಚ್ಚಾಗಿ ಇರಲಿ!","m7.concept":"ಡಿಜ್ಕ್ಸ್ಟ್ರಾ ಅಲ್ಗಾರಿದಮ್ ಗ್ರಾಫ್‌ನಲ್ಲಿ ಚಿಕ್ಕ ದಾರಿ ಹುಡುಕುತ್ತದೆ. GPS, ರೂಟಿಂಗ್‌ನಲ್ಲಿ ಬಳಕೆ.","m7.howto":"📬 ಇಂದ 🏠 ಗೆ ನೋಡ್‌ಗಳ ಮೂಲಕ ಅತಿ ಚಿಕ್ಕ ದಾರಿ ಹುಡುಕಿ.","m8.concept":"OSI ಮಾದರಿ: WhatsApp ಸಂದೇಶ 7 ಪದರಗಳ ಮೂಲಕ ಹೋಗುತ್ತದೆ. ಅಪ್ಲಿಕೇಶನ್ (7) → ಎನ್‌ಕ್ರಿಪ್ಟ್ (6) → ಸೆಷನ್ (5) → ಪ್ಯಾಕೆಟ್ (4) → IP ರೂಟ್ (3) → WiFi (2) → ರೇಡಿಯೋ ತರಂಗ (1).","m8.howto":"ಸುತ್ತ 1: ಪದರಗಳನ್ನು ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸಿ. ಸುತ್ತ 2: ಚೀಟ್ ಶೀಟ್ ನೋಡಿ ಕ್ವಿಜ್ ಉತ್ತರಿಸಿ. ಸುತ್ತ 3: ವೇಗ!","m9.concept":"ಕ್ಯಾಷ್ ಮೆಮೊರಿ ಹೆಚ್ಚಾಗಿ ಬಳಸುವ ಡೇಟಾ CPU ಹತ್ತಿರ ಇಡುತ್ತದೆ. ಕ್ಯಾಷ್ ಹಿಟ್ = ವೇಗ. ಮಿಸ್ = ನಿಧಾನ.","m9.howto":"ಮೆಮೊರಿ ಬ್ಲಾಕ್‌ಗಳನ್ನು ಕ್ಯಾಷ್ ತುಂಬಿಸಲು ಹೊಂದಿಸಿ.","m10.concept":"TCP ಸಂದೇಶ ಪ್ಯಾಕೆಟ್‌ಗಳಾಗಿ ಮುರಿದು ಕಳಿಸುತ್ತದೆ, ಗಮ್ಯದಲ್ಲಿ ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸುತ್ತದೆ.","m10.howto":"ಪ್ಯಾಕೆಟ್‌ಗಳನ್ನು ಸರಿಯಾದ ಕ್ರಮದಲ್ಲಿ ಎಳೆದು ಸಂದೇಶ ಜೋಡಿಸಿ.","m11.concept":"ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್ ಹಂಚಿಕೆ: ಸಮಾನ ಅಲ್ಗಾರಿದಮ್ ಪ್ರತಿ ಬಳಕೆದಾರರಿಗೆ ಸಮ ಪಾಲು ನೀಡುತ್ತದೆ.","m11.howto":"ಹರಾಜಿನಲ್ಲಿ ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್ ಹಂಚಿ. ನ್ಯಾಯಯುತ ಹಂಚಿಕೆ = ಹೆಚ್ಚು ನಕ್ಷತ್ರ.","m12.concept":"ಲೇಟೆನ್ಸಿ: ಪ್ರತಿ ಕೇಬಲ್ ತಡ ಸೇರಿಸುತ್ತದೆ. ನ್ಯೂಯಾರ್ಕ್-ಟೋಕ್ಯೋ ~55ms. CDN ಹತ್ತಿರದ ಸರ್ವರ್ ತಡ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.","m12.howto":"ಮೂಲ 📡 ಇಂದ ಗಮ್ಯ 🎯 ಗೆ ರಿಲೇ ನಗರಗಳ ಮೂಲಕ ರೂಟ್ ನಿರ್ಮಿಸಿ. ms ಗುರಿ ತಲುಪಿ!","m13.concept":"ಅಲ್ಗಾರಿದಮ್ ಸಂಕೀರ್ಣತೆ: O(n²) — ಬಬಲ್, ಸೆಲೆಕ್ಷನ್, ಇನ್ಸರ್ಷನ್ — ದೊಡ್ಡ ಡೇಟಾದಲ್ಲಿ ನಿಧಾನ. O(n log n) — ಮರ್ಜ್, ಕ್ವಿಕ್ — ಘಾತೀಯ ಹೆಚ್ಚು ವೇಗ.","m13.howto":"ಅರೇ ಪ್ರಕಾರ ಆಯ್ಕೆ ಮಾಡಿ (ಯಾದೃಚ್ಛಿಕ / ಬಹುತೇಕ ವಿಂಗಡಿತ / ತಿರುಗಿದ) ನಂತರ RACE ತಟ್ಟಿ. 3 ಪ್ರಕಾರ ಪ್ರಯತ್ನಿಸಿ — ಗೆಲ್ಲುವ ಅಲ್ಗಾರಿದಮ್ ಬದಲಾಗುತ್ತದೆ!","m14.concept":"ಬೂಲಿಯನ್ ತರ್ಕ: AND, OR, NOT, XOR ದ್ವಾರಗಳು — ಆನ್/ಆಫ್ ಸ್ವಿಚ್‌ಗಳು. ಒಂದು ಅಡ್ಡರ್ ನಿರ್ಮಿಸಲು ಒಂದಷ್ಟು ದ್ವಾರ ಸಾಕು. ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ 1500 ಕೋಟಿ ದ್ವಾರಗಳಿವೆ!","m14.howto":"ಔಟ್‌ಪುಟ್ (ಹಳದಿ ಚುಕ್ಕೆ) ಇಂದ ಇನ್‌ಪುಟ್ (ನೀಲಿ ಚುಕ್ಕೆ) ಗೆ ತಂತಿ ಎಳೆಯಿರಿ. ಸ್ವಿಚ್ ತಟ್ಟಿ ಪರೀಕ್ಷಿಸಿ. 5 ಸರ್ಕ್ಯೂಟ್ ಪೂರ್ಣಗೊಳಿಸಿ!","m15.concept":"ದ್ವಿಮಾನ ಹುಡುಕಾಟ ಮರ: ಸಂಖ್ಯೆ ಸಣ್ಣದಾದರೆ ಎಡ, ದೊಡ್ಡದಾದರೆ ಬಲ. ಪ್ರತಿ ಹೆಜ್ಜೆ ಅರ್ಧ ನೋಡ್‌ಗಳು ಬಿಡುವಾಗುತ್ತವೆ. 10 ಲಕ್ಷ ಐಟಮ್ → ಕೇವಲ 20 ಹೆಜ್ಜೆ!","m15.howto":"ಸುತ್ತ 1: BST ನಿರ್ಮಾಣ ನೋಡಿ. ಸುತ್ತ 2: ಬೈನರಿ ಸರ್ಚ್ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ಎಂದು ನೋಡಿ. ಸುತ್ತ 3: ನೀವೇ ಹುಡುಕಿ — ನೋಡ್ ತಟ್ಟಿ ಗುರಿ ತಲುಪಿ!","m1.banner":"ನೋಡ್ = ಸಾಧನ. ಅಂಚು = ಕೇಬಲ್. N ನೋಡ್‌ಗಳಿಗೆ N−1 ಅಂಚು ಬೇಕು. ಹೆಚ್ಚು ಅಂಚು = ತಪ್ಪು ನಿರ್ವಹಣೆ.","m2.banner":"ಹೆಚ್ಚು ಲೇನ್ = ಒಮ್ಮೆಗೆ ಹೆಚ್ಚು ಪ್ಯಾಕೆಟ್. ದಟ್ಟ ಪೈಪ್ ತಟ್ಟಿ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿ!","m3.banner":"ನೆಟ್‌ವರ್ಕ್ ತುರ್ತು ಟ್ರಾಫಿಕ್‌ಗೆ ಆದ್ಯತೆ ನೀಡುತ್ತದೆ. ಇದನ್ನು QoS ಎನ್ನುತ್ತಾರೆ.","m4.banner":"ನಿಜ ಇಂಟರ್ನೆಟ್ ಕೇಬಲ್ ಮುರಿಯುತ್ತವೆ. ಬ್ಯಾಕಪ್ ದಾರಿಗಳು ಡೇಟಾ ಹರಿಯಲು ಸಹಾಯ ಮಾಡುತ್ತವೆ.","m5.banner":"ಫೈರ್‌ವಾಲ್ ಪ್ರತಿ ಪ್ಯಾಕೆಟ್ ಪರೀಕ್ಷಿಸಿ ಬೆದರಿಕೆ ತಡೆಯುತ್ತದೆ. ಮಿಲಿಸೆಕೆಂಡ್‌ನಲ್ಲಿ ನಿರ್ಧರಿಸುತ್ತದೆ.","m6.banner":"ಒಂದೇ ಲಿಂಕ್‌ನಲ್ಲಿ ಹೆಚ್ಚು ಡೇಟಾ = ನಿಧಾನ. ಹೊರೆ ಹಂಚಿಕೆ = ವೇಗ.","m7.banner":"ರೂಟರ್‌ಗಳು ಗ್ರಾಫ್ ಅಲ್ಗಾರಿದಮ್ ಬಳಸಿ ವೇಗದ ದಾರಿ ಹುಡುಕುತ್ತವೆ. ಕಡಿಮೆ ಹಾಪ್ = ಕಡಿಮೆ ತಡ.","m8.banner":"ಪ್ರತಿ ಸಂದೇಶ 7 ಪದರಗಳ ಮೂಲಕ ಹೋಗುತ್ತದೆ — ಭೌತಿಕ → ಡೇಟಾ ಲಿಂಕ್ → ನೆಟ್‌ವರ್ಕ್ → ಟ್ರಾನ್ಸ್‌ಪೋರ್ಟ್ → ಸೆಷನ್ → ಪ್ರೆಸೆಂಟೇಶನ್ → ಅಪ್ಲಿಕೇಶನ್.","m9.banner":"ಕ್ಯಾಷ್ CPU ಹತ್ತಿರ ಹೆಚ್ಚು ಬಳಸುವ ಡೇಟಾ ಇಡುತ್ತದೆ. ತುಂಬಿದಾಗ ಕಡಿಮೆ ಬಳಕೆಯ ಡೇಟಾ ತೆಗೆಯುತ್ತದೆ.","m10.banner":"ದೊಡ್ಡ ಸಂದೇಶ ಪ್ಯಾಕೆಟ್‌ಗಳಾಗಿ ವಿಭಜಿಸಿ ಬೇರೆ ದಾರಿಯಲ್ಲಿ ಹೋಗಿ ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸುತ್ತವೆ — TCP/IP.","m11.banner":"ನೆಟ್‌ವರ್ಕ್ ಸೀಮಿತ ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್ ಅನ್ನು ಅನೇಕ ಬಳಕೆದಾರರಿಗೆ ಹಂಚುತ್ತದೆ. ನ್ಯಾಯಯುತ ಹಂಚಿಕೆ ಮುಖ್ಯ.","m12.banner":"ಲೇಟೆನ್ಸಿ = ಡೇಟಾ ಪ್ರಯಾಣ ಮಾಡಲು ತೆಗೆದ ಸಮಯ. CDN ಹತ್ತಿರದ ಸರ್ವರ್ ತಡ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.","m13.banner":"O(n²): ಬಬಲ್, ಸೆಲೆಕ್ಷನ್ — ದೊಡ್ಡ ಡೇಟಾದಲ್ಲಿ ನಿಧಾನ. O(n log n): ಮರ್ಜ್, ಕ್ವಿಕ್ — ಘಾತೀಯ ವೇಗ. ಪ್ರತಿ ಅಪ್ಲಿಕೇಶನ್ O(n log n) ವಿಂಗಡಣೆ ಬಳಸುತ್ತದೆ.","m14.banner":"AND · OR · NOT · XOR ದ್ವಾರಗಳು ಸೇರಿ ಅಡ್ಡರ್, ಮೆಮೊರಿ, CPU ನಿರ್ಮಿಸುತ್ತವೆ. ಎಲ್ಲ ಗಣನೆ ಆನ್/ಆಫ್ ಸ್ವಿಚ್‌ಗಳಷ್ಟೆ.","m15.banner":"BST ಹುಡುಕಾಟ ಪ್ರತಿ ಹೆಜ್ಜೆ ಸಂಭಾವ್ಯ ಸಂಖ್ಯೆ ಅರ್ಧ ಮಾಡುತ್ತದೆ. 10 ಲಕ್ಷ ಐಟಮ್ → ಕೇವಲ 20 ಹೆಜ್ಜೆ. ಡೇಟಾಬೇಸ್, ಫೈಲ್ ಸಿಸ್ಟಮ್‌ನಲ್ಲಿ ಬಳಕೆ.","result.delivered":"ತಲುಪಿಸಿದ","result.dropped":"ಬಿದ್ದ","result.pools":"ತುಂಬಿದ ಕೊಳಗಳು","result.bandwidth":"💡 ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್ = ಹೆದ್ದಾರಿಯ ಲೇನ್‌ಗಳು.","result.morelanes":"ಹೆಚ್ಚು ಲೇನ್ = ಒಮ್ಮೆಗೆ ಹೆಚ್ಚು ಪ್ಯಾಕೆಟ್ = ಡ್ರಾಪ್ ಇಲ್ಲ.","result.isps":"📡 ನಿಜ ISP ಗಳು ನಿಖರವಾಗಿ ಈ ರೀತಿ ಲಿಂಕ್ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡುತ್ತವೆ!"}},O="ic2_lang",z=["en","kn"];function _(){const t=localStorage.getItem(O);return z.includes(t)?t:"en"}function V(t){z.includes(t)&&localStorage.setItem(O,t)}function i(t,o={}){const e=_(),n=(S[e]&&S[e][t])??S.en[t]??t;return Object.keys(o).reduce((s,a)=>s.replace(`{${a}}`,o[a]),n)}const I="ic2_tts";function T(){return localStorage.getItem(I)!=="off"}function W(t){localStorage.setItem(I,t?"on":"off")}function Y(t,o="en"){if(!("speechSynthesis"in window)||!T())return;window.speechSynthesis.cancel();const e=new SpeechSynthesisUtterance(t),n=window.speechSynthesis.getVoices(),s=o==="kn"?"kn":"en",a=n.find(r=>r.lang.startsWith(s));a&&(e.voice=a),e.lang=o==="kn"?"kn-IN":"en-US",e.rate=.92,e.pitch=1.05,window.speechSynthesis.speak(e)}function R(){"speechSynthesis"in window&&window.speechSynthesis.cancel()}function X(t,o="#46f0c0"){const e=document.createElement("button"),n=()=>{e.textContent=T()?"🔊":"🔇",e.title=T()?"Mute voice":"Unmute voice"};return e.style.cssText=`
    position:absolute;top:56px;right:16px;z-index:70;
    background:rgba(0,0,0,0.5);border:1px solid ${o}55;
    border-radius:50%;width:36px;height:36px;
    font-size:16px;cursor:pointer;display:flex;align-items:center;
    justify-content:center;touch-action:manipulation;
    -webkit-tap-highlight-color:transparent;
  `,n(),e.addEventListener("click",()=>{W(!T()),R(),n()}),t.appendChild(e),e}function Q(t,{bgColor:o="#0a0a1a"}={}){const e=document.createElement("div");e.style.cssText=`
    position:fixed;inset:0;background:${o};
    display:flex;flex-direction:column;overflow:hidden;z-index:10;
    font-family:'Space Mono','Noto Sans Kannada',monospace,sans-serif;
  `,t.appendChild(e);const n=document.createElement("canvas");n.style.cssText="position:absolute;inset:0;width:100%;height:100%;touch-action:none;-webkit-user-select:none;user-select:none;",e.appendChild(n);const s=()=>{const l=window.devicePixelRatio||1;n.width=e.clientWidth*l,n.height=e.clientHeight*l,n.style.width=e.clientWidth+"px",n.style.height=e.clientHeight+"px",n.getContext("2d").setTransform(l,0,0,l,0,0)};s(),window.addEventListener("resize",s);const a=()=>n.getContext("2d"),r=()=>e.clientWidth,c=()=>e.clientHeight,d=l=>{const h=n.getBoundingClientRect(),b=l.changedTouches&&l.changedTouches.length?l.changedTouches[0]:l.touches&&l.touches.length?l.touches[0]:l,y=h.width?e.clientWidth/h.width:1,m=h.height?e.clientHeight/h.height:1;return{x:(b.clientX-h.left)*y,y:(b.clientY-h.top)*m}},p=X(e);return{root:e,canvas:n,ctx:a,W:r,H:c,destroy:()=>{window.removeEventListener("resize",s),R(),e.remove()},canvasXY:d,ttsBtn:p}}function K(t,{title:o,color:e="#46f0c0",width:n="min(440px,92vw)"}={}){const s=document.createElement("div");s.style.cssText=`
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);z-index:100;
  `;const a=document.createElement("div");if(a.style.cssText=`
    background:#0d1f2d;border:1px solid ${e}55;border-radius:20px;
    padding:28px 24px;width:${n};max-height:min(520px,88vh);
    display:flex;flex-direction:column;
    box-shadow:0 8px 48px rgba(0,0,0,0.7),0 0 0 1px ${e}22;
  `,o){const c=document.createElement("div");c.style.cssText=`font-size:11px;color:${e};letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;font-weight:700;flex-shrink:0;`,c.textContent=o,a.appendChild(c)}const r=document.createElement("div");return r.style.cssText="overflow-y:auto;flex:1;",a.appendChild(r),s.appendChild(a),t.appendChild(s),{el:a,body:r,remove:()=>s.remove()}}function J(t,{color:o="#46f0c0"}={}){const e=document.createElement("div");e.style.cssText=`
    position:absolute;top:0;left:0;right:0;height:48px;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 16px;z-index:60;
    background:linear-gradient(to bottom,rgba(0,0,0,0.6),transparent);
    pointer-events:none;
  `;const n=document.createElement("div"),s=document.createElement("div"),a=document.createElement("div");return[n,s,a].forEach(r=>{r.style.cssText=`color:${o};font-size:13px;font-weight:700;pointer-events:auto;`,e.appendChild(r)}),t.appendChild(e),{el:e,setLeft:r=>{n.innerHTML=r},setCenter:r=>{s.innerHTML=r},setRight:r=>{a.innerHTML=r},leftEl:n,rightEl:a}}function Z(t,o,e,n){const s=document.createElement("div");s.style.cssText=`
    position:absolute;left:${o}px;top:${e}px;
    font-size:18px;font-weight:700;color:#ffd700;
    pointer-events:none;z-index:200;
    animation:coinPop 0.9s ease-out forwards;
    text-shadow:0 2px 8px rgba(255,215,0,0.6);
  `,s.textContent=`+${n}🪙`,t.appendChild(s),setTimeout(()=>s.remove(),900)}(function(){if(document.getElementById("ic2-anims"))return;const o=document.createElement("style");o.id="ic2-anims",o.textContent=`
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
  `,document.head.appendChild(o)})();function ee(t,{concept:o,detail:e,color:n="#46f0c0"}){const s=document.createElement("div");return s.style.cssText=`
    position:absolute;bottom:0;left:0;right:0;z-index:55;
    background:linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.7) 70%,transparent 100%);
    padding:10px 16px 14px;pointer-events:none;
    max-height:80px;overflow:hidden;
  `,s.innerHTML=`
    <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${n};font-weight:700;margin-bottom:2px;">${i("ui.learning")}</div>
    <div style="font-size:13px;font-weight:700;color:#fff;">${o}</div>
    <div style="font-size:11px;color:#8aa6b4;margin-top:1px;line-height:1.4;">${e}</div>
  `,t.appendChild(s),s}function te(t,{emoji:o,title:e,concept:n,howto:s,color:a="#46f0c0",onStart:r}){const c=document.createElement("div");c.style.cssText=`
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.82);backdrop-filter:blur(8px);z-index:200;padding:20px;
  `;const d=document.createElement("div");d.style.cssText=`
    background:#0d1f2d;border:1px solid ${a}44;border-radius:24px;
    width:min(400px,100%);
    max-height:min(520px,88vh);
    display:flex;flex-direction:column;
    overflow:hidden;
  `;const p=document.createElement("div");p.style.cssText=`
    padding:clamp(16px,4vw,24px) clamp(14px,4vw,24px) 12px;
    text-align:center;flex-shrink:0;
  `,p.innerHTML=`
    <div style="font-size:48px;margin-bottom:8px;line-height:1;">${o}</div>
    <div style="font-size:9px;color:${a};letter-spacing:3px;text-transform:uppercase;font-weight:700;margin-bottom:4px;">${i("ui.mission")}</div>
    <div style="font-size:clamp(18px,5vw,22px);font-weight:700;color:#fff;">${e}</div>
  `,d.appendChild(p);const g=document.createElement("div");g.style.cssText=`
    flex:1;overflow-y:auto;padding:0 clamp(14px,4vw,24px) 12px;
    -webkit-overflow-scrolling:touch;
  `;const l=document.createElement("div");l.style.cssText=`
    background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
    border-radius:12px;padding:10px 14px;margin-bottom:10px;text-align:left;
  `,l.innerHTML=`
    <div style="font-size:10px;color:#fff;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:5px;">🎮 How to play</div>
    <div style="font-size:12px;color:#c8e6f0;line-height:1.55;">${s}</div>
  `,g.appendChild(l);const h=document.createElement("div");h.style.cssText=`
    background:${a}14;border:1px solid ${a}30;border-radius:12px;
    padding:10px 14px;text-align:left;
  `,h.innerHTML=`
    <div style="font-size:10px;color:${a};letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:5px;">${i("ui.whatlearn")}</div>
    <div style="font-size:11px;color:#e0f4ec;line-height:1.55;max-height:80px;overflow-y:auto;-webkit-overflow-scrolling:touch;">${n}</div>
  `,g.appendChild(h),d.appendChild(g);const b=document.createElement("div");b.style.cssText=`
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
  `,y.textContent=i("btn.play"),y.addEventListener("click",()=>{R(),c.remove(),r()});const m=n.replace(/<[^>]+>/g,"").replace(/[🎮💡📡🏠📬⚡🔊🔇]/gu,"");Y(m,_()),b.appendChild(y),d.appendChild(b),c.appendChild(d),t.appendChild(c)}function oe(t,{stars:o,maxStars:e=3,title:n,lines:s=[],coins:a=0,color:r="#ffd700",onContinue:c}){const d=K(t,{title:i("ui.complete"),color:r});d.body.innerHTML=`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:40px;margin-bottom:8px;">${"⭐".repeat(o)}${"☆".repeat(e-o)}</div>
      <div style="font-size:22px;font-weight:700;color:#fff;margin-bottom:6px;">${n}</div>
      ${s.map(g=>`<div style="font-size:13px;color:#8aa6b4;margin-top:4px;">${g}</div>`).join("")}
      ${a?`<div style="font-size:18px;color:#ffd700;margin-top:12px;font-weight:700;">+${a} 🪙</div>`:""}
    </div>
  `;const p=document.createElement("button");p.style.cssText=`
    width:100%;padding:14px;border-radius:12px;border:none;
    background:${r};color:#000;font-size:15px;font-weight:700;
    cursor:pointer;margin-top:8px;font-family:inherit;
    min-height:48px;touch-action:manipulation;
    -webkit-tap-highlight-color:transparent;
  `,p.textContent=o>=2?i("btn.continue"):i("btn.retry"),p.addEventListener("click",()=>{d.remove(),c(o<2?"retry":"continue",o)}),d.body.appendChild(p)}function F(){return[{id:1,title:i("m1.title"),emoji:"🎁",color:"#ffd700",sub:i("m1.sub"),bg:"#1a1500"},{id:2,title:i("m2.title"),emoji:"💧",color:"#00b4ff",sub:i("m2.sub"),bg:"#00111a"},{id:3,title:i("m3.title"),emoji:"🚀",color:"#ff6b35",sub:i("m3.sub"),bg:"#1a0d00"},{id:4,title:i("m4.title"),emoji:"👾",color:"#c9b6ff",sub:i("m4.sub"),bg:"#0d0020"},{id:5,title:i("m5.title"),emoji:"🥷",color:"#46f0c0",sub:i("m5.sub"),bg:"#001a0d"},{id:6,title:i("m6.title"),emoji:"🚗",color:"#ff3860",sub:i("m6.sub"),bg:"#1a0005"},{id:7,title:i("m7.title"),emoji:"🗺️",color:"#ffec3d",sub:i("m7.sub"),bg:"#1a1a00"},{id:8,title:i("m8.title"),emoji:"🏗️",color:"#ff9f43",sub:i("m8.sub"),bg:"#1a0e00"},{id:9,title:i("m9.title"),emoji:"🧠",color:"#fd79a8",sub:i("m9.sub"),bg:"#1a0010"},{id:10,title:i("m10.title"),emoji:"🏃",color:"#00cec9",sub:i("m10.sub"),bg:"#001a1a"},{id:11,title:i("m11.title"),emoji:"💰",color:"#e17055",sub:i("m11.sub"),bg:"#1a0800"},{id:12,title:i("m12.title"),emoji:"⏱️",color:"#a29bfe",sub:i("m12.sub"),bg:"#08001a"},{id:13,title:i("m13.title"),emoji:"🏎️",color:"#74c0fc",sub:i("m13.sub"),bg:"#000d1a"},{id:14,title:i("m14.title"),emoji:"⚡",color:"#ffd43b",sub:i("m14.sub"),bg:"#1a1800"},{id:15,title:i("m15.title"),emoji:"🌳",color:"#69db7c",sub:i("m15.sub"),bg:"#001a00"}]}function N(t,o,e){document.body.classList.add("home-screen");const n=document.createElement("div");n.style.cssText=`
    min-height:100%;background:#0a0a1a;
    display:flex;flex-direction:column;align-items:center;
    padding:0 0 60px;
    font-family:'Space Mono','Noto Sans Kannada',monospace,sans-serif;
  `;const s=window.location.origin+"/v1/",a=document.createElement("div");a.style.cssText=`
    width:100%;max-width:720px;padding:14px 14px 0;
    display:flex;flex-direction:column;gap:8px;
  `;const r=document.createElement("div");r.style.cssText="display:flex;justify-content:flex-end;";function c(){const m=_(),w=document.createElement("div");w.style.cssText=`
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
    `;const x=document.createElement("button");x.textContent="ಕನ್ನಡ",x.style.cssText=`
      padding:6px 14px;border:none;font-size:12px;font-weight:700;
      cursor:pointer;font-family:'Noto Sans Kannada','Space Mono',monospace,sans-serif;
      min-height:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
      background:${m==="kn"?"rgba(70,240,192,0.22)":"transparent"};
      color:${m==="kn"?"#46f0c0":"#8aa6b4"};
      transition:background 0.2s,color 0.2s;
    `;const u=A=>{V(A),n.remove(),N(t,o,e)};return v.addEventListener("click",()=>u("en")),x.addEventListener("click",()=>u("kn")),w.appendChild(v),w.appendChild(x),w}r.appendChild(c()),a.appendChild(r);const d=document.createElement("div");d.style.cssText="display:flex;justify-content:flex-end;",d.innerHTML=`
    <div style="
      display:inline-flex;border-radius:20px;overflow:hidden;
      border:1px solid rgba(255,255,255,0.12);font-size:11px;font-weight:700;
    ">
      <span style="
        padding:6px 14px;
        background:rgba(70,240,192,0.18);
        color:#46f0c0;
        border-right:1px solid rgba(255,255,255,0.1);
      ">${i("home.beginner")}</span>
      <a href="${s}" style="
        padding:6px 14px;text-decoration:none;
        color:#8aa6b4;
        transition:background 0.2s,color 0.2s;
      " onmouseover="this.style.color='#46f0c0'" onmouseout="this.style.color='#8aa6b4'">${i("home.advanced")}</a>
    </div>
  `,a.appendChild(d),n.appendChild(a);const p=document.createElement("div");p.style.cssText="width:100%;max-width:720px;padding:16px 14px 0;";const g=(o.completedModules||[]).length,l=i("home.progress",{n:g});p.innerHTML=`
    <!-- Header -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px;flex-wrap:wrap;">
      <div>
        <div style="font-size:10px;color:#8aa6b4;letter-spacing:3px;text-transform:uppercase;">Internet City</div>
        <div style="font-size:clamp(20px,6vw,28px);font-weight:700;color:#fff;line-height:1.1;">${i("home.tagline")}</div>
      </div>
      <div class="coin-display" style="flex-shrink:0;">🪙 ${o.coins}</div>
    </div>
    <div style="font-size:12px;color:#8aa6b4;margin-top:4px;margin-bottom:20px;">
      ${l}${g>=15?" 🏆":""}
    </div>
    <div id="module-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(190px,100%),1fr));gap:12px;"></div>
  `,n.appendChild(p),t.appendChild(n);const h=p.querySelector("#module-grid"),b=o.completedModules||[];F().forEach((m,w)=>{const v=o.moduleStars?.[m.id]||0,x=m.id===1||b.includes(m.id-1)||b.includes(m.id),u=document.createElement("div");u.className="module-card-v2"+(x?"":" locked"),u.style.cssText=`
      border-radius:20px;padding:20px;cursor:${x?"pointer":"not-allowed"};
      background:${m.bg};border:1px solid ${x?m.color+"44":"rgba(255,255,255,0.06)"};
      transition:transform 0.2s,border-color 0.2s,box-shadow 0.2s;
      animation:fadeInUp 0.4s ease ${w*.07}s both;
      touch-action:manipulation;
    `,u.innerHTML=`
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="font-size:32px;line-height:1;flex-shrink:0;">${m.emoji}</div>
        <div style="min-width:0;">
          <div style="font-size:10px;color:${m.color};letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;font-weight:700;">${i("home.module")} ${m.id}</div>
          <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:2px;line-height:1.2;">${m.title}</div>
          <div style="font-size:11px;color:#8aa6b4;margin-bottom:6px;">${m.sub}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div class="star-strip" style="font-size:14px;">${"⭐".repeat(v)}${"☆".repeat(3-v)}</div>
            ${x?"":`<div style="font-size:11px;color:#555;">${i("home.locked")}</div>`}
          </div>
        </div>
      </div>
    `,x&&(u.addEventListener("mouseenter",()=>{u.style.transform="translateY(-4px)",u.style.boxShadow=`0 8px 32px ${m.color}33`,u.style.borderColor=m.color+"88"}),u.addEventListener("mouseleave",()=>{u.style.transform="",u.style.boxShadow="",u.style.borderColor=m.color+"44"}),u.addEventListener("click",()=>e(m.id))),h.appendChild(u)})}const C=document.getElementById("app");let k=B();function E(t,...o){if(C.innerHTML="",t==="home")N(C,k,e=>E("module",e));else if(t==="module"){const e=o[0];q(e)}}async function q(t){document.body.classList.remove("home-screen");const e={1:()=>f(()=>import("./index-btKR7Kvo.js"),__vite__mapDeps([0,1,2])),2:()=>f(()=>import("./index-BtAkZLZh.js"),__vite__mapDeps([3,1,2])),3:()=>f(()=>import("./index--6WPR_qy.js"),__vite__mapDeps([4,1,2])),4:()=>f(()=>import("./index-Bb_Qo-FL.js"),__vite__mapDeps([5,1,2])),5:()=>f(()=>import("./index-CNQeJYVX.js"),__vite__mapDeps([6,1,2])),6:()=>f(()=>import("./index-DpYMJjMY.js"),__vite__mapDeps([7,1,2])),7:()=>f(()=>import("./index-DMQqeJ-d.js"),__vite__mapDeps([8,1,2])),8:()=>f(()=>import("./index-DkM5QcWc.js"),__vite__mapDeps([9,1,2])),9:()=>f(()=>import("./index-cpOv7Fcm.js"),__vite__mapDeps([10,1,2])),10:()=>f(()=>import("./index-DgVl0hhc.js"),__vite__mapDeps([11,1,2])),11:()=>f(()=>import("./index-DgD3ygDP.js"),__vite__mapDeps([12,1,2])),12:()=>f(()=>import("./index-DMgil8Xv.js"),__vite__mapDeps([13,1,2])),13:()=>f(()=>import("./index-ebPubBhs.js"),__vite__mapDeps([14,1,2])),14:()=>f(()=>import("./index-CtnReseJ.js"),__vite__mapDeps([15,1,2])),15:()=>f(()=>import("./index-DzTpL5EE.js"),__vite__mapDeps([16,1,2]))}[t];if(!e)return E("home");(await e()).launch(C,k,(s,a)=>{k=H(k,t,s),k=U(k,a),E("home")})}E("home");export{J as a,te as b,Z as c,oe as d,K as e,Q as m,ee as s,i as t};

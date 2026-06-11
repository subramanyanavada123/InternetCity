import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';
import { t } from '../../shared/i18n.js';

const ITEMS = ['🍎','🥐','🧃','🍕','🧁','🥤','🍜','🥗','🍦','🧀','🥨','🍩'];
const COLORS = ['#e74c3c','#f39c12','#27ae60','#e67e22','#8e44ad','#2980b9','#d35400','#16a085','#1abc9c','#f1c40f','#c0392b','#9b59b6'];
const CACHE_SIZE=4, GAME_TIME=90, SERVE_WINDOW=8, NEW_CUST_INT=6, FETCH_MS=2000, MAX_Q=3;

function float(root,x,y,text,col='#ffd700'){
  const el=document.createElement('div');
  el.style.cssText=`position:absolute;left:${x}px;top:${y}px;font-size:15px;font-weight:700;color:${col};pointer-events:none;z-index:300;white-space:nowrap;animation:coinPop 1.1s ease-out forwards;transform:translateX(-50%);`;
  el.textContent=text; root.appendChild(el); setTimeout(()=>el.remove(),1100);
}

export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor: '#1a0f00' });
  const { root, canvas, ctx, W, H, destroy, canvasXY } = shell;
  const hud = makeHUD(root, { color: '#ffd700' });

  const backBtn = document.createElement('button');
  backBtn.style.cssText=`position:absolute;top:8px;left:16px;z-index:70;background:rgba(0,0,0,0.55);border:1px solid #ffd70055;border-radius:10px;color:#ffd700;font-size:13px;font-weight:700;cursor:pointer;padding:6px 12px;font-family:inherit;`;
  backBtn.textContent = t('btn.back');
  backBtn.addEventListener('click',()=>{ cleanup(); onComplete(0,0); });
  root.appendChild(backBtn);

  // ── State ──────────────────────────────────────────────────────────────────
  let cache=[],queue=[],score=0,happiness=100,timeLeft=GAME_TIME,served=0,custServed=0;
  let fetchingIdx=-1,fetchProgress=0,fetchTimer=null,hintItem=null;
  let gameOver=false,raf=null,lastTs=null,custTimer=0;

  queue.push(makeCustomer()); queue.push(makeCustomer());

  // ── Layout ─────────────────────────────────────────────────────────────────
  function lo() {
    const w=W(),h=H(),rw=130,mw=w-rw-12,topH=110,midY=topH+10,midH=90,botY=midY+midH+10,botH=h-botY-10;
    const sw=Math.min(90,(mw-20)/CACHE_SIZE);
    const cacheSlots=Array.from({length:CACHE_SIZE},(_,i)=>({x:10+sw*i+sw/2,y:midY+midH/2,w:sw-8,h:midH-16}));
    const cols=4,cw=Math.min(75,(mw-20)/cols),ch=Math.min(75,(botH-30)/3);
    const storeSlots=Array.from({length:12},(_,i)=>({x:10+(i%cols)*cw+cw/2,y:botY+28+Math.floor(i/cols)*ch+ch/2,w:cw-8,h:ch-8}));
    const custSlots=Array.from({length:MAX_Q},(_,i)=>({x:10+(mw/MAX_Q)*i+mw/MAX_Q/2,y:topH/2}));
    return {mw,rw,topH,midY,midH,botY,botH,cacheSlots,storeSlots,custSlots};
  }

  function makeCustomer(){ return {want:Math.floor(Math.random()*ITEMS.length),timer:0,state:'waiting',exitAnim:0}; }

  // ── Cache (LRU) ────────────────────────────────────────────────────────────
  function cacheHas(i){ return cache.includes(i); }
  function cacheTouch(i){ cache=cache.filter(x=>x!==i); cache.push(i); }
  function cacheAdd(i){
    if(cacheHas(i)){cacheTouch(i);return;}
    if(cache.length>=CACHE_SIZE){
      const ev=cache.shift(); const l=lo();
      float(root,l.mw/2,l.midY-20,`EVICTED: ${ITEMS[ev]}`,'#ff8c00');
    }
    cache.push(i);
  }

  function serveCustomer(qi,fromCache){
    const c=queue[qi]; if(!c||c.state!=='waiting') return;
    c.state=fromCache?'served-happy':'served-grumpy'; c.exitAnim=0;
    const l=lo(),sx=l.custSlots[qi]?.x??200,sy=l.custSlots[qi]?.y??60;
    if(fromCache){ score+=30; sfx.coin(); float(root,sx,sy-40,'+30 ⚡','#ffd700'); }
    else { score+=10; happiness=Math.max(0,happiness-5); sfx.pop(); float(root,sx,sy-40,'+10','#aaa'); }
    served++; custServed++;
    if(custServed%3===0) hintItem=Math.floor(Math.random()*ITEMS.length);
    cacheTouch(c.want);
    setTimeout(()=>{ const idx=queue.indexOf(c); if(idx>=0) queue.splice(idx,1); },1000);
  }

  function custAngry(qi){
    const c=queue[qi]; if(!c||c.state!=='waiting') return;
    c.state='angry'; c.exitAnim=0;
    score=Math.max(0,score-20); happiness=Math.max(0,happiness-15); sfx.fail();
    const l=lo(); float(root,l.custSlots[qi]?.x??200,(l.custSlots[qi]?.y??60)-40,'-20 😤','#ff4444');
    setTimeout(()=>{ const idx=queue.indexOf(c); if(idx>=0) queue.splice(idx,1); },900);
  }

  function startFetch(itemIdx){
    if(fetchTimer!==null) return;
    fetchingIdx=itemIdx; fetchProgress=0;
    fetchTimer=setTimeout(()=>{
      cacheAdd(itemIdx); fetchingIdx=-1; fetchProgress=0; fetchTimer=null; sfx.pop();
      for(let i=0;i<queue.length;i++){
        if(queue[i].want===itemIdx&&queue[i].state==='waiting'){ serveCustomer(i,false); break; }
      }
    },FETCH_MS);
  }

  // ── Input ──────────────────────────────────────────────────────────────────
  function getPos(e){ return canvasXY(e); }
  function onClick(e){
    if(gameOver) return;
    const {x,y}=getPos(e); const l=lo();
    for(let ci=0;ci<CACHE_SIZE;ci++){
      const s=l.cacheSlots[ci],ii=cache[ci];
      if(ii===undefined) continue;
      if(Math.abs(x-s.x)<s.w/2&&Math.abs(y-s.y)<s.h/2){
        for(let qi=0;qi<queue.length;qi++){
          if(queue[qi].want===ii&&queue[qi].state==='waiting'){serveCustomer(qi,true);return;}
        }
      }
    }
    for(let i=0;i<12;i++){
      const s=l.storeSlots[i];
      if(Math.abs(x-s.x)<s.w/2&&Math.abs(y-s.y)<s.h/2){
        if(fetchTimer!==null) return;
        if(cacheHas(i)){ cacheTouch(i); for(let qi=0;qi<queue.length;qi++){ if(queue[qi].want===i&&queue[qi].state==='waiting'){serveCustomer(qi,true);return;} } }
        else { startFetch(i); sfx.click(); }
        return;
      }
    }
  }
  canvas.addEventListener('click',onClick);
  canvas.addEventListener('touchend',(e)=>{e.preventDefault();onClick(e);},{passive:false});

  // ── Draw ───────────────────────────────────────────────────────────────────
  function drawItem(c,x,y,r,emoji,col,alpha=1,desat=false){
    c.save(); c.globalAlpha=alpha;
    c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fillStyle=desat?'#334':col; c.fill();
    c.font=`${Math.round(r*1.05)}px serif`; c.textAlign='center'; c.textBaseline='middle';
    if(desat) c.filter='saturate(0.4)'; c.fillText(emoji,x,y+1); c.filter='none';
    c.restore();
  }

  function drawSection(c,x,y,w,h,label,border){
    c.save(); c.shadowColor=border; c.shadowBlur=12; c.strokeStyle=border; c.lineWidth=2;
    c.fillStyle='rgba(0,0,0,0.35)'; c.beginPath(); c.roundRect(x,y,w,h,10); c.fill(); c.stroke(); c.restore();
    c.save(); c.font='bold 11px "Space Mono",monospace'; c.fillStyle=border; c.textAlign='left'; c.textBaseline='top';
    c.fillText(label,x+8,y+5); c.restore();
  }

  function drawAll(ts){
    const c=ctx(),w=W(),h=H(),l=lo();
    c.clearRect(0,0,w,h);
    // Background
    c.fillStyle='#1a0f00'; c.fillRect(0,0,w,h);
    c.strokeStyle='rgba(180,100,20,0.06)'; c.lineWidth=1;
    for(let yy=0;yy<h;yy+=18){c.beginPath();c.moveTo(0,yy);c.lineTo(w,yy);c.stroke();}

    // Customers
    for(let qi=0;qi<queue.length;qi++){
      const cust=queue[qi],slot=l.custSlots[qi]; if(!slot) continue;
      let ox=0,oy=0,alpha=1;
      if(cust.state==='served-happy'){ oy=-cust.exitAnim*60; alpha=1-cust.exitAnim; cust.exitAnim=Math.min(1,cust.exitAnim+0.04); }
      else if(cust.state!=='waiting'){ ox=-cust.exitAnim*80; alpha=1-cust.exitAnim; cust.exitAnim=Math.min(1,cust.exitAnim+0.045); }
      const cx=slot.x+ox,cy=slot.y+oy;
      c.save(); c.globalAlpha=alpha;
      if(cust.state==='waiting'){
        const f=Math.min(1,cust.timer/SERVE_WINDOW);
        c.beginPath(); c.arc(cx,cy-5,24,-Math.PI/2,-Math.PI/2+f*Math.PI*2);
        c.strokeStyle=f>0.7?'#ff4444':f>0.4?'#ffaa00':'#44ff88'; c.lineWidth=3; c.stroke();
      }
      const face=cust.state==='angry'?'😠':cust.state==='served-grumpy'?'😤':cust.state==='served-happy'?'😊':'🧑';
      const shk=(cust.state==='waiting'&&cust.timer/SERVE_WINDOW>0.7)?Math.sin(ts*0.025)*3:0;
      c.font='26px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(face,cx+shk,cy-5);
      c.fillStyle='rgba(255,255,255,0.9)'; c.beginPath(); c.roundRect(cx+12,cy-36,36,26,8); c.fill();
      c.font='18px serif'; c.fillText(ITEMS[cust.want],cx+30,cy-23);
      c.restore();
    }

    // Cache shelf
    drawSection(c,4,l.midY,l.mw-4,l.midH,'⚡ Cache (instant)','#ffd700');
    for(let ci=0;ci<CACHE_SIZE;ci++){
      const s=l.cacheSlots[ci],ii=cache[ci];
      c.fillStyle='rgba(255,215,0,0.07)'; c.beginPath(); c.roundRect(s.x-s.w/2,s.y-s.h/2,s.w,s.h,8); c.fill();
      if(ci===0&&cache.length>=CACHE_SIZE){
        c.strokeStyle=`rgba(255,140,0,${0.4+0.3*Math.sin(ts*0.006)})`; c.lineWidth=2; c.setLineDash([4,4]);
        c.beginPath(); c.roundRect(s.x-s.w/2,s.y-s.h/2,s.w,s.h,8); c.stroke(); c.setLineDash([]);
      }
      if(ii!==undefined){
        const bounce=ci===cache.length-1?Math.abs(Math.sin(ts*0.006))*3:0;
        drawItem(c,s.x,s.y-bounce,s.h/2-4,ITEMS[ii],COLORS[ii]);
      }
    }

    // Storeroom
    drawSection(c,4,l.botY,l.mw-4,l.botH,'📦 Storeroom (2s delay)','#556677');
    for(let i=0;i<12;i++){
      const s=l.storeSlots[i],inC=cacheHas(i),fet=fetchingIdx===i;
      c.fillStyle=inC?'rgba(255,215,0,0.08)':'rgba(60,80,100,0.18)';
      c.beginPath(); c.roundRect(s.x-s.w/2,s.y-s.h/2,s.w,s.h,8); c.fill();
      if(inC){ c.strokeStyle='#ffd70066'; c.lineWidth=1.5; c.stroke(); }
      drawItem(c,s.x,s.y,s.h/2-5,ITEMS[i],COLORS[i],1,!inC);
      if(fet){
        c.save(); c.translate(s.x,s.y); c.rotate(ts*0.005); c.font='18px serif'; c.textAlign='center'; c.textBaseline='middle'; c.globalAlpha=0.85; c.fillText('⏳',0,0); c.restore();
        c.beginPath(); c.arc(s.x,s.y,s.h/2-2,-Math.PI/2,-Math.PI/2+fetchProgress*Math.PI*2); c.strokeStyle='#ffd700'; c.lineWidth=3; c.stroke();
      }
    }

    // Right panel
    const rx=w-l.rw+4,ph=h-60;
    c.fillStyle='rgba(0,0,0,0.45)'; c.strokeStyle='#ffd70033'; c.lineWidth=1;
    c.beginPath(); c.roundRect(rx,50,l.rw-8,ph,10); c.fill(); c.stroke();
    c.textAlign='center'; c.textBaseline='top';
    let py=62; const pw=(l.rw-8)/2;
    c.font='bold 12px "Space Mono",monospace';
    c.fillStyle='#ffd700'; c.fillText(`🏆 ${score}`,rx+pw,py); py+=24;
    c.fillStyle=timeLeft<20?'#ff4444':'#fff'; c.fillText(`⏱ ${Math.ceil(timeLeft)}s`,rx+pw,py); py+=24;
    c.fillStyle=happiness>60?'#2ed573':happiness>30?'#ffaa00':'#ff4444'; c.fillText(`😊 ${happiness}%`,rx+pw,py); py+=24;
    c.font='11px "Space Mono",monospace'; c.fillStyle='#aaa'; c.fillText(`Served: ${served}`,rx+pw,py); py+=20;
    c.fillStyle='#ffd70088'; c.fillText('Cache:',rx+pw,py); py+=18;
    for(let i=0;i<cache.length;i++){ c.font='13px serif'; c.fillStyle='#fff'; c.fillText(ITEMS[cache[i]],rx+pw,py); py+=18; }
    if(hintItem!==null){
      py+=6; c.font='10px "Space Mono",monospace'; c.fillStyle='rgba(255,200,0,0.65)'; c.fillText('Coming soon:',rx+pw,py); py+=16;
      c.font='16px serif'; c.fillStyle='rgba(255,200,0,0.8)'; c.fillText(ITEMS[hintItem],rx+pw,py);
    }

    // HUD
    hud.setLeft(`🏆 ${score}`); hud.setCenter(`⏱ ${Math.ceil(timeLeft)}s`); hud.setRight(`😊 ${happiness}%`);
  }

  // ── End ────────────────────────────────────────────────────────────────────
  function endGame(){
    gameOver=true; if(fetchTimer){clearTimeout(fetchTimer);fetchTimer=null;}
    let stars=0;
    if(served>=8) stars=1;
    if(served>=12&&happiness>50) stars=2;
    if(served>=15&&happiness>75) stars=3;
    const coins=stars*40+Math.floor(score/10);
    sfx[stars>=2?'win':'fail']();
    const titles=['Keep Practicing!','Good Caching!','Great Cache Hit Rate!','Memory Master! 🏆'];
    setTimeout(()=>{
      showStarResult(root,{stars,title:titles[stars],
        lines:[`Customers served: ${served}`,`Happiness: ${happiness}%`,`Score: ${score}`,stars<3?'Pre-cache items before customers arrive!':'Perfect prediction caching!'],
        coins,color:'#ffd700',onContinue: (action,s) => { cleanup(); if(action!=='retry') onComplete(s,coins); else launch(app,state,onComplete); }});
    },600);
  }

  // ── Loop ───────────────────────────────────────────────────────────────────
  function loop(ts){
    if(gameOver) return;
    raf=requestAnimationFrame(loop);
    if(lastTs===null) lastTs=ts;
    const dt=Math.min((ts-lastTs)/1000,0.1); lastTs=ts;
    timeLeft-=dt; if(timeLeft<=0){timeLeft=0;endGame();return;}
    custTimer+=dt;
    if(custTimer>=NEW_CUST_INT&&queue.length<MAX_Q){custTimer=0;queue.push(makeCustomer());}
    for(let qi=queue.length-1;qi>=0;qi--){
      const c=queue[qi]; if(c.state!=='waiting') continue;
      c.timer+=dt; if(c.timer>=SERVE_WINDOW) custAngry(qi);
    }
    if(fetchTimer!==null&&fetchingIdx>=0) fetchProgress=Math.min(1,fetchProgress+dt/(FETCH_MS/1000));
    drawAll(ts);
  }

  showLessonBanner(root, {
    concept: t('m9.concept'),
    detail: t('m9.banner'),
    color: '#fd79a8',
  });

  showIntro(root, {
    emoji: '🧠',
    title: t('m9.title'),
    concept: t('m9.concept'),
    howto: t('m9.howto'),
    color: '#fd79a8',
    onStart: () => { raf=requestAnimationFrame(loop); },
  });

  function cleanup(){
    if(raf) cancelAnimationFrame(raf);
    if(fetchTimer) clearTimeout(fetchTimer);
    canvas.removeEventListener('click',onClick);
    destroy();
  }
}

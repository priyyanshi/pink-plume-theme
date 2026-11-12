(function(){
var doc=document.documentElement,tone=doc.dataset.tone||'day',calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ---- stitched lettering: dashed thread round a soft, fuzzy fill ---- */
function stitch(){document.querySelectorAll('[data-stitch]').forEach(function(el){
  var txt=el.dataset.stitch,fs=+(el.dataset.size||64),NS='http://www.w3.org/2000/svg',s=document.createElementNS(NS,'svg');
  s.setAttribute('role','img');s.setAttribute('aria-label',el.textContent.trim()||txt);
  var defs=document.createElementNS(NS,'defs'),f=document.createElementNS(NS,'filter');f.id='fz'+Math.random().toString(36).slice(2,7);f.innerHTML='<feGaussianBlur stdDeviation="'+(fs*.014)+'"/>';defs.appendChild(f);s.appendChild(defs);
  function mk(a){var t=document.createElementNS(NS,'text');t.textContent=txt;t.setAttribute('x',0);t.setAttribute('y',fs);t.setAttribute('font-size',fs);t.style.fontFamily='Sacramento,cursive';for(var k in a)t.setAttribute(k,a[k]);s.appendChild(t);return t;}
  var thr=getComputedStyle(doc).getPropertyValue('--thr').trim()||'#ffd9e8';
  mk({fill:thr,'fill-opacity':.35,stroke:thr,'stroke-width':fs*.05,'stroke-opacity':.55,filter:'url(#'+f.id+')'});
  mk({fill:'none',stroke:thr,'stroke-width':fs*.032,'stroke-dasharray':(fs*.085)+' '+(fs*.06),'stroke-linecap':'round','stroke-linejoin':'round'});
  var keep=el.querySelector('.vh');el.textContent='';el.appendChild(s);var h=document.createElement('span');h.className='vh';h.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';h.textContent=s.getAttribute('aria-label');el.appendChild(h);
  var b=s.querySelector('text').getBBox(),p=fs*.12;s.setAttribute('viewBox',(b.x-p)+' '+(b.y-p)+' '+(b.width+2*p)+' '+(b.height+2*p));s.setAttribute('width',Math.ceil(b.width+2*p));s.setAttribute('height',Math.ceil(b.height+2*p));
  s.style.maxWidth='100%';s.style.height='auto';});}
(document.fonts&&document.fonts.load?Promise.all([document.fonts.load('40px Sacramento')]).catch(function(){}):Promise.resolve()).then(function(){return document.fonts&&document.fonts.ready;}).then(stitch,stitch);
/* nav links between pond pages replay the zoom-in */
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||a.target)return;try{var u=new URL(a.href,location.href);if(u.origin===location.origin&&u.pathname.indexOf('/pages/')===0)sessionStorage.setItem('pp-zoom','1');}catch(x){}});
addEventListener('pageshow',function(e){if(e.persisted)location.reload();});

/* ---- the pond ---- */
var cv=document.getElementById('pond');if(!cv||!cv.getContext)return;var x=cv.getContext('2d');
var T={day:{a:'#3f9a8e',b:'#1d6058',c:'#0b3a35',gl:'255,255,232',ga:.13,tint:null},
       sunset:{a:'#6b8791',b:'#40606e',c:'#243749',gl:'255,205,170',ga:.14,tint:'rgba(255,128,100,.17)'},
       night:{a:'#1c3a5a',b:'#0f2440',c:'#050d1c',gl:'170,190,255',ga:.06,tint:'rgba(18,22,74,.32)'}}[tone]||{};
var W=0,H=0,D=1,small=false,fish=[],pads=[],rip=[],mouse={x:-999,y:-999,lx:-999,ly:-999,lt:0},nextDrop=0,nextFlash=2,flash=null;
function rnd(a){var v=Math.sin(a*127.1+311.7)*43758.5453;return v-Math.floor(v);}
var tile=(function(){var S=256,c=document.createElement('canvas');c.width=c.height=S;var g=c.getContext('2d'),im=g.createImageData(S,S),TAU=6.2832;
  for(var j=0;j<S;j++)for(var i=0;i<S;i++){var u=i/S,v=j/S,f=Math.abs(Math.sin(TAU*(u*3+Math.sin(TAU*v*2)*.33)))*Math.abs(Math.sin(TAU*(v*3+Math.sin(TAU*u*2+1.3)*.33))),k=Math.pow(Math.max(0,1-f*3.2),2),n=(j*S+i)*4;im.data[n]=im.data[n+1]=im.data[n+2]=255;im.data[n+3]=k*255;}
  g.putImageData(im,0,0);return c;})();
var PAL=[['#fbf7f1',['#ff5a1c','#e8341c']],['#ff8a2a',['#fff1e2','#e5301b']],['#f1ece3',['#ff6a1f','#2a2a30']],['#ffb24c',['#ffffff','#d9261c']],['#e8e4dc',['#e23a1b','#ff9a3a']],['#ff9a38',['#ffffff']],['#fff',['#ff7a2a','#c71f1f','#2b2b33']]];
function setup(){D=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;small=W<700;cv.width=Math.round(W*D);cv.height=Math.round(H*D);
  fish=[];var n=small?5:8;for(var i=0;i<n;i++){var p=PAL[i%PAL.length],sc=(small?.78:1)*(.82+rnd(i+4)*.5),L=13*sc,pt=[];
    var k={x:W*(.1+rnd(i+1)*.8),y:H*(.1+rnd(i+2)*.8),a:rnd(i+3)*6.283,L:L,n:16,sp:34+rnd(i+9)*26,ph:rnd(i+7)*50,tt:rnd(i+8)*40,base:p[0],pat:[],seg:[],scare:0};
    for(var q=0;q<5;q++)k.pat.push({t:.05+rnd(i*9+q)*.8,o:(rnd(i*9+q+30)-.5)*.5,r:(.5+rnd(i*9+q+60)*.9)*L*.9,c:p[1][q%p[1].length]});
    for(var s=0;s<k.n;s++)k.seg.push({x:k.x-Math.cos(k.a)*L*s,y:k.y-Math.sin(k.a)*L*s});fish.push(k);}
  pads=[];var np=small?5:9;for(var j=0;j<np;j++){var side=j%4,ex=side===0?rnd(j+20)*.22:side===1?.78+rnd(j+20)*.22:rnd(j+20),ey=side===2?rnd(j+40)*.2:side===3?.8+rnd(j+40)*.2:rnd(j+40);
    if(side<2)ey=rnd(j+40);pads.push({x:ex*W,y:ey*H,r:(small?26:40)+rnd(j+50)*(small?18:34),a:rnd(j+60)*6.283,ph:rnd(j+70)*9,fl:rnd(j+80)>.55});}
  if(calm)for(var z=0;z<160;z++)step(.05);}
function wrap(a){while(a>Math.PI)a-=6.2832;while(a<-Math.PI)a+=6.2832;return a;}
function step(dt){fish.forEach(function(k,i){k.tt+=dt;var turn=Math.sin(k.tt*.6+k.ph)*.75+Math.sin(k.tt*1.7+k.ph*2)*.35,h=k.seg[0],m=Math.min(150,W*.18),
    ex=h.x<m?(m-h.x)/m:h.x>W-m?-(h.x-(W-m))/m:0,ey=h.y<m?(m-h.y)/m:h.y>H-m?-(h.y-(H-m))/m:0;
    if(ex||ey){var want=Math.atan2(ey||0,ex||0)+0;var tc=Math.atan2(H/2-h.y,W/2-h.x);turn+=wrap(tc-k.a)*2.4*Math.max(Math.abs(ex),Math.abs(ey));}
    var dx=h.x-mouse.x,dy=h.y-mouse.y,d=Math.hypot(dx,dy);if(d<170){var away=Math.atan2(dy,dx);turn+=wrap(away-k.a)*3.2*(1-d/170);k.scare=Math.min(1,k.scare+dt*3);}k.scare=Math.max(0,k.scare-dt*.7);
    k.a+=turn*dt;var v=k.sp*(1+k.scare*2.2)*(small?.8:1);h.x+=Math.cos(k.a)*v*dt;h.y+=Math.sin(k.a)*v*dt;
    for(var s=1;s<k.n;s++){var p=k.seg[s-1],q=k.seg[s],ddx=p.x-q.x,ddy=p.y-q.y,dd=Math.hypot(ddx,ddy)||1;q.x=p.x-ddx/dd*k.L;q.y=p.y-ddy/dd*k.L;}
    k.v=v;if(Math.random()<dt*.07)rip.push({x:h.x+Math.cos(k.a)*k.L,y:h.y+Math.sin(k.a)*k.L,t:now,life:1.8,r:46});});}
function bodyPath(P,Wd){var n=P.length,l=[],r=[];for(var i=0;i<n;i++){var a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d;l.push([P[i].x+nx*Wd[i],P[i].y+ny*Wd[i]]);r.push([P[i].x-nx*Wd[i],P[i].y-ny*Wd[i]]);}
  x.beginPath();x.moveTo(l[0][0],l[0][1]);for(i=1;i<n-1;i++){x.quadraticCurveTo(l[i][0],l[i][1],(l[i][0]+l[i+1][0])/2,(l[i][1]+l[i+1][1])/2);}x.lineTo(l[n-1][0],l[n-1][1]);x.lineTo(r[n-1][0],r[n-1][1]);
  for(i=n-2;i>0;i--){x.quadraticCurveTo(r[i][0],r[i][1],(r[i][0]+r[i-1][0])/2,(r[i][1]+r[i-1][1])/2);}x.lineTo(r[0][0],r[0][1]);
  var hx=P[0].x-(P[1].x-P[0].x)*.7,hy=P[0].y-(P[1].y-P[0].y)*.7;x.quadraticCurveTo(hx,hy,l[0][0],l[0][1]);x.closePath();}
function drawKoi(k,t){var n=k.n,P=[],Wd=[],ph=k.tt*(3.4+(k.v||30)/32),L=k.L,mw=L*.92;
  for(var i=0;i<n;i++){var s=k.seg[i],a=k.seg[Math.max(0,i-1)],b=k.seg[Math.min(n-1,i+1)],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,tt=i/(n-1),w=Math.sin(ph-i*.5)*L*.5*Math.pow(tt,1.3);
    P.push({x:s.x-dy/d*w,y:s.y+dx/d*w});Wd.push(mw*(tt<.3?.45+Math.sin(tt/.3*1.5708)*.55:1-.8*Math.pow((tt-.3)/.7,1.15)));}
  var e=P[n-1],e2=P[n-3],ang=Math.atan2(e.y-e2.y,e.x-e2.x),sw=Math.sin(ph-n*.5+1)*.35;
  function tail(col,al){x.save();x.translate(e.x,e.y);x.rotate(ang+sw);x.fillStyle=col;x.globalAlpha=al;x.beginPath();x.moveTo(0,0);x.bezierCurveTo(L*1.0,-L*.9,L*2.1,-L*1.0,L*2.5,-L*.45);x.bezierCurveTo(L*1.9,-L*.2,L*1.9,L*.2,L*2.5,L*.45);x.bezierCurveTo(L*2.1,L*1.0,L*1.0,L*.9,0,0);x.fill();x.restore();}
  function fins(col,al){x.fillStyle=col;x.globalAlpha=al;[-1,1].forEach(function(sd){var q=P[3],a=P[2],b=P[4],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,nx=-dy/d*sd,ny=dx/d*sd,fl=Math.sin(ph*.8+sd)*.25;
    x.save();x.translate(q.x+nx*Wd[3]*.8,q.y+ny*Wd[3]*.8);x.rotate(Math.atan2(ny,nx)+sd*.7+fl*sd);x.beginPath();x.ellipse(L*.9,0,L*1.05,L*.34,0,0,6.283);x.fill();x.restore();});}
  /* shadow on the bed of the pond */
  x.save();x.translate(9,15);x.globalAlpha=.2;x.fillStyle='#02121a';bodyPath(P,Wd);x.fill();x.restore();
  x.save();tail('#ffe9dc',.5);fins('#ffe9dc',.5);
  x.globalAlpha=.97;bodyPath(P,Wd);x.fillStyle=k.base;x.fill();x.save();x.clip();
  k.pat.forEach(function(p){var f=p.t*(n-1),i=Math.floor(f),j=Math.min(n-1,i+1),u=f-i,px=P[i].x+(P[j].x-P[i].x)*u,py=P[i].y+(P[j].y-P[i].y)*u;x.fillStyle=p.c;x.globalAlpha=.95;x.beginPath();x.ellipse(px+p.o*L,py+p.o*L*.6,p.r*1.2,p.r*.8,0,0,6.283);x.fill();});
  x.restore();
  /* eyes */var h=P[0],h2=P[1],ha=Math.atan2(h.y-h2.y,h.x-h2.x);x.globalAlpha=.9;x.fillStyle='#14161c';[-1,1].forEach(function(sd){x.beginPath();x.arc(h.x+Math.cos(ha+sd*1.15)*mw*.78-Math.cos(ha)*L*.1,h.y+Math.sin(ha+sd*1.15)*mw*.78-Math.sin(ha)*L*.1,L*.1,0,6.283);x.fill();});
  x.restore();}
function drawPad(p,t){x.save();x.translate(p.x+Math.sin(t*.3+p.ph)*3,p.y+Math.cos(t*.27+p.ph)*3);x.rotate(p.a+Math.sin(t*.12+p.ph)*.08);
  x.fillStyle='rgba(2,18,16,.22)';x.beginPath();x.arc(7,11,p.r,0,6.283);x.fill();
  var g=x.createRadialGradient(-p.r*.2,-p.r*.2,p.r*.1,0,0,p.r);g.addColorStop(0,'#58a64e');g.addColorStop(1,'#2f7a3f');x.fillStyle=g;x.beginPath();x.moveTo(0,0);x.arc(0,0,p.r,.22,6.283-.22);x.closePath();x.fill();
  x.strokeStyle='rgba(20,70,34,.45)';x.lineWidth=1.2;for(var i=0;i<7;i++){var an=.5+i*(5.3/6);x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(an)*p.r*.95,Math.sin(an)*p.r*.95);x.stroke();}
  if(p.fl){x.fillStyle='#ffc6dc';for(var k=0;k<9;k++){x.save();x.rotate(k*.698);x.beginPath();x.ellipse(p.r*.34,0,p.r*.36,p.r*.14,0,0,6.283);x.fill();x.restore();}
    x.fillStyle='#ff95bd';for(k=0;k<7;k++){x.save();x.rotate(k*.897+.3);x.beginPath();x.ellipse(p.r*.17,0,p.r*.2,p.r*.09,0,0,6.283);x.fill();x.restore();}x.fillStyle='#ffe08a';x.beginPath();x.arc(0,0,p.r*.07,0,6.283);x.fill();}
  x.restore();}
function drop(px,py,life,r){rip.push({x:px,y:py,t:now,life:life||1.2,r:r||30});}
var now=0,last=0;
function draw(ts){now=ts/1000;var dt=Math.min(.05,last?now-last:.016);last=now;
  x.setTransform(D,0,0,D,0,0);var g=x.createRadialGradient(W/2,H*.45,Math.min(W,H)*.1,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,T.a);g.addColorStop(.55,T.b);g.addColorStop(1,T.c);x.fillStyle=g;x.fillRect(0,0,W,H);
  /* sunlight (or moonlight) dancing on the bottom of the pond */
  x.globalCompositeOperation='lighter';var TS=Math.max(420,Math.min(W,H)*.9);
  [[1,.9,.4,0],[-.7,.55,.8,1]].forEach(function(l){var TZ=TS*(1+l[3]*.35),ox=((now*14*l[0])%TZ+TZ)%TZ,oy=((now*9*l[1]+l[3]*80)%TZ+TZ)%TZ;x.globalAlpha=T.ga*(l[3]?.7:1);
    for(var i=-1;i*TZ-ox<W;i++)for(var j=-1;j*TZ-oy<H;j++)x.drawImage(tile,Math.round(i*TZ-ox),Math.round(j*TZ-oy),Math.ceil(TZ)+1,Math.ceil(TZ)+1);});
  x.globalCompositeOperation='source-over';x.globalAlpha=1;
  if(!calm)step(dt);
  fish.forEach(function(k){drawKoi(k,now);});
  x.globalAlpha=1;pads.forEach(function(p){drawPad(p,now);});
  /* ripples */
  if(!calm){if(tone==='night'&&now>nextDrop){var c=Math.ceil(dt*45);while(c--)drop(Math.random()*W,Math.random()*H,.8+Math.random()*.6,12+Math.random()*14);nextDrop=0;}
    else if(tone!=='night'&&now>nextDrop){drop(Math.random()*W,Math.random()*H,1.6,24+Math.random()*16);nextDrop=now+2+Math.random()*3;}}
  rip=rip.filter(function(p){var u=(now-p.t)/p.life;if(u>=1)return false;var rr=2+p.r*u*(p.life>1.4?3:1.4);x.lineWidth=1.4;x.strokeStyle='rgba('+(T.gl||'255,255,255')+','+(.5*(1-u)).toFixed(3)+')';x.beginPath();x.ellipse(p.x,p.y,rr,rr*.86,0,0,6.283);x.stroke();
    if(u>.2){x.strokeStyle='rgba('+(T.gl||'255,255,255')+','+(.25*(1-u)).toFixed(3)+')';x.beginPath();x.ellipse(p.x,p.y,rr*.55,rr*.47,0,0,6.283);x.stroke();}return true;});
  /* sunset: now and then the light jumps */
  if(tone==='sunset'&&!calm){if(now>nextFlash){nextFlash=now+2.5+Math.random()*4;flash={x:Math.random()*W,y:Math.random()*H,t:now,R:120+Math.random()*120};}
    if(flash){var u=(now-flash.t)/.6;if(u>=1)flash=null;else{var fl=u<.15?1:u<.25?.3:u<.35?.8:Math.max(0,1-(u-.35)/.65),gg=x.createRadialGradient(flash.x,flash.y,0,flash.x,flash.y,flash.R);gg.addColorStop(0,'rgba(255,255,255,'+(.55*fl).toFixed(3)+')');gg.addColorStop(1,'rgba(255,200,190,0)');x.fillStyle=gg;x.fillRect(0,0,W,H);x.fillStyle='rgba(255,236,226,'+(.06*fl).toFixed(3)+')';x.fillRect(0,0,W,H);}}}
  if(T.tint){x.fillStyle=T.tint;x.fillRect(0,0,W,H);}
  var v=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,'rgba(0,16,18,0)');v.addColorStop(1,'rgba(0,16,18,.5)');x.fillStyle=v;x.fillRect(0,0,W,H);
  if(!calm)requestAnimationFrame(draw);}
function moved(e){mouse.x=e.clientX;mouse.y=e.clientY;if(Math.hypot(mouse.x-mouse.lx,mouse.y-mouse.ly)>46&&now-mouse.lt>.12){mouse.lx=mouse.x;mouse.ly=mouse.y;mouse.lt=now;drop(mouse.x,mouse.y,1,22);}}
addEventListener('pointermove',moved,{passive:true});addEventListener('pointerdown',function(e){mouse.x=e.clientX;mouse.y=e.clientY;drop(e.clientX,e.clientY,1.6,40);},{passive:true});
addEventListener('pointerleave',function(){mouse.x=mouse.y=-999;});
var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){setup();if(calm)draw(performance.now());},120);});
setup();requestAnimationFrame(draw);
})();

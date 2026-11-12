(function(){
var doc=document.documentElement,tone=doc.dataset.tone||'day',calm=matchMedia('(prefers-reduced-motion: reduce)').matches,zin=doc.classList.contains('zin');
var cv=document.getElementById('pond'),veil=document.querySelector('.pp-veil');if(!cv||!cv.getContext)return;var x=cv.getContext('2d');
/* the same light as the floor menu: the lake's own dark teal, warmed at sunset, deep blue at night */
var T={day:{a:'#2c6382',b:'#193d56',c:'#091a2a',gl:'190,235,255',ga:.16,gs:1,sh:'rgba(120,205,215,',tint:null},
       sunset:{a:'#5c5678',b:'#2f2f45',c:'#111322',gl:'255,205,185',ga:.14,gs:.9,sh:'rgba(220,175,170,',tint:'rgba(255,125,100,.12)'},
       night:{a:'#1b3452',b:'#0d1c30',c:'#040a14',gl:'160,185,255',ga:.08,gs:.45,sh:'rgba(90,125,190,',tint:'rgba(16,22,76,.28)'}}[tone];
var W=0,H=0,D=1,small=false,Z=1,cam=null,isl=[],shad=[],rip=[],drops=[],jumps=[],nextJump=1.6,nextDrop=0,nextFlash=2,flash=null,now=0,last=0;
function rnd(a){var v=Math.sin(a*127.1+311.7)*43758.5453;return v-Math.floor(v);}
function ease(u){return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;}
var tile=(function(){var S=256,c=document.createElement('canvas');c.width=c.height=S;var g=c.getContext('2d'),im=g.createImageData(S,S),TAU=6.2832,rgb=T.gl.split(',');
  var W6=[[2,1,0],[1,-2,1.7],[3,2,3.1],[-2,3,.6],[1,1,2.3],[4,-1,4.4]];
  for(var j=0;j<S;j++)for(var i=0;i<S;i++){var u=i/S,v=j/S,n=0;W6.forEach(function(w,q){n+=Math.sin(TAU*(w[0]*u+w[1]*v+.25*Math.sin(TAU*(w[1]*u-w[0]*v+q))+w[2]/6.2832*1.1));});n=n/6*.5+.5;var k=Math.min(1,Math.max(0,(n-.5)/.4)),n4=(j*S+i)*4;k=k*k*(3-2*k);im.data[n4]=+rgb[0];im.data[n4+1]=+rgb[1];im.data[n4+2]=+rgb[2];im.data[n4+3]=k*200;}
  g.putImageData(im,0,0);return c;})();
var glint=[];
/* ---- islands ---- */
function mkIsland(i,fx,fy,sz){var r=(small?.62:1)*(46+rnd(i+3)*40)*sz,pts=[],N=30,a1=rnd(i+5)*6,a2=rnd(i+6)*6,a3=rnd(i+7)*6,ph=[a1,a2,a3];
  for(var k=0;k<N;k++){var an=k/N*6.2832,rr=1+.2*Math.sin(an*2+ph[0])+.13*Math.sin(an*3+ph[1])+.07*Math.sin(an*5+ph[2]);pts.push([Math.cos(an)*rr,Math.sin(an)*rr*.86]);}
  var trees=[],nt=7+Math.floor(rnd(i+9)*8);for(k=0;k<nt;k++){var an2=rnd(i*13+k)*6.2832,d=Math.sqrt(rnd(i*13+k+40))*.62;trees.push({x:Math.cos(an2)*d,y:Math.sin(an2)*d*.8,s:.11+rnd(i*13+k+80)*.1,p:rnd(i*13+k+120)>.8});}
  var rocks=[];for(k=0;k<4;k++){var an3=rnd(i*7+k+200)*6.2832;rocks.push({x:Math.cos(an3)*.95,y:Math.sin(an3)*.82,s:.05+rnd(i*7+k+240)*.05});}
  return{x:fx*W,y:fy*H,r:r,pts:pts,trees:trees,rocks:rocks,ph:rnd(i+11)*9};}
function isPath(o,sc){x.beginPath();o.pts.forEach(function(p,i){var px=o.x+p[0]*o.r*sc,py=o.y+p[1]*o.r*sc;if(i)x.lineTo(px,py);else x.moveTo(px,py);});x.closePath();}
function drawIsland(o,t){var r=o.r;
  var g=x.createRadialGradient(o.x,o.y,r*.6,o.x,o.y,r*1.9);g.addColorStop(0,T.sh+'.5)');g.addColorStop(1,T.sh+'0)');x.fillStyle=g;x.beginPath();x.ellipse(o.x,o.y,r*1.9,r*1.7,0,0,6.2832);x.fill();
  var pu=(Math.sin(t*.7+o.ph)+1)/2;x.lineWidth=2.2;x.strokeStyle='rgba(255,255,255,'+(.18+pu*.2).toFixed(3)+')';isPath(o,1.08+pu*.05);x.stroke();
  x.fillStyle='rgba(0,14,14,.3)';isPath({x:o.x+6,y:o.y+10,r:r,pts:o.pts},1);x.fill();
  x.fillStyle='#d9c896';isPath(o,1);x.fill();
  var gg=x.createRadialGradient(o.x-r*.2,o.y-r*.2,r*.1,o.x,o.y,r);gg.addColorStop(0,'#78b457');gg.addColorStop(1,'#468a3c');x.fillStyle=gg;isPath(o,.82);x.fill();
  o.rocks.forEach(function(k){x.fillStyle='#b9b6ae';x.beginPath();x.ellipse(o.x+k.x*r,o.y+k.y*r,k.s*r,k.s*r*.8,0,0,6.2832);x.fill();});
  o.trees.forEach(function(k){var tx=o.x+k.x*r,ty=o.y+k.y*r,s=k.s*r;x.fillStyle='rgba(0,28,12,.38)';x.beginPath();x.arc(tx+s*.35,ty+s*.55,s,0,6.2832);x.fill();
    x.fillStyle=k.p?'#f6a9c9':'#2f7a3a';x.beginPath();x.arc(tx,ty,s,0,6.2832);x.fill();x.fillStyle=k.p?'#ffd0e2':'#58a85a';x.beginPath();x.arc(tx-s*.25,ty-s*.28,s*.5,0,6.2832);x.fill();});}
/* ---- fish: a few dark shapes under the water, and now and then one leaps out ---- */
function fishShape(len,col,patch,phase){x.fillStyle=col;x.beginPath();x.ellipse(0,0,len*.5,len*.19,0,0,6.2832);x.fill();x.fillStyle=patch;x.beginPath();x.ellipse(-len*.08,0,len*.2,len*.13,0,0,6.2832);x.fill();
  var sw=Math.sin(phase)*.5;x.save();x.translate(-len*.46,0);x.rotate(sw);x.fillStyle=col;x.globalAlpha*=.85;x.beginPath();x.moveTo(0,0);x.lineTo(-len*.34,-len*.2);x.lineTo(-len*.28,0);x.lineTo(-len*.34,len*.2);x.closePath();x.fill();x.restore();
  x.fillStyle=col;[-1,1].forEach(function(s){x.beginPath();x.ellipse(len*.14,s*len*.2,len*.13,len*.05,s*.6,0,6.2832);x.fill();});
  x.fillStyle='#111';[-1,1].forEach(function(s){x.beginPath();x.arc(len*.34,s*len*.09,len*.03,0,6.2832);x.fill();});}
var FC=[['#ff8a2a','#fff1e2'],['#f4efe6','#ff5a1c'],['#ffb24c','#e5301b'],['#e9e5dc','#ff7a2a']];
function startJump(){var tries=0,px,py,ok;do{px=W*(.08+Math.random()*.84);py=H*(.12+Math.random()*.76);ok=isl.every(function(o){return Math.hypot(px-o.x,py-o.y)>o.r*1.5;});}while(!ok&&++tries<20);if(!ok)return;
  var a=Math.random()*6.2832,len=small?26:34,c=FC[Math.floor(Math.random()*FC.length)],dist=(small?70:100)+Math.random()*60;
  jumps.push({x:px,y:py,a:a,t:now,dur:.95+Math.random()*.25,len:len,c:c,dist:dist,sp:false});splash(px,py,1);}
function splash(px,py,k){for(var i=0;i<3;i++)rip.push({x:px,y:py,t:now+i*.12,life:1.4+i*.2,r:26*k+i*8});
  for(i=0;i<9;i++){var an=Math.random()*6.2832,v=30+Math.random()*60;drops.push({x:px,y:py,vx:Math.cos(an)*v,vy:Math.sin(an)*v,t:now,life:.5+Math.random()*.3});}}
function drawJump(j){var u=(now-j.t)/j.dur;if(u<0||u>1)return;var h=Math.sin(u*Math.PI),px=j.x+Math.cos(j.a)*j.dist*u,py=j.y+Math.sin(j.a)*j.dist*u;
  x.save();x.translate(px+18*h,py+30*h);x.rotate(j.a);x.globalAlpha=.22*(1-h*.5);x.scale(1+.15*h,1);fishShape(j.len,'#02121a','#02121a',now*30);x.restore();
  x.save();x.translate(px,py);x.rotate(j.a+Math.sin(now*20)*.12);x.scale(1+.9*h,1+.9*h);x.globalAlpha=1;fishShape(j.len,j.c[0],j.c[1],now*34);x.restore();}
function drawShadows(t){shad.forEach(function(s,i){var an=t*.05*s.v+s.ph,px=W*(.5+.42*Math.sin(an)*Math.cos(s.k)),py=H*(.5+.38*Math.cos(an*.9+s.k)),hd=Math.atan2(Math.cos(an*.9+s.k)*-.9*.38*H,Math.cos(an)*.42*W*Math.cos(s.k));
  x.save();x.translate(px,py);x.rotate(hd);x.globalAlpha=T.ga>.1?.16:.1;x.fillStyle='#010a10';x.beginPath();x.ellipse(0,0,s.l*.5,s.l*.17,0,0,6.2832);x.fill();x.beginPath();x.moveTo(-s.l*.46,0);x.lineTo(-s.l*.72,-s.l*.16*Math.sin(t*3+i)-s.l*.1);x.lineTo(-s.l*.72,s.l*.16*Math.sin(t*3+i)+s.l*.1);x.fill();x.restore();});}
function setup(){D=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;small=W<700;cv.width=Math.round(W*D);cv.height=Math.round(H*D);
  isl=[[.09,.3,.9],[.9,.22,1.05],[.8,.8,1.1],[.16,.82,.8],[.52,.93,.55],[.6,.08,.5],[.96,.55,.55]].slice(0,small?5:7).map(function(a,i){return mkIsland(i,a[0],a[1],a[2]);});
  glint=[];for(var q=0;q<(small?150:300);q++)glint.push({x:rnd(q+500)*W,y:rnd(q+900)*H,l:5+rnd(q+1300)*15,ph:rnd(q+1700)*60,sp:.8+rnd(q+2100)*2.2});
  shad=[];for(var i=0;i<(small?3:4);i++)shad.push({ph:rnd(i+1)*9,v:.5+rnd(i+2)*.6,k:rnd(i+3)*1.2,l:(small?90:130)+rnd(i+4)*60});}
/* ---- drawing ---- */
function draw(ts){now=ts/1000;var dt=Math.min(.05,last?now-last:.016);last=now;
  if(cam){var u=Math.min(1,(now*1000-cam.t0)/cam.dur);Z=Math.exp(Math.log(cam.from)+(Math.log(cam.to)-Math.log(cam.from))*ease(u));if(u>=1){var cb=cam.cb;cam=null;if(cb)cb();}}
  x.setTransform(D,0,0,D,0,0);var g=x.createRadialGradient(W/2,H*.45,Math.min(W,H)*.08,W/2,H/2,Math.max(W,H)*.8);g.addColorStop(0,T.a);g.addColorStop(.55,T.b);g.addColorStop(1,T.c);x.fillStyle=g;x.fillRect(0,0,W,H);
  x.save();x.translate(W/2,H/2);x.scale(Z,Z);x.translate(-W/2,-H/2);
  drawShadows(now);
  /* long swells drifting across the lake, then sun (or moon) sparkling on the crests */
  x.globalCompositeOperation='lighter';[[1,.6,620,0,1],[-.7,.4,380,1,.6]].forEach(function(l){var TZ=l[2],ox=((now*13*l[0])%TZ+TZ)%TZ,oy=((now*7*l[1]+l[3]*90)%TZ+TZ)%TZ,x0=-(W/Z-W)/2-TZ,y0=-(H/Z-H)/2-TZ;x.globalAlpha=T.ga*l[4];
    for(var i=0;x0+i*TZ-ox<W+(W/Z-W)/2;i++)for(var j=0;y0+j*TZ-oy<H+(H/Z-H)/2;j++)x.drawImage(tile,Math.round(x0+i*TZ-ox),Math.round(y0+j*TZ-oy),TZ+1,TZ+1);});
  x.fillStyle='rgb('+T.gl+')';glint.forEach(function(q){var a=Math.sin(now*q.sp+q.ph);if(a<.55)return;x.globalAlpha=Math.pow((a-.55)/.45,2)*.75*T.gs;x.beginPath();x.ellipse(q.x,q.y,q.l*.5,1.1,0,0,6.2832);x.fill();});
  x.globalCompositeOperation='source-over';x.globalAlpha=1;
  isl.forEach(function(o){drawIsland(o,now);});
  if(!calm){if(now>nextJump){startJump();nextJump=now+3.2+Math.random()*4.5;}}
  jumps=jumps.filter(function(j){var u=(now-j.t)/j.dur;if(u>=1){if(!j.sp){j.sp=1;splash(j.x+Math.cos(j.a)*j.dist,j.y+Math.sin(j.a)*j.dist,1);}return false;}return true;});jumps.forEach(drawJump);
  if(!calm){if(tone==='night'){var c=Math.round(dt*40);while(c--)rip.push({x:Math.random()*W,y:Math.random()*H,t:now,life:.8+Math.random()*.6,r:12+Math.random()*14});}
    else if(now>nextDrop){rip.push({x:Math.random()*W,y:Math.random()*H,t:now,life:1.6,r:24+Math.random()*16});nextDrop=now+1.6+Math.random()*2.4;}}
  rip=rip.filter(function(p){var u=(now-p.t)/p.life;if(u>=1)return false;if(u<0)return true;var rr=2+p.r*u*(p.life>1.3?3:1.4);x.lineWidth=1.4;x.strokeStyle='rgba('+T.gl+','+(.5*(1-u)).toFixed(3)+')';x.beginPath();x.ellipse(p.x,p.y,rr,rr*.86,0,0,6.2832);x.stroke();
    if(u>.2){x.strokeStyle='rgba('+T.gl+','+(.25*(1-u)).toFixed(3)+')';x.beginPath();x.ellipse(p.x,p.y,rr*.55,rr*.47,0,0,6.2832);x.stroke();}return true;});
  drops=drops.filter(function(d){var u=(now-d.t)/d.life;if(u>=1)return false;x.fillStyle='rgba(255,255,255,'+(.85*(1-u)).toFixed(3)+')';x.beginPath();x.arc(d.x+d.vx*u*.8,d.y+d.vy*u*.8-Math.sin(u*Math.PI)*16,1.8*(1-u*.5),0,6.2832);x.fill();return true;});
  x.restore();
  if(tone==='sunset'&&!calm){if(now>nextFlash){nextFlash=now+2.5+Math.random()*4;flash={x:Math.random()*W,y:Math.random()*H,t:now,R:120+Math.random()*120};}
    if(flash){var fu=(now-flash.t)/.6;if(fu>=1)flash=null;else{var fl=fu<.15?1:fu<.25?.3:fu<.35?.8:Math.max(0,1-(fu-.35)/.65),gg=x.createRadialGradient(flash.x,flash.y,0,flash.x,flash.y,flash.R);gg.addColorStop(0,'rgba(255,255,255,'+(.5*fl).toFixed(3)+')');gg.addColorStop(1,'rgba(255,200,190,0)');x.fillStyle=gg;x.fillRect(0,0,W,H);x.fillStyle='rgba(255,236,226,'+(.05*fl).toFixed(3)+')';x.fillRect(0,0,W,H);}}}
  if(T.tint){x.fillStyle=T.tint;x.fillRect(0,0,W,H);}
  var v=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.4,W/2,H/2,Math.max(W,H)*.78);v.addColorStop(0,'rgba(0,10,12,0)');v.addColorStop(1,'rgba(0,10,12,.45)');x.fillStyle=v;x.fillRect(0,0,W,H);
  if(!calm||cam)requestAnimationFrame(draw);}
/* ---- camera: the dive continues (arriving) and reverses (leaving) ---- */
function camTo(from,to,dur,cb){cam={from:from,to:to,dur:dur,t0:performance.now(),cb:cb};Z=from;if(calm&&!cam.raf){requestAnimationFrame(draw);}}
if(zin&&!calm){Z=.4;veil.style.opacity=1;requestAnimationFrame(function(){requestAnimationFrame(function(){veil.style.transition='opacity 1s ease-out';veil.style.opacity=0;camTo(.4,1,1500);});});}
function leave(){if(window.ppLeaving)return;window.ppLeaving=1;var key=document.body.dataset.page||'',home=document.querySelector('.pp-logo').href;try{sessionStorage.setItem('pp-out',key||'x');}catch(e){}
  if(calm){location.href=home;return;}
  doc.classList.add('pp-leaving');veil.style.transition='opacity .5s ease-in .5s';veil.style.opacity=1;camTo(Z,.34,1050,function(){location.href=home;});requestAnimationFrame(draw);}
document.getElementById('ppMenu').addEventListener('click',leave);
document.querySelector('.pp-logo').addEventListener('click',function(e){if(e.metaKey||e.ctrlKey||e.shiftKey)return;e.preventDefault();leave();});
/* the clock button cycles: time of day, then day, sunset, night */
document.getElementById('ppTheme').addEventListener('click',function(){var sky='auto',th='';try{sky=localStorage.getItem('pp-sky')||'auto';th=localStorage.getItem('pp-theme')||'';}catch(e){}
  var cur=sky==='auto'?'auto':sky==='sunset'?'sunset':th==='night'?'night':'day',nx={auto:'day',day:'sunset',sunset:'night',night:'auto'}[cur];
  try{localStorage.setItem('pp-sky',nx==='auto'?'auto':nx==='sunset'?'sunset':'storm');if(nx==='day'||nx==='night')localStorage.setItem('pp-theme',nx);}catch(e){}location.reload();});
addEventListener('pageshow',function(e){if(e.persisted)location.reload();});
addEventListener('pointerdown',function(e){if(Z!==1)return;rip.push({x:e.clientX,y:e.clientY,t:now,life:1.6,r:40});},{passive:true});
var lp={x:-99,y:-99};addEventListener('pointermove',function(e){if(Z!==1||Math.hypot(e.clientX-lp.x,e.clientY-lp.y)<50)return;lp={x:e.clientX,y:e.clientY};rip.push({x:lp.x,y:lp.y,t:now,life:1,r:22});},{passive:true});
var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){setup();if(calm)draw(performance.now());},120);});
/* the cards: a fluffy cloud, like the pop-ups on the home page */
function pad(card){var cvs=card.querySelector(':scope>.pp-pad');if(!cvs){cvs=document.createElement('canvas');cvs.className='pp-pad';cvs.setAttribute('aria-hidden','true');card.insertBefore(cvs,card.firstChild);}
  var M=90,w=card.offsetWidth+2*M,h=card.offsetHeight+2*M,d=Math.min(2,devicePixelRatio||1),C={day:['255,243,249','238,208,228','255,255,255'],sunset:['255,236,228','246,200,194','255,250,244'],night:['108,90,146','66,52,100','146,126,184']}[tone],g=cvs.getContext('2d');
  cvs.width=Math.round(w*d);cvs.height=Math.round(h*d);cvs.style.cssText='left:'+(-M)+'px;top:'+(-M)+'px;width:'+w+'px;height:'+h+'px';g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
  var x0=M+24,y0=M+24,x1=w-M-24,y1=h-M-24,r=Math.min(46,(x1-x0)/3,(y1-y0)/3),pts=[],step=46,per=[[x0+r,y0,x1-r,y0],[x1,y0+r,x1,y1-r],[x1-r,y1,x0+r,y1],[x0,y1-r,x0,y0+r]];
  per.forEach(function(e,si){var L=Math.hypot(e[2]-e[0],e[3]-e[1]),n=Math.max(1,Math.round(L/step));for(var i=0;i<=n;i++)pts.push([e[0]+(e[2]-e[0])*i/n,e[1]+(e[3]-e[1])*i/n,si]);
    var c=[[x1-r,y0+r],[x1-r,y1-r],[x0+r,y1-r],[x0+r,y0+r]][si];for(var k=1;k<4;k++){var an=(si*1.5707-1.5707)+k*1.5707/4;pts.push([c[0]+Math.cos(an)*r,c[1]+Math.sin(an)*r,si]);}});
  function puff(px,py,rad,col,al){var gr=g.createRadialGradient(px,py,0,px,py,rad);gr.addColorStop(0,'rgba('+col+','+al+')');gr.addColorStop(.78,'rgba('+col+','+(al*.96)+')');gr.addColorStop(1,'rgba('+col+',0)');g.fillStyle=gr;g.beginPath();g.arc(px,py,rad,0,6.2832);g.fill();}
  g.shadowColor='rgba('+C[0]+',1)';g.shadowBlur=10;g.fillStyle='rgb('+C[0]+')';g.fillRect(x0+10,y0+10,x1-x0-20,y1-y0-20);g.shadowBlur=0;
  pts.forEach(function(p,i){var q=function(k){return rnd(i*7+k+(card.offsetWidth%97));},rad=40+q(1)*28,ox=(q(2)-.5)*18,oy=(q(3)-.5)*18;puff(p[0]+ox,p[1]+oy+10,rad,C[1],.9);});
  pts.forEach(function(p,i){var q=function(k){return rnd(i*7+k+(card.offsetWidth%97));},rad=38+q(1)*26,ox=(q(2)-.5)*18,oy=(q(3)-.5)*18;puff(p[0]+ox,p[1]+oy,rad,C[0],1);});
  var gi=g.createRadialGradient(w*.4,h*.35,10,w/2,h/2,Math.max(w,h)*.6);gi.addColorStop(0,'rgba('+C[2]+',.35)');gi.addColorStop(1,'rgba('+C[0]+',0)');g.fillStyle=gi;g.fillRect(x0,y0,x1-x0,y1-y0);}
function pads(){document.querySelectorAll('.pp-card').forEach(pad);}
if(window.ResizeObserver){var ro=new ResizeObserver(pads);document.querySelectorAll('.pp-card').forEach(function(c){ro.observe(c);});}
pads();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(pads);addEventListener('resize',pads);
setup();if(calm){draw(performance.now());}else requestAnimationFrame(draw);
})();

(function(){
var doc=document.documentElement,tone=doc.dataset.tone||'day',calm=matchMedia('(prefers-reduced-motion: reduce)').matches,zin=doc.classList.contains('zin');
var cv=document.getElementById('pond'),veil=document.querySelector('.pp-veil');if(!cv||!cv.getContext)return;var x=cv.getContext('2d');
/* the same light as the floor menu: the lake's own dark teal, warmed at sunset, deep blue at night */
var T={day:{a:'#2b5658',b:'#1b3436',c:'#0b1819',gl:'175,235,225',ga:.16,sh:'rgba(120,205,195,',tint:null},
       sunset:{a:'#554c58',b:'#302c34',c:'#121115',gl:'255,205,175',ga:.14,sh:'rgba(210,170,150,',tint:'rgba(255,125,95,.14)'},
       night:{a:'#1b2f48',b:'#0e1a2c',c:'#050a13',gl:'150,175,255',ga:.07,sh:'rgba(90,120,190,',tint:'rgba(16,20,70,.3)'}}[tone];
var W=0,H=0,D=1,small=false,Z=1,cam=null,isl=[],shad=[],rip=[],drops=[],jumps=[],nextJump=1.6,nextDrop=0,nextFlash=2,flash=null,now=0,last=0;
function rnd(a){var v=Math.sin(a*127.1+311.7)*43758.5453;return v-Math.floor(v);}
function ease(u){return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;}
var tile=(function(){var S=256,c=document.createElement('canvas');c.width=c.height=S;var g=c.getContext('2d'),im=g.createImageData(S,S),TAU=6.2832;
  for(var j=0;j<S;j++)for(var i=0;i<S;i++){var u=i/S,v=j/S,f=Math.abs(Math.sin(TAU*(u*3+Math.sin(TAU*v*2)*.33)))*Math.abs(Math.sin(TAU*(v*3+Math.sin(TAU*u*2+1.3)*.33))),k=Math.pow(Math.max(0,1-f*3.2),2),n=(j*S+i)*4;im.data[n]=im.data[n+1]=im.data[n+2]=255;im.data[n+3]=k*255;}
  g.putImageData(im,0,0);return c;})();
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
  shad=[];for(var i=0;i<(small?3:4);i++)shad.push({ph:rnd(i+1)*9,v:.5+rnd(i+2)*.6,k:rnd(i+3)*1.2,l:(small?90:130)+rnd(i+4)*60});}
/* ---- drawing ---- */
function draw(ts){now=ts/1000;var dt=Math.min(.05,last?now-last:.016);last=now;
  if(cam){var u=Math.min(1,(now*1000-cam.t0)/cam.dur);Z=Math.exp(Math.log(cam.from)+(Math.log(cam.to)-Math.log(cam.from))*ease(u));if(u>=1){var cb=cam.cb;cam=null;if(cb)cb();}}
  x.setTransform(D,0,0,D,0,0);var g=x.createRadialGradient(W/2,H*.45,Math.min(W,H)*.08,W/2,H/2,Math.max(W,H)*.8);g.addColorStop(0,T.a);g.addColorStop(.55,T.b);g.addColorStop(1,T.c);x.fillStyle=g;x.fillRect(0,0,W,H);
  x.save();x.translate(W/2,H/2);x.scale(Z,Z);x.translate(-W/2,-H/2);
  drawShadows(now);
  /* sun (or moon) glitter on the swell: two scales, drifting different ways */
  x.globalCompositeOperation='lighter';[[1,.9,.5,0,380],[-.7,.5,.8,1,230]].forEach(function(l){var TZ=l[4],ox=((now*16*l[0])%TZ+TZ)%TZ,oy=((now*8*l[1]+l[3]*80)%TZ+TZ)%TZ,x0=-(W/Z-W)/2-TZ,y0=-(H/Z-H)/2-TZ;x.globalAlpha=T.ga*(l[3]?.55:.9);
    for(var i=0;x0+i*TZ-ox<W+(W/Z-W)/2;i++)for(var j=0;y0+j*TZ-oy<H+(H/Z-H)/2;j++)x.drawImage(tile,Math.round(x0+i*TZ-ox),Math.round(y0+j*TZ-oy),TZ+1,TZ+1);});
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
/* the lily-pad cards */
function pad(card){var s=card.querySelector(':scope>.pp-pad');if(!s){s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('class','pp-pad');s.setAttribute('aria-hidden','true');card.insertBefore(s,card.firstChild);}
  var w=card.offsetWidth+32,h=card.offsetHeight+32,a=.9,cx=w/2,cy=h/2,nx=w*.74,nd=Math.min(h*.1,64),id='pm'+Math.random().toString(36).slice(2,6);
  var P='M'+cx+',0 C'+(cx+a*cx)+',0 '+w+','+(cy-a*cy)+' '+w+','+cy+' C'+w+','+(cy+a*cy)+' '+(cx+a*cx)+','+h+' '+cx+','+h+' C'+(cx-a*cx)+','+h+' 0,'+(cy+a*cy)+' 0,'+cy+' C0,'+(cy-a*cy)+' '+(cx-a*cx)+',0 '+cx+',0Z';
  var veins='';for(var i=0;i<11;i++){var an=-.6+i*(Math.PI*2/11),ex=nx+Math.cos(an)*w,ey=nd+Math.sin(an)*h;veins+='<line x1="'+nx+'" y1="'+nd+'" x2="'+ex+'" y2="'+ey+'"/>';}
  var lot='',lx=w*.045,ly=h*.07,lr=Math.min(60,w*.1);for(i=0;i<9;i++)lot+='<ellipse cx="'+(lr*.5)+'" cy="0" rx="'+(lr*.5)+'" ry="'+(lr*.2)+'" transform="rotate('+(i*40)+')" fill="#ffc6dc" stroke="#f08db4" stroke-width="1"/>';for(i=0;i<7;i++)lot+='<ellipse cx="'+(lr*.26)+'" cy="0" rx="'+(lr*.3)+'" ry="'+(lr*.13)+'" transform="rotate('+(i*51+20)+')" fill="#ff95bd"/>';lot+='<circle r="'+(lr*.1)+'" fill="#ffe08a"/>';
  s.setAttribute('width',w);s.setAttribute('height',h);s.setAttribute('viewBox','0 0 '+w+' '+h);
  s.innerHTML='<defs><radialGradient id="'+id+'g" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="var(--pad1)"/><stop offset="1" stop-color="var(--pad2)"/></radialGradient><mask id="'+id+'"><rect width="'+w+'" height="'+h+'" fill="#fff"/><polygon points="'+(nx-16)+',-4 '+nx+','+nd+' '+(nx+16)+',-4" fill="#000"/></mask></defs><g mask="url(#'+id+')"><path d="'+P+'" fill="url(#'+id+'g)" stroke="var(--padr)" stroke-width="3"/><g stroke="var(--vein)" stroke-width="1.6" fill="none">'+veins+'</g></g><g transform="translate('+lx+' '+ly+')">'+lot+'</g>';}
function pads(){document.querySelectorAll('.pp-card').forEach(pad);}
if(window.ResizeObserver){var ro=new ResizeObserver(pads);document.querySelectorAll('.pp-card').forEach(function(c){ro.observe(c);});}
pads();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(pads);addEventListener('resize',pads);
setup();if(calm){draw(performance.now());}else requestAnimationFrame(draw);
})();

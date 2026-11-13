/* lake pages: aerial lake, islands, leaping fish, cloud cards (engine shared with the home page) */
/* ---- birds seen from above (shared by the floor menu and the lake pages): a small flock crosses now and then, flapping, with a shadow far below ---- */
function ppBird(x,len,flap){const w=.5+.5*Math.cos(flap),sp=len*(.3+.78*w);   // wings sweep: short on the upstroke, long on the downstroke
  x.beginPath();x.ellipse(0,0,len*.3,len*.085,0,0,6.2832);x.fill();
  x.beginPath();x.moveTo(-len*.26,0);x.lineTo(-len*.5,-len*.07);x.lineTo(-len*.46,0);x.lineTo(-len*.5,len*.07);x.closePath();x.fill();
  [-1,1].forEach(function(sd){x.beginPath();x.moveTo(len*.1,sd*len*.05);x.quadraticCurveTo(-len*.02,sd*sp*.55,-len*.34*(1-.25*w),sd*sp);x.quadraticCurveTo(-len*.2,sd*sp*.45,-len*.24,sd*len*.07);x.closePath();x.fill();});}
function ppFlock(st,t,dt,W,H,len){if(t>st.next){var n=3+Math.floor(Math.random()*3),side=Math.floor(Math.random()*4),a,x0,y0,sp=(55+Math.random()*35)*(len/18);
    if(side===0){x0=-60;y0=H*(.15+Math.random()*.7);a=(Math.random()-.5)*.7;}else if(side===1){x0=W+60;y0=H*(.15+Math.random()*.7);a=Math.PI+(Math.random()-.5)*.7;}else if(side===2){x0=W*(.15+Math.random()*.7);y0=-60;a=Math.PI/2+(Math.random()-.5)*.7;}else{x0=W*(.15+Math.random()*.7);y0=H+60;a=-Math.PI/2+(Math.random()-.5)*.7;}
    for(var i=0;i<n;i++){var rk=Math.ceil(i/2)*(i%2?1:-1),bx=x0-Math.cos(a)*Math.abs(rk)*len*2.2+Math.cos(a+1.5708)*rk*len*1.5,by=y0-Math.sin(a)*Math.abs(rk)*len*2.2+Math.sin(a+1.5708)*rk*len*1.5;
      st.b.push({x:bx,y:by,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,a:a,ph:Math.random()*6,len:len*(.85+Math.random()*.3),sw:Math.random()*6});}
    st.next=t+16+Math.random()*16;}
  st.b=st.b.filter(function(b){b.x+=b.vx*dt;b.y+=b.vy*dt+Math.sin(t*1.3+b.sw)*.15;return b.x>-140&&b.x<W+140&&b.y>-140&&b.y<H+140;});}
function ppFlockDraw(x,st,t,len){x.save();x.fillStyle='#02121a';st.b.forEach(function(b){x.save();x.globalAlpha=.2;x.translate(b.x+len*.9,b.y+len*1.5);x.rotate(b.a);ppBird(x,b.len*.86,t*9+b.ph);x.restore();});
  x.fillStyle='#2b313c';st.b.forEach(function(b){x.save();x.globalAlpha=.93;x.translate(b.x,b.y);x.rotate(b.a);ppBird(x,b.len,t*9+b.ph);x.restore();});x.restore();}
var PPCT={day:'255,226,238',sunset:'255,208,200',night:'170,128,182'},PPCL={day:'255,240,246',sunset:'255,232,224',night:'150,112,166'},PPBIL={};
function ppRnd(a){var v=Math.sin(a*127.1+311.7)*43758.5453;return v-Math.floor(v);}
function noise2(seed){var t=seed*9301+49297,R=function(){return((t=(t*16807)%2147483647)/2147483647);},G=64,g=new Float32Array(G*G).map(R);
  var f=function(x,y){var xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,a=g[((yi%G+G)%G)*G+((xi%G+G)%G)],b=g[((yi%G+G)%G)*G+(((xi+1)%G+G)%G)],c=g[(((yi+1)%G+G)%G)*G+((xi%G+G)%G)],d=g[(((yi+1)%G+G)%G)*G+(((xi+1)%G+G)%G)],u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};
  return function(x,y,o){o=o||4;var s=0,amp=.5,fr=1;for(var i=0;i<o;i++){s+=f(x*fr,y*fr)*amp;fr*=2.03;amp*=.5;}return s/(1-Math.pow(.5,o));};}
function billow(seed,flat,tint){var S=256,c=document.createElement('canvas');c.width=c.height=S;var ctx=c.getContext('2d'),img=ctx.createImageData(S,S),d=img.data,N=noise2(seed+1),Lx=0,Ly=-.62,Lz=.78;
  for(var y=0;y<S;y++)for(var x=0;x<S;x++){var dx=(x-128)/116,dy=(y-128)/116,r=Math.hypot(dx,dy),rr=r+(N(x*.045,y*.045,3)-.5)*.2+(N(x*.22+40,y*.22,3)-.5)*.08,
    al=flat?1-Math.min(1,Math.max(0,(rr-.58)/.42)):1-Math.min(1,Math.max(0,(rr-.7)/.3));if(al<=0)continue;
    var rc=Math.min(r,.999),nz=Math.sqrt(1-rc*rc),dif=Math.max(0,dx*Lx+dy*Ly+nz*Lz),sh=.5+.5*Math.pow((dif+.15)/1.15,.9),rim=Math.min(1,Math.max(0,(r-.72)/.3));sh=sh+(.82-sh)*rim*rim*.6;if(flat)sh=.6+.4*sh;sh*=.94+.1*N(x*.09+7,y*.09+3,4);
    var v=Math.min(255,Math.round(sh*255)),i=(y*S+x)*4;d[i]=d[i+1]=d[i+2]=v;d[i+3]=Math.round(al*al*(3-2*al)*255);}
  ctx.putImageData(img,0,0);var o=document.createElement('canvas');o.width=o.height=S;var q=o.getContext('2d');q.drawImage(c,0,0);q.globalCompositeOperation='multiply';q.fillStyle='rgb('+tint+')';q.fillRect(0,0,S,S);q.globalCompositeOperation='destination-in';q.drawImage(c,0,0);return o;}
function ppCloudPad(card,tone){var CT=PPCT[tone||'day'],CL=PPCL[tone||'day'],bil=PPBIL[tone||'day']||(PPBIL[tone||'day']=null);var cvs=card.querySelector(':scope>.pp-pad');if(!cvs){cvs=document.createElement('canvas');cvs.className='pp-pad';cvs.setAttribute('aria-hidden','true');card.insertBefore(cvs,card.firstChild);}
  if(!bil){bil=PPBIL[tone||'day']={s:[],f:[]};for(var i=0;i<6;i++)bil.s.push(billow(i*3+2,false,CT));for(i=0;i<3;i++)bil.f.push(billow(40+i*5,true,CT));}
  var M=120,w=card.offsetWidth+2*M,h=card.offsetHeight+2*M,d=Math.min(2,devicePixelRatio||1),g=cvs.getContext('2d');
  cvs.width=Math.round(w*d);cvs.height=Math.round(h*d);cvs.style.cssText='left:'+(-M)+'px;top:'+(-M)+'px;width:'+w+'px;height:'+h+'px';g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
  var x0=M+40,y0=M+40,x1=w-M-40,y1=h-M-40,seed=card.offsetWidth%89,pts=[],cx=w/2,cy=h/2,ax=(x1-x0)/2*1.04,ay=(y1-y0)/2*1.1,NP=Math.max(26,Math.round((ax+ay)/13));
  for(var k=0;k<NP;k++){var an=k/NP*6.2832,ca=Math.cos(an),sa=Math.sin(an),e=2/2.6,wob=1+.1*Math.sin(an*3+seed)+.06*Math.sin(an*5+seed*2);pts.push([cx+(ca<0?-1:1)*Math.pow(Math.abs(ca),e)*ax*wob,cy+(sa<0?-1:1)*Math.pow(Math.abs(sa),e)*ay*wob]);}
  g.filter='blur(5px)';g.globalAlpha=.45;for(var gy=y0+30;gy<y1-10;gy+=130)for(var gx=x0+30;gx<x1-10;gx+=130){var q=ppRnd(gx*.7+gy*1.3+seed),sz=230+q*60;g.drawImage(bil.f[Math.floor(q*3)%3],gx-sz/2,gy-sz/2,sz,sz);}
  g.globalAlpha=.38;pts.forEach(function(p,i){var q=function(k){return ppRnd(i*9+k+seed);},sz=110+q(1)*110;g.drawImage(bil.s[Math.floor(q(2)*6)%6],p[0]+(q(3)-.5)*34-sz/2,p[1]+(q(4)-.5)*34-sz/2,sz,sz);});
  g.globalAlpha=.3;pts.forEach(function(p,i){var q=ppRnd(i*5+seed+77),sz=80+q*70;g.drawImage(bil.f[i%3],p[0]+(q-.5)*50-sz/2,p[1]+(ppRnd(i+seed)-.5)*40-sz/2,sz,sz);});
  g.filter='none';g.globalAlpha=1;g.save();g.translate(cx,cy);g.scale(ax+20,ay+20);var wg=g.createRadialGradient(0,0,0,0,0,1.1);wg.addColorStop(0,'rgba('+CL+',.62)');wg.addColorStop(.6,'rgba('+CL+',.5)');wg.addColorStop(1,'rgba('+CL+',0)');g.fillStyle=wg;g.fillRect(-1.2,-1.2,2.4,2.4);g.restore();}
var PPW=null;function ppWaterImg(){if(!PPW){var u=(window.PP_DATA&&window.PP_DATA.water)||window.PP_WATER;if(!u)return null;PPW={im:new Image(),ok:false};PPW.im.onload=function(){PPW.ok=true;};PPW.im.src=u;}return PPW.ok?PPW.im:null;}
try{ppWaterImg();}catch(e){}
function ppWaterBg(tone){var u=(window.PP_DATA&&window.PP_DATA.water)||window.PP_WATER||'',c={day:'#f7e9ef',sunset:'rgb(236,170,170)',night:'rgb(60,68,138)'}[tone]||'#f7e9ef';return 'background-color:'+c+';background-image:url('+u+');background-size:cover;background-position:center;background-blend-mode:multiply;';}
function ppLakeMake(o){var doc=document.documentElement,tone=o.tone||'day',calm=matchMedia('(prefers-reduced-motion: reduce)').matches,dead=false;
var WI=ppWaterImg(),cv=o.cv,veil=o.veil;if(!cv||!cv.getContext)return null;var x=cv.getContext('2d');
/* the same light as the floor menu: the lake's own dark teal, warmed at sunset, deep blue at night */
var T={day:{a:'#2c6382',b:'#193d56',c:'#091a2a',gl:'190,235,255',ga:.16,gs:1,sh:'rgba(120,205,215,',tint:null},
       sunset:{a:'#5c5678',b:'#2f2f45',c:'#111322',gl:'255,205,185',ga:.14,gs:.9,sh:'rgba(220,175,170,',tint:'rgba(255,125,100,.12)'},
       night:{a:'#1b3452',b:'#0d1c30',c:'#040a14',gl:'160,185,255',ga:.08,gs:.45,sh:'rgba(90,125,190,',tint:'rgba(16,22,76,.28)'}}[tone];
var flk={b:[],next:2.5},W=0,H=0,D=1,small=false,Z=1,cam=null,isl=[],shad=[],rip=[],drops=[],jumps=[],nextJump=1.6,nextDrop=0,nextFlash=2,flash=null,now=0,last=0;
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
  isl=[];
  glint=[];for(var q=0;q<(small?150:300);q++)glint.push({x:rnd(q+500)*W,y:rnd(q+900)*H,l:5+rnd(q+1300)*15,ph:rnd(q+1700)*60,sp:.8+rnd(q+2100)*2.2});
  shad=[];for(var i=0;i<0;i++)shad.push({ph:rnd(i+1)*9,v:.5+rnd(i+2)*.6,k:rnd(i+3)*1.2,l:(small?90:130)+rnd(i+4)*60});}
/* ---- drawing ---- */
function draw(ts){if(dead)return;now=ts/1000;var dt=Math.min(.05,last?now-last:.016);last=now;
  if(cam){var u=Math.min(1,(now*1000-cam.t0)/cam.dur);Z=Math.exp(Math.log(cam.from)+(Math.log(cam.to)-Math.log(cam.from))*ease(u));if(u>=1){var cb=cam.cb;cam=null;if(cb)cb();}}
  x.setTransform(D,0,0,D,0,0);var g=x.createRadialGradient(W/2,H*.45,Math.min(W,H)*.08,W/2,H/2,Math.max(W,H)*.8);g.addColorStop(0,T.a);g.addColorStop(.55,T.b);g.addColorStop(1,T.c);x.fillStyle=g;x.fillRect(0,0,W,H);
  x.save();x.translate(W/2,H/2);x.scale(Z,Z);x.translate(-W/2,-H/2);
  WI=ppWaterImg();if(WI){var ke=Math.max(1.0,1.14*(.82+.18*Math.min(1,Z))),ws=Math.max(W/WI.width,H/WI.height)*ke/Z,ww=WI.width*ws,wh=WI.height*ws,am=(ke-1)*.45*Math.min(1,.9/Z),wx=(W-ww)/2+Math.sin(now*.025)*W*am/Z*.9,wy=(H-wh)/2+Math.cos(now*.02)*H*am/Z*.9;x.drawImage(WI,wx,wy,ww,wh);
    if(tone==='day'){x.fillStyle='rgba(255,214,232,.10)';x.fillRect(-W,-H,3*W,3*H);}
    else if(tone==='sunset'){x.globalCompositeOperation='multiply';x.fillStyle='rgb(236,170,170)';x.fillRect(-W,-H,3*W,3*H);x.globalCompositeOperation='source-over';x.fillStyle='rgba(240,120,110,.22)';x.fillRect(-W,-H,3*W,3*H);}
    else{x.globalCompositeOperation='multiply';x.fillStyle='rgb(72,82,160)';x.fillRect(-W,-H,3*W,3*H);x.globalCompositeOperation='source-over';x.fillStyle='rgba(6,10,40,.3)';x.fillRect(-W,-H,3*W,3*H);}}
  drawShadows(now);
  /* long swells drifting across the lake, then sun (or moon) sparkling on the crests */
  x.globalCompositeOperation='lighter';[[1,.6,620,0,1],[-.7,.4,380,1,.6]].forEach(function(l){var TZ=l[2],ox=((now*13*l[0])%TZ+TZ)%TZ,oy=((now*7*l[1]+l[3]*90)%TZ+TZ)%TZ,x0=-(W/Z-W)/2-TZ,y0=-(H/Z-H)/2-TZ;x.globalAlpha=T.ga*l[4]*(WI?.55:1);
    for(var i=0;x0+i*TZ-ox<W+(W/Z-W)/2;i++)for(var j=0;y0+j*TZ-oy<H+(H/Z-H)/2;j++)x.drawImage(tile,Math.round(x0+i*TZ-ox),Math.round(y0+j*TZ-oy),TZ+1,TZ+1);});
  x.fillStyle='rgb('+T.gl+')';glint.forEach(function(q){var a=Math.sin(now*q.sp+q.ph);if(a<.55)return;x.globalAlpha=Math.pow((a-.55)/.45,2)*.75*T.gs;x.beginPath();x.ellipse(q.x,q.y,q.l*.5,1.1,0,0,6.2832);x.fill();});
  x.globalCompositeOperation='source-over';x.globalAlpha=1;
  isl.forEach(function(o){drawIsland(o,now);});
  
  if(tone==='day'&&!calm){var bl=small?16:22;ppFlock(flk,now,dt,W,H,bl);ppFlockDraw(x,flk,now,bl);}
  jumps=jumps.filter(function(j){var u=(now-j.t)/j.dur;if(u>=1){if(!j.sp){j.sp=1;splash(j.x+Math.cos(j.a)*j.dist,j.y+Math.sin(j.a)*j.dist,1);}return false;}return true;});jumps.forEach(drawJump);
  if(!calm){if(tone==='night'){var c=Math.round(dt*120);while(c--)rip.push({x:Math.random()*W,y:Math.random()*H,t:now,life:.35+Math.random()*.35,r:1.6+Math.random()*2.6,tiny:1});}
    else if(now>nextDrop){rip.push({x:Math.random()*W,y:Math.random()*H,t:now,life:1.6,r:14+Math.random()*10});nextDrop=now+1.6+Math.random()*2.4;}}
  rip=rip.filter(function(p){var u=(now-p.t)/p.life;if(u>=1)return false;if(u<0)return true;var rr=(p.tiny?.6:2)+p.r*u*(p.tiny?1:p.life>1.3?3:1.4);x.lineWidth=p.tiny?.8:1.4;x.strokeStyle='rgba('+T.gl+','+(.5*(1-u)).toFixed(3)+')';x.beginPath();x.ellipse(p.x,p.y,rr,rr*.86,0,0,6.2832);x.stroke();
    if(u>.2){x.strokeStyle='rgba('+T.gl+','+(.25*(1-u)).toFixed(3)+')';x.beginPath();x.ellipse(p.x,p.y,rr*.55,rr*.47,0,0,6.2832);x.stroke();}return true;});
  drops=drops.filter(function(d){var u=(now-d.t)/d.life;if(u>=1)return false;x.fillStyle='rgba(255,255,255,'+(.85*(1-u)).toFixed(3)+')';x.beginPath();x.arc(d.x+d.vx*u*.8,d.y+d.vy*u*.8-Math.sin(u*Math.PI)*16,1.8*(1-u*.5),0,6.2832);x.fill();return true;});
  x.restore();
  if(tone==='sunset'&&!calm){if(now>nextFlash){nextFlash=now+2.5+Math.random()*4;flash={x:Math.random()*W,y:Math.random()*H,t:now,R:120+Math.random()*120};}
    if(flash){var fu=(now-flash.t)/.6;if(fu>=1)flash=null;else{var fl=fu<.15?1:fu<.25?.3:fu<.35?.8:Math.max(0,1-(fu-.35)/.65),gg=x.createRadialGradient(flash.x,flash.y,0,flash.x,flash.y,flash.R);gg.addColorStop(0,'rgba(255,255,255,'+(.5*fl).toFixed(3)+')');gg.addColorStop(1,'rgba(255,200,190,0)');x.fillStyle=gg;x.fillRect(0,0,W,H);x.fillStyle='rgba(255,236,226,'+(.05*fl).toFixed(3)+')';x.fillRect(0,0,W,H);}}}
  if(T.tint&&!WI){x.fillStyle=T.tint;x.fillRect(0,0,W,H);}
  var gh=Math.max(150,H*.2),gg2=x.createLinearGradient(0,H-gh,0,H);gg2.addColorStop(0,'rgba(18,42,20,0)');gg2.addColorStop(.5,'rgba(16,38,18,'+(tone==='night'?.5:.42)+')');gg2.addColorStop(1,'rgba(12,30,14,'+(tone==='night'?.88:.8)+')');x.fillStyle=gg2;x.fillRect(0,H-gh,W,gh);
  var v=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.4,W/2,H/2,Math.max(W,H)*.78);v.addColorStop(0,'rgba(0,10,12,0)');v.addColorStop(1,'rgba(0,10,12,.45)');x.fillStyle=v;x.fillRect(0,0,W,H);
  if(!calm||cam)requestAnimationFrame(draw);}
/* ---- camera: the dive continues (arriving) and reverses (leaving) ---- */
function camTo(from,to,dur,cb){cam={from:from,to:to,dur:dur,t0:performance.now(),cb:cb};Z=from;if(calm&&!cam.raf){requestAnimationFrame(draw);}}
function arrive(){if(calm)return;Z=.4;veil.style.transition='none';veil.style.opacity=1;requestAnimationFrame(function(){requestAnimationFrame(function(){veil.style.transition='opacity 1s ease-out';veil.style.opacity=0;camTo(.4,1,1500);requestAnimationFrame(draw);});});}
function leave(cb){if(calm){cb();return;}if(o.wrap){o.wrap.style.transition='opacity .35s';o.wrap.style.opacity=0;}veil.style.transition='opacity .5s ease-in .5s';veil.style.opacity=1;camTo(Z,.34,1050,cb);requestAnimationFrame(draw);}
var onDown=function(e){if(Z!==1)return;rip.push({x:e.clientX,y:e.clientY,t:now,life:1.6,r:40});};addEventListener('pointerdown',onDown,{passive:true});
var lp={x:-99,y:-99},onMove=function(e){if(Z!==1||Math.hypot(e.clientX-lp.x,e.clientY-lp.y)<50)return;lp={x:e.clientX,y:e.clientY};rip.push({x:lp.x,y:lp.y,t:now,life:1,r:22});};addEventListener('pointermove',onMove,{passive:true});
var rt,onSize=function(){clearTimeout(rt);rt=setTimeout(function(){setup();if(calm)draw(performance.now());},120);};addEventListener('resize',onSize);
/* the cards: the same shaded billows the home page's main cloud is made of */
function pads(){if(dead)return;o.root.querySelectorAll('.pp-card').forEach(function(c){ppCloudPad(c,tone);});}
var ro=null;if(window.ResizeObserver){ro=new ResizeObserver(pads);o.root.querySelectorAll('.pp-card').forEach(function(c){ro.observe(c);});}
pads();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(pads);addEventListener('resize',pads);
setup();if(calm){draw(performance.now());}else requestAnimationFrame(draw);
return{arrive:arrive,leave:leave,pads:pads,stop:function(){dead=true;removeEventListener('pointerdown',onDown);removeEventListener('pointermove',onMove);removeEventListener('resize',onSize);removeEventListener('resize',pads);if(ro)ro.disconnect();}};}


/* ---- the standalone lake page (opened directly, or after a reload) ---- */
(function(){var doc=document.documentElement,tone=doc.dataset.tone||'day',wrap=document.getElementById('MainContent'),home=document.querySelector('.pp-logo').href;wrap.dataset.t=tone;
  var L=ppLakeMake({cv:document.getElementById('pond'),veil:document.querySelector('.pp-veil'),root:wrap,wrap:wrap,tone:tone});if(!L)return;
  if(doc.classList.contains('zin'))L.arrive();
  var going=0;function leave(){if(going)return;going=1;try{sessionStorage.setItem('pp-out',document.body.dataset.page||'about');}catch(e){}doc.classList.add('pp-leaving');L.leave(function(){location.href=home;});}
  document.getElementById('ppMenu').addEventListener('click',leave);
  document.querySelector('.pp-logo').addEventListener('click',function(e){if(e.metaKey||e.ctrlKey||e.shiftKey)return;e.preventDefault();leave();});
  /* the clock button cycles: time of day, then day, sunset, night */
  document.getElementById('ppTheme').addEventListener('click',function(){var sky='auto',th='';try{sky=localStorage.getItem('pp-sky')||'auto';th=localStorage.getItem('pp-theme')||'';}catch(e){}
    var cur=sky==='auto'?'auto':sky==='sunset'?'sunset':th==='night'?'night':'day',nx={auto:'day',day:'sunset',sunset:'night',night:'auto'}[cur];
    try{localStorage.setItem('pp-sky',nx==='auto'?'auto':nx==='sunset'?'sunset':'storm');if(nx==='day'||nx==='night')localStorage.setItem('pp-theme',nx);}catch(e){}location.reload();});
  addEventListener('pageshow',function(e){if(e.persisted)location.reload();});
})();

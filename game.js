const $=i=>document.getElementById(i),R=(a,b)=>a+Math.random()*(b-a),cv=$('c');
const rd=new THREE.WebGLRenderer({canvas:cv,antialias:false});let PR=1;
const sc=new THREE.Scene();sc.background=new THREE.Color(0x8fb4c9);sc.fog=new THREE.Fog(0x8fb4c9,40,230);
const cam=new THREE.PerspectiveCamera(70,1,.1,400);
function rs(){rd.setPixelRatio(Math.min(devicePixelRatio,PR));rd.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',rs);rs();
sc.add(new THREE.HemisphereLight(0xffffff,0x445533,.95));
const sun=new THREE.DirectionalLight(0xffffff,.6);sun.position.set(50,100,30);sc.add(sun);
const mat=c=>new THREE.MeshLambertMaterial({color:c}),ISL=300;
const flat=(g,c,y,rz)=>{const m=new THREE.Mesh(g,mat(c));m.rotation.x=-Math.PI/2;m.rotation.z=rz||0;m.position.y=y;sc.add(m);return m};
flat(new THREE.PlaneGeometry(1400,1400),0x1f5f8b,-.3);
flat(new THREE.CircleGeometry(ISL,48),0x4f7a3a,0);
flat(new THREE.CircleGeometry(ISL+6,48),0xcdb98a,-.1);
flat(new THREE.PlaneGeometry(8,ISL*1.9),0x33353a,.03);
flat(new THREE.PlaneGeometry(8,ISL*1.9),0x33353a,.04,Math.PI/2);
const obs=[];
for(let i=0;i<18;i++){
  const x=R(-220,220),z=R(-220,220);if(Math.abs(x)<14||Math.abs(z)<14)continue;
  const w=R(9,18),d=R(9,18),h=R(5,14),b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat([0x6b6e66,0x8a8574,0x57605a][i%3]));
  b.position.set(x,h/2,z);sc.add(b);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(w+1,.8,d+1),mat(0x3a3d38));roof.position.set(x,h+.4,z);sc.add(roof);
  obs.push({x,z,r:Math.max(w,d)/2+.8});
}
for(let i=0;i<110;i++){
  const a=R(0,6.28),d=Math.sqrt(Math.random())*(ISL-15),x=Math.cos(a)*d,z=Math.sin(a)*d;
  if(Math.abs(x)<9||Math.abs(z)<9)continue;
  const t=new THREE.Mesh(new THREE.CylinderGeometry(.3,.4,2.4,6),mat(0x5a3d22));t.position.set(x,1.2,z);sc.add(t);
  const l=new THREE.Mesh(new THREE.ConeGeometry(2.2,5.5,7),mat(0x2d5a2a));l.position.set(x,4.6,z);sc.add(l);
  obs.push({x,z,r:.8});
}
const zr=new THREE.Mesh(new THREE.CylinderGeometry(1,1,70,48,1,true),new THREE.MeshBasicMaterial({color:0xe03a20,transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false}));
zr.position.y=35;sc.add(zr);
function mkChar(c){
  const g=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(.8,1.1,.5),mat(c));b.position.y=.85;
  const h=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),mat(0xd8b48a));h.position.y=1.65;
  const gun=new THREE.Mesh(new THREE.BoxGeometry(.12,.14,.8),mat(0x151515));gun.position.set(.28,1.1,-.5);
  g.add(b,h,gun);sc.add(g);return g;
}
const inp={jx:0,jy:0,fire:0,jump:0,sprint:0,crouch:0},keys={};
const WP=[{n:'PISTOL',mag:15,rate:.3,dmg:28,pel:1,sp:0,rel:1,c:0},{n:'RIFLE',mag:30,rate:.12,dmg:20,pel:1,sp:0,rel:1.4,c:0x4a90e0},{n:'SHOTGUN',mag:6,rate:.8,dmg:14,pel:7,sp:.07,rel:2,c:0xe07030},{n:'SNIPER',mag:5,rate:1.2,dmg:90,pel:1,sp:0,rel:2.2,c:0xb040e0}];
let loot=[];
let run=false,P,bots=[],zn,zt,tm=0,yaw=0,pit=.25,SENS=1,T=[];
const pm=mkChar(0xd9a441);pm.visible=false;
function msg(t){const m=$('msg');m.textContent=t;m.style.opacity=1;clearTimeout(msg.t);msg.t=setTimeout(()=>m.style.opacity=0,2200)}
function show(id){for(const s of['menu','settings','end'])$(s).classList.toggle('hide',s!==id);$('hud').classList.toggle('hide',id!=='')}
function start(){
  for(const b of bots)sc.remove(b.m);bots=[];
  const a=R(0,6.28);P={x:Math.cos(a)*170,z:Math.sin(a)*170,y:0,vy:0,hp:100,w:0,own:[1,0,0,0],am:[15,0,0,0],rs:[60,0,0,0],rel:0,cd:0,k:0,m:pm};
  yaw=Math.atan2(P.x,P.z);pit=.25;pm.visible=true;
  for(let i=0;i<10;i++){const q=R(0,6.28),d=R(40,250);bots.push({x:Math.cos(q)*d,z:Math.sin(q)*d,hp:100,cd:R(.5,1.5),yaw:0,w:null,k:0,m:mkChar(0xa83a2a)})}
  for(const l of loot)sc.remove(l.m);loot=[];
  for(let n=0;loot.length<50&&n<600;n++){
    const a=R(0,6.28),d=Math.sqrt(Math.random())*(ISL-20),x=Math.cos(a)*d,z=Math.sin(a)*d;
    if(obs.some(b=>Math.hypot(x-b.x,z-b.z)<b.r+1.2))continue;
    const i=loot.length,t=i<12?'med':i<26?'ammo':1+i%3,wp=typeof t==='number',col=t==='med'?0x35c46a:t==='ammo'?0xe0c030:WP[t].c;
    const m=new THREE.Group(),bx=new THREE.Mesh(new THREE.BoxGeometry(wp?1:.7,wp?.6:.7,wp?1.4:.7),mat(col));m.add(bx);
    if(wp){const bm=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,7,6),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.45}));bm.position.y=3.5;m.add(bm)}
    m.position.set(x,0,z);sc.add(m);loot.push({x,z,t,m,on:true});
  }
  T=[P,...bots];zn={x:0,z:0,r:ISL*.95,tr:ISL*.95,tx:0,tz:0};zt=25;tm=0;
  inp.sprint=inp.crouch=0;$('bS').classList.remove('on');$('bC').classList.remove('on');
  run=true;show('');msg('DROP ZONE CLEAR. FIND THE LAST SURVIVOR.');
}
function end(w,rank){run=false;pm.visible=false;$('et').textContent=w?'VICTORY':'ELIMINATED';$('et').style.color=w?'#e0a526':'#c8402a';
  $('es').textContent=(w?'Last one standing. ':'You placed #'+rank+' of 11. ')+'Kills: '+P.k;show('end')}
function push(o,r){
  for(const b of obs){const dx=o.x-b.x,dz=o.z-b.z,d=Math.hypot(dx,dz),m=b.r+r;if(d<m&&d>0){o.x=b.x+dx/d*m;o.z=b.z+dz/d*m}}
  const d=Math.hypot(o.x,o.z);if(d>ISL-4){o.x*=(ISL-4)/d;o.z*=(ISL-4)/d}
}
function hit(t,d,by){
  if(t.hp<=0)return;t.hp-=d;
  if(t===P){const v=$('vig');v.style.opacity=.9;setTimeout(()=>v.style.opacity=0,180)}
  if(t.hp<=0&&t!==P){t.m.visible=false;by.k++;if(by===P)msg('ENEMY ELIMINATED')}
}
function blocked(o,a,t){for(let s=2;s<t;s+=1.5){const x=o.x+a.x*s,z=o.z+a.z*s;for(const b of obs)if(Math.hypot(x-b.x,z-b.z)<b.r*.9&&o.y+a.y*s<(b.r>1.5?10:3))return true}return false}
function tracer(f,to){
  const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([f,to]),new THREE.LineBasicMaterial({color:0xffd34d}));
  sc.add(l);setTimeout(()=>{sc.remove(l);l.geometry.dispose()},60);
}
const aim=new THREE.Vector3(),org=new THREE.Vector3();
function fire(){
  const w=WP[P.w];if(P.cd>0||P.rel>0)return;if(P.am[P.w]<=0){reload();return}
  P.cd=w.rate;P.am[P.w]--;
  const gun=new THREE.Vector3(P.x,P.y+1.1,P.z);let any=false;
  for(let k=0;k<w.pel;k++){
    const d=aim.clone();if(w.sp){d.x+=R(-w.sp,w.sp);d.y+=R(-w.sp,w.sp);d.z+=R(-w.sp,w.sp);d.normalize()}
    let best=null,bt=150;
    for(const b of bots){if(b.hp<=0)continue;
      const cx=b.x-org.x,cy=b.y0-org.y,cz=b.z-org.z,t=cx*d.x+cy*d.y+cz*d.z;
      if(t>0&&t<bt&&cx*cx+cy*cy+cz*cz-t*t<.64&&!blocked(org,d,t)){best=b;bt=t}}
    if(best){hit(best,w.dmg,P);any=true}
    tracer(gun,org.clone().addScaledVector(d,best?bt:60));
  }
  if(any){const c=$('cross');c.classList.add('hit');setTimeout(()=>c.classList.remove('hit'),90)}
}
function swap(){let i=P.w;do{i=(i+1)%4}while(!P.own[i]);P.w=i;P.rel=0;msg(WP[i].n)}
function take(it){
  if(it.t==='med'){if(P.hp>=100)return;P.hp=Math.min(100,P.hp+40);msg('+40 HEALTH')}
  else if(it.t==='ammo'){for(let i=0;i<4;i++)if(P.own[i])P.rs[i]+=WP[i].mag*2;msg('AMMO PICKED UP')}
  else{const i=it.t;if(!P.own[i]){P.own[i]=1;P.am[i]=WP[i].mag}P.rs[i]+=WP[i].mag*2;P.w=i;P.rel=0;msg(WP[i].n+' EQUIPPED')}
  it.on=false;it.m.visible=false;
}
function reload(){const w=WP[P.w];if(P.rel>0||P.am[P.w]>=w.mag||P.rs[P.w]<=0)return;P.rel=w.rel;msg('RELOADING')}
function botAI(b,dt){
  if(b.hp<=0)return;
  let tg=null,bd=70;
  for(const o of T){if(o===b||o.hp<=0)continue;const d=Math.hypot(o.x-b.x,o.z-b.z);if(d<bd){bd=d;tg=o}}
  const zd=Math.hypot(b.x-zn.x,b.z-zn.z);let ax,az;
  if(zd>zn.r-12){ax=zn.x-b.x;az=zn.z-b.z}
  else if(tg){ax=tg.x-b.x;az=tg.z-b.z;if(bd<18){const q=ax;ax=-az;az=q}}
  else{if(!b.w||Math.hypot(b.w.x-b.x,b.w.z-b.z)<3){const a=R(0,6.28),d=R(0,zn.r*.8);b.w={x:zn.x+Math.cos(a)*d,z:zn.z+Math.sin(a)*d}}ax=b.w.x-b.x;az=b.w.z-b.z}
  const l=Math.hypot(ax,az)||1;b.x+=ax/l*4*dt;b.z+=az/l*4*dt;push(b,.5);
  if(tg){b.yaw=Math.atan2(-(tg.x-b.x),-(tg.z-b.z));
    if((b.cd-=dt)<=0&&bd<55){b.cd=R(.5,1);const o={x:b.x,y:1.2,z:b.z},a={x:(tg.x-b.x)/bd,y:0,z:(tg.z-b.z)/bd};
      if(!blocked(o,a,bd)){tracer(new THREE.Vector3(b.x,1.2,b.z),new THREE.Vector3(tg.x,1.2,tg.z));if(Math.random()<.5-bd/160)hit(tg,8,b)}}
  }else b.yaw=Math.atan2(-ax,-az);
  if(zd>zn.r)b.hp-=4*dt;
}
function step(dt){
  tm+=dt;
  if(tm>zt){zt+=25;zn.tr=Math.max(18,zn.tr*.62);const d=(zn.r-zn.tr)*.5*Math.random(),a=R(0,6.28);zn.tx=zn.x+Math.cos(a)*d;zn.tz=zn.z+Math.sin(a)*d;msg('ZONE SHRINKING')}
  zn.r+=Math.sign(zn.tr-zn.r)*Math.min(Math.abs(zn.tr-zn.r),1.6*dt);zn.x+=(zn.tx-zn.x)*Math.min(1,dt*.2);zn.z+=(zn.tz-zn.z)*Math.min(1,dt*.2);
  zr.position.x=zn.x;zr.position.z=zn.z;zr.scale.set(zn.r,1,zn.r);
  let fw=-inp.jy,st=inp.jx;
  if(keys.w)fw++;if(keys.s)fw--;if(keys.d)st++;if(keys.a)st--;
  const l=Math.hypot(fw,st);if(l>1){fw/=l;st/=l}
  const sp=inp.crouch?2.6:inp.sprint?9:5.5,sy=Math.sin(yaw),cy=Math.cos(yaw);
  P.x+=(-sy*fw+cy*st)*sp*dt;P.z+=(-cy*fw-sy*st)*sp*dt;push(P,.5);
  if((inp.jump||keys[' '])&&P.y<=0){P.vy=7.5}inp.jump=0;
  P.vy-=22*dt;P.y=Math.max(0,P.y+P.vy*dt);if(P.y===0&&P.vy<0)P.vy=0;
  P.cd-=dt;
  if(P.rel>0&&(P.rel-=dt)<=0){const i=P.w,n=Math.min(WP[i].mag-P.am[i],P.rs[i]);P.am[i]+=n;P.rs[i]-=n;P.rel=0}
  for(const it of loot)if(it.on&&Math.hypot(P.x-it.x,P.z-it.z)<1.8)take(it);
  if(inp.fire||keys.f)fire();
  if(Math.hypot(P.x-zn.x,P.z-zn.z)>zn.r)hit(P,4*dt,P);
  for(const b of bots)botAI(b,dt);
  const al=bots.filter(b=>b.hp>0).length+(P.hp>0?1:0);
  $('alive').textContent='ALIVE '+al;$('kills').textContent='KILLS '+P.k;$('hp').style.width=Math.max(0,P.hp)+'%';
  $('ammo').textContent=WP[P.w].n+'  '+(P.rel>0?'RELOADING':P.am[P.w]+' / '+P.rs[P.w]);
  if(P.hp<=0)end(false,al+1);else if(al===1)end(true,1);
}
function render(){
  if(run){
    for(const it of loot){it.m.rotation.y+=.03;it.m.children[0].position.y=.8+Math.sin(performance.now()/300+it.x)*.15}
    pm.position.set(P.x,P.y,P.z);pm.rotation.y=yaw;pm.scale.y=inp.crouch?.7:1;
    for(const b of bots){b.m.position.set(b.x,0,b.z);b.m.rotation.y=b.yaw;b.y0=1}
    const cp=Math.cos(pit),hy=P.y+(inp.crouch?1.2:1.7);
    aim.set(-Math.sin(yaw)*cp,-Math.sin(pit),-Math.cos(yaw)*cp);
    cam.position.set(P.x-aim.x*5,hy-aim.y*5+.6,P.z-aim.z*5);
    cam.lookAt(P.x+aim.x*30,hy+aim.y*30,P.z+aim.z*30);
    org.copy(cam.position);
  }else{const t=performance.now()/9000;cam.position.set(Math.cos(t)*150,60,Math.sin(t)*150);cam.lookAt(0,0,0)}
  rd.render(sc,cam);
}
let last=performance.now();
(function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;if(run)step(dt);render();requestAnimationFrame(loop)})(last);
for(const b of bots)b.y0=1;
// Input
function hold(id,k){const e=$(id);e.onpointerdown=v=>{v.preventDefault();e.setPointerCapture(v.pointerId);inp[k]=1;e.classList.add('on')};e.onpointerup=e.onpointercancel=()=>{if(k!=='jump')inp[k]=0;e.classList.remove('on')}}
hold('bF','fire');hold('bJ','jump');
function tog(id,k,o){$(id).onclick=()=>{inp[k]^=1;if(inp[k])inp[o]=0;$('bS').classList.toggle('on',!!inp.sprint);$('bC').classList.toggle('on',!!inp.crouch)}}
tog('bS','sprint','crouch');tog('bC','crouch','sprint');$('bR').onpointerdown=()=>run&&reload();$('bW').onpointerdown=()=>run&&swap();
const jo=$('joy'),kn=$('knob');let jid=null;
function jm(e){const b=jo.getBoundingClientRect(),dx=e.clientX-b.left-b.width/2,dy=e.clientY-b.top-b.height/2,m=b.width/2,d=Math.min(1,Math.hypot(dx,dy)/m),a=Math.atan2(dy,dx);
  inp.jx=Math.cos(a)*d;inp.jy=Math.sin(a)*d;kn.style.transform=`translate(calc(-50% + ${Math.cos(a)*d*m*.6}px),calc(-50% + ${Math.sin(a)*d*m*.6}px))`}
jo.onpointerdown=e=>{jid=e.pointerId;jo.setPointerCapture(jid);jm(e)};
jo.onpointermove=e=>{if(e.pointerId===jid)jm(e)};
jo.onpointerup=jo.onpointercancel=()=>{jid=null;inp.jx=inp.jy=0;kn.style.transform='translate(-50%,-50%)'};
let lid=null,lx=0,ly=0;
cv.onpointerdown=e=>{if(lid===null){lid=e.pointerId;lx=e.clientX;ly=e.clientY;cv.setPointerCapture(lid)}};
cv.onpointermove=e=>{if(e.pointerId===lid){const s=.005*SENS;yaw-=(e.clientX-lx)*s;pit=Math.max(-.5,Math.min(1,pit+(e.clientY-ly)*s));lx=e.clientX;ly=e.clientY}};
cv.onpointerup=cv.onpointercancel=e=>{if(e.pointerId===lid)lid=null};
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=1;
  if(k==='shift'){inp.sprint=1;inp.crouch=0}if(k==='c'){inp.crouch^=1;inp.sprint=0}if(k==='r'&&run)reload();if(k==='q'&&run)swap();if(run&&'1234'.includes(k)&&P.own[+k-1]){P.w=+k-1;P.rel=0;msg(WP[P.w].n)}
  $('bS').classList.toggle('on',!!inp.sprint);$('bC').classList.toggle('on',!!inp.crouch)});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();delete keys[k];if(k==='shift'){inp.sprint=0;$('bS').classList.remove('on')}});
// Menus
$('play').onclick=$('again').onclick=start;$('set').onclick=()=>show('settings');$('back').onclick=$('tomenu').onclick=()=>show('menu');
$('sens').oninput=e=>SENS=+e.target.value;
$('qual').onclick=e=>{PR=PR===1?2:1;e.target.textContent='GRAPHICS: '+(PR===1?'LOW':'HIGH');rs()};
show('menu');

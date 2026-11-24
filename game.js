import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const loading=document.querySelector('#loading'), menu=document.querySelector('#menu'), hud=document.querySelector('#hud'), endPanel=document.querySelector('#end');
const aliveEl=document.querySelector('#alive'), zoneEl=document.querySelector('#zone'), killsEl=document.querySelector('#kills'), message=document.querySelector('#message');
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x8ec5d4); scene.fog=new THREE.Fog(0x8ec5d4,75,180);
const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,300);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.7)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xdaf5ff,0x526044,2));
const sun=new THREE.DirectionalLight(0xfff0d2,2.2); sun.position.set(-35,60,25); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); scene.add(sun);
const mat=(c,r=.9)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(220,220),mat(0x628b45)); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const water=new THREE.Mesh(new THREE.PlaneGeometry(500,500),mat(0x347f9c)); water.rotation.x=-Math.PI/2; water.position.y=-.7; scene.add(water);
// Roads
function road(x,z,w,d){const m=new THREE.Mesh(new THREE.BoxGeometry(w,.08,d),mat(0x454b4b));m.position.set(x,.05,z);scene.add(m)}
road(0,0,12,210); road(0,0,210,10);
for(let i=-90;i<=90;i+=18){const stripe=new THREE.Mesh(new THREE.BoxGeometry(.25,.09,5),mat(0xe8dfb0));stripe.position.set(0,.11,i);scene.add(stripe)}
// Buildings
function building(x,z,w,d,h,color=0xb7a184){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));body.position.y=h/2;body.castShadow=true;body.receiveShadow=true;g.add(body);const roof=new THREE.Mesh(new THREE.BoxGeometry(w+0.5,.35,d+0.5),mat(0x39434a));roof.position.y=h+.15;g.add(roof);g.position.set(x,0,z);scene.add(g);return g}
[[-25,-28,12,10,8], [26,-32,14,11,10],[-34,26,11,13,7],[33,30,13,10,9],[0,55,18,12,8],[55,0,10,15,7],[-58,-4,14,12,9]].forEach(v=>building(...v));
// Trees
function tree(x,z,s=1){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.25*s,.38*s,2.3*s,7),mat(0x69452b));trunk.position.set(x,1.15*s,z);trunk.castShadow=true;scene.add(trunk);const crown=new THREE.Mesh(new THREE.ConeGeometry(1.8*s,4*s,7),mat(0x286b3c));crown.position.set(x,3.5*s,z);crown.castShadow=true;scene.add(crown)}
for(let i=0;i<65;i++){let x=(Math.random()-.5)*180,z=(Math.random()-.5)*180;if(Math.abs(x)<12||Math.abs(z)<10)continue;tree(x,z,.7+Math.random()*.7)}
// Safe zone ring
const zone=new THREE.Mesh(new THREE.RingGeometry(0.985,1,128),new THREE.MeshBasicMaterial({color:0x58d9ff,side:THREE.DoubleSide}));zone.rotation.x=-Math.PI/2;zone.position.y=.18;scene.add(zone);
let zoneRadius=92, zoneStart=performance.now(), playing=false, kills=0, ammo=30, reserve=120, yaw=0, pitch=-.18, moveX=0,moveZ=0, sprint=false, firing=false, lastShot=0;
const player=new THREE.Group();scene.add(player);
const torso=new THREE.Mesh(new THREE.BoxGeometry(.85,1.1,.45),mat(0x263f69));torso.position.y=1.35;torso.castShadow=true;player.add(torso);
const head=new THREE.Mesh(new THREE.SphereGeometry(.32,12,10),mat(0xc58f68));head.position.y=2.12;head.castShadow=true;player.add(head);
const legs=[];for(let x of [-.23,.23]){const l=new THREE.Mesh(new THREE.BoxGeometry(.28,.8,.32),mat(0x252a30));l.position.set(x,.45,0);player.add(l);legs.push(l)}
player.position.set(0,0,12);
const bots=[];
function makeBot(x,z){const b=new THREE.Group();const shirt=new THREE.Mesh(new THREE.BoxGeometry(.8,1,.42),mat([0x8c4435,0x526e45,0x6a568c][Math.floor(Math.random()*3)]));shirt.position.y=1.3;b.add(shirt);const h=new THREE.Mesh(new THREE.SphereGeometry(.29,10,8),mat(0xb98a68));h.position.y=2;b.add(h);b.position.set(x,0,z);b.userData={hp:100,dir:Math.random()*6.28,shot:0};scene.add(b);bots.push(b)}
for(let i=0;i<10;i++)makeBot((Math.random()-.5)*130,(Math.random()-.5)*130);
const clock=new THREE.Clock();
function setCamera(){const target=new THREE.Vector3(player.position.x,1.6,player.position.z);const dist=7;const offset=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch)*dist,2.4-Math.sin(pitch)*dist,Math.cos(yaw)*Math.cos(pitch)*dist);camera.position.copy(target).add(offset);camera.lookAt(target)}
function start(){playing=true;menu.classList.add('hidden');endPanel.classList.add('hidden');hud.classList.remove('hidden');player.position.set(0,0,12);kills=0;ammo=30;reserve=120;zoneRadius=92;zoneStart=performance.now();setCamera();message.textContent='Stay inside the blue safe zone';}
document.querySelector('#playBtn').onclick=start;document.querySelector('#againBtn').onclick=()=>location.reload();
function finish(win){playing=false;hud.classList.add('hidden');endPanel.classList.remove('hidden');document.querySelector('#endText').textContent=win?'BOOYAH! You survived.':'Match over — try again!'}
function shoot(){if(!playing||ammo<=0)return;const now=performance.now();if(now-lastShot<180)return;lastShot=now;ammo--;const dir=new THREE.Vector3();camera.getWorldDirection(dir);const ray=new THREE.Raycaster(camera.position,dir,0,65);const hits=ray.intersectObjects(bots,true);if(hits.length){let obj=hits[0].object;let bot=bots.find(b=>b===obj||b.children.includes(obj));if(bot){bot.userData.hp-=50;if(bot.userData.hp<=0){scene.remove(bot);bots.splice(bots.indexOf(bot),1);kills++;killsEl.textContent='KILLS '+kills}}}}
document.querySelector('#fireBtn').addEventListener('pointerdown',e=>{e.preventDefault();shoot()});
document.querySelector('#jumpBtn').onclick=()=>{if(playing&&player.position.y<.05)player.userData.vy=7};
document.querySelector('#sprintBtn').addEventListener('pointerdown',()=>sprint=true);document.querySelector('#sprintBtn').addEventListener('pointerup',()=>sprint=false);
window.addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='Space'&&playing&&player.position.y<.05)player.userData.vy=7;if(e.code==='KeyR'){ammo=30;reserve=Math.max(0,reserve-30)}if(e.code==='KeyF')shoot()});
window.addEventListener('keyup',e=>keys[e.code]=false);const keys={};
let lookPointer=null,lastPX=0,lastPY=0;
renderer.domElement.addEventListener('pointerdown',e=>{if(e.clientX>innerWidth*.42){lookPointer=e.pointerId;lastPX=e.clientX;lastPY=e.clientY}});
window.addEventListener('pointermove',e=>{if(lookPointer===e.pointerId&&playing){yaw-=(e.clientX-lastPX)*.005;pitch=Math.max(-.65,Math.min(.35,pitch+(e.clientY-lastPY)*.003));lastPX=e.clientX;lastPY=e.clientY}});
window.addEventListener('pointerup',e=>{if(lookPointer===e.pointerId)lookPointer=null});
// Virtual joystick
const joy=document.querySelector('#joystick'),stick=document.querySelector('#stick');let joyId=null;
joy.addEventListener('pointerdown',e=>{joyId=e.pointerId;joy.setPointerCapture(joyId);joyMove(e)});
joy.addEventListener('pointermove',e=>{if(e.pointerId===joyId)joyMove(e)});
function joyMove(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const len=Math.hypot(dx,dy),max=38;if(len>max){dx=dx/len*max;dy=dy/len*max}stick.style.transform=`translate(${dx}px,${dy}px)`;moveX=dx/max;moveZ=dy/max}
function resetJoy(){joyId=null;moveX=moveZ=0;stick.style.transform='translate(0,0)'}joy.addEventListener('pointerup',resetJoy);joy.addEventListener('pointercancel',resetJoy);
function update(dt){if(!playing)return;const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-moveZ;const side=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+moveX;const speed=sprint||keys.ShiftLeft?12:7;const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));const r=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));const v=f.multiplyScalar(forward).add(r.multiplyScalar(side));if(v.length()>1)v.normalize();player.position.addScaledVector(v,speed*dt);player.position.x=THREE.MathUtils.clamp(player.position.x,-102,102);player.position.z=THREE.MathUtils.clamp(player.position.z,-102,102);if(v.lengthSq()>.01)player.rotation.y=Math.atan2(v.x,v.z);
player.userData.vy=(player.userData.vy||0)-18*dt;player.position.y=Math.max(0,player.position.y+(player.userData.vy||0)*dt);if(player.position.y===0)player.userData.vy=0;
legs.forEach((l,i)=>l.rotation.x=Math.sin(performance.now()*.012+i*Math.PI)*Math.min(1,v.length()*1.5));
const elapsed=(performance.now()-zoneStart)/1000;if(elapsed>25)zoneRadius=Math.max(18,zoneRadius-dt*1.15);zone.scale.set(zoneRadius,zoneRadius,1);const dist=Math.hypot(player.position.x,player.position.z);if(dist>zoneRadius){player.userData.zoneDmg=(player.userData.zoneDmg||0)+dt;if(player.userData.zoneDmg>3){message.textContent='OUTSIDE SAFE ZONE! Move inside!';if(player.userData.zoneDmg>18)finish(false)}}else{player.userData.zoneDmg=0;message.textContent='Stay inside the blue safe zone'}
zoneEl.textContent='ZONE '+Math.round(zoneRadius/92*100)+'%';aliveEl.textContent='ALIVE '+(bots.length+1);killsEl.textContent='KILLS '+kills;
bots.forEach((b,i)=>{b.userData.dir+=Math.sin(performance.now()*.0005+i)*dt*.3;b.position.x+=Math.sin(b.userData.dir)*dt*2;b.position.z+=Math.cos(b.userData.dir)*dt*2;const d=b.position.distanceTo(player.position);if(d<22&&performance.now()-b.userData.shot>1800){b.userData.shot=performance.now();player.userData.botHits=(player.userData.botHits||0)+1;if(player.userData.botHits>14)finish(false)}});
if(bots.length===0)finish(true);setCamera()}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);update(dt);renderer.render(scene,camera)}animate();
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
loading.remove();
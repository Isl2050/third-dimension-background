const hero=document.querySelector('.hero-journey'),video=document.querySelector('.hero-video'),frame=document.querySelector('.film-frame');
const header=document.querySelector('.site-header'),toggle=document.querySelector('.film-toggle'),fill=document.querySelector('.scrub-progress-fill');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
document.body.insertBefore(frame,document.querySelector('main'));document.body.append(toggle);
video.muted=true;video.loop=true;video.pause();
const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:false});
canvas.className='hero-sequence';frame.insertBefore(canvas,frame.querySelector('.film-shade'));
const total=201,duration=40.133,cache=new Map(),pending=new Set();
let mode='scroll',target=0,scheduled=false,userPaused=reduce.matches,lastButton='',lastScene=-1,lastDraw=-1;
const titles=['فوق السحب','القصر من الأعلى','واجهة القصر','الصالة الكبرى','المجلس الملكي','غرفة الضيوف','الحديقة وحمام السباحة','الواجهة الخلفية','THIRD DIMENSION CONSULTANCY','من النهار إلى الليل'];
const times=[0,2,6,9,11.5,16,21,24,28,32];
function scene(time){let i=0;for(let n=1;n<times.length&&time>=times[n];n++)i=n;if(i===lastScene)return;lastScene=i;document.getElementById('scene-title').textContent=titles[i];document.getElementById('scene-count').textContent=`${String(i+1).padStart(2,'0')} / 10`;}
function draw(){
 if(!cache.size)return;let i=target;if(!cache.has(i))i=[...cache.keys()].sort((a,b)=>Math.abs(a-target)-Math.abs(b-target))[0];
 if(i===lastDraw)return;const img=cache.get(i),s=Math.max(canvas.width/img.width,canvas.height/img.height),w=img.width*s,h=img.height*s;
 ctx.drawImage(img,(canvas.width-w)/2,(canvas.height-h)/2,w,h);lastDraw=i;canvas.classList.add('is-ready');
}
function loadFrames(){
 if(mode!=='scroll'||document.hidden)return;const wanted=[target];
 for(let d=1;d<=8;d++){if(target+d<total)wanted.push(target+d);if(target-d>=0)wanted.push(target-d);}
 for(const i of wanted){
  if(pending.size>=3)break;if(cache.has(i)||pending.has(i))continue;pending.add(i);
  const img=new Image();img.decoding='async';
  img.onload=async()=>{try{await img.decode();}catch{}pending.delete(i);cache.set(i,img);
   // Bound decoded memory; compressed images remain in Chrome's HTTP cache.
   while(cache.size>24){const far=[...cache.keys()].sort((a,b)=>Math.abs(b-target)-Math.abs(a-target))[0];cache.delete(far);}
   if(mode==='scroll'){draw();loadFrames();}
  };
  img.onerror=()=>pending.delete(i);img.src=`${frame.dataset.framesRoot}${String(i+1).padStart(3,'0')}.jpg`;
 }
}
function resize(){canvas.width=Math.min(innerWidth,1280);canvas.height=Math.round(canvas.width*innerHeight/innerWidth);lastDraw=-1;draw();schedule();}
function buttonState(){const scroll=mode==='scroll';toggle.disabled=scroll;const text=scroll?'التحكم في الهيرو بالسكرول':video.paused?'تشغيل الخلفية ▶':'إيقاف الخلفية Ⅱ';if(text===lastButton)return;lastButton=text;toggle.textContent=text;toggle.setAttribute('aria-label',scroll?'تحكم في الهيرو بالتمرير':video.paused?'تشغيل فيديو الخلفية':'إيقاف فيديو الخلفية');}
function playback(){if(mode==='scroll'||userPaused||document.hidden)video.pause();else video.play().catch(buttonState);buttonState();}
function update(){
 scheduled=false;const rect=hero.getBoundingClientRect(),p=Math.max(0,Math.min(1,-rect.top/Math.max(hero.offsetHeight-innerHeight,1))),next=rect.bottom<=0?'background':'scroll';target=Math.round(p*(total-1));
 hero.style.setProperty('--progress',p.toFixed(4));fill.style.transform=`scaleX(${p})`;header.classList.toggle('is-scrolled',scrollY>28);document.body.classList.toggle('is-background-film',next==='background');
 if(mode!==next){mode=next;canvas.classList.remove('is-video');playback();if(mode==='background'&&video.readyState>=3)canvas.classList.add('is-video');}
 if(mode==='scroll'){draw();loadFrames();scene(p*duration);}buttonState();
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
video.addEventListener('playing',()=>{if(mode==='background')canvas.classList.add('is-video');});
video.addEventListener('timeupdate',()=>{if(mode==='background')scene(video.currentTime);});video.addEventListener('play',buttonState);video.addEventListener('pause',buttonState);
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',resize);
document.addEventListener('visibilitychange',()=>{playback();schedule();});reduce.addEventListener('change',()=>{userPaused=reduce.matches;playback();schedule();});
toggle.addEventListener('click',()=>{if(mode==='background'){userPaused=!video.paused;playback();}});
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.mobile-nav');
function closeMenu(){nav.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','فتح القائمة');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.hidden=!open;menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'إغلاق القائمة':'فتح القائمة');});nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.getElementById('year').textContent=new Date().getFullYear();resize();update();

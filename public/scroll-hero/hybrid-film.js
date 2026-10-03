const hero=document.querySelector('.hero-journey');
const video=document.querySelector('.hero-video');
const header=document.querySelector('.site-header');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const toggle=document.querySelector('.film-toggle');
const fill=document.querySelector('.scrub-progress-fill');
const frame=document.querySelector('.film-frame');
document.body.insertBefore(frame,document.querySelector('main'));
document.body.append(toggle);
video.muted=true;
video.loop=true;
video.pause();
const titles=['فوق السحب','القصر من الأعلى','واجهة القصر','الصالة الكبرى','المجلس الملكي','غرفة الضيوف','الحديقة وحمام السباحة','الواجهة الخلفية','THIRD DIMENSION CONSULTANCY','من النهار إلى الليل'];
const times=[0,2,6,9,11.5,16,21,24,28,32];
let mode='scroll',target=0,userPaused=reduce.matches,lastScene=-1,scheduled=false;
let seekTimer=0,lastSeek=0,lastButton='';
function scene(){
  let index=0;
  for(let i=1;i<times.length&&video.currentTime>=times[i];i++)index=i;
  if(index===lastScene)return;
  document.getElementById('scene-title').textContent=titles[index];
  document.getElementById('scene-count').textContent=`${String(index+1).padStart(2,'0')} / 10`;
  lastScene=index;
}
function buttonState(){
  const scrolling=mode==='scroll';
  toggle.disabled=scrolling;
  const text=scrolling?'الفيديو يتحرك مع السكرول':video.paused?'تشغيل الخلفية ▶':'إيقاف الخلفية Ⅱ';
  if(text===lastButton)return;
  lastButton=text;toggle.textContent=text;
  toggle.setAttribute('aria-label',scrolling?'تحكم في الهيرو بالتمرير':video.paused?'تشغيل فيديو الخلفية':'إيقاف فيديو الخلفية');
}
function playback(){
  if(mode==='scroll'||userPaused||document.hidden)video.pause();
  else video.play().catch(buttonState);
  buttonState();
}
function seek(){
  seekTimer=0;
  if(mode!=='scroll'||reduce.matches||document.hidden||video.readyState<1)return;
  if(video.seeking)return;
  // Keep the scroll responsive; decode only the latest target at most 20 times/s.
  const wait=50-(performance.now()-lastSeek);
  if(wait>0){seekTimer=setTimeout(seek,wait);return;}
  // Never start a seek into an undownloaded range and leave the decoder waiting.
  let available=null;
  for(let i=0;i<video.buffered.length;i++){
    const start=video.buffered.start(i),end=Math.max(start,video.buffered.end(i)-.08);
    const candidate=Math.max(start,Math.min(end,target));
    if(available===null||Math.abs(candidate-target)<Math.abs(available-target))available=candidate;
  }
  if(available===null)return;
  const next=Math.round(available*30)/30;
  if(Math.abs(video.currentTime-next)<1/30)return;
  lastSeek=performance.now();video.currentTime=next;
}
function update(){
  scheduled=false;
  const rect=hero.getBoundingClientRect();
  const progress=Math.max(0,Math.min(1,-rect.top/Math.max(hero.offsetHeight-innerHeight,1)));
  const next=rect.bottom<=0?'background':'scroll';
  const duration=Number.isFinite(video.duration)?video.duration:40.147;
  target=Math.min(Math.max(0,duration-.05),progress*duration);
  hero.style.setProperty('--progress',progress.toFixed(4));
  fill.style.transform=`scaleX(${progress})`;
  header.classList.toggle('is-scrolled',scrollY>28);
  document.body.classList.toggle('is-background-film',next==='background');
  if(mode!==next){mode=next;clearTimeout(seekTimer);seekTimer=0;playback();}
  if(mode==='scroll'&&!seekTimer)seek();
  scene();buttonState();
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
video.addEventListener('loadedmetadata',update);
video.addEventListener('progress',()=>{if(mode==='scroll'&&!seekTimer)seek();});
video.addEventListener('loadeddata',()=>{if(mode==='scroll'&&!seekTimer)seek();});
video.addEventListener('seeked',()=>{scene();if(mode==='scroll')seek();else playback();});
video.addEventListener('timeupdate',scene);
video.addEventListener('play',buttonState);
video.addEventListener('pause',buttonState);
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',schedule);
document.addEventListener('visibilitychange',()=>{playback();schedule();});
reduce.addEventListener('change',()=>{userPaused=reduce.matches;playback();schedule();});
toggle.addEventListener('click',()=>{if(mode==='background'){userPaused=!video.paused;playback();}});
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.mobile-nav');
function closeMenu(){nav.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','فتح القائمة');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.hidden=!open;menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'إغلاق القائمة':'فتح القائمة');});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.getElementById('year').textContent=new Date().getFullYear();
update();

const hero=document.querySelector('.hero-journey');
const video=document.querySelector('.hero-video');
const header=document.querySelector('.site-header');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const toggle=document.querySelector('.film-toggle');
const fill=document.querySelector('.scrub-progress-fill');
// Move the same video outside the hero so scrolling cannot clip or stop it.
const frame=document.querySelector('.film-frame');
document.body.insertBefore(frame,document.querySelector('main'));
document.body.append(toggle);
const titles=['فوق السحب','القصر من الأعلى','واجهة القصر','الصالة الكبرى','المجلس الملكي','غرفة الضيوف','الحديقة وحمام السباحة','الواجهة الخلفية','THIRD DIMENSION CONSULTANCY','من النهار إلى الليل'];
const times=[0,2,6,9,11.5,16,21,24,28,32];
let userPaused=reduce.matches,visible=true,lastScene=-1;
video.muted=true;
function buttonState(){toggle.textContent=video.paused?'تشغيل الفيلم ▶':'إيقاف الفيلم Ⅱ';toggle.setAttribute('aria-label',video.paused?'تشغيل فيديو الخلفية':'إيقاف فيديو الخلفية');}
function playback(){if(userPaused||!visible||document.hidden)video.pause();else video.play().catch(buttonState);}
function updateFilm(){
  const progress=video.currentTime/(video.duration||40.147);
  hero.style.setProperty('--progress',progress.toFixed(4));
  fill.style.transform=`scaleX(${progress})`;
  let scene=0;for(let i=1;i<times.length&&video.currentTime>=times[i];i++)scene=i;
  if(scene!==lastScene){document.getElementById('scene-title').textContent=titles[scene];document.getElementById('scene-count').textContent=`${String(scene+1).padStart(2,'0')} / 10`;lastScene=scene;}
}
toggle.addEventListener('click',()=>{userPaused=!video.paused;playback();});
video.addEventListener('play',buttonState);video.addEventListener('pause',buttonState);
video.addEventListener('timeupdate',updateFilm);video.addEventListener('loadedmetadata',()=>{updateFilm();playback();});
new IntersectionObserver(entries=>{
  document.body.classList.toggle('is-background-film',!entries[0].isIntersecting);
}).observe(hero);
document.addEventListener('visibilitychange',playback);
reduce.addEventListener('change',()=>{userPaused=reduce.matches;playback();});
// Scroll affects only the header; video time is driven by native playback.
function headerState(){header.classList.toggle('is-scrolled',scrollY>28);}
window.addEventListener('scroll',headerState,{passive:true});headerState();
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.mobile-nav');
function closeMenu(){nav.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','فتح القائمة');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'إغلاق القائمة':'فتح القائمة');nav.hidden=!open;});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.getElementById('year').textContent=new Date().getFullYear();
buttonState();playback();updateFilm();

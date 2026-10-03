// Keep navigation independent from video decoding and other page effects.
document.querySelectorAll('a[href="#top"]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    // Instant return avoids a long animation over the 900svh film section.
    window.scrollTo({top:0,left:0,behavior:'instant'});
    history.replaceState(null,'','#top');
  });
});

document.querySelectorAll('.contact-actions a').forEach(link => {
  const isWhatsapp = link.href.includes('wa.me/');
  if (!isWhatsapp && !link.href.startsWith('mailto:')) return;
  const icon = document.createElement('img');
  icon.src = `../assets/icons/${isWhatsapp?'whatsapp':'email'}.svg`;
  icon.alt='';icon.width=22;icon.height=22;icon.className='contact-icon';
  link.prepend(icon);
});

const logoSection=document.querySelector('.institutions-section');
const logoGroup=logoSection?.querySelector('.logos-group');
if(logoGroup){
  const duplicate=logoGroup.cloneNode(true);
  duplicate.setAttribute('aria-hidden','true');
  duplicate.querySelectorAll('img').forEach(img=>img.alt='');
  logoGroup.after(duplicate);
  const toggle=logoSection.querySelector('.logos-toggle');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  toggle.addEventListener('click',()=>{
    const paused=logoSection.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.textContent=paused?'تشغيل الحركة ▶':'إيقاف الحركة Ⅱ';
  });
  new IntersectionObserver(entries=>{
    logoSection.classList.toggle('is-offscreen',!entries[0].isIntersecting);
  }).observe(logoSection);
  document.addEventListener('visibilitychange',()=>logoSection.classList.toggle('is-hidden',document.hidden));
  function reducedLogos(){toggle.hidden=motion.matches;}
  motion.addEventListener('change',reducedLogos);reducedLogos();
}

(() => {
  const section = document.querySelector('.mixed-showcase'), stage = section.querySelector('.mixed-stage');
  const cloud = section.querySelector('.mixed-cloud'), dialog = document.querySelector('.mixed-lightbox');
  const pause = section.querySelector('.mixed-pause'), mode = section.querySelector('.mixed-mode');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let cards = [], images = [], yaw = .2, pitch = -.12, visible = false, stopped = false, grid = reduce.matches;
  let frame = 0, last = 0, drag = null, moved = false, loaded = false, focused = false;
  const points = [];
  function render() {
    if (grid) return;
    const radius = Math.min(stage.clientWidth * .35, 385), vertical = Math.min(stage.clientHeight * .42, 350);
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    cards.forEach((card, i) => {
      const p = points[i], x = p.x * cy + p.z * sy, z1 = p.z * cy - p.x * sy;
      const y = p.y * cp - z1 * sp, z = p.y * sp + z1 * cp;
      const front = z > -.48;
      card.style.transform = `translate(-50%,-50%) translate3d(${x * radius}px,${y * vertical}px,${z * radius}px) rotateY(${Math.atan2(x,z) * 32}deg) rotateX(${-y * 30}deg) rotateZ(${p.roll}deg)`;
      card.style.opacity = String(.16 + (z + 1) * .42);
      card.style.zIndex = String(Math.round((z + 1) * 40));
      card.style.pointerEvents = front ? 'auto' : 'none';
      card.tabIndex = front ? 0 : -1;
      card.setAttribute('aria-hidden', String(!front));
    });
  }
  function canRun() { return visible && loaded && !grid && !stopped && !reduce.matches && !document.hidden && !dialog.open && !drag && !focused; }
  function tick(time) {
    frame = 0;
    if (!canRun()) { last = 0; return; }
    if (last) yaw += Math.min(time-last, 70) * .000055;
    last = time; render(); frame = requestAnimationFrame(tick);
  }
  function resume() { cancelAnimationFrame(frame); frame = 0; last = 0; if (canRun()) frame = requestAnimationFrame(tick); }
  function layout() {
    section.classList.toggle('is-grid', grid);
    mode.textContent = grid ? 'العرض ثلاثي الأبعاد' : 'عرض كل الصور'; mode.setAttribute('aria-pressed', String(grid));
    cards.forEach(card => { if (grid) {card.tabIndex = 0; card.setAttribute('aria-hidden','false');} });
    render(); resume();
  }
  function open(i) {
    const item = images[i];
    dialog.querySelector('img').src = item.original; dialog.querySelector('img').alt = item.alt;
    dialog.querySelector('a').href = item.original; dialog.showModal(); resume();
  }
  async function load() {
    if (loaded) return; loaded = true;
    try {
      const response = await fetch('assets/mixed/manifest.json'); if (!response.ok) throw Error('Gallery unavailable');
      images = await response.json(); section.querySelector('.mixed-total').textContent = `${images.length} / من أعمالنا`;
      cards = images.map((item,i) => {
        const y = 1 - 2 * (i + .5) / images.length, angle = i * 2.399963, ring = Math.sqrt(1-y*y);
        points.push({x:Math.cos(angle)*ring, y, z:Math.sin(angle)*ring, roll:(i%5-2)*4});
        const card = document.createElement('button'); card.type = 'button'; card.className = 'mixed-card'; card.setAttribute('aria-label',`تكبير ${item.alt}`);
        const img = document.createElement('img'); img.src = item.src; img.alt = item.alt; img.decoding = 'async';
        card.append(img); card.addEventListener('click', e => { if (moved && e.detail !== 0) return; open(i); }); cloud.append(card); return card;
      }); layout();
    } catch { section.querySelector('.mixed-total').textContent = 'تعذر تحميل الصور'; }
  }
  stage.addEventListener('pointerdown',e => {
    if (grid || e.button !== 0) return;
    moved = false; drag = {x:e.clientX,y:e.clientY,yaw,pitch}; resume();
  });
  stage.addEventListener('pointermove',e => {
    if (!drag) return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if (Math.abs(dx)+Math.abs(dy)>8) { moved=true; stage.setPointerCapture(e.pointerId); }
    yaw=drag.yaw+dx*.005; pitch=Math.max(-.65,Math.min(.65,drag.pitch-dy*.003)); render();
  });
  function release() { drag=null; resume(); }
  stage.addEventListener('pointerup',release); stage.addEventListener('pointercancel',release); stage.addEventListener('lostpointercapture',release);
  stage.addEventListener('keydown',e => { if (grid || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return; e.preventDefault(); yaw+=e.key==='ArrowLeft'?-.18:e.key==='ArrowRight'?.18:0; pitch=Math.max(-.65,Math.min(.65,pitch+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0))); render(); });
  section.addEventListener('focusin',() => {focused=stage.contains(document.activeElement) && document.activeElement.matches(':focus-visible'); resume();});
  section.addEventListener('focusout',() => {setTimeout(() => {focused=stage.contains(document.activeElement) && document.activeElement.matches(':focus-visible');resume();},0);});
  pause.addEventListener('click',() => {stopped=!stopped;pause.textContent=stopped?'تشغيل الحركة':'إيقاف الحركة';resume();});
  mode.addEventListener('click',() => {grid=!grid;moved=false;layout();});
  dialog.querySelector('button').addEventListener('click',() => dialog.close());
  dialog.addEventListener('click',e => {if(e.target===dialog)dialog.close();}); dialog.addEventListener('close',resume);
  document.addEventListener('visibilitychange',resume); window.addEventListener('resize',render);
  reduce.addEventListener('change',() => {grid=reduce.matches;layout();});
  new IntersectionObserver(entries => {visible=entries[0].isIntersecting;resume();},{threshold:.1}).observe(section);
  const loader = new IntersectionObserver(entries => {if(entries[0].isIntersecting){load();loader.disconnect();}},{rootMargin:'500px'});loader.observe(section);
  layout();
})();

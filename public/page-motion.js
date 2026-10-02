(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const items = [...document.querySelectorAll('.services-heading,.service-item,.vision-heading,.vision-text,.contact-section > h2,.contact-description,.location-copy,.location-map,.mixed-top')];
  items.forEach(item => item.classList.add('reveal'));
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target,isIntersecting}) => target.classList.toggle('is-visible',isIntersecting));
  },{threshold:.08,rootMargin:'0px 0px -35px 0px'});
  items.forEach(item => observer.observe(item));
  document.documentElement.classList.add('motion-ready');
  reduce.addEventListener('change',() => document.documentElement.classList.toggle('motion-ready',!reduce.matches));
})();

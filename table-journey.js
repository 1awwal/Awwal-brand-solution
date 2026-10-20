(() => {
  const frame = document.querySelector('.table-frame');
  const scene = document.querySelector('.table-scene');
  const digital = document.querySelector('.table-digital');
  const steps = [...document.querySelectorAll('.table-step')];
  if (!frame || !scene || !digital || !steps.length) return;

  const count = document.querySelector('.table-count');
  const title = document.querySelector('.table-title');
  const description = document.querySelector('.table-description');
  const label = document.querySelector('.table-active-name');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function activate(step) {
    steps.forEach(item => item.classList.toggle('is-active', item === step));
    if (count) count.innerHTML = `${step.dataset.index} <i>/ 08</i>`;
    if (title) title.textContent = step.dataset.title;
    if (description) description.textContent = step.dataset.description;
    if (label) label.textContent = step.dataset.label;
    const focus = Number(step.dataset.focus || .5);
    frame.style.setProperty('--focus-x', `${Math.round(focus * 100)}%`);
    scene.style.objectPosition = `${Math.round(focus * 100)}% center`;
    scene.style.transform = `scale(${reducedMotion ? 1 : (step.dataset.image === 'digital' ? 1.02 : 1.1 + (Number(step.dataset.index) % 3) * .065)})`;
    frame.classList.toggle('is-digital', step.dataset.image === 'digital');
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) activate(visible.target);
    }, { threshold: [0, .15, .35, .6], rootMargin: '-38% 0px -38% 0px' });
    steps.forEach(step => observer.observe(step));
  } else {
    const onScroll = () => {
      const midpoint = window.innerHeight / 2;
      const current = steps.reduce((best, step) =>
        Math.abs(step.getBoundingClientRect().top + step.offsetHeight / 2 - midpoint) <
        Math.abs(best.getBoundingClientRect().top + best.offsetHeight / 2 - midpoint) ? step : best
      );
      activate(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (!reducedMotion) frame.style.scrollBehavior = 'smooth';
  activate(steps[0]);
})();
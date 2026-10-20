(() => {
  const frame = document.querySelector('.table-frame');
  const scene = document.querySelector('.table-scene');
  const digital = document.querySelector('.table-digital');
  const steps = [...document.querySelectorAll('.table-step')];
  if (!frame || !scene || !digital || !steps.length) return;

  const count = frame.querySelector('.table-count');
  const title = frame.querySelector('.table-title');
  const description = frame.querySelector('.table-description');
  const label = frame.querySelector('.table-active-name');
  const progressBar = frame.querySelector('.table-scroll-progress i');
  const previous = frame.querySelector('.table-prev');
  const next = frame.querySelector('.table-next');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = -1;
  let cameraFocus = Number(steps[0].dataset.focus);
  let cameraZoom = 1.08;
  let animationFrame = 0;

  function activate(index) {
    if (active === index) return;
    active = index;
    const step = steps[index];
    steps.forEach((item, i) => item.classList.toggle('is-active', i === index));
    if (count) count.innerHTML = `${step.dataset.index} <i>/ ${String(steps.length).padStart(2, '0')}</i>`;
    if (title) title.textContent = step.dataset.title;
    if (description) description.textContent = step.dataset.description;
    if (label) label.textContent = step.dataset.label;
    frame.setAttribute('aria-label', `${step.querySelector('h3').textContent} mockup viewer`);
    frame.classList.toggle('is-digital', step.dataset.image === 'digital');
    if (previous) previous.disabled = index === 0;
    if (next) next.disabled = index === steps.length - 1;
  }

  function anchor() {
    return window.innerHeight * (window.innerWidth <= 700 ? .72 : .54);
  }

  function draw() {
    animationFrame = 0;
    const line = anchor();
    const centers = steps.map(step => {
      const rect = step.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });
    let nearest = 0;
    centers.forEach((center, index) => {
      if (Math.abs(center - line) < Math.abs(centers[nearest] - line)) nearest = index;
    });
    activate(nearest);

    let upper = centers.findIndex(center => center >= line);
    let position;
    if (upper === 0) position = 0;
    else if (upper === -1) position = steps.length - 1;
    else position = upper - 1 + Math.min(1, Math.max(0, (line - centers[upper - 1]) / (centers[upper] - centers[upper - 1])));
    const from = Math.floor(position);
    const to = Math.min(steps.length - 1, from + 1);
    const blend = position - from;
    const targetFocus = Number(steps[from].dataset.focus) * (1 - blend) + Number(steps[to].dataset.focus) * blend;
    const targetZoom = reduced.matches ? 1 : 1.08 + Math.sin(position / (steps.length - 1) * Math.PI) * .08;
    const smoothing = reduced.matches ? 1 : .16;
    cameraFocus += (targetFocus - cameraFocus) * smoothing;
    cameraZoom += (targetZoom - cameraZoom) * smoothing;

    const width = frame.clientWidth;
    const height = frame.clientHeight;
    const ratio = scene.naturalWidth && scene.naturalHeight ? scene.naturalWidth / scene.naturalHeight : 3;
    const imageWidth = Math.max(width, height * ratio);
    const imageHeight = imageWidth / ratio;
    const x = Math.min(0, Math.max(width - imageWidth * cameraZoom, width / 2 - imageWidth * cameraZoom * cameraFocus));
    const y = (height - imageHeight * cameraZoom) / 2;
    scene.style.width = `${imageWidth}px`;
    scene.style.height = `${imageHeight}px`;
    scene.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${cameraZoom.toFixed(4)})`;
    if (progressBar) progressBar.style.transform = `scaleX(${((position + 1) / steps.length).toFixed(4)})`;
    if (Math.abs(targetFocus - cameraFocus) > .0001 || Math.abs(targetZoom - cameraZoom) > .0001) schedule();
  }

  function schedule() {
    if (!animationFrame) animationFrame = requestAnimationFrame(draw);
  }

  function go(index) {
    const step = steps[Math.max(0, Math.min(steps.length - 1, index))];
    const rect = step.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + rect.top + rect.height / 2 - anchor(),
      behavior: reduced.matches ? 'auto' : 'smooth'
    });
    schedule();
  }

  previous?.addEventListener('click', () => go(active - 1));
  next?.addEventListener('click', () => go(active + 1));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  scene.addEventListener('load', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(frame);
  if (document.fonts?.ready) document.fonts.ready.then(schedule);
  if (reduced.addEventListener) reduced.addEventListener('change', schedule);
  activate(0);
  schedule();
})();
